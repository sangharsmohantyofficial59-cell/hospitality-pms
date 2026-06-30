import { Room, Booking } from "../../src/types";
import { RoomStatus, BookingStatus } from "../../src/types";

export class RoomService {
  static findRoomById(rooms: Room[], id: string | null | undefined) {
    if (!id) return undefined;
    return rooms.find(r => String(r.id) === String(id));
  }

  static findRoomByNumber(rooms: Room[], number: string) {
    return this.findRoomById(rooms, number);
  }

  static updateRoomStatus(rooms: Room[], roomId: string | null | undefined, status: RoomStatus) {
    if (!roomId) return undefined;
    const room = this.findRoomById(rooms, roomId);
    if (!room) return undefined;
    room.status = status;
    return room;
  }

  static assignRoom(rooms: Room[], roomId: string | null | undefined, bookingStatus?: BookingStatus | string) {
    if (!roomId) return undefined;
    const room = this.findRoomById(rooms, roomId);
    if (!room) return undefined;
    if (bookingStatus === BookingStatus.CHECKED_IN || String(bookingStatus) === String(BookingStatus.CHECKED_IN)) {
      room.status = RoomStatus.OCCUPIED;
    } else {
      room.status = RoomStatus.RESERVED;
    }
    return room;
  }

  static releaseRoom(rooms: Room[], roomId: string | null | undefined) {
    if (!roomId) return undefined;
    const room = this.findRoomById(rooms, roomId);
    if (!room) return undefined;
    if (room.status === RoomStatus.RESERVED || room.status === RoomStatus.OCCUPIED) {
      room.status = RoomStatus.AVAILABLE;
    }
    return room;
  }

  static detectRoomConflict(bookings: Booking[], roomId: string, newCheckIn: Date, newCheckOut: Date, excludeBookingId?: string) {
    const overlaps = (existingIn: string, existingOut: string) => {
      const exIn = new Date(existingIn);
      const exOut = new Date(existingOut);
      return newCheckIn < exOut && newCheckOut > exIn;
    };

    const conflictingBooking = bookings.find(b => {
      const matchesRoomId = String(b.roomId) === String(roomId) ||
        (b.bookingRooms && b.bookingRooms.some(r => r.roomId && String(r.roomId) === String(roomId)));

      if (!matchesRoomId) return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;

      const isCancelled = b.status === BookingStatus.CANCELLED;
      const isCheckedOut = b.status === BookingStatus.CHECKED_OUT;
      if (isCancelled) return false;
      if (isCheckedOut) return false;

      return overlaps(b.checkInDate, b.checkOutDate);
    });

    return conflictingBooking;
  }

  static getAvailableRooms(rooms: Room[], bookings: Booking[], roomTypeId: string, requestedCheckIn: Date, requestedCheckOut: Date) {
    const totalPhysicalRoomsForType = rooms.filter(r => String(r.roomTypeId) === String(roomTypeId)).length;

    const overlaps = (existingIn: string, existingOut: string) => {
      const exIn = new Date(existingIn);
      const exOut = new Date(existingOut);
      return requestedCheckIn < exOut && requestedCheckOut > exIn;
    };

    const activeOverlappingBookingsCount = bookings.reduce((sum, b) => {
      if (b.status === BookingStatus.CANCELLED) return sum;
      if (b.status === BookingStatus.CHECKED_OUT) return sum;
      if (!overlaps(b.checkInDate, b.checkOutDate)) return sum;

      if (b.bookingRooms && b.bookingRooms.length > 0) {
        const matchingCount = b.bookingRooms.filter(r => String(r.roomTypeId) === String(roomTypeId)).length;
        return sum + matchingCount;
      }

      if (String(b.roomTypeId) === String(roomTypeId)) {
        return sum + 1;
      }
      return sum;
    }, 0);

    return Math.max(0, totalPhysicalRoomsForType - activeOverlappingBookingsCount);
  }

  static checkRoomAvailability(rooms: Room[], bookings: Booking[], roomId: string, checkIn: Date, checkOut: Date, excludeBookingId?: string) {
    const conflict = this.detectRoomConflict(bookings, roomId, checkIn, checkOut, excludeBookingId);
    return !conflict;
  }

  static calculateRoomOccupancy(rooms: Room[]) {
    const occupied = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
    const total = rooms.length || 1;
    return (occupied / total) * 100;
  }
}
