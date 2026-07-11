/**
 * WhatsApp Cloud API Service — Sprint 7, Module 1 (Final Cleanup)
 *
 * Provider    : Meta WhatsApp Cloud API (graph.facebook.com)
 * Legacy      : Twilio removed — not used here.
 *
 * Design principles:
 *  - Booking ALWAYS succeeds. WhatsApp failure is logged, never thrown.
 *  - All credentials come from whatsappConfig.ts (env vars only).
 *  - Simulation mode prints a full, human-readable card to console.
 *  - Every dispatch attempt emits structured log: Booking ID, Phone,
 *    Template, Status, Timestamp, Meta Response.
 *
 * Implemented this sprint:
 *  - sendBookingConfirmation()
 *
 * Stubbed for Sprint 7 Module 2:
 *  - sendCancellation()
 *  - sendPaymentConfirmation()
 *
 * Reference:
 *  https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 */

import { getWhatsAppConfig } from "../config/whatsappConfig";
import {
  buildBookingConfirmationTemplate,
  buildBookingConfirmationText,
  type BookingConfirmationVariables,
} from "../templates/whatsappTemplates";
import { messageLogs, type SentMessageLog } from "./notificationService";

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes a phone number for the Meta Cloud API.
 * Strips all non-digit characters except a leading "+".
 * Ensures the number is in E.164 format (e.g. "+919876543210").
 */
function normalizePhone(raw: string): string {
  const stripped = raw.replace(/[^0-9+]/g, "");
  if (stripped.startsWith("+")) return stripped;
  if (stripped.length === 10) return `+91${stripped}`;
  return `+${stripped}`;
}

/** Generates a unique message log ID for WhatsApp Cloud API messages. */
function generateMsgId(): string {
  return `MSG-${Date.now().toString().slice(-5)}-WA`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Structured attempt logger
// ─────────────────────────────────────────────────────────────────────────────

interface AttemptLog {
  bookingId: string;
  phone: string;
  template: string;
  status: "Sent" | "Simulated" | "Failed";
  timestamp: string;
  metaResponse?: unknown;
  errorDetail?: string;
}

/**
 * Emits a structured log line for every WhatsApp dispatch attempt.
 * All 6 fields are always present: Booking ID, Phone, Template, Status,
 * Timestamp, Meta Response.
 */
function logAttempt(entry: AttemptLog): void {
  const label = entry.status === "Sent"
    ? "[WhatsApp] ✅ SENT"
    : entry.status === "Simulated"
    ? "[WhatsApp] 🔵 SIMULATED"
    : "[WhatsApp] ❌ FAILED";

  console.log(
    `${label} | BookingID: ${entry.bookingId} | Phone: ${entry.phone} | Template: ${entry.template} | Status: ${entry.status} | Time: ${entry.timestamp}` +
    (entry.metaResponse !== undefined ? ` | MetaResponse: ${JSON.stringify(entry.metaResponse)}` : "") +
    (entry.errorDetail ? ` | Error: ${entry.errorDetail}` : "")
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delivery result type
// ─────────────────────────────────────────────────────────────────────────────

export interface WhatsAppDeliveryResult {
  /** Internal message log ID */
  msgId: string;
  /** Destination phone number (E.164) */
  phone: string;
  /** "Sent" | "Simulated" | "Failed" */
  status: "Sent" | "Simulated" | "Failed";
  /** Meta message ID if API returned one */
  metaMessageId?: string;
  /** Full API response body for audit logging */
  apiResponse?: unknown;
  /** Error details when status === "Failed" */
  errorDetail?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// sendBookingConfirmation  [IMPLEMENTED]
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a WhatsApp booking confirmation via the Meta Cloud API.
 *
 * Integration contract:
 *  - Called automatically from server.ts after booking status → CONFIRMED.
 *  - Never throws — booking flow is never rolled back due to WhatsApp failure.
 *  - Every attempt is logged with: Booking ID, Phone, Template, Status, Timestamp, Meta Response.
 */
export async function sendBookingConfirmation({
  bookingId,
  guestName,
  toPhone,
  vars,
}: {
  bookingId: string;
  guestName: string;
  toPhone: string;
  vars: BookingConfirmationVariables;
}): Promise<WhatsAppDeliveryResult> {
  const msgId = generateMsgId();
  const phone = normalizePhone(toPhone);
  const sentAt = new Date().toISOString();
  const config = getWhatsAppConfig();
  const template = config.templateName;
  const textPreview = buildBookingConfirmationText(vars);

  // ── SIMULATION MODE ────────────────────────────────────────────────────────
  if (!config.enabled) {
    // Print full formatted simulation card to console
    console.log(textPreview);

    logAttempt({ bookingId, phone, template, status: "Simulated", timestamp: sentAt });

    const log: SentMessageLog = {
      id: msgId,
      bookingId,
      guestName,
      recipient: phone,
      type: "whatsapp",
      event: "booking_confirmation",
      subject: `WhatsApp Booking Confirmation (Simulated)`,
      body: textPreview,
      status: "Simulated",
      sentAt,
    };
    messageLogs.unshift(log);

    return { msgId, phone, status: "Simulated" };
  }

  // ── LIVE MODE — Meta Cloud API Call ───────────────────────────────────────
  const templatePayload = buildBookingConfirmationTemplate(template, vars);
  const requestBody = {
    messaging_product: "whatsapp",
    to: phone,
    ...templatePayload,
  };

  let apiResponse: unknown;

  try {
    const response = await fetch(config.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    apiResponse = await response.json().catch(() => ({ raw: "non-JSON response" }));

    if (!response.ok) {
      const errorDetail = JSON.stringify(apiResponse);
      logAttempt({ bookingId, phone, template, status: "Failed", timestamp: sentAt, metaResponse: apiResponse, errorDetail });

      const log: SentMessageLog = {
        id: msgId, bookingId, guestName, recipient: phone,
        type: "whatsapp", event: "booking_confirmation",
        subject: `WhatsApp Booking Confirmation`,
        body: textPreview, status: "Failed", sentAt,
      };
      messageLogs.unshift(log);
      return { msgId, phone, status: "Failed", apiResponse, errorDetail };
    }

    const parsed = apiResponse as any;
    const metaMessageId: string | undefined = parsed?.messages?.[0]?.id ?? undefined;

    logAttempt({ bookingId, phone, template, status: "Sent", timestamp: sentAt, metaResponse: apiResponse });

    const log: SentMessageLog = {
      id: msgId, bookingId, guestName, recipient: phone,
      type: "whatsapp", event: "booking_confirmation",
      subject: `WhatsApp Booking Confirmation`,
      body: textPreview, status: "Sent", sentAt,
    };
    messageLogs.unshift(log);

    return { msgId, phone, status: "Sent", metaMessageId, apiResponse };

  } catch (err: unknown) {
    const errorDetail = err instanceof Error ? err.message : String(err);
    logAttempt({ bookingId, phone, template, status: "Failed", timestamp: sentAt, errorDetail });

    const log: SentMessageLog = {
      id: msgId, bookingId, guestName, recipient: phone,
      type: "whatsapp", event: "booking_confirmation",
      subject: `WhatsApp Booking Confirmation`,
      body: textPreview, status: "Failed", sentAt,
    };
    messageLogs.unshift(log);
    return { msgId, phone, status: "Failed", apiResponse, errorDetail };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// sendCancellation  [STUB — Sprint 7 Module 2]
// ─────────────────────────────────────────────────────────────────────────────

/**
 * [STUB — Sprint 7 Module 2]
 * Will use the "booking_cancellation" approved Meta template.
 * Params accepted but not processed until Module 2 implementation.
 */
export async function sendCancellation(params: {
  bookingId: string;
  guestName: string;
  toPhone: string;
  vars: Record<string, string>;
}): Promise<void> {
  const sentAt = new Date().toISOString();
  logAttempt({
    bookingId: params.bookingId,
    phone: normalizePhone(params.toPhone),
    template: "booking_cancellation",
    status: "Simulated",
    timestamp: sentAt,
  });
  console.warn(
    `[WhatsApp] sendCancellation() — Sprint 7 Module 2 stub. Booking: ${params.bookingId} | Guest: ${params.guestName}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// sendPaymentConfirmation  [STUB — Sprint 7 Module 2]
// ─────────────────────────────────────────────────────────────────────────────

/**
 * [STUB — Sprint 7 Module 2]
 * Will use the "payment_confirmation" approved Meta template.
 * Params accepted but not processed until Module 2 implementation.
 */
export async function sendPaymentConfirmation(params: {
  bookingId: string;
  guestName: string;
  toPhone: string;
  vars: Record<string, string>;
}): Promise<void> {
  const sentAt = new Date().toISOString();
  logAttempt({
    bookingId: params.bookingId,
    phone: normalizePhone(params.toPhone),
    template: "payment_confirmation",
    status: "Simulated",
    timestamp: sentAt,
  });
  console.warn(
    `[WhatsApp] sendPaymentConfirmation() — Sprint 7 Module 2 stub. Booking: ${params.bookingId} | Guest: ${params.guestName}`
  );
}

