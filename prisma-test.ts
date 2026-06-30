import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  console.log("✅ Connected");
  await prisma.$disconnect();
}

main().catch(console.error);