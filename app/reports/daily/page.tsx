import Link from "next/link";
import { endOfDay, format, parseISO, startOfDay } from "date-fns";

import { PageHeader, SectionCard } from "@/components/ui";
import { PrintButton } from "@/components/print-button";
import { prisma } from "@/lib/prisma";
import { centsToCurrency, formatDateTime } from "@/lib/utils";

type DailyReportPageProps = {
  searchParams: Promise<{ date?: string }>;
};

function selectedDate(input?: string) {
  if (!input) return new Date();
  const parsed = parseISO(input);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default async function DailyReportPage({ searchParams }: DailyReportPageProps) {
  const params = await searchParams;
  const day = selectedDate(params.date);
  const start = startOfDay(day);
  const end = endOfDay(day);

  const visits = await prisma.visit.findMany({
    where: {
      visitAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      customer: true,
      visitServices: true,
    },
    orderBy: { visitAt: "asc" },
  });

  const totalPaid = visits.reduce((sum, visit) => sum + (visit.amountPaidCents ?? 0), 0);
  const serviceCounts = new Map<string, number>();
  for (const visit of visits) {
    for (const service of visit.visitServices) {
      serviceCounts.set(service.serviceName, (serviceCounts.get(service.serviceName) ?? 0) + 1);
    }
  }

  const sortedServices = [...serviceCounts.entries()].sort((a, b) => b[1] - a[1]);
  const reportDate = format(day, "yyyy-MM-dd");

  return (
    <div className="space-y-8 print:space-y-4">
      <PageHeader
        eyebrow="Operations"
        title="Daily summary"
        description="Review the visits and money collected for a single day, then print or export the summary."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/api/reports/daily?date=${reportDate}`}
              className="rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-rose-300 hover:text-rose-600"
            >
              Export CSV
            </Link>
            <PrintButton label="Print summary" />
          </div>
        }
      />

      <SectionCard title="Choose a day" description="Use any day to review visits and export the daily summary.">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium text-stone-700">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={reportDate}
              className="rounded-2xl border border-stone-300 px-4 py-3 text-base"
            />
          </div>
          <button className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800">
            Load summary
          </button>
        </form>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
        <SectionCard title={visits.length.toString()} description="Visits recorded">
          <div />
        </SectionCard>
        <SectionCard title={centsToCurrency(totalPaid)} description="Payments recorded">
          <div />
        </SectionCard>
        <SectionCard title={sortedServices.length.toString()} description="Services delivered">
          <div />
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] print:grid-cols-[1.4fr_0.9fr]">
        <SectionCard title="Visits" description={`Visits for ${format(day, "MMMM d, yyyy")}.`}>
          <div className="space-y-4">
            {visits.map((visit) => (
              <div key={visit.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-stone-900">{visit.customer.name}</p>
                    <p>{formatDateTime(visit.visitAt)}</p>
                    <p>{visit.visitServices.map((service) => service.serviceName).join(", ") || "No services recorded"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-stone-900">{centsToCurrency(visit.amountPaidCents ?? 0)}</p>
                    <p>{visit.paymentMethod || "No payment method"}</p>
                  </div>
                </div>
              </div>
            ))}
            {!visits.length ? (
              <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-sm text-stone-500">
                No visits recorded for this day.
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Service mix" description="How many times each service appeared in the day’s visits.">
          <div className="space-y-3">
            {sortedServices.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm">
                <span className="font-medium text-stone-900">{name}</span>
                <span className="text-stone-600">{count}</span>
              </div>
            ))}
            {!sortedServices.length ? (
              <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-sm text-stone-500">
                No service activity for this day.
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
