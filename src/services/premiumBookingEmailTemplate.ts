import { MEDIA } from "../config/hotel/media";
import { HOTEL } from "../config/hotel/hotel";
import { BRANDING } from "../config/hotel/branding";
import { POLICIES } from "../config/hotel/policies";
import { escapeHtml } from "./escapeHtmlUtil";

type PaymentStatusLike = string | undefined;

export function formatDate(d: string) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toISOString().slice(0, 10);
}

function nightsBetween(checkIn: string, checkOut: string) {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
  const diff = Math.abs(d2.getTime() - d1.getTime());
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(1, days || 1);
}

function googleMapsHref() {
  if (HOTEL.coordinates?.lat !== undefined && HOTEL.coordinates?.lng !== undefined) {
    return `https://maps.google.com/?q=${HOTEL.coordinates.lat},${HOTEL.coordinates.lng}`;
  }
  const q = encodeURIComponent(
    `${HOTEL.address.line1}, ${HOTEL.address.city}, ${HOTEL.address.state} ${HOTEL.address.pin}`
  );
  return `https://maps.google.com/?q=${q}`;
}

export function generatePremiumBookingHtml(args: {
  guestName: string;
  bookingId: string;
  roomTypeName: string;
  roomLabel?: string;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
  paymentStatus: PaymentStatusLike;
}) {
  const {
    guestName,
    bookingId,
    roomTypeName,
    roomLabel,
    numberOfGuests,
    checkInDate,
    checkOutDate,
    paymentStatus,
  } = args;

  const nights = nightsBetween(checkInDate, checkOutDate);
  const hero = MEDIA.heroImages[0] || MEDIA.heroImages[MEDIA.heroImages.length - 1];

  const hotelAddress = `${HOTEL.address.line1}, ${HOTEL.address.city}, ${HOTEL.address.state} ${HOTEL.address.pin}, ${HOTEL.address.country}`;
  const paymentText = paymentStatus ? String(paymentStatus) : "Pending";
  const paymentColor = paymentText.toLowerCase().includes("paid") ? "#0f766e" : "#b45309";

  const mapsHref = googleMapsHref();

  const hotelPhone = BRANDING.phone || "+91-0000-000000";
  const hotelEmail = BRANDING.email || "reservations@example.com";
  const hotelWebsite = BRANDING.website || "";

  const websiteLink = hotelWebsite
    ? `<a href="${escapeHtml(hotelWebsite)}" target="_blank" rel="noreferrer" style="display:inline-block;border:1px solid rgba(15,23,42,0.12);color:#0f172a;text-decoration:none;font-weight:900;font-size:12px;padding:11px 14px;border-radius:12px;background:#fff;">Visit Website</a>`
    : "";

  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:680px;margin:0 auto;padding:24px;">
    <div style="border:1px solid rgba(15,23,42,0.12);border-radius:18px;overflow:hidden;background:#ffffff;">

      <div style="padding:20px 24px;background:linear-gradient(135deg, ${BRANDING.primaryColor} 0%, #0c4b53 100%);color:#fff;">
        <div style="display:flex;align-items:center;gap:14px;">
          <img src="${MEDIA.logo.src}" alt="${MEDIA.logo.alt}" style="width:56px;height:56px;object-fit:contain;border-radius:14px;background:rgba(255,255,255,0.12);padding:6px;" />
          <div>
            <div style="font-size:14px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;opacity:0.95;">${BRANDING.brandName}</div>
            <div style="font-size:22px;font-weight:900;line-height:1.1;">${escapeHtml(BRANDING.hotelName || HOTEL.general.hotelName)}</div>
            <div style="font-size:12px;opacity:0.9;margin-top:4px;">${HOTEL.general.starCategory} • ${HOTEL.general.hotelType}</div>
          </div>
        </div>
      </div>

      <div style="position:relative;">
        <img src="${hero?.src}" alt="${hero?.alt || "Hotel hero"}" style="width:100%;height:220px;object-fit:cover;display:block;" />
        <div style="position:absolute;left:18px;bottom:18px;background:rgba(255,255,255,0.92);backdrop-filter:blur(6px);padding:12px 14px;border-radius:14px;border:1px solid rgba(15,23,42,0.08);max-width:420px;">
          <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:800;color:#0b5d6f;">Premium Booking Confirmation</div>
          <div style="margin-top:4px;font-size:20px;font-weight:950;color:#0f172a;">Reservation #${escapeHtml(bookingId)}</div>
        </div>
      </div>

      <div style="padding:22px 24px 8px;">
        <div style="color:#0f172a;font-size:16px;font-weight:900;">Dear ${escapeHtml(guestName)},</div>
        <div style="margin-top:6px;color:#334155;font-size:13px;line-height:1.7;">Your booking has been successfully confirmed. Please find your stay details below.</div>
      </div>

      <div style="padding:0 24px 18px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#0f172a;">
          <tbody>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.08);color:#475569;font-weight:700;width:45%;">Guest</td>
              <td style="padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.08);text-align:right;font-weight:800;">${escapeHtml(guestName)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.08);color:#475569;font-weight:700;">Booking ID</td>
              <td style="padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.08);text-align:right;font-weight:800;font-family:monospace;">${escapeHtml(bookingId)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.08);color:#475569;font-weight:700;">Room</td>
              <td style="padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.08);text-align:right;font-weight:800;">${escapeHtml(roomLabel ? `${roomLabel} • ${roomTypeName}` : roomTypeName)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.08);color:#475569;font-weight:700;">Guests</td>
              <td style="padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.08);text-align:right;font-weight:800;">${numberOfGuests} Person(s)</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.08);color:#475569;font-weight:700;">Check-in</td>
              <td style="padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.08);text-align:right;font-weight:800;">${formatDate(checkInDate)} ${HOTEL.checkIn.time}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.08);color:#475569;font-weight:700;">Check-out</td>
              <td style="padding:10px 0;border-bottom:1px solid rgba(15,23,42,0.08);text-align:right;font-weight:800;">${formatDate(checkOutDate)} ${HOTEL.checkOut.time}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#475569;font-weight:700;">Nights</td>
              <td style="padding:10px 0;text-align:right;font-weight:800;">${nights}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#475569;font-weight:700;">Payment status</td>
              <td style="padding:10px 0;text-align:right;font-weight:900;color:${paymentColor};">${escapeHtml(paymentText)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="padding:0 24px 22px;">
        <div style="background:#f8fafc;border:1px solid rgba(15,23,42,0.08);border-radius:16px;padding:16px 16px;">
          <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:900;color:#0b5d6f;">Hotel location & contact</div>
          <div style="margin-top:6px;font-size:13px;color:#334155;line-height:1.65;">
            <div><strong>Address:</strong> ${escapeHtml(hotelAddress)}</div>
            <div style="margin-top:4px;"><strong>Phone:</strong> ${escapeHtml(hotelPhone)}</div>
            <div style="margin-top:4px;"><strong>Email:</strong> ${escapeHtml(hotelEmail)}</div>
            <div style="margin-top:4px;"><strong>Website:</strong> ${escapeHtml(hotelWebsite)}</div>
          </div>

          <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
            <a href="${mapsHref}" target="_blank" rel="noreferrer" style="display:inline-block;background:${BRANDING.primaryColor};color:#fff;text-decoration:none;font-weight:900;font-size:12px;padding:11px 14px;border-radius:12px;">Open Google Maps</a>
            <a href="mailto:${hotelEmail}" style="display:inline-block;border:1px solid rgba(15,23,42,0.12);color:#0f172a;text-decoration:none;font-weight:900;font-size:12px;padding:11px 14px;border-radius:12px;background:#fff;">Email Hotel</a>
            ${websiteLink}
          </div>
        </div>
      </div>

      <div style="padding:0 24px 26px;">
        <div style="background:linear-gradient(135deg, rgba(11,93,111,0.08) 0%, rgba(232,163,61,0.08) 100%);border:1px solid rgba(11,93,111,0.16);border-radius:16px;padding:16px 16px;">
          <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:900;color:${BRANDING.primaryColor};">Cancellation policy</div>
          <div style="margin-top:6px;font-size:13px;color:#334155;line-height:1.7;">${escapeHtml(POLICIES.cancellation.description)}</div>
        </div>
      </div>

      <div style="padding:18px 24px;background:#0f172a;color:#cbd5e1;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
          <div>
            <div style="font-weight:950;color:#fff;font-size:14px;">${escapeHtml(BRANDING.hotelName || HOTEL.general.hotelName)}</div>
            <div style="font-size:12px;margin-top:4px;opacity:0.9;">${escapeHtml(hotelAddress)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px;opacity:0.9;">Phone: ${escapeHtml(hotelPhone)}</div>
            <div style="font-size:12px;opacity:0.9;">Email: ${escapeHtml(hotelEmail)}</div>
            <div style="font-size:12px;opacity:0.9;">Website: ${escapeHtml(hotelWebsite)}</div>
          </div>
        </div>
        <div style="margin-top:10px;font-size:11px;opacity:0.85;">&copy; ${new Date().getFullYear()} ${escapeHtml(BRANDING.brandName)}. All rights reserved.</div>
      </div>
    </div>
  </div>
  `;
}

