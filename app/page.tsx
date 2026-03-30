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
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-stone-900 px-6 py-24 text-center sm:px-12 sm:py-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-1/4 -top-1/4 h-[150%] w-[150%] animate-[spin_20s_linear_infinite] bg-[conic-gradient(at_center,transparent_40%,#fda4af_80%,transparent)]" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Elevate your style at AR Studio.
          </h1>
          <p className="mt-6 text-lg leading-8 text-stone-300">
            Expert hair, makeup, and styling services tailored just for you. Book your next appointment today and experience the difference.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {/* The user can update this calendly link! */}
            <a
              href="#"
              className="rounded-full bg-rose-500 px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            >
              Book an Appointment
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Our Services</h2>
          <p className="mt-4 text-lg text-stone-600">Transparent pricing for premium results.</p>
        </div>
        
        <div className="space-y-16">
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
          <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
            <h3 className="mb-4 text-center text-2xl font-bold tracking-tight text-stone-900">
              Additional Travel & Time Fees
            </h3>
            <p className="mx-auto mb-8 max-w-2xl text-center text-stone-600">
              Services provided outside of standard studio hours or locations will incur these additional base charges.
            </p>
            <div className="divide-y divide-stone-100">
              {addOns.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between py-4">
                  <span className="font-medium text-stone-800">{addon.name}</span>
                  <span className="font-semibold text-stone-600">{centsToCurrency(addon.priceDefault ?? 0)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Contact & Footer Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-rose-50 px-6 py-12 sm:px-12 sm:py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Have questions?</h2>
          <p className="mt-2 text-stone-600">We'd love to hear from you. Get in touch to discuss custom packages or special requests.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <a href="mailto:hello@arglamstudio.com" className="font-semibold text-rose-600 hover:text-rose-500">
              Email Us <span aria-hidden="true">&rarr;</span>
            </a>
            <span className="hidden text-stone-300 sm:inline">|</span>
            <a href="tel:4694698217" className="font-semibold text-rose-600 hover:text-rose-500">
              Call or Text: (469) 469-8217 <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
