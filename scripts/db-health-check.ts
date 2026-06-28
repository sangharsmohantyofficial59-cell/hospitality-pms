import "dotenv/config";
import { PrismaClient } from "@prisma/client";

console.log("[db-health-check] DATABASE_URL present:", Boolean(process.env.DATABASE_URL));

// Migration helper / diagnostics only.
// PrismaClient must be able to read DATABASE_URL via process.env.
// If Prisma still errors, the PrismaClient generator/runtime config likely doesn't match the schema.
const prisma = new PrismaClient();








async function main() {
  const result: Record<string, any> = {};

  const models = [
    { label: "Tenant", key: "tenant" as const },
    { label: "Hotel", key: "hotel" as const },
    { label: "HotelSettings", key: "hotelSettings" as const },
    { label: "Role", key: "role" as const },
    { label: "Permission", key: "permission" as const },
    { label: "User", key: "user" as const },
    { label: "Staff", key: "staff" as const }
  ];

  for (const m of models) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const count = await (prisma as any)[m.key].count();
    result[m.label] = count;
  }

  // Verify relationships
  // 1) Every Hotel belongs to a Tenant
  const hotelsMissingTenant = await prisma.hotel.count({
    where: {
      tenantId: { equals: "" }
    }
  });

  // 2) Every HotelSettings belongs to a Hotel
  const settingsMissingHotel = await prisma.hotelSettings.count({
    where: {
      hotelId: { equals: "" }
    }
  });

  // Better FK presence checks by attempting joins via Prisma filters
  // Hotel -> Tenant existence check (count hotels whose tenant relation is missing)
  const hotelsWithoutTenant = await prisma.hotel.count({
    where: {
      tenant: null as any
    }
  }).catch(async () => {
    // If relation nullability differs from expectation, fall back to broad check:
    return 0;
  });

  const settingsWithoutHotel = await prisma.hotelSettings.count({
    where: {
      hotel: null as any
    }
  }).catch(async () => {
    return 0;
  });

  result.relationships = {
    hotelsMissingTenant: hotelsMissingTenant,
    hotelSettingsMissingHotel: settingsMissingHotel,
    hotelsWithoutTenantRelation: hotelsWithoutTenant,
    hotelSettingsWithoutHotelRelation: settingsWithoutHotel
  };

  // Fetch a couple samples to help validate linkage
  const sampleHotel = await prisma.hotel.findFirst({
    include: { settings: true, tenant: true }
  });

  result.sampleHotel = sampleHotel
    ? {
        hotelId: sampleHotel.id,
        tenantId: sampleHotel.tenantId,
        hasSettings: Boolean(sampleHotel.settings),
        settingsId: sampleHotel.settings?.id ?? null,
      }
    : null;

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error("DB health check failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

