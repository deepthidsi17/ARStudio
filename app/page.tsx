import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { centsToCurrency } from "@/lib/utils";
import { PageHeader, SectionCard } from "@/components/ui";

export default async function Home() {
  const [customerCount, visitCount, serviceCount, bookingCount, totalCollected] =
    await Promise.all([
      prisma.customer.count(),
      prisma.visit.count(),
      prisma.service.count({ where: { active: true } }),
      prisma.calendlyEvent.count(),
      prisma.visit.aggregate({ _sum: { amountPaidCents: true } }),
    ]);

  const stats = [
    { label: "Customers", value: customerCount.toString() },
    { label: "Visits", value: visitCount.toString() },
    { label: "Active services", value: serviceCount.toString() },
    { label: "Calendly bookings", value: bookingCount.toString() },
    {
      label: "Recorded payments",
      value: centsToCurrency(totalCollected._sum.amountPaidCents ?? 0),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AR Studio"
        title="Client intake and bookings"
        description="Keep client intake simple, review upcoming bookings, and keep salon operations organized in one place."
        action={
          <Link
            href="/checkin"
            className="rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            Open Client Check-In
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-5">
        {stats.map((stat) => (
          <SectionCard key={stat.label} title={stat.value} className="p-5" description={stat.label}>
            <div />
          </SectionCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Client check-in"
          description="Use this page for new or returning clients. Returning clients can be found by phone or email."
        >
          <Link href="/checkin" className="text-sm font-semibold text-rose-600">
            Go to check-in
          </Link>
        </SectionCard>
        <SectionCard
          title="Calendly booking sync"
          description="Pull appointments into the app and match them to customer records by phone or email."
        >
          <Link href="/bookings" className="text-sm font-semibold text-rose-600">
            Review bookings
          </Link>
        </SectionCard>
        <SectionCard
          title="Staff pages"
          description="Customers, visits, services, and daily reporting stay grouped in a separate staff-only area."
        >
          <Link href="/staff" className="text-sm font-semibold text-rose-600">
            Open staff pages
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}
