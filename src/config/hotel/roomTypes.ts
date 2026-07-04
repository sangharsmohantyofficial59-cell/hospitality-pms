export const ROOM_TYPES = [
  {
    id: "deluxe",
    name: "Deluxe Room",
    baseRateINR: 4500,
    weekendRateINR: 5200,
    seasonRateINR: 6800,
    extraAdultINR: 1200,
    extraChildINR: 700,
    occupancy: {
      base: 2,
      max: 3,
    },
    bed: {
      size: "King/Twin",
    },
    mealPlanOptions: ["EP", "CP", "MAP"],
    description:
      "Description not explicitly provided in the workbook table row; configure using common fields per type (Breakfast included/optional, amenities, policies, and images).",
  },
  {
    id: "premium_sea_view",
    name: "Premium Sea View",
    baseRateINR: 6200,
    weekendRateINR: 7000,
    seasonRateINR: 9500,
    extraAdultINR: 1500,
    extraChildINR: 900,
    occupancy: {
      base: 2,
      max: 3,
    },
    bed: {
      size: "King",
    },
    mealPlanOptions: ["CP", "MAP", "AP"],
    description:
      "Description not explicitly provided in the workbook table row; configure using common fields per type (Breakfast included/optional, amenities, policies, and images).",
  },
  {
    id: "executive_suite",
    name: "Executive Suite",
    baseRateINR: 9800,
    weekendRateINR: 11000,
    seasonRateINR: 14500,
    extraAdultINR: 1800,
    extraChildINR: 1000,
    occupancy: {
      base: 2,
      max: 4,
    },
    bed: {
      size: "King + Sofa",
    },
    mealPlanOptions: ["MAP", "AP"],
    description:
      "Description not explicitly provided in the workbook table row; configure using common fields per type (Breakfast included/optional, amenities, policies, and images).",
  },
  {
    id: "family_room",
    name: "Family Room",
    baseRateINR: 7500,
    weekendRateINR: 8500,
    seasonRateINR: 10500,
    extraAdultINR: 1500,
    extraChildINR: 800,
    occupancy: {
      base: 4,
      max: 5,
    },
    bed: {
      size: "2 Queen",
    },
    mealPlanOptions: ["CP", "MAP"],
    description:
      "Description not explicitly provided in the workbook table row; configure using common fields per type (Breakfast included/optional, amenities, policies, and images).",
  },
  {
    id: "presidential_suite",
    name: "Presidential Suite",
    baseRateINR: 18000,
    weekendRateINR: 21000,
    seasonRateINR: 27000,
    extraAdultINR: 2500,
    extraChildINR: 1200,
    occupancy: {
      base: 2,
      max: 4,
    },
    bed: {
      size: "King",
    },
    mealPlanOptions: ["AP"],
    description:
      "Description not explicitly provided in the workbook table row; configure using common fields per type (Breakfast included/optional, amenities, policies, and images).",
  },
] as const;

export type RoomTypeConfig = (typeof ROOM_TYPES)[number];

export const ROOM_TYPE_IDS = ROOM_TYPES.map((t) => t.id) as ReadonlyArray<RoomTypeConfig["id"]>;

