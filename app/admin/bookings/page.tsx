import { createCustomerFromBookingAction, matchCalendlyBookingAction, syncCalendlyAction } from "@/app/actions";
import { MessageBanner, PageHeader, SectionCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { displayPhone, formatDateTime } from "@/lib/utils";

type BookingsPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const params = await searchParams;
  const [bookings, customers] = await Promise.all([
    prisma.calendlyEvent.findMany({
      include: { matchedCustomer: true },
      orderBy: [{ scheduledAt: "desc" }, { updatedAt: "desc" }],
      take: 100,
    }),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, phone: true, email: true },
      take: 200,
    }),
  ]);

  const unmatched = bookings.filter((booking) => !booking.matchedCustomerId);
  const matched = bookings.filter((booking) => booking.matchedCustomerId);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Calendly"
        title="Bookings"
        description="Sync upcoming bookings from Calendly, review unmatched clients, and link them to customer records."
        action={
          <form action={syncCalendlyAction}>
            <button className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-600">
              Run Calendly sync
            </button>
          </form>
        }
      />
      <MessageBanner message={params.message} />

      <SectionCard
        title="Integration notes"
        description="Set CALENDLY_API_TOKEN and CALENDLY_USER_URI in the app .env before running sync. Use the webhook endpoint later for near-real-time updates."
      >
        <code className="rounded-xl bg-stone-100 px-3 py-2 text-sm text-stone-700">
          /api/calendly/webhook
        </code>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <SectionCard title="Unmatched bookings" description="Link the booking to an existing customer or create a new customer from the booking details.">
          <div className="space-y-4">
            {unmatched.map((booking) => (
              <div key={booking.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-stone-900">{booking.inviteeName || "Unknown invitee"}</p>
                  <p className="text-sm text-stone-600">
                    {displayPhone(booking.inviteePhone)} · {booking.inviteeEmail || "No email"}
                  </p>
                  <p className="text-sm text-stone-500">
                    {booking.eventName || "Calendly booking"} · {formatDateTime(booking.scheduledAt)}
                  </p>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                  <form action={matchCalendlyBookingAction} className="flex flex-col gap-3 md:flex-row">
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <select name="customerId" className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base">
                      <option value="">Match to customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} · {displayPhone(customer.phone)} · {customer.email || "No email"}
                        </option>
                      ))}
                    </select>
                    <button className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-800">
                      Link
                    </button>
                  </form>
                  <form action={createCustomerFromBookingAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <button className="w-full rounded-2xl border border-rose-300 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50">
                      Create customer
                    </button>
                  </form>
                </div>
              </div>
            ))}

            {!unmatched.length ? (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
                No unmatched bookings right now.
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Matched bookings" description="Bookings already linked to a customer in AR Studio.">
          <div className="space-y-4">
            {matched.map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
                <p className="font-semibold text-stone-900">{booking.inviteeName || "Unknown invitee"}</p>
                <p className="text-sm text-stone-600">{booking.eventName || "Calendly booking"}</p>
                <p className="text-sm text-stone-500">{formatDateTime(booking.scheduledAt)}</p>
                <p className="mt-2 text-sm text-emerald-700">
                  Matched to {booking.matchedCustomer?.name || "customer"}.
                </p>
              </div>
            ))}

            {!matched.length ? (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
                No matched bookings yet.
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
