import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { centsToCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" }
  });

  const addOnKeywords = ["Travel", "Early Morning"];
  const isAddOn = (name: string) => addOnKeywords.some((kw) => name.includes(kw));

  const isMakeup = (name: string) => name.includes("Makeup") || name.includes("Glam") || name.includes("Look");
  const isHair = (name: string) => name.includes("Hair");
  const isSaree = (name: string) => name.includes("Saree");

  const makeupServices = services.filter((s) => !isAddOn(s.name) && isMakeup(s.name));
  const hairServices = services.filter((s) => !isAddOn(s.name) && isHair(s.name));
  const sareeServices = services.filter((s) => !isAddOn(s.name) && isSaree(s.name));
  const addOns = services.filter((s) => isAddOn(s.name));

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-stone-900 px-6 py-12 text-center sm:px-8 sm:py-16 mx-4 sm:mx-6 lg:mx-8 mt-4">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-1/4 -top-1/4 h-[150%] w-[150%] animate-[spin_30s_linear_infinite] bg-[conic-gradient(at_center,transparent_40%,#fda4af_80%,transparent)]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Elevate your style at AR Studio.
          </h1>
          <p className="mt-4 text-base leading-6 text-stone-300">
            Expert hair, makeup, and styling services tailored just for you. Book your next appointment today and experience the difference.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <a
              href="#"
              className="rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            >
              Book an Appointment
            </a>
            
            <a href="mailto:hello@arglamstudio.com" className="text-sm font-semibold text-stone-300 hover:text-white transition">
              hello@arglamstudio.com
            </a>
            <span className="hidden text-stone-500 sm:inline">•</span>
            <a href="tel:4694698217" className="text-sm font-semibold text-stone-300 hover:text-white transition">
              (469) 469-8217
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Our Services</h2>
          <p className="mt-3 text-base text-stone-600">Transparent pricing for premium results.</p>
        </div>
        
        <div className="space-y-12">
          {/* Makeup Category */}
          {makeupServices.length > 0 && (
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-stone-900">Makeup</h3>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {makeupServices.map((service) => (
                  <div key={service.id} className="group relative overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-rose-50 text-rose-200"><span className="text-4xl">✦</span></div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-stone-900">{service.name}</h3>
                        <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-800">{centsToCurrency(service.priceDefault ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hair Category */}
          {hairServices.length > 0 && (
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-stone-900">Hair Styling</h3>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {hairServices.map((service) => (
                  <div key={service.id} className="group relative overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-rose-50 text-rose-200"><span className="text-4xl">✦</span></div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-stone-900">{service.name}</h3>
                        <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-800">{centsToCurrency(service.priceDefault ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saree Category */}
          {sareeServices.length > 0 && (
            <div>
              <h3 className="mb-6 text-2xl font-semibold text-stone-900">Saree Draping</h3>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {sareeServices.map((service) => (
                  <div key={service.id} className="group relative overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-rose-50 text-rose-200"><span className="text-4xl">✦</span></div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-stone-900">{service.name}</h3>
                        <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-800">{centsToCurrency(service.priceDefault ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Additional Fees Section */}
      {addOns.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="mb-3 text-center text-xl font-bold tracking-tight text-stone-900">
              Additional Travel & Time Fees
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-stone-600">
              Services provided outside of standard studio hours or locations will incur these additional base charges.
            </p>
            <div className="divide-y divide-stone-100">
              {addOns.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-stone-800">{addon.name}</span>
                  <span className="text-sm font-semibold text-stone-600">{centsToCurrency(addon.priceDefault ?? 0)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
