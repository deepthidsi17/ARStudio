import { notFound } from "next/navigation";

import { deleteCustomerAction, updateCustomerAction } from "@/app/actions";
import { PageHeader, SectionCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { HEALTH_FLAGS } from "@/lib/consent";
import { centsToCurrency, displayPhone, formatDateTime, visitSourceLabel } from "@/lib/utils";

const FLAG_LABELS: Record<string, string> = Object.fromEntries(
  HEALTH_FLAGS.map((f) => [f.name, f.label]),
);

type ConsentHealthHistory = {
  allergies?: string;
  skinConditions?: string;
  medications?: string;
  reactionDetails?: string;
  flags?: string[];
};

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
        include: { visitServices: true },
        orderBy: { visitAt: "desc" },
      },
      appointments: {
        orderBy: { scheduledAt: "desc" },
        take: 10,
      },
      consents: {
        orderBy: { createdAt: "desc" },
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

      <SectionCard title="Appointments" description="Recent native appointments scheduled by this customer.">
        <div className="space-y-3">
          {customer.appointments.map((appt) => (
            <div key={appt.id} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
              <p className="font-semibold text-stone-900">{appt.name || "Appointment"}</p>
              <p>{formatDateTime(appt.scheduledAt)}</p>
              <p>Status: {appt.status}</p>
            </div>
          ))}
          {!customer.appointments.length ? (
            <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-sm text-stone-500">
              No recent appointments.
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        title="Consent &amp; waiver records"
        description="Signed consent and liability waiver forms on file for this customer."
      >
        <div className="space-y-4">
          {customer.consents.map((consent) => {
            const health = (consent.healthHistory as ConsentHealthHistory | null) ?? {};
            const flags = health.flags ?? [];
            return (
              <div key={consent.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-stone-900">
                      Signed by {consent.signatureName}
                      {consent.isMinor && consent.guardianName
                        ? ` (guardian: ${consent.guardianName})`
                        : ""}
                    </p>
                    <p className="text-sm text-stone-600">{formatDateTime(consent.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-stone-600">
                      Form v{consent.formVersion}
                    </span>
                    {consent.releaseAccepted ? (
                      <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                        Release accepted
                      </span>
                    ) : (
                      <span className="rounded-full border border-red-300 bg-red-50 px-2.5 py-1 font-medium text-red-700">
                        Release NOT accepted
                      </span>
                    )}
                    <span className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-stone-600">
                      Photos: {consent.photoConsent ? "consented" : "declined"}
                    </span>
                  </div>
                </div>

                <dl className="mt-3 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
                  {health.allergies ? (
                    <div>
                      <dt className="text-xs uppercase tracking-[0.2em] text-stone-400">Allergies</dt>
                      <dd>{health.allergies}</dd>
                    </div>
                  ) : null}
                  {health.skinConditions ? (
                    <div>
                      <dt className="text-xs uppercase tracking-[0.2em] text-stone-400">Skin conditions</dt>
                      <dd>{health.skinConditions}</dd>
                    </div>
                  ) : null}
                  {health.medications ? (
                    <div>
                      <dt className="text-xs uppercase tracking-[0.2em] text-stone-400">Medications</dt>
                      <dd>{health.medications}</dd>
                    </div>
                  ) : null}
                  {health.reactionDetails ? (
                    <div>
                      <dt className="text-xs uppercase tracking-[0.2em] text-stone-400">Notes</dt>
                      <dd>{health.reactionDetails}</dd>
                    </div>
                  ) : null}
                </dl>

                {flags.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {flags.map((flag) => (
                      <span
                        key={flag}
                        className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
                      >
                        ⚠ {FLAG_LABELS[flag] ?? flag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {consent.signatureImage ? (
                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Drawn signature</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={consent.signatureImage}
                      alt={`Signature of ${consent.signatureName}`}
                      className="mt-1 h-20 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                ) : null}
              </div>
            );
          })}

          {!customer.consents.length ? (
            <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-sm text-stone-500">
              No signed consent forms on file yet.
            </div>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
