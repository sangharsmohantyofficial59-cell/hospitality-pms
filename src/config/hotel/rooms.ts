import { ROOM_TYPES } from "./roomTypes";

type RoomStatus =
  | "Occupied"
  | "Vacant"
  | "Dirty"
  | "Clean"
  | "Inspected"
  | "Blocked"
  | "Under Repair"
  | "OK";

const STATUS_POOL: RoomStatus[] = [
  "Vacant",
  "Vacant",
  "Clean",
  "Inspected",
  "Occupied",
  "Dirty",
  "OK",
  "Blocked",
  "Under Repair",
];

const pickStatus = (i: number): RoomStatus => STATUS_POOL[i % STATUS_POOL.length];

const createRoom = (args: {
  roomTypeId: (typeof ROOM_TYPES)[number]["id"];
  index: number; // 0..9 within this room type
  globalIndex: number; // 0..49 across all room types
}): {
  roomNo: number;
  roomTypeId: string;
  floor: number;
  view: string;
  building: string;
  wing: string;
  status: RoomStatus;
  maxOcc: number;
  bedType: string;
  areaSqft: number;
  smoking: boolean;
  ratePlan: string;
  housekeeping: RoomStatus;
  maintenance: RoomStatus;
  virtual: boolean;
  connecting: boolean;
  connectingToRoomNo?: number;
} => {
  const { roomTypeId, index, globalIndex } = args;

  // Deterministic room number generation:
  // - Deluxe: 101-110
  // - Premium Sea View: 201-210
  // - Executive Suite: 301-310
  // - Family Room: 401-410
  // - Presidential Suite: 501-510
  const base = {
    deluxe: 100,
    premium_sea_view: 200,
    executive_suite: 300,
    family_room: 400,
    presidential_suite: 500,
  }[roomTypeId];

  const roomNo = base + (index + 1);
  const floor = Math.floor(base / 100);

  const viewByType: Record<string, string> = {
    deluxe: "Garden",
    premium_sea_view: "Sea",
    executive_suite: "Sea",
    family_room: "Garden",
    presidential_suite: "Sea",
  };

  const buildingByType: Record<string, string> = {
    deluxe: "Main",
    premium_sea_view: "Main",
    executive_suite: "Main",
    family_room: "Garden Wing",
    presidential_suite: "Main",
  };

  const wingByType: Record<string, string> = {
    deluxe: "A",
    premium_sea_view: "B",
    executive_suite: "B",
    family_room: "C",
    presidential_suite: "B",
  };

  const bedByType: Record<string, string> = {
    deluxe: index % 2 === 0 ? "King" : "Twin",
    premium_sea_view: "King",
    executive_suite: "King+Sofa",
    family_room: "2 Queen",
    presidential_suite: "King",
  };

  const areaByType: Record<string, number> = {
    deluxe: 320,
    premium_sea_view: 400,
    executive_suite: 650,
    family_room: 550,
    presidential_suite: 900,
  };

  const maxOccByType: Record<string, number> = {
    deluxe: 2,
    premium_sea_view: 3,
    executive_suite: 4,
    family_room: 5,
    presidential_suite: 4,
  };

  const ratePlanByType: Record<string, string> = {
    deluxe: "BAR",
    premium_sea_view: "Corporate",
    executive_suite: "Package",
    family_room: "Seasonal",
    presidential_suite: "BAR",
  };

  const status = pickStatus(globalIndex);
  const housekeeping: RoomStatus =
    status === "Blocked" || status === "Under Repair" ? "Dirty" : pickStatus(globalIndex + 3);
  const maintenance: RoomStatus =
    status === "Under Repair" || status === "Blocked" ? "Under Repair" : pickStatus(globalIndex + 5);

  // Sparse deterministic connecting pair behavior (only within a room type block)
  // Example: connecting rooms in a pair (base+1) <-> (base+2), (base+5) <-> (base+6) ...
  const connecting = index % 5 === 0; // every 5th room becomes connecting
  const connectingToRoomNo = connecting ? base + (index + 2) : undefined;

  return {
    roomNo,
    roomTypeId,
    floor,
    view: viewByType[roomTypeId],
    building: buildingByType[roomTypeId],
    wing: wingByType[roomTypeId],
    status,
    maxOcc: maxOccByType[roomTypeId],
    bedType: bedByType[roomTypeId],
    areaSqft: areaByType[roomTypeId],
    smoking: false,
    ratePlan: ratePlanByType[roomTypeId],
    housekeeping,
    maintenance,
    virtual: roomTypeId === "presidential_suite",
    connecting,
    ...(connectingToRoomNo ? { connectingToRoomNo } : {}),
  };
};

// Create 50 rooms total: 10 per room type.
// Ensure every roomTypeId references src/config/hotel/roomTypes.ts.
export const ROOMS = ROOM_TYPES.flatMap((rt, roomTypeIdx) => {
  return Array.from({ length: 10 }).map((_, index) => {
    const globalIndex = roomTypeIdx * 10 + index;
    return createRoom({ roomTypeId: rt.id, index, globalIndex });
  });
});

export type RoomInventory = (typeof ROOMS)[number];


