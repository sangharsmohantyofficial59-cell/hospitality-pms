import { Booking, Guest, Room } from "../../src/types";
import { GuestService } from "./GuestService";
import { RoomService } from "./RoomService";
import { ActivityLogService } from "./ActivityLogService";
import { BookingStatus } from "../../src/types";

export type CreateBookingParams = {
  body: any;
  guests: Guest[];
  bookings: Booking[];
  rooms: Room[];
  activityLogs: any[];
  initialRoomTypes: any[];
};

export class BookingService {
  static findBookingById(bookings: Booking[], id: string) {
    return bookings.find(b => b.id === id);
  }

  static findBookingsByGuest(bookings: Booking[], guestId: string) {
    return bookings.filter(b => b.guestId === guestId);
  }

  static findBookingsByRoom(bookings: Booking[], roomId: string) {
    return bookings.filter(b => String(b.roomId) === String(roomId));
  }

  static validateBookingDates(checkInDate: string, checkOutDate: string) {
    try {
      const inD = new Date(checkInDate);
      const outD = new Date(checkOutDate);
      if (isNaN(inD.getTime()) || isNaN(outD.getTime())) return { valid: false, message: "Invalid dates" };
      if (inD >= outD) return { valid: false, message: "checkOutDate must be after checkInDate" };
      return { valid: true };
    } catch (e) {
      return { valid: false, message: "Invalid date range" };
    }
  }

  static createBooking(params: CreateBookingParams) {
    const { body, guests, bookings, rooms, activityLogs, initialRoomTypes } = params;
    const {
      guestName,
      guestEmail,
      guestPhone,
      roomTypeId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
      source,
      notes,
      paymentMethod,
      transactionId,
      paymentStatus
    } = body;

    // Validate minimal guest payload
    const guestValidation = GuestService.validateGuestPayload({ guestName, guestEmail, guestPhone });
    if (!guestValidation.valid) {
      return { error: "Missing required fields", statusCode: 400 };
    }

    // Validate room dates
    const dateValidation = this.validateBookingDates(checkInDate, checkOutDate);
    if (!dateValidation.valid) {
      return { error: dateValidation.message, statusCode: 400 };
    }

    // Find or create guest
    const guest = GuestService.findOrCreateGuest(guests, {
      name: guestName,
      email: guestEmail,
      phone: guestPhone
    });

    // Check availability using RoomService helper
    const requestedCheckIn = new Date(checkInDate);
    const requestedCheckOut = new Date(checkOutDate);
    const availableRooms = RoomService.getAvailableRooms(rooms, bookings, roomTypeId, requestedCheckIn, requestedCheckOut);
    if (availableRooms <= 0) {
      return { error: "No rooms of this type are available for the selected dates.", statusCode: 409 };
    }

    // Create booking object (preserve ID format)
    const bookingId = `BK-${Date.now().toString().slice(-4)}`;
    const newBooking: Booking = {
      id: bookingId,
      guestId: guest.id,
      roomId: roomId || null,
      roomTypeId,
      checkInDate,
      checkOutDate,
      numberOfGuests: Number(numberOfGuests),
      totalPrice: Number(totalPrice),
      source: source || ("WEBSITE" as any),
      status: BookingStatus.CONFIRMED,
      paymentStatus: paymentStatus || ("PENDING" as any),
      notes,
      createdAt: new Date().toISOString(),
      bookingType: body.bookingType || "Room Booking",
      discountAmount: Number(body.discountAmount || 0),
      discountPercent: Number(body.discountPercent || 0),
      gstRate: Number(body.gstRate || 12),
      customServiceLines: body.customServiceLines || [],
      transport: body.transport || { vehicleType: "", pickupAddress: "", dropAddress: "", scheduleTime: "", status: "Pending", cost: undefined },
      cancellationReason: "",
      paymentOption: body.paymentOption || "Full",
      advancePaid: body.paymentOption === "Advance" ? Number(body.advancePaid || (Number(totalPrice) / 2)) : Number(body.advancePaid || totalPrice),
      pendingBalance: body.paymentOption === "Advance" ? Number(body.pendingBalance || (Number(totalPrice) - Number(body.advancePaid || (Number(totalPrice) / 2)))) : Number(body.pendingBalance || 0),
      auditLogs: body.auditLogs || [
        {
          timestamp: new Date().toISOString(),
          action: "Booking Created",
          user: guestName,
          notes: `Created via channel: ${source || "Walk-In"} - Category: ${roomTypeId} (${body.paymentOption === "Advance" ? "Pay Advance Selected" : "Pay Full Selected"})`
        }
      ]
    } as Booking;

    if (roomId) {
      const roomConflict = RoomService.detectRoomConflict(bookings, String(roomId), requestedCheckIn, requestedCheckOut);
      if (roomConflict) {
        return { error: "Selected room is already booked for the chosen dates.", statusCode: 409 };
      }
    }

    bookings.push(newBooking);

    // Activity log
    ActivityLogService.log(activityLogs, {
      action: "Reservation Creation",
      user: source === "WEBSITE" ? "Website Engine" : "Rajesh Kumar (Front Desk)",
      details: `New reservation ${bookingId} created for guest ${guest.name} (${newBooking.bookingType}). Total: ₹${newBooking.totalPrice.toLocaleString()}${newBooking.paymentOption === "Advance" ? ` [Advance Paid: ₹${newBooking.advancePaid?.toLocaleString()}, Balance: ₹${newBooking.pendingBalance?.toLocaleString()}]` : ""}`,
      icon: "create"
    });

    // If room assigned, update room status
    if (newBooking.roomId) {
      RoomService.assignRoom(rooms, newBooking.roomId, newBooking.status);
    }

    return { booking: newBooking, guest };
  }
}
