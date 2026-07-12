import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { MEDIA } from "../config/hotel/media";
import { HOTEL } from "../config/hotel/hotel";
import { BRANDING } from "../config/hotel/branding";

function safeText(s: any) {
  return String(s ?? "");
}

export async function generatePremiumBookingVoucherPdf(args: {
  bookingId: string;
  guestName: string;
  roomTypeName: string;
  roomLabel?: string;
  checkInDate: string;
  checkOutDate: string;
  paymentStatus: string;
}) {
  const {
    bookingId,
    guestName,
    roomTypeName,
    roomLabel,
    checkInDate,
    checkOutDate,
    paymentStatus,
  } = args;

  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 36;

  // Title banner
  doc.setFillColor(11, 93, 111);
  doc.rect(0, 0, pageWidth, 64, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`${BRANDING.hotelName || HOTEL.general.hotelName}`, margin, 30);
  doc.setFontSize(11);
  doc.text(`Premium Booking Voucher`, margin, 48);

  // Hotel logo (best-effort)
  // jsPDF can embed images from data URLs; we fallback to omission if it fails.
  try {
    const res = await fetch(MEDIA.logo.src);
    const blob = await res.blob();
    const buf = await blob.arrayBuffer();
    const base64 = Buffer.from(buf).toString("base64");
    const mime = blob.type || "image/png";
    doc.addImage(`data:${mime};base64,${base64}`, "PNG", margin, 74, 48, 48);
  } catch {
    // ignore
  }

  // Body
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "normal");

  let y = 90;
  doc.setFontSize(11);
  doc.text(`Guest: ${safeText(guestName)}`, margin, y);
  y += 16;
  doc.text(`Booking ID: ${safeText(bookingId)}`, margin, y);
  y += 16;

  doc.text(`Room: ${safeText(roomLabel ? `${roomLabel} • ${roomTypeName}` : roomTypeName)}`, margin, y);
  y += 16;

  doc.text(`Stay: ${safeText(checkInDate)} to ${safeText(checkOutDate)}`, margin, y);
  y += 16;

  doc.text(`Payment status: ${safeText(paymentStatus)}`, margin, y);
  y += 16;

  // QR code on right
  const qrSize = 120;
  const qrX = pageWidth - margin - qrSize;
  const qrY = 110;
  try {
    const qrDataUrl = await QRCode.toDataURL(bookingId, { errorCorrectionLevel: "M" });
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  } catch {
    // ignore
  }

  doc.setFontSize(10);
  doc.text("Scan for booking verification", qrX, qrY + qrSize + 14);

  // Contact footer
  doc.setDrawColor(11, 93, 111);
  doc.setLineWidth(1);
  doc.line(margin, 760, pageWidth - margin, 760);

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const address = `${HOTEL.address.line1}, ${HOTEL.address.city}, ${HOTEL.address.state} ${HOTEL.address.pin}, ${HOTEL.address.country}`;
  doc.text(`Contact`, margin, 785);
  doc.setTextColor(15, 23, 42);
  doc.text(`Phone: ${BRANDING.phone}`, margin, 802);
  doc.text(`Email: ${BRANDING.email}`, margin, 818);
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.text(address, margin, 835, pageWidth - margin * 2);

  const pdfBytes = doc.output("arraybuffer");
  return Buffer.from(pdfBytes);
}

