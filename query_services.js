const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() { console.log(await prisma.service.findMany({where:{active:true}})); }
main().catch(console.error).finally(()=>prisma.$disconnect());
