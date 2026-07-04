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

export const INITIAL_GUESTS: Guest[] = [
  {
    id: "GUST-7001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 98765 43210",
    idType: "Passport",
    idNumber: "Z-1234567",
    createdAt: "2026-06-15T09:30:00Z"
  },
  {
    id: "GUST-7002",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91 87654 32109",
    createdAt: "2026-06-19T14:45:00Z"
  },
  {
    id: "GUST-7003",
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "+91 76543 21098",
    idType: "Aadhaar",
    idNumber: "1234-5678-9012",
    createdAt: "2026-06-18T11:00:00Z"
  },
  {
    id: "GUST-7004",
    name: "Sarah Jenkins",
    email: "sarah@example.com",
    phone: "+1 (555) 019-2834",
    idType: "Driver License",
    idNumber: "DL-9081273",
    createdAt: "2026-06-20T08:15:00Z"
  },
  {
    id: "GUST-7005",
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+91 99887 76655",
    idType: "Passport",
    idNumber: "P-8827131",
    createdAt: "2026-06-17T15:20:00Z"
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "BK-1001",
    guestId: "GUST-7003",
    roomId: "201",
    roomTypeId: "premium_sea_view",
    checkInDate: "2026-06-18",
    checkOutDate: "2026-06-21",
    numberOfGuests: 2,
    totalPrice: 8400, // 3 nights * 2800
    source: BookingSource.BOOKING_COM,
    status: BookingStatus.CHECKED_IN,
    paymentStatus: PaymentStatus.PAID,
    createdAt: "2026-06-10T12:30:00Z",
    checkedInAt: "2026-06-18T13:45:00Z"
  },
  {
    id: "BK-1002",
    guestId: "GUST-7004",
    roomId: "301",
    roomTypeId: "executive_suite",
    checkInDate: "2026-06-20",
    checkOutDate: "2026-06-22",
    numberOfGuests: 2,
    totalPrice: 8400, // 2 nights * 4200
    source: BookingSource.WEBSITE,
    status: BookingStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID,
    createdAt: "2026-06-15T18:22:00Z"
  },
  {
    id: "BK-1003",
    guestId: "GUST-7001",
    roomId: "102",
    roomTypeId: "deluxe",
    checkInDate: "2026-06-15",
    checkOutDate: "2026-06-19",
    numberOfGuests: 1,
    totalPrice: 6000, // 4 nights * 1500
    source: BookingSource.AGODA,
    status: BookingStatus.CHECKED_OUT,
    paymentStatus: PaymentStatus.PAID,
    createdAt: "2026-06-05T09:15:00Z",
    checkedInAt: "2026-06-15T11:20:00Z",
    checkedOutAt: "2026-06-19T10:00:00Z"
  },
  {
    id: "BK-1004",
    guestId: "GUST-7002",
    roomId: "206",
    roomTypeId: "premium_sea_view",
    checkInDate: "2026-06-21",
    checkOutDate: "2026-06-25",
    numberOfGuests: 2,
    totalPrice: 11200, // 4 nights * 2800
    source: BookingSource.MAKEMYTRIP,
    status: BookingStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PENDING,
    createdAt: "2026-06-19T14:45:00Z"
  },
  {
    id: "BK-1005",
    guestId: "GUST-7005",
    roomId: "507",
    roomTypeId: "presidential_suite",
    checkInDate: "2026-06-17",
    checkOutDate: "2026-06-20",
    numberOfGuests: 3,
    totalPrice: 22500, // 3 nights * 7500
    source: BookingSource.PHONE,
    status: BookingStatus.CHECKED_IN,
    paymentStatus: PaymentStatus.PAID,
    createdAt: "2026-06-14T11:00:00Z",
    checkedInAt: "2026-06-17T14:15:00Z"
  },
  {
    id: "BK-1006",
    guestId: "GUST-7001",
    roomId: "302",
    roomTypeId: "executive_suite",
    checkInDate: "2026-06-19",
    checkOutDate: "2026-06-23",
    numberOfGuests: 2,
    totalPrice: 16800, // 4 nights * 4200
    source: BookingSource.WALK_IN,
    status: BookingStatus.CHECKED_IN,
    paymentStatus: PaymentStatus.PAID,
    createdAt: "2026-06-19T10:30:00Z",
    checkedInAt: "2026-06-19T10:32:00Z"
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: "PAY-2001",
    bookingId: "BK-1001",
    amount: 8400,
    method: "Card",
    status: PaymentStatus.PAID,
    transactionId: "pay_OTA_Bk_118a8d",
    createdAt: "2026-06-18T13:45:00Z"
  },
  {
    id: "PAY-2002",
    bookingId: "BK-1002",
    amount: 8400,
    method: "Razorpay",
    status: PaymentStatus.PAID,
    transactionId: "pay_NkoE93kd98",
    createdAt: "2026-06-15T18:25:00Z"
  },
  {
    id: "PAY-2003",
    bookingId: "BK-1003",
    amount: 6000,
    method: "Razorpay",
    status: PaymentStatus.PAID,
    transactionId: "pay_Aga9a8d9a2",
    createdAt: "2026-06-05T09:18:00Z"
  },
  {
    id: "PAY-2005",
    bookingId: "BK-1005",
    amount: 22500,
    method: "Cash",
    status: PaymentStatus.PAID,
    createdAt: "2026-06-17T14:15:00Z"
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "NT-3001",
    type: "new_booking",
    title: "New Website Reservation",
    message: "Sarah Jenkins booked Executive Room for 2026-06-20 to 2026-06-22.",
    isRead: false,
    createdAt: "2026-06-15T18:22:00Z"
  },
  {
    id: "NT-3002",
    type: "payment_confirmation",
    title: "Payment Confirmed",
    message: "Razorpay transaction pay_NkoE93kd98 of ₹8,400 received for BK-1002.",
    isRead: false,
    createdAt: "2026-06-15T18:25:00Z"
  },
  {
    id: "NT-3003",
    type: "check_in",
    title: "Guest Checked In",
    message: "Rajesh Kumar has successully checked into Room 201.",
    isRead: true,
    createdAt: "2026-06-18T13:45:00Z"
  },
  {
    id: "NT-3004",
    type: "room_assignment",
    title: "Room Assigned",
    message: "Room 301. assigned to Booking BK-1002 (Sarah Jenkins).",
    isRead: true,
    createdAt: "2026-06-20T08:30:00Z"
  }
];
