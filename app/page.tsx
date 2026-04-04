import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { centsToCurrency } from "@/lib/utils";
import CategorySection from "@/components/category-section";
import { CartProvider } from "@/components/cart-context";
import { CartWidget } from "@/components/cart-widget";

export const dynamic = "force-dynamic";

function getServiceDescription(name: string): string {
  // Makeup
  if (name.includes("Everyday Glam") || name.includes("Basic")) {
    return "Enhance your natural beauty with a fresh, wearable look. Features light to medium coverage for a skin-like finish, neutral eye tones, and a soft lip. Perfect for outings, casual events, daytime functions or photos where you want an effortless, polished glow.";
  }
  if (name.includes("Party") && name.includes("Look")) {
    return "Get camera-ready with a bold, noticeable glam. Expect medium to full coverage with a defined contour, dramatic smokey or colorful eyes, and a long-lasting bold or deep-nude lip. Ideal for parties, receptions, birthdays, and night events.";
  }
  if (name === "Bridal Makeup") {
    return "A timeless, elegant, and camera-perfect look designed to last 10–12+ hours. We use high-grade skin prep, seamless full coverage, and waterproof, tear-proof eye looks. Meticulously crafted for HD cameras. Perfect for your wedding ceremonies and main events.";
  }
  if (name.includes("Hair")) {
    return "Complete your look with professional hair styling. From sleek, voluminous blowouts to intricate, elegant updos, we tailor the style to frame your face perfectly and complement your outfit. Hair extensions and hair accessories add-ons have an additional cost.";
  }

  // Saree
  if (name.includes("Lehenga")) {
    return "Professional lehenga draping to ensure a flawless, comfortable fit that looks stunning and stays secure throughout your event.";
  }
  if (name.includes("Full Saree Iron") && name.includes("Draping")) {
    return "The complete saree package — ironing, pre-pleating, and expert draping so you can show up stress-free and perfectly styled.";
  }
  if (name.includes("Full Saree Iron")) {
    return "Full ironing and pre-pleating service so your saree is crisp, ready, and perfectly prepared before draping.";
  }
  if (name.includes("Saree Pre-pleating")) {
    return "Neat box or hanger folding of your saree pleats ahead of time, saving you time and ensuring a polished look.";
  }
  if (name.includes("Saree Draping")) {
    return "Experience a flawless, comfortable fit with professional saree draping, tailored to your style and event.";
  }

  // Facials & D-Tan
  if (name === "Fruit Facial") return "A refreshing facial using natural fruit extracts to brighten, hydrate, and restore your skin's natural glow.";
  if (name === "Herbal Facial") return "A soothing herbal facial using botanical ingredients to calm skin, reduce dullness, and leave a naturally refreshed glow.";
  if (name === "Pearl Facial") return "Luxurious pearl-infused facial to lighten, nourish, and give your skin a luminous, dewy finish.";
  if (name === "Wine Facial") return "A rejuvenating wine-based facial rich in antioxidants that tightens pores, reduces fine lines, and adds a youthful radiance.";
  if (name === "Gold Facial") return "Premium gold facial that boosts collagen, reduces inflammation, and leaves skin with a rich, healthy golden glow.";
  if (name === "Diamond Facial") return "Our most luxurious facial — diamond dust exfoliation for deep cleansing, tightening, and an unmatched radiant finish.";
  if (name === "D-Tan") return "Targeted de-tan treatment to remove sun damage and uneven skin tone, restoring your natural complexion.";
  if (name === "D-Tan + Facial") return "Combined D-Tan and facial treatment for complete skin restoration — removes tan and deeply nourishes in one session.";

  // Threading
  if (name.includes("Threading")) {
    if (name.includes("Full Face")) return "Complete face threading covering eyebrows, upper lip, chin, forehead, jawline, and sideburns for a clean, polished look.";
    if (name.includes("Eyebrow")) return "Precise eyebrow shaping using thread for clean arches and defined brows.";
    if (name.includes("Upper Lip")) return "Quick and gentle upper lip threading for smooth, hair-free skin.";
    if (name.includes("Lower Chin")) return "Neat lower chin threading to remove fine hair and define your jawline.";
    if (name.includes("Forehead")) return "Forehead threading to remove peach fuzz and give a smooth, clean canvas.";
    if (name.includes("Jawline")) return "Detailed jawline threading for sharp, well-defined facial contours.";
  }

  // Waxing
  if (name.includes("Waxing")) {
    if (name.includes("Full Legs")) return "Full leg waxing from ankle to thigh for smooth, long-lasting results. Regular and chocolate wax options available.";
    if (name.includes("Half Legs")) return "Lower-leg waxing from ankle to knee for a quick, smooth finish. Regular and chocolate wax available.";
    if (name.includes("Hands")) return "Full arm and hand waxing for silky-smooth skin. Choose between regular or chocolate wax.";
    if (name.includes("Underarms")) return "Quick underarm waxing for clean, smooth results with minimal irritation.";
    if (name.includes("Side Face")) return "Gentle side-face waxing to remove fine hair along the cheeks and sideburns.";
    if (name.includes("Forehead")) return "Forehead waxing for a clean, smooth look — ideal paired with threading.";
    if (name.includes("Upper Lip")) return "Precise upper lip waxing for smooth, hair-free skin.";
    if (name.includes("Chin")) return "Chin waxing for a clean, defined look.";
  }

  // Henna Hair Color
  if (name === "Henna Hair Color") return "Natural henna hair color application service for healthy-looking coverage and shine. This service includes application only; hair wash is not included.";

  // Massage
  if (name === "Hair Oil Massage") return "Relaxing scalp and hair oil massage to reduce stress, improve circulation, and nourish roots for healthier hair.";
  if (name === "Back Massage") return "Therapeutic back massage focused on relieving muscle tension, improving blood flow, and restoring comfort.";

  // Special Packages
  if (name === "Party Package") return "Complete party-ready bundle — Makeup + Hair + Saree Draping. Perfect for receptions, birthdays, and celebrations.";
  if (name === "Bridal Package") return "All-inclusive bridal bundle — Makeup + Hair + Saree Draping.";

  // Travel & Add-ons
  if (name.includes("Travel")) return "Distance-based travel fee for on-location services. Final fee confirmed before booking.";
  if (name.includes("Early Morning") || name.includes("Late Evening")) return "Additional fee for appointments before 8 AM or after 7 PM.";

  return "Premium styling service tailored perfectly to your individual preferences and event needs.";
}

export default async function Home() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" }
  });

  const addOnKeywords = ["Travel", "Early Morning"];
  const isAddOn = (name: string) => addOnKeywords.some((kw) => name.includes(kw));

  const isMakeup = (name: string) =>
    ["Basic Everyday Glam", "Party & Event Look", "Hair Styles"].includes(name);
  const isSaree = (name: string) =>
    name.includes("Saree") || name.includes("Lehenga");
  const isFacial = (name: string) =>
    name.includes("Facial") || name.includes("D-Tan");
  const isThreading = (name: string) => name.includes("Threading");
  const isWaxing = (name: string) => name.includes("Waxing");
  const isHenna = (name: string) => name === "Henna Hair Color";
  const isMassage = (name: string) =>
    name === "Hair Oil Massage" || name === "Back Massage";
  const isPackage = (name: string) =>
    name === "Party Package" || name === "Bridal Package";

  const makeupServices = services.filter((s) => isMakeup(s.name)).sort((a, b) => {
    const order = [
      "Hair Styles",
      "Basic Everyday Glam",
      "Party & Event Look"
    ];
    const indexA = order.findIndex(name => a.name.trim() === name);
    const indexB = order.findIndex(name => b.name.trim() === name);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
  const sareeServices = services.filter((s) => isSaree(s.name)).sort((a, b) => {
    const order = [
      "Saree Draping",
      "Saree Pre-pleating",
      "Full Saree Iron + Pre-pleating",
      "Full Saree Iron + Pre-pleating + Draping",
      "Lehenga Draping"
    ];
    // Exact match is best, but includes works if names are exact on db
    const indexA = order.findIndex(name => a.name.trim() === name);
    const indexB = order.findIndex(name => b.name.trim() === name);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
  const facialServices = services.filter((s) => isFacial(s.name)).sort((a, b) => { const order = ["Herbal Facial", "Fruit Facial", "Wine Facial", "Pearl Facial", "Gold Facial", "Diamond Facial", "D-Tan", "D-Tan + Facial"]; const indexA = order.findIndex(name => a.name.trim() === name); const indexB = order.findIndex(name => b.name.trim() === name); return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB); });
  const threadingServices = services.filter((s) => isThreading(s.name)).sort((a, b) => {
    const order = ["Eyebrow Threading", "Upper Lip Threading", "Lower Chin Threading", "Forehead Threading", "Jawline Threading", "Full Face Threading"];
    const indexA = order.findIndex(name => a.name.trim() === name);
    const indexB = order.findIndex(name => b.name.trim() === name);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
  const waxingServices = services
    .filter((s) => isWaxing(s.name) && s.name.trim() !== "Forehead Waxing")
    .sort((a, b) => {
      const order = ["Upper Lip Waxing", "Chin Waxing", "Side Face Waxing", "Underarms Waxing", "Hands Waxing", "Half Legs Waxing", "Full Legs Waxing"];
      const indexA = order.findIndex(name => a.name.trim() === name);
      const indexB = order.findIndex(name => b.name.trim() === name);
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });
  const hennaServices = services.filter((s) => isHenna(s.name));
  const massageServices = services.filter((s) => isMassage(s.name));
    const packageServices = services.filter((s) => isPackage(s.name)).sort((a, b) => {
      const order = ["Party Package", "Bridal Package"];
      const indexA = order.findIndex(name => a.name.trim() === name);
      const indexB = order.findIndex(name => b.name.trim() === name);
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });
  const addOns = services.filter((s) => isAddOn(s.name)).sort((a, b) => {
    const order = [
      "Travel Within 5 Miles",
      "Travel 5 to 10 Miles",
      "Travel 10 to 15 Miles",
      "Travel Over 15 Miles",
      "Early Morning / Late Evening Slot"
    ];
    const indexA = order.findIndex(name => a.name.includes(name));
    const indexB = order.findIndex(name => b.name.includes(name));
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  return (
    <CartProvider>
      <div className="bg-[#FAF8F5] min-h-screen font-sans">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="max-w-xl">
            <h1 className="text-5xl font-medium tracking-tight text-stone-900 sm:text-6xl leading-[1.1]">
              Always make room for beauty in your life
            </h1>
            <p className="mt-4 text-lg text-stone-600 leading-relaxed max-w-md">
              Expert hair, makeup, and premium styling services tailored perfectly to your individual preferences and event needs.
            </p>
            <div className="mt-7 flex items-center gap-4">
              <a
                href="#services"
                className="rounded-[32px] bg-stone-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 transition"
              >
                make a reservation
              </a>
              <a
                href="#services"
                className="rounded-[32px] border border-stone-300 px-8 py-3.5 text-sm font-semibold text-stone-900 hover:border-stone-500 hover:bg-stone-50 transition"
              >
                our services
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-bl-[100px] shadow-lg">
            <Image 
              src="/service-images/hair-makeup.png" 
              alt="AR Glam Studio Styling" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top"
            />
          </div>
        </div>

        {/* Info Grid (Contact, Hours, Location) */}
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3 border-t border-stone-200/60 pt-10">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 mb-6 group transition-colors hover:bg-stone-200">
              <svg className="h-5 w-5 text-stone-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.909-6.847-6.846l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
            </div>
            <h3 className="font-semibold tracking-wide text-stone-900">Contact</h3>
            <p className="mt-3 text-sm text-stone-500">(469) 469-8217</p>
            <p className="mt-1 text-sm text-stone-500">hello@arglamstudio.com</p>
            <a 
              href="https://instagram.com/ar_glamor_hub" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-rose-500 transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              @ar_glamor_hub
            </a>
          </div>
          <div className="text-center sm:border-l sm:border-r border-stone-200/60 px-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 mb-6 group transition-colors hover:bg-stone-200">
              <svg className="h-5 w-5 text-stone-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <h3 className="font-semibold tracking-wide text-stone-900">Hours</h3>
            <p className="mt-3 text-sm text-stone-500">Mon to Fri: 3:30 PM – 7:30 PM</p>
            <p className="mt-1 text-sm text-stone-500">Sat & Sun: 9:00 AM – 7:30 PM</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 mb-6 group transition-colors hover:bg-stone-200">
              <svg className="h-5 w-5 text-stone-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
            </div>
            <h3 className="font-semibold tracking-wide text-stone-900">Location</h3>
            <p className="mt-3 text-sm text-stone-500">North Dallas Area</p>
            <p className="mt-1 text-sm text-stone-500">Texas, United States</p>
          </div>
        </div>
      </section>

      {/* Detailed Services Section (Left Image, Right Accordions) */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl text-balance">Curated Services</h2>
          <p className="mt-4 text-base text-stone-500">Transparent pricing. Premium results. Detailed breakdown below.</p>
        </div>
        
        <div className="space-y-20">
          {/* Makeup & Hair */}
          {makeupServices.length > 0 && (
            <div id={`details-makeup-hair`} className="scroll-mt-24">
              <CategorySection
                id="makeup-hair"
                title="Makeup & Hair"
                description="From natural daytime enhancements to full glamorous bridal looks, perfectly tailored to your style."
                  imageUrl="/service-images/makeup-hair-service.jpg"
                services={makeupServices.map((service) => ({ ...service, description: getServiceDescription(service.name) }))}
              />
            </div>
          )}

          {/* Saree & Lehenga */}
          {sareeServices.length > 0 && (
            <div id={`details-saree-lehenga`} className="scroll-mt-24">
              <CategorySection
                id="saree-lehenga"
                title="Saree & Lehenga"
                description="Professional draping, ironing, and pre-pleating for a flawless, secure, and comfortable fit."
                imageUrl="/service-images/saree-draping-service.png"
                services={sareeServices.map((service) => ({ ...service, description: getServiceDescription(service.name) }))}
              />
            </div>
          )}

          {/* Facials & D-Tan */}
          {facialServices.length > 0 && (
            <div id={`details-facials`} className="scroll-mt-24">
              <CategorySection
                id="facials"
                title="Facials & D-Tan"
                description="Rejuvenate your skin with our premium facials and targeted de-tan treatments for a radiant complexion."
                imageUrl="/service-images/diamond-facial-service.png"
                services={facialServices.map((service) => ({ ...service, description: getServiceDescription(service.name) }))}
              />
            </div>
          )}

          {/* Threading */}
          {threadingServices.length > 0 && (
            <div id={`details-threading`} className="scroll-mt-24">
              <CategorySection
                id="threading"
                title="Threading"
                description="Precise, gentle threading services for perfectly shaped brows and a clean, fuzz-free face."
                imageUrl="/service-images/eyebrow-threading-service.png"
                services={threadingServices.map((service) => ({ ...service, description: getServiceDescription(service.name) }))}
              />
            </div>
          )}

          {/* Waxing */}
          {waxingServices.length > 0 && (
            <div id={`details-waxing`} className="scroll-mt-24">
              <CategorySection
                id="waxing"
                title="Waxing"
                description="Smooth, long-lasting hair removal with high-quality wax options designed for minimal irritation."
                imageUrl="/service-images/full-legs-waxing-service.png"
                services={waxingServices.map((service) => ({ ...service, description: getServiceDescription(service.name) }))}
              />
            </div>
          )}

          {/* Henna */}
          {hennaServices.length > 0 && (
            <div id={`details-henna`} className="scroll-mt-24">
              <CategorySection
                id="henna"
                title="Henna Hair Color"
                description="Natural henna-based hair color for shine and coverage. Application only — hair wash is not included."
                imageUrl="/service-images/henna-service.png"
                services={hennaServices.map((service) => ({ ...service, description: getServiceDescription(service.name) }))}
              />
            </div>
          )}

          {/* Massage */}
          {massageServices.length > 0 && (
            <div id={`details-massage`} className="scroll-mt-24">
              <CategorySection
                id="massage"
                title="Massage"
                description="Relaxing therapeutic massage treatments designed to relieve tension and restore comfort."
                imageUrl="/service-images/hair-oil-massage-service.png"
                services={massageServices.map((service) => ({ ...service, description: getServiceDescription(service.name) }))}
              />
            </div>
          )}

          {/* Special Packages */}
          {packageServices.length > 0 && (
            <div id={`details-packages`} className="scroll-mt-24">
              <CategorySection
                id="packages"
                title="Special Packages"
                description="Bundled services with built-in savings for parties and bridal bookings."
                imageUrl="/service-images/bridal-package-service.png"
                services={packageServices.map((service) => ({ ...service, description: getServiceDescription(service.name) }))}
              />
            </div>
          )}
        </div>
      </section>

      {/* Additional Fees Section */}
      {addOns.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-10 mb-16">
          <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
            <h3 className="mb-3 text-center text-xl font-medium tracking-tight text-stone-900">
              Travel & Add-on Fees
            </h3>
            <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-stone-500">
              Services provided outside of standard studio hours or locations will incur these additional base charges.
            </p>
            <div className="divide-y divide-stone-100">
              {addOns.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between py-4">
                  <span className="text-sm font-medium text-stone-800">{addon.name}</span>
                  <span className="text-sm font-semibold text-stone-500">From {centsToCurrency(addon.priceDefault ?? 0)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Preparation Block (Bottom Template Layout) */}
      <section id="prep" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 border-t border-stone-200/60">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl">What to know before you glow</h2>
          <p className="mt-4 text-base text-stone-500">Follow these simple preparation steps for the best possible results.</p>
        </div>
        
        <div className="mx-auto">
          <dl className="grid gap-10 sm:grid-cols-2">
            <div>
              <div className="mb-4 text-2xl">💆‍♀️</div>
                <dt className="text-sm font-semibold text-stone-900">Makeup Prep</dt>
                <dd className="mt-2 text-sm text-stone-500 leading-relaxed">
                  Arrive with a clean face. Do not apply heavy SPF. If you need threading/waxing, do it 2–3 days prior.
                </dd>
              </div>
              <div>
                <div className="mb-4 text-2xl">💇‍♀️</div>
                <dt className="text-sm font-semibold text-stone-900">Hair Prep</dt>
                <dd className="mt-2 text-sm text-stone-500 leading-relaxed">
                  Wash hair night before. Keep it 100% dry on arrival unless you are booked specifically for a blowout.
                </dd>
              </div>
              <div>
                <div className="mb-4 text-2xl">👗</div>
                <dt className="text-sm font-semibold text-stone-900">Saree Prep</dt>
                <dd className="mt-2 text-sm text-stone-500 leading-relaxed">
                  Wear your footwear (heels) and inner skirt before draping begins for a secure, correct fit length.
                </dd>
              </div>
              <div>
                <div className="mb-4 text-2xl">🚗</div>
                <dt className="text-sm font-semibold text-stone-900">Travel & Setup</dt>
                <dd className="mt-2 text-sm text-stone-500 leading-relaxed">
                  For on-location services, provide a well-lit area near an outlet. We arrive 15 mins early to set up.
                </dd>
              </div>
            </dl>
        </div>
      </section>

      {/* Footer block */}
      <footer className="bg-stone-900 text-stone-300 py-8 text-center text-sm border-t border-stone-800">
        <p>© {new Date().getFullYear()} AR Glam Studio. All rights reserved.</p>
      </footer>
      <CartWidget />
      </div>
    </CartProvider>
  );
}
