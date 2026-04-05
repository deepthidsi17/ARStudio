import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultServices = [
  // ── Makeup Services ──
  { name: "Basic Everyday Glam", priceDefault: 4000, imageUrl: "/service-images/hair-makeup.png" },
  { name: "Party & Event Look", priceDefault: 6000, imageUrl: "/service-images/hair-makeup.png" },
  { name: "Bridal Makeup", priceDefault: 8000, imageUrl: "/service-images/hair-makeup.png" },
  { name: "Hair Styles", priceDefault: 4000, imageUrl: "/service-images/hair-makeup.png" },

  // ── Saree Services ──
  { name: "Saree Pre-pleating", priceDefault: 2500, imageUrl: "/service-images/saree-draping-service.png" },
  { name: "Saree Draping", priceDefault: 4000, imageUrl: "/service-images/saree-draping-service.png" },
  { name: "Full Saree Iron + Pre-pleating", priceDefault: 4000, imageUrl: "/service-images/saree-draping-service.png" },
  { name: "Full Saree Iron + Pre-pleating + Draping", priceDefault: 6500, imageUrl: "/service-images/saree-draping-service.png" },
  { name: "Lehenga Draping", priceDefault: 2000, imageUrl: "/service-images/saree-draping-service.png" },

  // ── Facials & D-Tan ──
  { name: "Fruit Facial", priceDefault: 3000, imageUrl: "/service-images/diamond-facial-service.png" },
  { name: "Herbal Facial", priceDefault: 3000, imageUrl: "/service-images/diamond-facial-service.png" },
  { name: "Pearl Facial", priceDefault: 4000, imageUrl: "/service-images/diamond-facial-service.png" },
  { name: "Wine Facial", priceDefault: 4500, imageUrl: "/service-images/diamond-facial-service.png" },
  { name: "Gold Facial", priceDefault: 5000, imageUrl: "/service-images/diamond-facial-service.png" },
  { name: "Diamond Facial", priceDefault: 6000, imageUrl: "/service-images/diamond-facial-service.png" },
  { name: "D-Tan", priceDefault: 3000, imageUrl: "/service-images/diamond-facial-service.png" },
  { name: "D-Tan + Facial", priceDefault: 6000, imageUrl: "/service-images/diamond-facial-service.png" },

  // ── Threading Services ──
  { name: "Eyebrow Threading", priceDefault: 600, imageUrl: "/service-images/eyebrow-threading-service.png" },
  { name: "Upper Lip Threading", priceDefault: 300, imageUrl: "/service-images/eyebrow-threading-service.png" },
  { name: "Lower Chin Threading", priceDefault: 300, imageUrl: "/service-images/eyebrow-threading-service.png" },
  { name: "Forehead Threading", priceDefault: 400, imageUrl: "/service-images/eyebrow-threading-service.png" },
  { name: "Jawline Threading", priceDefault: 800, imageUrl: "/service-images/eyebrow-threading-service.png" },
  { name: "Full Face Threading", priceDefault: 2000, imageUrl: "/service-images/eyebrow-threading-service.png" },

  // ── Waxing Services ──
  { name: "Upper Lip Waxing", priceDefault: 400, imageUrl: "/service-images/full-legs-waxing-service.png" },
  { name: "Chin Waxing", priceDefault: 400, imageUrl: "/service-images/full-legs-waxing-service.png" },
  { name: "Forehead Waxing", priceDefault: 500, imageUrl: "/service-images/full-legs-waxing-service.png" },
  { name: "Side Face Waxing", priceDefault: 600, imageUrl: "/service-images/full-legs-waxing-service.png" },
  { name: "Underarms Waxing", priceDefault: 1000, imageUrl: "/service-images/full-legs-waxing-service.png" },
  { name: "Hands Waxing", priceDefault: 2500, imageUrl: "/service-images/full-legs-waxing-service.png" },
  { name: "Half Legs Waxing", priceDefault: 2500, imageUrl: "/service-images/full-legs-waxing-service.png" },
  { name: "Full Legs Waxing", priceDefault: 3500, imageUrl: "/service-images/full-legs-waxing-service.png" },

  // ── Henna Hair Color ──
  { name: "Henna Hair Color", priceDefault: 2500, imageUrl: "/service-images/henna-service.png" },

  // ── Massage ──
  { name: "Hair Oil Massage", priceDefault: 2500, imageUrl: "/service-images/hair-oil-massage-service.png" },
  { name: "Back Massage", priceDefault: 2500, imageUrl: "/service-images/hair-oil-massage-service.png" },

  // ── Special Packages ──
  { name: "Party Package", priceDefault: 16000, imageUrl: "/service-images/bridal-package-service.png" },
  { name: "Bridal Package", priceDefault: 22000, imageUrl: "/service-images/bridal-package-service.png" },

  // ── Travel & Add-ons ──
  { name: "Travel Within 5 Miles", priceDefault: 1000, imageUrl: "/service-images/travel-within-5-miles-service.png" },
  { name: "Travel 5 to 10 Miles", priceDefault: 1500, imageUrl: "/service-images/travel-within-5-miles-service.png" },
  { name: "Travel 10 to 15 Miles", priceDefault: 2000, imageUrl: "/service-images/travel-within-5-miles-service.png" },
  { name: "Travel Over 15 Miles", priceDefault: 2500, imageUrl: "/service-images/travel-within-5-miles-service.png" },
  { name: "Early Morning / Late Evening Slot", priceDefault: 2000, imageUrl: "/service-images/travel-within-5-miles-service.png" },
];

// Names of services that should currently be active
const activeNames = new Set(defaultServices.map((s) => s.name));

async function main() {
  // Upsert all current services
  for (const service of defaultServices) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {
        active: true,
        priceDefault: service.priceDefault,
        imageUrl: service.imageUrl,
      },
      create: service,
    });
  }

  // Deactivate any old services not in the current menu
  await prisma.service.updateMany({
    where: { name: { notIn: [...activeNames] } },
    data: { active: false },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
