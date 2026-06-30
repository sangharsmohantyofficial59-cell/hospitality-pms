/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum RoomStatus {
  AVAILABLE = "Available",
  RESERVED = "Reserved",
  OCCUPIED = "Occupied",
  CLEANING = "Cleaning",
  MAINTENANCE = "Maintenance"
}

export enum BookingSource {
  WEBSITE = "Website",
  WALK_IN = "Walk-in",
  PHONE = "Phone",
  BOOKING_COM = "Booking.com",
  MAKEMYTRIP = "MakeMyTrip",
  AGODA = "Agoda"
}

export enum BookingStatus {
  BOOKED = "Booked",
  PENDING = "Booked", // backward compatibility alias
  CONFIRMED = "Confirmed",
  CHECKED_IN = "Checked In",
  CHECKED_OUT = "Checked Out",
  MOVED_TO_BILLING = "Moved To Billing",
  INVOICE_GENERATED = "Invoice Generated",
  PAID = "Paid",
  CLOSED = "Closed",
  CANCELLED = "Cancelled"
}

export enum PaymentStatus {
  PENDING = "Pending",
  PAID = "Paid",
  FAILED = "Failed",
  REFUNDED = "Refunded"
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff";
}

export interface RoomType {
  id: string; // e.g. "deluxe", "executive"
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  amenities: string[];
  imageUrl: string;
}

export interface Room {
  id: string; // room number, e.g., "101", "205"
  roomTypeId: string;
  status: RoomStatus;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  idType?: string; // Passport, Aadhaar, Driver License
  idNumber?: string;
  idProofUrl?: string; // simulated url
  createdAt: string;
}

export interface Booking {
  id: string; // e.g. "BK-1001"
  guestId: string;
  roomId: string | null; // null if not assigned yet
  roomTypeId: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  numberOfGuests: number;
  totalPrice: number;
  source: BookingSource;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  // Demo Enhanced Properties
  bookingType?: "Room Booking" | "Conference Hall Booking" | "Corporate Booking" | "Group Booking";
  discountAmount?: number;
  discountPercent?: number;
  discountReason?: string;
  discountRemarks?: string;
  discountApprovedVia?: string;
  discountAppliedBy?: string;
  gstRate?: number;
  customServiceLines?: { id: string; description: string; amount: number }[];
  transport?: {
    vehicleType: "Auto" | "Sedan" | "SUV" | "Innova" | "Tempo Traveller" | "Mini Bus" | "Bus" | "";
    pickupAddress: string;
    dropAddress: string;
    scheduleTime: string;
    status: "Pending" | "Dispatched" | "Completed" | "Cancelled";
    cost?: number;
  };
  cancellationReason?: string;
  auditLogs?: { timestamp: string; action: string; user: string; notes?: string }[];
  // Operational and Billing Enhancements
  paymentOption?: "Full" | "Advance";
  advancePaid?: number;
  pendingBalance?: number;
  closedBillDetails?: {
    paymentMethod: string;
    amountReceived: number;
    refNumber: string;
    notes?: string;
    closedAt: string;
  };
  bookingRooms?: {
    roomTypeId: string;
    roomId: string | null;
    adults: number;
    children: number;
    rate: number;
  }[];
}

export interface Payment {
  id: string; // e.g. "PAY-2001"
  bookingId: string;
  amount: number;
  method: string; // e.g. "Razorpay", "Cash", "Card"
  status: PaymentStatus;
  transactionId?: string; // e.g. "pay_NkoE93..."
  createdAt: string;
  notes?: string;
}

export interface Notification {
  id: string;
  type: "new_booking" | "check_in" | "room_assignment" | "payment_confirmation";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface UploadedDocument {
  id: string;
  guestId: string;
  bookingId: string;
  documentType: string;
  documentUrl: string;
  fileName: string;
  createdAt: string;
}

export interface SentMessageLog {
  id: string;
  bookingId: string;
  guestName: string;
  recipient: string;
  type: "email" | "whatsapp";
  event: "booking_confirmation" | "check_in_reminder" | "check_out_confirmation";
  subject: string;
  body: string;
  status: "Sent" | "Simulated" | "Failed";
  etherealUrl?: string;
  sentAt: string;
}

export interface ServiceRequest {
  id: string;
  bookingId: string;
  guestName: string;
  roomId: string;
  requestType: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  timestamp: string;
  createdTime: string;
  completionTime?: string;
  slaTimer?: string;
  assignedStaff?: string;
  description?: string;
  comments?: string;
}
