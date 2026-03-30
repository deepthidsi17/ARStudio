import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { centsToCurrency } from "@/lib/utils";
import ServiceCard from "@/components/service-card";

export const dynamic = "force-dynamic";

function getServiceDescription(name: string): string {
  if (name.includes("Everyday Glam") || name.includes("Basic")) {
    return "Enhance your natural beauty with a fresh, wearable look. Features light to medium coverage for a skin-like finish, neutral eye tones, and a soft lip. Perfect for outings, casual events, daytime functions or photos where you want an effortless, polished glow.";
  }
  if (name.includes("Party") || name.includes("Event")) {
    return "Get camera-ready with a bold, noticeable glam. Expect medium to full coverage with a defined contour, dramatic smokey or colorful eyes, and a long-lasting bold or deep-nude lip. Ideal for parties, receptions, birthdays, and night events.";
  }
  if (name.includes("Bridal")) {
    return "A timeless, elegant, and camera-perfect look designed to last 10–12+ hours. We use high-grade skin prep, seamless full coverage, and waterproof, tear-proof eye looks. Meticulously crafted for HD cameras. Perfect for your wedding ceremonies and main events.";
  }
  if (name.includes("Hair")) {
    return "Complete your look with professional hair styling. From sleek, voluminous blowouts to intricate, elegant updos, we will tailor the style to frame your face perfectly and complement your outfit.";
  }
  if (name.includes("Saree")) {
    return "Experience a flawless, comfortable fit with professional saree styling. From simple traditional draping to full ironing and pre-pleating to save time, we assure you'll look elegant and feel secure throughout your entire event.";
  }
  return "Premium styling service tailored perfectly to your individual preferences and event needs.";
}

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
                  <ServiceCard 
                    key={service.id} 
                    service={{ ...service, description: getServiceDescription(service.name) }} 
                  />
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
                  <ServiceCard 
                    key={service.id} 
                    service={{ ...service, description: getServiceDescription(service.name) }} 
                  />
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
                  <ServiceCard 
                    key={service.id} 
                    service={{ ...service, description: getServiceDescription(service.name) }} 
                  />
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
                  <span className="text-sm font-semibold text-stone-600">From {centsToCurrency(addon.priceDefault ?? 0)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
