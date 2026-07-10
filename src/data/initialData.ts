/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoomType, Room, Guest, Booking, RoomStatus, BookingSource, BookingStatus, PaymentStatus, Payment, Notification } from "../types";

import { ROOM_TYPES } from "../config/hotel/roomTypes";
import { ROOMS } from "../config/hotel/rooms";

export const INITIAL_ROOM_TYPES: RoomType[] = ROOM_TYPES.map((rt) => ({
  id: rt.id,
  name: rt.name,
  description: rt.description,
  basePrice: rt.baseRateINR,
  maxGuests: rt.occupancy.max,
  amenities: [] as string[],
  imageUrl: "",
}));

// Map Rooms config status to RoomStatus enum
function mapStatus(status: string): RoomStatus {
  switch (status) {
    case "Occupied":
      return RoomStatus.OCCUPIED;
    case "Dirty":
      return RoomStatus.CLEANING;
    case "Blocked":
    case "Under Repair":
      return RoomStatus.MAINTENANCE;
    default:
      return RoomStatus.AVAILABLE;
  }
}

export const INITIAL_ROOMS: Room[] = ROOMS.map((r) => ({
  id: String(r.roomNo),
  roomTypeId: r.roomTypeId,
  status: mapStatus(r.status),
}));

export const INITIAL_GUESTS: Guest[] = [];

export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_PAYMENTS: Payment[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

