import { Booking, Payment, Room, Guest, Notification } from "../../src/types";
import { BookingStatus } from "../../src/types";
import { RoomService } from "./RoomService";
import { GuestService } from "./GuestService";
import { ActivityLogService } from "./ActivityLogService";
import { sendNotificationEvents } from "../../src/services/notificationService";
import { sendBookingConfirmation as sendWhatsAppBookingConfirmation } from "../../src/services/whatsappService";
import { HOTEL } from "../../src/config/hotel/hotel";
import { INITIAL_ROOM_TYPES } from "../../src/data/initialData";

export type CancelBookingReason = {
  reason: string;
  reasonDetails?: string;
};

export type CancelBookingServiceInput = {
  bookingId: string;
  reason: CancelBookingReason;
  operatorLabel?: string;

  // References to in-memory state arrays
  rooms: Room[];
  guests: Guest[];
  bookings: Booking[];
  payments: Payment[];
  notifications: Notification[];
  activityLogs: any[];

  // for computing room type names
  initialRoomTypes?: any[];
};

export type CancelBookingServiceResult = {
  success: boolean;
  booking?: Booking;
  error?: string;
};

function safeOperatorLabel(op?: string) {
  return op && op.trim() ? op.trim() : "Front Desk Staff";
}

// Server-side cancellation is the single source of truth.
export async function cancelBooking(
  input: CancelBookingServiceInput
): Promise<CancelBookingServiceResult> {
  const {
    bookingId,
    reason,
    operatorLabel,
    rooms,
    guests,
    bookings,
    activityLogs,
    initialRoomTypes
  } = input;

  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return { success: false, error: "Booking not found" };

  // Policy validation
  // Current system has cancellation rules mirrored in the client.
  // Keep the server conservative and aligned with existing client eligibility.
  const status = booking.status;
  if (
    status === BookingStatus.CANCELLED ||
    status === "Checked In" ||
    status === "Checked Out" ||
    status !== BookingStatus.CONFIRMED
  ) {
    return {
      success: false,
      error: "Cancellation is not allowed for the current booking state."
    };
  }

  // Booking Status = Cancelled
  booking.status = BookingStatus.CANCELLED;

  // cancellation reason + audit log
  const guest = GuestService.findGuestById(guests, booking.guestId);
  const guestName = guest?.name || booking.guestId;

  booking.cancellationReason = `${reason.reason}${
    reason.reasonDetails ? ` (${reason.reasonDetails})` : ""
  }`;

  // Refund Status placeholder
  (booking as any).refundStatus = "Pending";

  // Inventory release
  const activeRoomId = booking.roomId;
  if (activeRoomId) {
    RoomService.releaseRoom(rooms, activeRoomId);
  }

  if (booking.bookingRooms) {
    booking.bookingRooms.forEach((r: any) => {
      if (r.roomId) {
        RoomService.releaseRoom(rooms, r.roomId);
      }
      r.roomId = null;
    });
  }

  booking.roomId = null;

  ActivityLogService.log(activityLogs, {
    action: "Reservation Cancelled",
    user: safeOperatorLabel(operatorLabel),
    details: `Booking ${bookingId} cancelled by ${safeOperatorLabel(
      operatorLabel
    )}. Reason: ${booking.cancellationReason}`,
    icon: "cancel"
  });

  booking.auditLogs = [
    ...(booking.auditLogs || []),
    {
      timestamp: new Date().toISOString(),
      action: "Reservation Cancelled",
      user: safeOperatorLabel(operatorLabel),
      notes: `Cancellation reason: ${booking.cancellationReason}`
    }
  ];

  // Notifications (reuse existing implementation)
  const roomType = (initialRoomTypes || INITIAL_ROOM_TYPES).find(
    rt => rt.id === booking.roomTypeId
  );
  const roomTypeName = roomType ? roomType.name : "Suite Luxury Stay";

  // WhatsApp notification (best-effort)
  if (guest?.phone) {
    const hotelAddress = `${HOTEL.address.line1}, ${HOTEL.address.city}, ${HOTEL.address.state} ${HOTEL.address.pin}`;
    const googleMapsUrl = `https://maps.google.com/?q=${HOTEL.coordinates.lat},${HOTEL.coordinates.lng}`;

    try {
      await sendWhatsAppBookingConfirmation({
        bookingId,
        guestName: guest.name ?? guestName,
        toPhone: guest.phone,
        vars: {
          hotelName: process.env.HOTEL_NAME ?? HOTEL.general.hotelName,
          guestName: guest.name ?? guestName,
          bookingId,
          roomType: roomTypeName,
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          guestCount: booking.numberOfGuests ?? 1,
          paymentStatus: (booking as any).paymentStatus ?? "Pending",
          hotelPhone: process.env.HOTEL_PHONE ?? "+91-6752-223344",
          hotelAddress,
          googleMapsUrl
        }
      });
    } catch {
      // WhatsApp errors must not roll back cancellation.
    }
  }

  // Email notification (best-effort)
  // notificationService currently supports: booking_confirmation, check_in_reminder, check_out_confirmation
  try {
    await sendNotificationEvents(
      "check_out_confirmation",
      booking as any,
      guest as any,
      roomTypeName
    );
  } catch {
    // keep cancellation outcome
  }

  return { success: true, booking };
}

