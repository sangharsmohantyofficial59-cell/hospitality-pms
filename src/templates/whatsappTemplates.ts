/**
 * WhatsApp Cloud API — Message Template Definitions
 * Sprint 7, Module 1
 *
 * Architecture:
 *   - Each template type has its own named builder function.
 *   - Builders produce the JSON payload for Meta's POST /messages endpoint.
 *   - Only bookingConfirmation is fully implemented this sprint.
 *   - All others return a documented TODO stub so they compile and are ready
 *     to be filled in during Module 2 without breaking anything.
 *
 * Template variable naming follows the sprint spec:
 *   hotelName, guestName, bookingId, roomType, checkIn, checkOut,
 *   guestCount, paymentStatus, hotelPhone, hotelAddress, googleMapsUrl
 *
 * IMPORTANT: Template names must be approved in Meta Business Manager
 * before live dispatch. Simulation mode works without approval.
 *
 * Reference:
 *   https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#template-object
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────────────────────────────────────

/** Input variables for the booking confirmation template. */
export interface BookingConfirmationVariables {
  hotelName: string;
  guestName: string;
  bookingId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guestCount: number | string;
  paymentStatus: string;
  hotelPhone: string;
  hotelAddress: string;
  googleMapsUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. bookingConfirmation  [IMPLEMENTED]
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the Meta Cloud API `template` payload for booking confirmations.
 *
 * Maps to an approved template with:
 *   HEADER (text) : hotelName
 *   BODY          : guestName, bookingId, roomType, checkIn, checkOut, guestCount, paymentStatus
 *   FOOTER        : hotelAddress, hotelPhone, googleMapsUrl
 *
 * Adjust parameter indices to match your approved template component order.
 */
export function buildBookingConfirmationTemplate(
  templateName: string,
  vars: BookingConfirmationVariables
): object {
  return {
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components: [
        {
          type: "header",
          parameters: [{ type: "text", text: vars.hotelName }],
        },
        {
          type: "body",
          parameters: [
            { type: "text", text: vars.guestName },
            { type: "text", text: vars.bookingId },
            { type: "text", text: vars.roomType },
            { type: "text", text: vars.checkIn },
            { type: "text", text: vars.checkOut },
            { type: "text", text: String(vars.guestCount) },
            { type: "text", text: vars.paymentStatus },
          ],
        },
        {
          type: "footer",
          parameters: [
            { type: "text", text: vars.hotelAddress },
            { type: "text", text: vars.hotelPhone },
            { type: "text", text: vars.googleMapsUrl },
          ],
        },
      ],
    },
  };
}

/**
 * Builds a rich plain-text simulation message for booking confirmation.
 * Printed to console in simulation mode so the full message is always visible.
 */
export function buildBookingConfirmationText(vars: BookingConfirmationVariables): string {
  const line = "─".repeat(52);
  return [
    ``,
    `┌${line}┐`,
    `│  📲  WhatsApp Booking Confirmation [SIMULATED]     │`,
    `└${line}┘`,
    `  Hotel       : ${vars.hotelName}`,
    `  Guest       : ${vars.guestName}`,
    `  Booking ID  : ${vars.bookingId}`,
    `  Room Type   : ${vars.roomType}`,
    `  Check-In    : ${vars.checkIn}`,
    `  Check-Out   : ${vars.checkOut}`,
    `  Guests      : ${vars.guestCount}`,
    `  Payment     : ${vars.paymentStatus}`,
    `  Phone       : ${vars.hotelPhone}`,
    `  Address     : ${vars.hotelAddress}`,
    `  Maps        : ${vars.googleMapsUrl}`,
    `└${line}┘`,
    ``,
  ].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. paymentConfirmation  [TODO — Sprint 7 Module 2]
// ─────────────────────────────────────────────────────────────────────────────

export interface PaymentConfirmationVariables {
  hotelName: string;
  guestName: string;
  bookingId: string;
  amount: string;
  paymentMethod: string;
  transactionId: string;
  timestamp: string;
}

/**
 * [TODO — Sprint 7 Module 2]
 * Will use the "payment_confirmation" approved Meta template.
 */
export function buildPaymentConfirmationTemplate(
  templateName: string,
  vars: PaymentConfirmationVariables
): object {
  console.warn(`[WhatsApp Templates] buildPaymentConfirmationTemplate is not yet implemented (Sprint 7 Module 2). Template: ${templateName}`);
  return { type: "template", template: { name: templateName, language: { code: "en" }, components: [] } };
}

export function buildPaymentConfirmationText(vars: PaymentConfirmationVariables): string {
  return `[TODO] Payment Confirmation for ${vars.guestName} | Booking: ${vars.bookingId} | Amount: ${vars.amount}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. checkInReminder  [TODO — Sprint 7 Module 2]
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckInReminderVariables {
  hotelName: string;
  guestName: string;
  bookingId: string;
  checkIn: string;
  checkInTime: string;
  roomType: string;
  hotelPhone: string;
  googleMapsUrl: string;
}

/**
 * [TODO — Sprint 7 Module 2]
 * Will use the "check_in_reminder" approved Meta template.
 */
export function buildCheckInReminderTemplate(
  templateName: string,
  vars: CheckInReminderVariables
): object {
  console.warn(`[WhatsApp Templates] buildCheckInReminderTemplate is not yet implemented (Sprint 7 Module 2). Template: ${templateName}`);
  return { type: "template", template: { name: templateName, language: { code: "en" }, components: [] } };
}

export function buildCheckInReminderText(vars: CheckInReminderVariables): string {
  return `[TODO] Check-In Reminder for ${vars.guestName} | Booking: ${vars.bookingId} | Check-In: ${vars.checkIn} at ${vars.checkInTime}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. checkOutReminder  [TODO — Sprint 7 Module 2]
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckOutReminderVariables {
  hotelName: string;
  guestName: string;
  bookingId: string;
  checkOut: string;
  checkOutTime: string;
  roomNumber: string;
  hotelPhone: string;
}

/**
 * [TODO — Sprint 7 Module 2]
 * Will use the "check_out_reminder" approved Meta template.
 */
export function buildCheckOutReminderTemplate(
  templateName: string,
  vars: CheckOutReminderVariables
): object {
  console.warn(`[WhatsApp Templates] buildCheckOutReminderTemplate is not yet implemented (Sprint 7 Module 2). Template: ${templateName}`);
  return { type: "template", template: { name: templateName, language: { code: "en" }, components: [] } };
}

export function buildCheckOutReminderText(vars: CheckOutReminderVariables): string {
  return `[TODO] Check-Out Reminder for ${vars.guestName} | Booking: ${vars.bookingId} | Check-Out: ${vars.checkOut} by ${vars.checkOutTime}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. feedbackRequest  [TODO — Sprint 7 Module 2]
// ─────────────────────────────────────────────────────────────────────────────

export interface FeedbackRequestVariables {
  hotelName: string;
  guestName: string;
  bookingId: string;
  checkOut: string;
  feedbackUrl: string;
}

/**
 * [TODO — Sprint 7 Module 2]
 * Will use the "feedback_request" approved Meta template.
 */
export function buildFeedbackRequestTemplate(
  templateName: string,
  vars: FeedbackRequestVariables
): object {
  console.warn(`[WhatsApp Templates] buildFeedbackRequestTemplate is not yet implemented (Sprint 7 Module 2). Template: ${templateName}`);
  return { type: "template", template: { name: templateName, language: { code: "en" }, components: [] } };
}

export function buildFeedbackRequestText(vars: FeedbackRequestVariables): string {
  return `[TODO] Feedback Request for ${vars.guestName} | Booking: ${vars.bookingId} | URL: ${vars.feedbackUrl}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. staffAlert  [TODO — Sprint 7 Module 2]
// ─────────────────────────────────────────────────────────────────────────────

export interface StaffAlertVariables {
  hotelName: string;
  alertType: string;
  bookingId: string;
  guestName: string;
  roomNumber: string;
  message: string;
  timestamp: string;
}

/**
 * [TODO — Sprint 7 Module 2]
 * Will use the "staff_alert" approved Meta template.
 * Sends operational alerts to hotel staff WhatsApp numbers.
 */
export function buildStaffAlertTemplate(
  templateName: string,
  vars: StaffAlertVariables
): object {
  console.warn(`[WhatsApp Templates] buildStaffAlertTemplate is not yet implemented (Sprint 7 Module 2). Template: ${templateName}`);
  return { type: "template", template: { name: templateName, language: { code: "en" }, components: [] } };
}

export function buildStaffAlertText(vars: StaffAlertVariables): string {
  return `[TODO] Staff Alert [${vars.alertType}] | Booking: ${vars.bookingId} | Guest: ${vars.guestName} | Room: ${vars.roomNumber} | ${vars.message}`;
}
