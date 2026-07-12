import { HOTEL } from "../config/hotel/hotel";

function toIcsDate(dateStr: string, time: string) {
  // dateStr expected YYYY-MM-DD
  const [y, m, d] = String(dateStr).split("-").map(Number);
  if (!y || !m || !d) return "";
  const [hh, mm] = String(time).split(":").map(Number);
  // Use UTC to avoid timezone issues across clients ("Z" designator)
  const dt = new Date(Date.UTC(y, m - 1, d, hh || 0, mm || 0, 0));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}Z`;
}

export function generateBookingIcs(args: {
  bookingId: string;
  guestName: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
}) {
  const { bookingId, guestName, roomTypeName, checkInDate, checkOutDate } = args;

  const dtStart = toIcsDate(checkInDate, HOTEL.checkIn.time);
  const dtEnd = toIcsDate(checkOutDate, HOTEL.checkOut.time);

  const uid = `${bookingId}@pms`;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const summary = `Hotel stay — ${roomTypeName}`;
  const description = `Booking ID: ${bookingId} | Guest: ${guestName}`;

  // Escape commas/semicolons/newlines for ICS
  const esc = (s: string) =>
    String(s)
      .replaceAll("\\", "\\\\")
      .replaceAll(",", "\\,")
      .replaceAll(";", "\\;")
      .replaceAll("\n", "\\n");

  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//PMS//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nBEGIN:VEVENT\r\nUID:${uid}\r\nDTSTAMP:${stamp}\r\nDTSTART:${dtStart}\r\nDTEND:${dtEnd}\r\nSUMMARY:${esc(summary)}\r\nDESCRIPTION:${esc(description)}\r\nLOCATION:${esc(HOTEL.address.line1)}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
}

