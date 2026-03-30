import Link from "next/link";

import { PageHeader, SectionCard } from "@/components/ui";

const staffPages = [
  {
    href: "/customers",
    title: "Customers",
    description: "Review customer history, contact details, and notes.",
  },
  {
    href: "/visits",
    title: "Visits",
    description: "Track completed visits, payments, and follow-up notes.",
  },
  {
    href: "/services",
    title: "Services",
    description: "Manage the service catalog, pricing, and gallery images.",
  },
  {
    href: "/reports/daily",
    title: "Daily Summary",
    description: "Print or export a daily operational summary for staff.",
  },
];

export default function StaffPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Staff"
        title="Staff pages"
        description="These pages support day-to-day salon operations and are intended for staff use."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {staffPages.map((page) => (
          <SectionCard key={page.href} title={page.title} description={page.description}>
            <Link href={page.href} className="text-sm font-semibold text-rose-600">
              Open {page.title}
            </Link>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
