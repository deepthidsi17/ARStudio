"use server";

import { VisitSource } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ACKNOWLEDGMENTS, CONSENT_VERSION } from "@/lib/consent";
import { dollarsToCents, isValidPhoneNumber, normalizeEmail, normalizePhone } from "@/lib/utils";

function parseServiceIds(formData: FormData): string[] {
  return formData
    .getAll("serviceIds")
    .map((value) => String(value))
    .filter(Boolean);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

// Returns an error message if the form claims to include consent but is missing
// the two legally load-bearing pieces (typed signature + accepted release).
// The client enforces these too; this is server-side defense in depth.
function consentError(formData: FormData): string | null {
  if (formData.get("consentProvided") !== "true") return null;
  if (!str(formData, "signatureName")) return "Please type your full legal name to sign the consent form.";
  if (formData.get("releaseAccepted") !== "on") return "Please read and accept the Release and Waiver of Liability to continue.";
  for (const ack of ACKNOWLEDGMENTS) {
    if (ack.required && formData.get(`ack_${ack.name}`) !== "on") {
      return "Please confirm the required acknowledgments to continue.";
    }
  }
  return null;
}

// Persists a signed consent record for a visit. No-op if the form didn't carry
// consent (e.g. a returning client who already signed the current version).
async function saveConsent(formData: FormData, customerId: string, visitId: string) {
  if (formData.get("consentProvided") !== "true") return;

  const flags = formData.getAll("hh_flags").map(String);
  const acknowledgments: Record<string, boolean> = {};
  for (const ack of ACKNOWLEDGMENTS) {
    acknowledgments[ack.name] = formData.get(`ack_${ack.name}`) === "on";
  }

  const signatureImage = str(formData, "signatureImage");
  const isMinor = formData.get("isMinor") === "on";

  const requestHeaders = await headers();
  const ipAddress =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    null;

  await prisma.consent.create({
    data: {
      customerId,
      visitId,
      formVersion: str(formData, "consentVersion") || CONSENT_VERSION,
      healthHistory: {
        allergies: str(formData, "hh_allergies"),
        skinConditions: str(formData, "hh_skinConditions"),
        medications: str(formData, "hh_medications"),
        reactionDetails: str(formData, "hh_reactionDetails"),
        flags,
      },
      acknowledgments,
      releaseAccepted: formData.get("releaseAccepted") === "on",
      signatureName: str(formData, "signatureName"),
      signatureType: signatureImage ? "drawn" : "typed",
      signatureImage: signatureImage || null,
      isMinor,
      guardianName: isMinor ? str(formData, "guardianName") || null : null,
      photoConsent: formData.get("photoConsent") === "on",
      ipAddress,
      userAgent: requestHeaders.get("user-agent") || null,
    },
  });
}

async function attachServices(visitId: string, serviceIds: string[]) {
  const services = await prisma.service.findMany({
    where: {
      id: { in: serviceIds },
      active: true,
    },
  });

  if (!services.length) {
    return;
  }

  await prisma.visitService.createMany({
    data: services.map((service) => ({
      visitId,
      serviceId: service.id,
      serviceName: service.name,
      priceCents: service.priceDefault ?? null,
    })),
  });
}

function checkinRedirect(message: string) {
  redirect(`/checkin?message=${encodeURIComponent(message)}`);
}

export async function createCustomerVisitAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const serviceIds = parseServiceIds(formData);

  if (!name || name.length < 4) {
    checkinRedirect("Please enter a valid, full customer name.");
  }

  if (!phone && !email) {
    checkinRedirect("Please enter a phone number or email address.");
  }

  if (phone && !isValidPhoneNumber(phone)) {
    checkinRedirect("Please enter a valid 10-digit phone number.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    checkinRedirect("Please enter a valid email address.");
  }

  if (!serviceIds.length) {
    checkinRedirect("Please select at least one service.");
  }

  const consentValidationError = consentError(formData);
  if (consentValidationError) {
    checkinRedirect(consentValidationError);
  }

  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email);

  let customer =
    (normalizedPhone
      ? await prisma.customer.findUnique({ where: { normalizedPhone } })
      : null) ??
    (normalizedEmail
      ? await prisma.customer.findUnique({ where: { normalizedEmail } })
      : null);

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name,
        phone: phone || null,
        normalizedPhone,
        email: email || null,
        normalizedEmail,
      },
    });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        name: customer.name || name,
        phone: customer.phone || phone || null,
        normalizedPhone: customer.normalizedPhone || normalizedPhone,
        email: customer.email || email || null,
        normalizedEmail: customer.normalizedEmail || normalizedEmail,
      },
    });
  }

  const visit = await prisma.visit.create({
    data: {
      customerId: customer.id,
      notes: notes || null,
      source: VisitSource.IPAD,
    },
  });

  await attachServices(visit.id, serviceIds);
  await saveConsent(formData, customer.id, visit.id);
  revalidatePath("/checkin");
  revalidatePath("/customers");
  revalidatePath("/visits");
  checkinRedirect(`Saved visit for ${customer.name}.`);
}

export async function createReturningVisitAction(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const serviceIds = parseServiceIds(formData);

  if (!customerId || !serviceIds.length) {
    checkinRedirect("Please choose a customer and at least one service.");
  }

  const consentValidationError = consentError(formData);
  if (consentValidationError) {
    checkinRedirect(consentValidationError);
  }

  const visit = await prisma.visit.create({
    data: {
      customerId,
      notes: notes || null,
      source: VisitSource.IPAD,
    },
  });

  await attachServices(visit.id, serviceIds);
  await saveConsent(formData, customerId, visit.id);
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  revalidatePath("/checkin");
  revalidatePath("/customers");
  revalidatePath("/visits");
  checkinRedirect(`Saved a new visit for ${customer?.name ?? "your customer"}.`);
}

export async function createServiceAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const priceDefault = dollarsToCents(formData.get("priceDefault"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  if (!name) {
    redirect("/services?message=Please enter a service name.");
  }

  await prisma.service.upsert({
    where: { name },
    update: {
      active: true,
      priceDefault,
      imageUrl: imageUrl || null,
    },
    create: {
      name,
      priceDefault,
      imageUrl: imageUrl || null,
    },
  });

  revalidatePath("/services");
  revalidatePath("/checkin");
  redirect(`/services?message=${encodeURIComponent(`Saved service ${name}.`)}`);
}

export async function updateServiceAction(formData: FormData) {
  const serviceId = String(formData.get("serviceId") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  const priceDefault = dollarsToCents(formData.get("priceDefault"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  if (!serviceId) {
    redirect("/services?message=Missing service.");
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      active,
      priceDefault,
      imageUrl: imageUrl || null,
    },
  });

  revalidatePath("/services");
  revalidatePath("/checkin");
  redirect("/services?message=Service updated.");
}

export async function updateVisitPaymentAction(formData: FormData) {
  const visitId = String(formData.get("visitId") ?? "");
  const amountPaidCents = dollarsToCents(formData.get("amountPaid"));
  const paymentMethod = String(formData.get("paymentMethod") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!visitId) {
    redirect("/visits?message=Missing visit.");
  }

  await prisma.visit.update({
    where: { id: visitId },
    data: {
      amountPaidCents,
      paymentMethod: paymentMethod || null,
      notes: notes || null,
      source: VisitSource.STAFF,
    },
  });

  revalidatePath("/visits");
  revalidatePath("/customers");
  redirect("/visits?message=Payment saved.");
}

export async function updateCustomerAction(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!customerId || !name) {
    redirect("/customers?message=Customer name is required.");
  }

  if (phone && !isValidPhoneNumber(phone)) {
    redirect(`/customers/${customerId}?message=${encodeURIComponent("Please enter a valid 10-digit phone number.")}`);
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      name,
      phone: phone || null,
      normalizedPhone: normalizePhone(phone),
      email: email || null,
      normalizedEmail: normalizeEmail(email),
      notes: notes || null,
    },
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/checkin");
  redirect(`/customers/${customerId}?message=${encodeURIComponent("Customer updated.")}`);
}

export async function deleteVisitAction(formData: FormData) {
  const visitId = String(formData.get("visitId") ?? "");
  if (!visitId) {
    redirect("/visits?message=Missing visit.");
  }

  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    select: { customerId: true },
  });

  await prisma.visit.delete({
    where: { id: visitId },
  });

  revalidatePath("/visits");
  revalidatePath("/customers");
  if (visit?.customerId) {
    revalidatePath(`/customers/${visit.customerId}`);
  }
  redirect("/visits?message=Visit deleted.");
}

export async function deleteCustomerAction(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "");
  if (!customerId) {
    redirect("/customers?message=Missing customer.");
  }

  await prisma.customer.delete({
    where: { id: customerId },
  });

  revalidatePath("/customers");
  revalidatePath("/visits");
  revalidatePath("/bookings");
  revalidatePath("/checkin");
  redirect("/customers?message=Customer deleted.");
}
