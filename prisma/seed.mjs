import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultServices = [
  { name: "Haircut", priceDefault: 4500, imageUrl: "/service-images/haircut-service.png" },
  { name: "Blowout", priceDefault: 3500, imageUrl: "/service-images/blowout-service.png" },
  { name: "Root Touch-Up", priceDefault: 6500, imageUrl: "/service-images/color-service.png" },
  { name: "Full Color", priceDefault: 9500, imageUrl: "/service-images/color-service.png" },
  { name: "Highlights", priceDefault: 12000, imageUrl: "/service-images/color-service.png" },
  { name: "Keratin Treatment", priceDefault: 15000, imageUrl: "/service-images/blowout-service.png" },
  { name: "Makeup", priceDefault: 8000, imageUrl: "/service-images/makeup-service.png" },
  { name: "Bridal Trial", priceDefault: 12500, imageUrl: "/service-images/makeup-service.png" },
  { name: "Saree Draping", priceDefault: 2000, imageUrl: "/service-images/saree-draping-service.png" },
  { name: "Saree Pre-Plating", priceDefault: 2500, imageUrl: "/service-images/saree-pre-plating-service.png" },
];

async function main() {
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
