import Link from "next/link";

import { deleteVisitAction, updateVisitPaymentAction } from "@/app/actions";
import { MessageBanner, PageHeader, SectionCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { centsToCurrency, formatDateTime, visitSourceLabel } from "@/lib/utils";

type VisitsPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function VisitsPage({ searchParams }: VisitsPageProps) {
  const params = await searchParams;
  const visits = await prisma.visit.findMany({
    include: {
      customer: true,
      visitServices: true,
    },
    orderBy: { visitAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Visit ledger"
        title="Visits and payments"
        description="Review recent visits, record how much was paid, and add notes after each appointment."
      />
      <MessageBanner message={params.message} />

      <SectionCard title="Recent visits" description="Save payment details directly from the visit list.">
        <div className="space-y-4">
          {visits.map((visit) => (
            <div key={visit.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
                    {visitSourceLabel(visit.source)}
                  </p>
                  <p className="text-lg font-semibold text-stone-900">
                    <Link href={`/customers/${visit.customerId}`} className="hover:text-rose-600">
                      {visit.customer.name}
                    </Link>
                  </p>
                  <p className="text-sm text-stone-600">{formatDateTime(visit.visitAt)}</p>
                  <p className="text-sm text-stone-600">
                    {visit.visitServices.map((service) => service.serviceName).join(", ") || "No services recorded"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-right text-sm text-stone-600">
                  <p>Recorded payment</p>
                  <p className="text-lg font-semibold text-stone-900">{centsToCurrency(visit.amountPaidCents ?? 0)}</p>
                </div>
              </div>

              <form action={updateVisitPaymentAction} className="mt-5 grid gap-4 lg:grid-cols-[160px_160px_1fr_auto] lg:items-end">
                <input type="hidden" name="visitId" value={visit.id} />
                <div className="space-y-2">
                  <label htmlFor={`amount-${visit.id}`} className="text-sm font-medium text-stone-700">
                    Amount paid
                  </label>
                  <input
                    id={`amount-${visit.id}`}
                    name="amountPaid"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={visit.amountPaidCents ? (visit.amountPaidCents / 100).toFixed(2) : ""}
                    className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor={`method-${visit.id}`} className="text-sm font-medium text-stone-700">
                    Payment method
                  </label>
                  <input
                    id={`method-${visit.id}`}
                    name="paymentMethod"
                    defaultValue={visit.paymentMethod ?? ""}
                    className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
                    placeholder="Cash, Zelle, Venmo"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor={`notes-${visit.id}`} className="text-sm font-medium text-stone-700">
                    Notes
                  </label>
                  <input
                    id={`notes-${visit.id}`}
                    name="notes"
                    defaultValue={visit.notes ?? ""}
                    className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
                    placeholder="Optional visit notes"
                  />
                </div>
                <button className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-600">
                  Save
                </button>
              </form>
              <form action={deleteVisitAction} className="mt-3 flex justify-end">
                <input type="hidden" name="visitId" value={visit.id} />
                <button className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                  Delete visit
                </button>
              </form>
            </div>
          ))}

          {!visits.length ? (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
              No visits recorded yet.
            </div>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
