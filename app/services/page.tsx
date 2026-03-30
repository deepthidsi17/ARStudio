import { createServiceAction, updateServiceAction } from "@/app/actions";
import { MessageBanner, PageHeader, SectionCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { centsToCurrency } from "@/lib/utils";

type ServicesPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const params = await searchParams;
  const services = await prisma.service.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Service catalog"
        title="Services"
        description="Manage the list of services available on the client intake form and the default price shown to staff."
      />
      <MessageBanner message={params.message} />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <SectionCard title="Add a service" description="Create a new service or reactivate an existing one by name.">
          <form action={createServiceAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-stone-700">
                Service name
              </label>
              <input id="name" name="name" required className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base" />
            </div>
            <div className="space-y-2">
              <label htmlFor="priceDefault" className="text-sm font-medium text-stone-700">
                Default price
              </label>
              <input
                id="priceDefault"
                name="priceDefault"
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="imageUrl" className="text-sm font-medium text-stone-700">
                Picture URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
                placeholder="https://..."
              />
            </div>
            <button className="w-full rounded-2xl bg-rose-500 px-4 py-3 text-base font-semibold text-white hover:bg-rose-600">
              Save service
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Current services" description="Toggle availability and update the default price used by staff.">
          <div className="space-y-4">
            {services.map((service) => (
              <form key={service.id} action={updateServiceAction} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <input type="hidden" name="serviceId" value={service.id} />
                <div className="grid gap-4 md:grid-cols-[1.2fr_200px_220px_140px] md:items-end">
                  <div>
                    <p className="text-base font-semibold text-stone-900">{service.name}</p>
                    <p className="text-sm text-stone-500">Current: {centsToCurrency(service.priceDefault ?? 0)}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700" htmlFor={`price-${service.id}`}>
                      Default price
                    </label>
                    <input
                      id={`price-${service.id}`}
                      name="priceDefault"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={service.priceDefault ? (service.priceDefault / 100).toFixed(2) : ""}
                      className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700" htmlFor={`image-${service.id}`}>
                      Picture URL
                    </label>
                    <input
                      id={`image-${service.id}`}
                      name="imageUrl"
                      type="url"
                      defaultValue={service.imageUrl ?? ""}
                      className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-700" htmlFor={`active-${service.id}`}>
                      Active
                    </label>
                    <select
                      id={`active-${service.id}`}
                      name="active"
                      defaultValue={service.active ? "true" : "false"}
                      className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-base"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="rounded-2xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800">
                    Update
                  </button>
                </div>
              </form>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
