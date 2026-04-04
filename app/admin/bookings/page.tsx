import { PageHeader, SectionCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { displayPhone, formatDateTime, centsToCurrency } from "@/lib/utils";
import EditBookingTime from "./edit-booking-time";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    include: { services: true },
    orderBy: { scheduledAt: "asc" },
  });

  const upcoming = appointments.filter(a => a.status === "PENDING" || a.status === "CONFIRMED");
  const past = appointments.filter(a => a.status === "COMPLETED" || a.status === "CANCELLED" || a.status === "NO_SHOW");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Appointments"
        title="Manage Bookings"
        description="View and manage incoming native appointments reserved by customers."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <SectionCard title="Upcoming & Pending" description="Action required or scheduled soon.">
          <div className="space-y-4">
            {upcoming.map((appt) => (
              <div key={appt.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-lg font-semibold text-stone-900">{appt.name}</p>
                    <p className="text-sm text-stone-600">
                      {displayPhone(appt.phone)} · {appt.email}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-stone-800 border border-stone-200">
                    {appt.status}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center">
                    <p className="text-sm font-bold text-rose-600">
                      {formatDateTime(appt.scheduledAt)}
                    </p>
                    <EditBookingTime id={appt.id} currentDateTime={appt.scheduledAt} isPast={false} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-200">
                  <ul className="text-sm text-stone-600 space-y-1 mb-2">
                    {appt.services.map(s => (
                      <li key={s.id} className="flex justify-between">
                        <span>{s.serviceName}</span>
                        <span>{centsToCurrency(s.priceCents || 0)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between font-bold text-stone-900 text-sm">
                    <span>Total:</span>
                    <span>{centsToCurrency(appt.totalPriceCents || 0)}</span>
                  </div>
                </div>
              </div>
            ))}

            {upcoming.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
                No upcoming appointments.
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Past or Cancelled" description="History of previous appointments.">
          <div className="space-y-4">
            {past.map((appt) => (
              <div key={appt.id} className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-stone-900">{appt.name}</p>
                  <span className="text-xs font-medium text-stone-500">{appt.status}</span>
                </div>
                <p className="text-sm text-stone-600">{formatDateTime(appt.scheduledAt)}</p>
                <p className="mt-1 text-sm text-stone-500">
                  {appt.services.length} services · {centsToCurrency(appt.totalPriceCents || 0)}
                </p>
              </div>
            ))}

            {!past.length ? (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
                No past appointments yet.
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
