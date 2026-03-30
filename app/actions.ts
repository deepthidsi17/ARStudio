"use server";

import { VisitSource } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { syncCalendlyEvents } from "@/lib/calendly";
import { prisma } from "@/lib/prisma";
import { dollarsToCents, isValidPhoneNumber, normalizeEmail, normalizePhone } from "@/lib/utils";

function parseServiceIds(formData: FormData): string[] {
  return formData
    .getAll("serviceIds")
    .map((value) => String(value))
    .filter(Boolean);
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

  if (!name) {
    checkinRedirect("Please enter the customer name.");
  }

  if (!phone && !email) {
    checkinRedirect("Please enter a phone number or email address.");
  }

  if (phone && !isValidPhoneNumber(phone)) {
    checkinRedirect("Please enter a valid 10-digit phone number.");
  }

  if (!serviceIds.length) {
    checkinRedirect("Please select at least one service.");
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

  const visit = await prisma.visit.create({
    data: {
      customerId,
      notes: notes || null,
      source: VisitSource.IPAD,
    },
  });

  await attachServices(visit.id, serviceIds);
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

export async function syncCalendlyAction() {
  try {
    await syncCalendlyEvents();
    revalidatePath("/bookings");
    revalidatePath("/customers");
    redirect("/bookings?message=Calendly sync completed.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calendly sync failed.";
    redirect(`/bookings?message=${encodeURIComponent(message)}`);
  }
}

export async function matchCalendlyBookingAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const customerId = String(formData.get("customerId") ?? "");

  if (!bookingId || !customerId) {
    redirect("/bookings?message=Choose a booking and customer.");
  }

  await prisma.calendlyEvent.update({
    where: { id: bookingId },
    data: { matchedCustomerId: customerId },
  });

  revalidatePath("/bookings");
  revalidatePath("/customers");
  redirect("/bookings?message=Booking linked to customer.");
}

export async function createCustomerFromBookingAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) {
    redirect("/bookings?message=Missing booking.");
  }

  const booking = await prisma.calendlyEvent.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    redirect("/bookings?message=Booking not found.");
  }

  const normalizedPhone = normalizePhone(booking.inviteePhone);
  const normalizedEmail = normalizeEmail(booking.inviteeEmail);

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
        name: booking.inviteeName || "Calendly Client",
        phone: booking.inviteePhone,
        normalizedPhone,
        email: booking.inviteeEmail,
        normalizedEmail,
      },
    });
  }

  await prisma.calendlyEvent.update({
    where: { id: booking.id },
    data: { matchedCustomerId: customer.id },
  });

  revalidatePath("/bookings");
  revalidatePath("/customers");
  redirect("/bookings?message=Customer created from booking.");
}
