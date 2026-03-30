import Link from "next/link";

import { MessageBanner, PageHeader, SectionCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { centsToCurrency, displayPhone, formatDateTime } from "@/lib/utils";

type CustomersPageProps = {
  searchParams: Promise<{
    q?: string;
    message?: string;
  }>;
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const q = String(params.q ?? "").trim();

  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : undefined,
    include: {
      visits: {
        include: { visitServices: true },
        orderBy: { visitAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Client records"
        title="Customers"
        description="Look up clients, review visit history, and jump into each customer profile."
      />
      <MessageBanner message={params.message} />
      <SectionCard title="Search customers" description="Search by name, phone number, or email address.">
        <form className="flex flex-col gap-3 sm:flex-row">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search customers"
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
          />
          <button className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800">
            Search
          </button>
        </form>
      </SectionCard>

      <div className="grid gap-4">
        {customers.map((customer) => {
          const lastVisit = customer.visits[0];
          const totalPaid = customer.visits.reduce((sum, visit) => sum + (visit.amountPaidCents ?? 0), 0);

          return (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-rose-300"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-stone-900">{customer.name}</h2>
                  <p className="text-sm text-stone-600">
                    {displayPhone(customer.phone)} · {customer.email || "No email"}
                  </p>
                  <p className="text-sm text-stone-500">
                    Last visit: {lastVisit ? formatDateTime(lastVisit.visitAt) : "No visits yet"}
                  </p>
                </div>
                <div className="grid gap-2 text-sm text-stone-600 sm:grid-cols-3 md:min-w-[340px]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Visits</p>
                    <p className="text-base font-semibold text-stone-900">{customer.visits.length}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Total paid</p>
                    <p className="text-base font-semibold text-stone-900">{centsToCurrency(totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Recent services</p>
                    <p className="text-sm font-medium text-stone-900">
                      {lastVisit?.visitServices.map((service) => service.serviceName).join(", ") || "None"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {!customers.length ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-600">
            No customers found yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
