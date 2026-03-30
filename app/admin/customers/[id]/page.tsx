import { notFound } from "next/navigation";

import { deleteCustomerAction, updateCustomerAction } from "@/app/actions";
import { PageHeader, SectionCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { centsToCurrency, displayPhone, formatDateTime, visitSourceLabel } from "@/lib/utils";

type CustomerDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
};

export default async function CustomerDetailPage({ params, searchParams }: CustomerDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      visits: {
        include: { visitServices: true, calendlyEvent: true },
        orderBy: { visitAt: "desc" },
      },
      calendlyEvents: {
        orderBy: { scheduledAt: "desc" },
        take: 10,
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const totalPaid = customer.visits.reduce((sum, visit) => sum + (visit.amountPaidCents ?? 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Customer profile"
        title={customer.name}
        description={`${displayPhone(customer.phone)} · ${customer.email || "No email on file"}`}
      />
      {query.message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{query.message}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.4fr]">
        <SectionCard title="Profile summary" description="Edit customer details or remove the customer record.">
          <form action={updateCustomerAction} className="space-y-4">
            <input type="hidden" name="customerId" value={customer.id} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                defaultValue={customer.name}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                defaultValue={customer.phone ?? ""}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                defaultValue={customer.email ?? ""}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={customer.notes ?? ""}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
              />
            </div>
            <dl className="grid gap-4 text-sm text-stone-700 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-stone-400">Visits</dt>
                <dd>{customer.visits.length}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-stone-400">Payments recorded</dt>
                <dd>{centsToCurrency(totalPaid)}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-600">
                Save customer
              </button>
            </div>
          </form>
          <form action={deleteCustomerAction} className="mt-4 border-t border-stone-200 pt-4">
            <input type="hidden" name="customerId" value={customer.id} />
            <button className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
              Delete customer
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Visit history" description="Every visit, the selected services, and what was paid.">
          <div className="space-y-4">
            {customer.visits.map((visit) => (
              <div key={visit.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-stone-900">{formatDateTime(visit.visitAt)}</p>
                    <p className="text-sm text-stone-600">
                      {visit.visitServices.map((service) => service.serviceName).join(", ") || "No services recorded"}
                    </p>
                  </div>
                  <div className="text-sm text-stone-600">
                    <p>Source: {visitSourceLabel(visit.source)}</p>
                    <p>Paid: {centsToCurrency(visit.amountPaidCents ?? 0)}</p>
                  </div>
                </div>
                {visit.notes ? <p className="mt-3 text-sm text-stone-600">{visit.notes}</p> : null}
              </div>
            ))}

            {!customer.visits.length ? (
              <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-sm text-stone-500">
                No visits recorded yet.
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Calendly bookings" description="Recent bookings that were matched to this customer.">
        <div className="space-y-3">
          {customer.calendlyEvents.map((event) => (
            <div key={event.id} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
              <p className="font-semibold text-stone-900">{event.eventName || "Calendly booking"}</p>
              <p>{formatDateTime(event.scheduledAt)}</p>
              <p>Status: {event.status}</p>
            </div>
          ))}
          {!customer.calendlyEvents.length ? (
            <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-sm text-stone-500">
              No matched bookings yet.
            </div>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
