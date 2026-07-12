import { generatePremiumBookingHtml } from "./premiumBookingEmailTemplate";
import { generatePremiumBookingVoucherPdf } from "./premiumBookingVoucherPdf";
import { generateBookingIcs } from "./bookingIcs";

export async function buildPremiumBookingArtifacts(args: {
  guestName: string;
  bookingId: string;
  roomTypeName: string;
  roomLabel?: string;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
  paymentStatus: string;
}) {
  const html = generatePremiumBookingHtml(args);

  const [pdfBuf, icsStr] = await Promise.all([
    generatePremiumBookingVoucherPdf({
      bookingId: args.bookingId,
      guestName: args.guestName,
      roomTypeName: args.roomTypeName,
      roomLabel: args.roomLabel,
      checkInDate: args.checkInDate,
      checkOutDate: args.checkOutDate,
      paymentStatus: args.paymentStatus,
    }).catch(() => Buffer.from("", "utf-8")),
    Promise.resolve(
      generateBookingIcs({
        bookingId: args.bookingId,
        guestName: args.guestName,
        roomTypeName: args.roomTypeName,
        checkInDate: args.checkInDate,
        checkOutDate: args.checkOutDate,
      })
    ).catch(() => "" as string),
  ]);

  const attachments: Array<{ filename: string; content: Buffer | string; contentType?: string }> = [];
  if (pdfBuf && Buffer.isBuffer(pdfBuf) && pdfBuf.length > 0) {
    attachments.push({
      filename: `Booking-Voucher-${args.bookingId}.pdf`,
      content: pdfBuf,
      contentType: "application/pdf",
    });
  }
  if (icsStr && typeof icsStr === "string" && icsStr.trim().length > 0) {
    attachments.push({
      filename: `Booking-${args.bookingId}.ics`,
      // Ensure Nodemailer receives the ICS as an in-memory Buffer.
      content: Buffer.from(icsStr, "utf-8"),
      contentType: "text/calendar; charset=utf-8",
    });
  }


  return { html, attachments };
}

