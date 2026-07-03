import nodemailer from "nodemailer";
import twilio from "twilio";

export interface SentMessageLog {
  id: string;
  bookingId: string;
  guestName: string;
  recipient: string; // Email or Phone number
  type: "email" | "whatsapp";
  event: "booking_confirmation" | "check_in_reminder" | "check_out_confirmation";
  subject: string;
  body: string;
  status: "Sent" | "Simulated" | "Failed";
  etherealUrl?: string;
  sentAt: string;
}

// Memory array synced with server.ts
export let messageLogs: SentMessageLog[] = [];

export function setMessageLogs(newLogs: SentMessageLog[]) {
  messageLogs = newLogs;
}

// Lazy initialization wrapper for transporter
async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log(`[NotificationService] Initializing real SMTP transporter for ${host}:${port}`);
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  // Fallback to creating a dynamic ethereal.email SMTP test account
  try {
    console.log("[NotificationService] No custom SMTP credentials. Launching Ethereal test account...");
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (error) {
    console.warn("[NotificationService] Node environment blocked Ethereal, falling back to simulated engine.", error);
    return null;
  }
}

// Send Email Notification
export async function sendEmail({
  bookingId,
  guestName,
  toEmail,
  event,
  subject,
  htmlBody,
  textBody
}: {
  bookingId: string;
  guestName: string;
  toEmail: string;
  event: SentMessageLog["event"];
  subject: string;
  htmlBody: string;
  textBody: string;
}): Promise<SentMessageLog> {
  const sentAt = new Date().toISOString();
  const id = `MSG-${Date.now().toString().slice(-4)}-E`;

  const transporter = await getTransporter();
  const fromEmail = process.env.SMTP_FROM || "bookings@grandcrestkolkata.com";

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Grand Crest Hotel" <${fromEmail}>`,
        to: toEmail,
        subject,
        text: textBody,
        html: htmlBody
      });

      const fromStr = info.envelope?.from;
      const hostStr = (transporter.options as any)?.host;
      const isEthereal = 
        (typeof fromStr === "string" && fromStr.includes("ethereal.email")) || 
        (typeof hostStr === "string" && hostStr.includes("ethereal"));
      const etherealUrl = isEthereal ? nodemailer.getTestMessageUrl(info) || undefined : undefined;

      const log: SentMessageLog = {
        id,
        bookingId,
        guestName,
        recipient: toEmail,
        type: "email",
        event,
        subject,
        body: textBody,
        status: isEthereal ? "Simulated" : "Sent",
        etherealUrl,
        sentAt
      };
      
      messageLogs.unshift(log);
      console.log(`[Email Service] successfully delivered mail for ${bookingId} to ${toEmail}. ID: ${info.messageId}`);
      if (etherealUrl) {
        console.log(`[Ethereal Inbox link]: ${etherealUrl}`);
      }
      return log;
    } catch (e: any) {
      console.error("[Email Service] SMTP transmission error:", e);
      const log: SentMessageLog = {
        id,
        bookingId,
        guestName,
        recipient: toEmail,
        type: "email",
        event,
        subject,
        body: textBody,
        status: "Failed",
        sentAt
      };
      messageLogs.unshift(log);
      return log;
    }
  } else {
    // Isolated client-side simulation
    const log: SentMessageLog = {
      id,
      bookingId,
      guestName,
      recipient: toEmail,
      type: "email",
      event,
      subject,
      body: textBody,
      status: "Simulated",
      sentAt
    };
    messageLogs.unshift(log);
    console.log(`[Simulated Email] Sent (Internal PMS loop) to ${toEmail} about booking ${bookingId}`);
    return log;
  }
}

// Send WhatsApp Notification
export async function sendWhatsApp({
  bookingId,
  guestName,
  toPhone,
  event,
  body
}: {
  bookingId: string;
  guestName: string;
  toPhone: string;
  event: SentMessageLog["event"];
  body: string;
}): Promise<SentMessageLog> {
  const sentAt = new Date().toISOString();
  const id = `MSG-${Date.now().toString().slice(-4)}-W`;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"; // Default Twilio Sandbox Number

  if (accountSid && authToken) {
    try {
      console.log(`[NotificationService] Initializing real Twilio WhatsApp API Client`);
      const client = twilio(accountSid, authToken);
      
      // Ensure number formatting has whatsapp prefix for twilio
      const formattedTo = toPhone.startsWith("whatsapp:") ? toPhone : `whatsapp:${toPhone}`;

      const res = await client.messages.create({
        body,
        from: fromWhatsApp,
        to: formattedTo
      });

      const log: SentMessageLog = {
        id,
        bookingId,
        guestName,
        recipient: toPhone,
        type: "whatsapp",
        event,
        subject: `WhatsApp: ${event.replace(/_/g, " ")}`,
        body,
        status: "Sent",
        sentAt
      };
      messageLogs.unshift(log);
      console.log(`[WhatsApp SDK] twilio SMS/WhatsApp successfully delivered to ${toPhone}. Sid: ${res.sid}`);
      return log;
    } catch (e: any) {
      console.error("[WhatsApp SDK] twilio dispatch error:", e);
      const log: SentMessageLog = {
        id,
        bookingId,
        guestName,
        recipient: toPhone,
        type: "whatsapp",
        event,
        subject: `WhatsApp: ${event.replace(/_/g, " ")}`,
        body,
        status: "Failed",
        sentAt
      };
      messageLogs.unshift(log);
      return log;
    }
  } else {
    // Pure simulated experience representation
    const log: SentMessageLog = {
      id,
      bookingId,
      guestName,
      recipient: toPhone,
      type: "whatsapp",
      event,
      subject: `WhatsApp: ${event.replace(/_/g, " ")}`,
      body,
      status: "Simulated",
      sentAt
    };
    messageLogs.unshift(log);
    console.log(`[Simulated WhatsApp] Sent to ${toPhone} for booking ${bookingId}`);
    return log;
  }
}

// Dynamic template generators
export function generateTemplates(
  event: SentMessageLog["event"],
  booking: any,
  guest: any,
  roomTypeName: string
) {
  const rootUrl =
  process.env.APP_URL ||
  "https://hospitality-pms-production.up.railway.app";
  
  if (event === "booking_confirmation") {
    const subject = `Reservation Confirmed: Your Stay at Grand Crest (${booking.id})`;
    const textBody = `Dear ${guest.name},

Your reservation at Grand Crest Hotel (18, Park Street, Kolkata) has been successfully guaranteed.

Booking Summary Details:
- Booking Reference: ${booking.id}
- Reserved Category: ${roomTypeName}
- Schedule Period: ${booking.checkInDate} to ${booking.checkOutDate}
- Guests Count: ${booking.numberOfGuests} Persons
- Total Paid Subtotal: ₹${booking.totalPrice.toLocaleString()} (via Razorpay Guaranteed)

Next Step: Express Digital Pre-Arrival Check-In:
Please complete E-Check-In instantly by uploading your Government Photo ID scanned proof at our virtual portal prior to your checkin hour. This will guarantee immediate key release at our lobby.
Access Portal: ${rootUrl}/guest?bookingId=${booking.id}

Warm regards,
Front Desk Reception
Grand Crest Kolkata
bookings@grandcrestkolkata.com
+91 (33) 2200-9900`;

    const htmlBody = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#4f46e5;margin:0;font-size:24px;font-weight:800;">Grand Crest Hotel</h1>
          <p style="color:#64748b;font-size:12px;margin:4px 0 0;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Park Street, Kolkata</p>
        </div>
        <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin-bottom:24px;border:1px solid #f1f5f9;">
          <h2 style="margin-top:0;font-size:16px;color:#0f172a;font-weight:700;">Reservation Confirmed</h2>
          <p style="font-size:13px;color:#334155;line-height:1.6;margin-bottom:0;">
            Dear <strong>${guest.name}</strong>, your suite booking is fully verified and locked! We look forward to hosting you.
          </p>
        </div>
        <table style="width:100%;font-size:12px;color:#475569;border-collapse:collapse;margin-bottom:24px;">
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Booking Reference:</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#0f172a;font-family:monospace;">${booking.id}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Reserved Suite:</td><td style="padding:8px 0;text-align:right;color:#0f172a;">${roomTypeName}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Check-In Date:</td><td style="padding:8px 0;text-align:right;color:#0f172a;">${booking.checkInDate} (12:00 PM)</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Check-Out Date:</td><td style="padding:8px 0;text-align:right;color:#0f172a;">${booking.checkOutDate} (11:00 AM)</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Authorized Occupancy:</td><td style="padding:8px 0;text-align:right;color:#0f172a;">${booking.numberOfGuests} Person(s)</td></tr>
          <tr><td style="padding:12px 0 8px;font-weight:700;color:#0f172a;">Total Invoice Paid:</td><td style="padding:12px 0 8px;text-align:right;font-weight:800;color:#4f46e5;font-size:16px;">₹${booking.totalPrice.toLocaleString()}</td></tr>
        </table>
        <div style="background-color:#e0e7ff;border:1px solid #c7d2fe;padding:16px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h3 style="margin:0 0 6px;color:#3730a3;font-size:12px;text-transform:uppercase;font-weight:800;letter-spacing:1px;">⚡ Skip Lobby Queues: Pre-Arrival Check-In</h3>
          <p style="margin:0 0 12px;color:#4338ca;font-size:11px;line-height:1.5;">To authorize direct key-cards handout, complete your mandatory ID card verification proofs upload now.</p>
          <a href="${rootUrl}/guest?bookingId=${booking.id}" style="display:inline-block;background-color:#4f46e5;color:white;text-decoration:none;font-weight:700;font-size:11px;padding:8px 16px;border-radius:8px;box-shadow:0 10px 15px -3px rgba(79,70,229,0.1)">Proceed to Virtual Lobby E-CheckIn</a>
        </div>
        <div style="text-align:center;color:#94a3b8;font-size:10px;border-top:1px solid #f1f5f9;padding-top:16px;">
          <strong>Grand Crest Hotel Kolkata</strong> • 18 Park St., Kolkata 700016 • Ph: +91 (33) 2200-9900
        </div>
      </div>
    `;

    const whatsappBody = `⭐ *Reservation Confirmed!* ⭐
Dear *${guest.name}*, your booking reference *${booking.id}* at *Grand Crest Hotel Kolkata* is confirmed.

🛏️ *Suite:* ${roomTypeName}
🗓️ *Dates:* ${booking.checkInDate} to ${booking.checkOutDate}
👥 *Guests:* ${booking.numberOfGuests} Person(s)
💰 *Total Paid:* ₹${booking.totalPrice.toLocaleString()}

⚡ *Express Check-In:* Avoid lobby delays! Please upload your ID proofs online before arrival:
👉 ${rootUrl}/guest?bookingId=${booking.id}

We look forward to welcoming you!`;

    return { subject, textBody, htmlBody, whatsappBody };
  } else if (event === "check_in_reminder") {
    const subject = `Welcome to Grand Crest: Check-In Confirmation (${booking.id})`;
    const textBody = `Dear ${guest.name},

Welcome! You have successfully completed registration at Grand Crest Hotel. We are thrilled to host you!

Active Stay Summary:
- Booking Reference: ${booking.id}
- Assigned Room: ${booking.roomId ? `Room ${booking.roomId}` : "Suite Category Locked"}
- Reserved Category: ${roomTypeName}
- Scheduled checkout date: ${booking.checkOutDate} (Strictly 11:00 AM)

Key Guidelines:
- High-efficiency Wi-Fi: Connect to "Grand_Crest_Guest" (No password, standard portal login)
- In-room service: Dial '9' from your room's intercom for Butler services.
- Complimentary breakfast is hosted from 7:30 AM to 10:30 AM at our second-floor lounge.

Have a pleasant and comfortable stay!

Sincerely,
Concierge Guest Relations
Grand Crest Kolkata
+91 (33) 2200-9900`;

    const htmlBody = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#10b981;margin:0;font-size:24px;font-weight:800;">Grand Crest Hotel</h1>
          <p style="color:#64748b;font-size:12px;margin:4px 0 0;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Park Street, Kolkata</p>
        </div>
        <div style="background-color:#ecfdf5;padding:20px;border-radius:12px;margin-bottom:24px;border:1px solid #d1fae5;">
          <h2 style="margin-top:0;font-size:16px;color:#065f46;font-weight:700;">Stay Registration & Key Activated</h2>
          <p style="font-size:13px;color:#047857;line-height:1.6;margin-bottom:0;">
            Dear <strong>${guest.name}</strong>, welcome to <strong>${booking.roomId ? `Room ${booking.roomId}` : "your assigned suite"}</strong>! Your keys are active.
          </p>
        </div>
        <table style="width:100%;font-size:12px;color:#475569;border-collapse:collapse;margin-bottom:24px;">
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Booking Reference:</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#0f172a;font-family:monospace;">${booking.id}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Assigned Room Unit:</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#10b981;">Room ${booking.roomId || "unassigned"}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Reserved Category:</td><td style="padding:8px 0;text-align:right;color:#0f172a;">${roomTypeName}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Scheduled Check-Out:</td><td style="padding:8px 0;text-align:right;color:#0f172a;">${booking.checkOutDate} (11:00 AM)</td></tr>
        </table>
        <div style="background-color:#f8fafc;padding:16px;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:24px;font-size:12px;line-height:1.6;color:#334155;">
          <h4 style="margin:0 0 6px;color:#0f172a;font-weight:700;">🛎️ Custom Guest Guide:</h4>
          <ul style="margin:0;padding-left:16px;">
            <li><strong>High-Speed Wi-Fi:</strong> Connect to <em>"Grand_Crest_Guest"</em> (Portal-SAML keyless).</li>
            <li><strong>Room Dining / Butler Desk:</strong> Dial intercom <strong>'9'</strong> from bed panel.</li>
            <li><strong>Complimentary Buffet Breakfast:</strong> Hosted daily from 07:30 AM to 10:30 AM in Second Floor Lobby.</li>
          </ul>
        </div>
        <div style="text-align:center;color:#94a3b8;font-size:10px;border-top:1px solid #f1f5f9;padding-top:16px;">
          <strong>Grand Crest Hotel Kolkata</strong> • 18 Park St., Kolkata 700016 • Ph: +91 (33) 2200-9900
        </div>
      </div>
    `;

    const whatsappBody = `🛎️ *Welcome to Grand Crest Kolkata!* 🛎️
Dear *${guest.name}*, you have successfully checked into *${booking.roomId ? `Room ${booking.roomId}` : "your suite"}*!

📍 *Booking Ref:* ${booking.id}
🔑 *Assigned Suite:* Room ${booking.roomId || "N/A"} (${roomTypeName})
🗓️ *Checkout Schedule:* ${booking.checkOutDate} (Before 11:00 AM)

💡 *Key Info:*
- *Wi-Fi:* Connect to "Grand_Crest_Guest"
- *Butler desk / Room Service:* Dial *'9'* from Intercom
- *Breakfast buffet:* 7:30 AM - 10:30 AM at Second Floor

We hope you have a stellar stay! Contact us if you need anything.`;

    return { subject, textBody, htmlBody, whatsappBody };
  } else {
    const subject = `E-Checkout Confirmation & Paid Ledger Invoice: Grand Crest (${booking.id})`;
    const textBody = `Dear ${guest.name},

Thank you for choosing to stay with us at Grand Crest Hotel. We hope you experienced an exceptional and memorable visit to Kolkata.

Your electronic check-out logs and ledger payments have been closed successfully.

Ledger Summary & Invoice Details:
- Booking Reference: ${booking.id}
- Completed Room Stay: Room ${booking.roomId || "N/A"} (${roomTypeName})
- Schedule Period: ${booking.checkInDate} to ${booking.checkOutDate}
- Total Charged Net: ₹${booking.totalPrice.toLocaleString()}
- Payment Ledger Status: PAID IN FULL

We hope to welcome you back on your next travel journey to Kolkata. Have a safe and comfortable onward travel!

Warmest regards,
Hotel Administration
Grand Crest Kolkata
bookings@grandcrestkolkata.com`;

    const htmlBody = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#475569;margin:0;font-size:24px;font-weight:800;">Grand Crest Hotel</h1>
          <p style="color:#64748b;font-size:12px;margin:4px 0 0;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Park Street, Kolkata</p>
        </div>
        <div style="background-color:#f1f5f9;padding:20px;border-radius:12px;margin-bottom:24px;border:1px solid #e2e8f0;text-align:center;">
          <h2 style="margin-top:0;font-size:16px;color:#0f172a;font-weight:700;">Electronic Invoice & Settlement Receipts</h2>
          <p style="font-size:13px;color:#334155;line-height:1.6;margin-bottom:0;">
            Dear <strong>${guest.name}</strong>, thank you for staying with us. Your folio check-out clearance is approved.
          </p>
        </div>
        <table style="width:100%;font-size:12px;color:#475569;border-collapse:collapse;margin-bottom:24px;">
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Booking Reference:</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#0f172a;font-family:monospace;">${booking.id}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Completed Suite Stay:</td><td style="padding:8px 0;text-align:right;color:#0f172a;">Room ${booking.roomId || "N/A"} (${roomTypeName})</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Check-In Date:</td><td style="padding:8px 0;text-align:right;color:#0f172a;">${booking.checkInDate}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Check-Out Date:</td><td style="padding:8px 0;text-align:right;color:#0f172a;">${booking.checkOutDate}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0;font-weight:600;">Ledger Settlement:</td><td style="padding:8px 0;text-align:right;color:#10b981;font-weight:700;">PAID IN FULL (Folio Cleared)</td></tr>
          <tr><td style="padding:12px 0 8px;font-weight:700;color:#0f172a;">Aggregate Folio Net:</td><td style="padding:12px 0 8px;text-align:right;font-weight:800;color:#0f172a;font-size:16px;">₹${booking.totalPrice.toLocaleString()}</td></tr>
        </table>
        <div style="background-color:#fafafa;padding:16px;border-radius:12px;border:1px solid #f1f5f9;text-align:center;font-size:11px;color:#64748b;line-height:1.5;">
          <span>We wish you safe and pleasant onward travels. If you would like to provide feedback or need further accounting folios, email us reference bookings@grandcrestkolkata.com</span>
        </div>
        <div style="text-align:center;color:#94a3b8;font-size:10px;border-top:1px solid #f1f5f9;padding-top:16px;margin-top:24px;">
          <strong>Grand Crest Hotel Kolkata</strong> • 18 Park St., Kolkata 700016 • Ph: +91 (33) 2200-9900
        </div>
      </div>
    `;

    const whatsappBody = `✅ *Folio Settled & Checked Out!* ✅
Dear *${guest.name}*, your folios check-out and accounting settle at *Grand Crest Hotel Kolkata* are complete.

📍 *Booking Ref:* ${booking.id}
🛏️ *Stay:* Room ${booking.roomId || "N/A"} (${roomTypeName})
💸 *Invoice Total Paid:* ₹${booking.totalPrice.toLocaleString()} (Folio Balance: ₹0)

We hope you had a dynamic stay with us and have a seamless trip back home! Looking forward to hosting you soon again. 🌟`;

    return { subject, textBody, htmlBody, whatsappBody };
  }
}

// Global master dispatch event
export async function sendNotificationEvents(
  event: SentMessageLog["event"],
  booking: any,
  guest: any,
  roomTypeName: string
) {
  if (!guest || !guest.email || !guest.phone) {
    console.warn(`[NotificationService] Unable to dispatch alerts. Missing guest contact parameters.`, guest);
    return;
  }

  const { subject, textBody, htmlBody, whatsappBody } = generateTemplates(event, booking, guest, roomTypeName);

  console.log(`[NotificationService] Initiating multi-channel dispatch logs for Event: ${event} -> Booking: ${booking.id}`);

  // 1. Dispatch Email asynchronously (in parallel or sequentially with graceful catch)
  await sendEmail({
    bookingId: booking.id,
    guestName: guest.name,
    toEmail: guest.email,
    event,
    subject,
    textBody,
    htmlBody
  });

  // 2. Dispatch WhatsApp details
  await sendWhatsApp({
    bookingId: booking.id,
    guestName: guest.name,
    toPhone: guest.phone,
    event,
    body: whatsappBody
  });
}
