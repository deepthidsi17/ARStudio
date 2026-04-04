import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { centsToCurrency, displayPhone, formatDateTime, normalizeEmail, normalizePhone, PHONE_PATTERN } from "@/lib/utils";
import { MessageBanner, PageHeader, SectionCard } from "@/components/ui";
import { createCustomerVisitAction, createReturningVisitAction } from "@/app/actions";
import { ValidatedCheckinForm } from "@/components/validated-checkin-form";
import CheckinServicePicker from "@/components/checkin-service-picker";

type CheckinPageProps = {
  searchParams: Promise<{
    message?: string;
    contact?: string;
    phone?: string;
    email?: string;
    mode?: string;
  }>;
};

async function lookupCustomer(contact?: string) {
  const normalizedPhone = normalizePhone(contact);
  const normalizedEmail = normalizeEmail(contact);

  if (!normalizedPhone && !normalizedEmail) {
    return null;
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  return prisma.customer.findFirst({
    where: {
      OR: [
        ...(normalizedPhone ? [{ normalizedPhone }] : []),
        ...(normalizedEmail ? [{ normalizedEmail }] : []),
      ],
    },
    include: {
      visits: {
        include: {
          visitServices: true,
        },
        orderBy: { visitAt: "desc" },
        take: 3,
      },
      appointments: {
        where: {
          status: { in: ["CONFIRMED", "PENDING"] },
          scheduledAt: { gte: startOfDay, lt: endOfDay },
        },
        include: { services: true }
      }
    },
  });
}

async function lookupAppointmentsForToday(contact?: string) {
  if (!contact) return [];
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  return prisma.appointment.findMany({
    where: {
      OR: [
        { email: { equals: contact, mode: "insensitive" } },
        { phone: { equals: contact } },
        // Also try matching the normalized phone just in case
        ...(normalizePhone(contact) ? [{ phone: { contains: normalizePhone(contact)! } }] : []),
      ],
      status: { in: ["PENDING", "CONFIRMED"] },
      scheduledAt: { gte: startOfDay, lt: endOfDay },
    },
    include: {
      services: true,
    }
  });
}

export default async function CheckinPage({ searchParams }: CheckinPageProps) {
  const params = await searchParams;
  const contact = params.contact ?? params.phone ?? params.email ?? "";
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  const customer = await lookupCustomer(contact);
  const standaloneAppointments = await lookupAppointmentsForToday(contact);
  
  const allPreselectedIds = [
    ...(customer?.appointments?.flatMap(appt => appt.services.map(s => s.serviceId)) || []),
    ...standaloneAppointments.flatMap(appt => appt.services.map(s => s.serviceId))
  ];
  const uniquePreselectedIds = Array.from(new Set(allPreselectedIds));

  const mode = params.mode === "new" ? "new" : "returning";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Client intake"
        title="Client check-in"
        description="Choose whether the customer is new or returning, then save the services for today."
      />
      <MessageBanner message={params.message} />

      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/checkin?mode=returning"
              className={`rounded-3xl border px-6 py-5 shadow-sm transition ${
                mode === "returning" ? "border-rose-300 bg-rose-50" : "border-stone-200 bg-white hover:border-rose-200"
              }`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">Returning customer</p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-900">Find by phone or email</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">Quick lookup for repeat clients so they can tap their services and keep moving.</p>
            </Link>
            <Link
              href="/checkin?mode=new"
              className={`rounded-3xl border px-6 py-5 shadow-sm transition ${
                mode === "new" ? "border-rose-300 bg-rose-50" : "border-stone-200 bg-white hover:border-rose-200"
              }`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">New customer</p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-900">Enter details once</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">Create the customer profile, capture services for today, and store it for future visits.</p>
            </Link>
          </div>

          {mode === "returning" ? (
            <SectionCard
              title="Returning customer intake"
              description="Search by phone number or email. If found, tap the services for today and save the visit."
              className="p-8"
            >
              <form action="/checkin" className="space-y-4">
                <input type="hidden" name="mode" value="returning" />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700" htmlFor="returning-contact">
                    Phone number or email
                  </label>
                  <input
                    id="returning-contact"
                    name="contact"
                    defaultValue={contact}
                    inputMode="email"
                    placeholder="(555) 555-5555 or client@example.com"
                    className="w-full rounded-3xl border border-stone-300 px-5 py-4 text-lg"
                  />
                </div>
                <p className="text-sm text-stone-500">Enter either the customer&apos;s phone number or email address.</p>
                <button
                  type="submit"
                  className="w-full rounded-3xl bg-stone-900 px-5 py-4 text-lg font-semibold text-white transition hover:bg-stone-800"
                >
                  Find customer
                </button>
              </form>

              {customer ? (
                <div className="mt-6 space-y-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-500">Match found</p>
                    <h3 className="text-xl font-semibold text-stone-900">{customer.name}</h3>
                    <p className="text-sm text-stone-600">
                      {displayPhone(customer.phone)} · {customer.email || "No email"}
                    </p>
                  </div>

                  <ValidatedCheckinForm action={createReturningVisitAction} className="space-y-5">
                    <input type="hidden" name="customerId" value={customer.id} />
                    <CheckinServicePicker 
                      services={services} 
                      preselectedServiceIds={uniquePreselectedIds}
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-stone-700" htmlFor="returning-notes">
                        Notes for today
                      </label>
                      <textarea
                        id="returning-notes"
                        name="notes"
                        rows={3}
                        className="w-full rounded-3xl border border-stone-300 px-5 py-4 text-base"
                        placeholder="Anything special for this visit?"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-3xl bg-rose-500 px-5 py-4 text-lg font-semibold text-white transition hover:bg-rose-600"
                    >
                      Save returning customer visit
                    </button>
                  </ValidatedCheckinForm>

                  {customer.visits.length ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-stone-700">Recent visits</p>
                      {customer.visits.map((visit) => (
                        <div key={visit.id} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
                          <p className="font-medium text-stone-900">{formatDateTime(visit.visitAt)}</p>
                          <p>{visit.visitServices.map((item) => item.serviceName).join(", ") || "No services recorded"}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : contact ? (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {standaloneAppointments.length > 0 ? (
                    <span><strong>Appointment found!</strong> But they don't have a profile yet. Switch to &quot;New customer&quot; above to check them in.</span>
                  ) : (
                    <span>No matching customer yet. Use the new customer form to create one.</span>
                  )}
                </div>
              ) : null}
            </SectionCard>
          ) : (
            <SectionCard
              title="New customer intake"
              description="Create a new customer profile and save the requested services in one simple flow."
              className="p-8"
            >
              <ValidatedCheckinForm action={createCustomerVisitAction} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-stone-700" htmlFor="name">
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      defaultValue={standaloneAppointments[0]?.name || ""}
                      className="w-full rounded-3xl border border-stone-300 px-5 py-4 text-lg"
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700" htmlFor="phone">
                      Phone number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      inputMode="tel"
                      pattern={PHONE_PATTERN}
                      defaultValue={standaloneAppointments[0]?.phone || contact}
                      className="w-full rounded-3xl border border-stone-300 px-5 py-4 text-lg"
                      placeholder="(555) 555-5555"
                    />
                    <p className="text-sm text-stone-500">Use a valid 10-digit phone number if provided.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700" htmlFor="email">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={standaloneAppointments[0]?.email || (contact.includes('@') ? contact : "")}
                      className="w-full rounded-3xl border border-stone-300 px-5 py-4 text-lg"
                      placeholder="client@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-stone-700">Services wanted</p>
                  <CheckinServicePicker services={services} preselectedServiceIds={uniquePreselectedIds} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700" htmlFor="notes">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full rounded-3xl border border-stone-300 px-5 py-4 text-base"
                    placeholder="Optional notes for the visit"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-3xl bg-rose-500 px-5 py-4 text-lg font-semibold text-white transition hover:bg-rose-600"
                >
                  Save new customer visit
                </button>
              </ValidatedCheckinForm>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
