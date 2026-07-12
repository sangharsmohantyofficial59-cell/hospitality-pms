/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { api } from "./api";
import { Booking } from "../types";

export interface CancelBookingParams {
  bookingId: string;
  reason: string;
  reasonDetails?: string;
  operatorName?: string;
}

/**
 * Shared booking cancellation function used by both Admin panel and Guest Portal.
 * Interacts with the unified backend cancellation flow.
 */
export async function cancelBooking(params: CancelBookingParams): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const { bookingId, reason, reasonDetails, operatorName } = params;
  const res = await api.booking.updateBooking(bookingId, {
    status: "Cancelled",
    cancellationReason: reason,
    reason,
    reasonDetails,
    operatorName: operatorName || "Guest (Self Service)"
  });
  if (!res || !res.success) {
    throw new Error(res?.error || "Cancellation failed");
  }
  return res;
}
