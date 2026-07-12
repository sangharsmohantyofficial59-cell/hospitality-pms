import React, { useEffect, useMemo, useState } from "react";
import { XCircle } from "lucide-react";
import { Booking, BookingStatus, PaymentStatus, RoomType } from "../../types";
import { POLICIES } from "../../config/hotel/policies";

export type CancellationReasonKey =
  | "Plans Changed"
  | "Travel Cancelled"
  | "Found Another Hotel"
  | "Price Issue"
  | "Personal Reasons"
  | "Other";

const DEFAULT_REASON_KEYS: CancellationReasonKey[] = [
  "Plans Changed",
  "Travel Cancelled",
  "Found Another Hotel",
  "Price Issue",
  "Personal Reasons",
  "Other",
];

type CancellationPolicyConfig = {
  /** Cancellation fee rule (example: percent of booking amount). */
  feePercent?: number;
  /** Free window before check-in date. */
  freeHoursBeforeCheckIn?: number;
  /** Human readable policy text. */
  description?: string;
};

function getCancellationPolicyConfig(): CancellationPolicyConfig {
  // Configuration-driven policy: prefer HOTEL cancellation config if present.
  // Existing sprint config has POLICIES.cancellation.description only; keep it backward compatible.
  const feePercent = (process.env.CANCELLATION_FEE_PERCENT ? Number(process.env.CANCELLATION_FEE_PERCENT) : undefined) as
    | number
    | undefined;
  const freeHoursBeforeCheckIn = (process.env.CANCELLATION_FREE_HOURS_BEFORE_CHECKIN
    ? Number(process.env.CANCELLATION_FREE_HOURS_BEFORE_CHECKIN)
    : undefined) as number | undefined;

  return {
    feePercent: Number.isFinite(feePercent as any) ? (feePercent as number) : undefined,
    freeHoursBeforeCheckIn: Number.isFinite(freeHoursBeforeCheckIn as any)
      ? (freeHoursBeforeCheckIn as number)
      : undefined,
    description: POLICIES?.cancellation?.description,
  };
}

function calcCancellationNumbers({
  booking,
  cancellationPolicy,
}: {
  booking: Booking;
  cancellationPolicy: CancellationPolicyConfig;
}) {
  const bookingAmount = Number(booking.totalPrice || 0);
  const now = new Date();
  const checkIn = new Date(booking.checkInDate);
  const msUntilCheckIn = checkIn.getTime() - now.getTime();
  const hoursUntilCheckIn = msUntilCheckIn / (1000 * 60 * 60);

  const isWithinFreeWindow =
    cancellationPolicy.freeHoursBeforeCheckIn !== undefined
      ? hoursUntilCheckIn > cancellationPolicy.freeHoursBeforeCheckIn
      : false;

  // If free window rule is unknown, we fall back to feePercent always applying.
  const feePercent = cancellationPolicy.feePercent ?? 30;

  // Free cancellation: fee = 0 when within free window
  const cancellationFee = isWithinFreeWindow ? 0 : Math.round((bookingAmount * feePercent) / 100);
  const refundAmount = Math.max(0, bookingAmount - cancellationFee);

  return {
    bookingAmount,
    cancellationFee,
    refundAmount,
    refundStatus: "Pending" as const,
    cancellationPolicyText:
      cancellationPolicy.description || POLICIES?.cancellation?.description || "Cancellation fee applies as per hotel policy.",
  };
}

type CancelBookingDialogProps = {
  open: boolean;
  booking: Booking | null;
  roomType?: RoomType;
  hotelContact?: { phone?: string; email?: string };
  currentUserLabel?: string;

  // Cancellation eligibility (server is source of truth); used to disable CTA
  canCancel?: boolean;

  reasons?: CancellationReasonKey[];

  onClose: () => void;
  onConfirmCancel: (payload: {
    bookingId: string;
    reason: CancellationReasonKey;
    reasonDetails?: string;
  }) => Promise<void>;
};

export default function CancelBookingDialog({
  open,
  booking,
  roomType,
  hotelContact,
  currentUserLabel,
  canCancel,
  reasons,
  onClose,
  onConfirmCancel,
}: CancelBookingDialogProps) {
  const cancellationPolicy = useMemo(() => getCancellationPolicyConfig(), []);
  const reasonOptions = reasons && reasons.length ? reasons : DEFAULT_REASON_KEYS;

  const [selectedReason, setSelectedReason] = useState<CancellationReasonKey>("Plans Changed");
  const [otherText, setOtherText] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedReason("Plans Changed");
    setOtherText("");
    setBusy(false);
    setError("");
    setConfirmOpen(false);
    setSuccessOpen(false);
  }, [open]);

  const summary = useMemo(() => {
    if (!booking) return null;
    return calcCancellationNumbers({ booking, cancellationPolicy });
  }, [booking, cancellationPolicy]);

  const effectiveCanCancel = useMemo(() => {
    if (!booking) return false;
    // Client-side guardrails; server must validate the real rules.
    const statusOk = booking.status === BookingStatus.CONFIRMED;
    const checkedInForbidden = booking.checkedInAt !== undefined && booking.checkedInAt !== null;
    const policyText = summary?.cancellationPolicyText || POLICIES?.cancellation?.description;
    if (canCancel !== undefined) return Boolean(canCancel && statusOk && !checkedInForbidden && Boolean(policyText));
    return statusOk && !checkedInForbidden;
  }, [booking, canCancel, summary]);

  if (!open || !booking || !summary) return null;

  const requiresOtherDetails = selectedReason === "Other";

  const validate = () => {
    setError("");
    if (!selectedReason) {
      setError("Cancellation reason is required.");
      return false;
    }
    if (requiresOtherDetails && !otherText.trim()) {
      setError("Please specify details for 'Other' reason.");
      return false;
    }
    if (!effectiveCanCancel) {
      setError("Cancellation is not allowed for the current booking state.");
      return false;
    }
    return true;
  };

  const openConfirm = () => {
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    try {
      setBusy(true);
      await onConfirmCancel({
        bookingId: booking.id,
        reason: selectedReason,
        reasonDetails: requiresOtherDetails ? otherText.trim() : undefined,
      });
      setConfirmOpen(false);
      setSuccessOpen(true);
    } catch (e: any) {
      setError(e?.message || "Cancellation failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const closeSuccess = () => {
    setSuccessOpen(false);
    onClose();
  };

  const formattedCheckIn = booking.checkInDate;
  const formattedCheckOut = booking.checkOutDate;
  const formattedRoomType = roomType?.name || booking.roomTypeId;

  const ModalShell = ({
    children,
    header,
    onCloseClick,
    subtitle,
  }: {
    children: React.ReactNode;
    header: React.ReactNode;
    onCloseClick?: () => void;
    subtitle?: React.ReactNode;
  }) => (
    <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl border border-stone-200 shadow-2xl overflow-hidden">
        <div className="bg-rose-600 text-white px-6 py-4 flex justify-between items-center border-b border-rose-700">
          <div className="flex items-center gap-2">{header}</div>
          {onCloseClick ? (
            <button className="text-white/90 hover:text-white font-bold" onClick={onCloseClick}>
              ✕
            </button>
          ) : (
            <div />
          )}
        </div>

        {subtitle ? <div className="px-6 py-3 bg-white border-b border-stone-200">{subtitle}</div> : null}

        {children}
      </div>
    </div>
  );

  const cancellationPolicyText = summary.cancellationPolicyText;

  return (
    <>
      {successOpen ? (
        <ModalShell
          header={
            <>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/15 border border-white/20">✓</span>
              <h2 className="font-bold text-base">Booking Cancelled Successfully</h2>
            </>
          }
          onCloseClick={undefined}
        >
          <div className="p-6 flex flex-col gap-5 text-xs text-stone-800">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="font-bold text-emerald-900">✓ Booking Cancelled Successfully</div>
              <div className="mt-1 text-emerald-900/90 font-mono">
                Booking ID: {booking.id}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-stone-900 mb-3">Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 border border-stone-200 rounded-xl p-4">
                <div>
                  <span className="block text-[10px] font-mono uppercase text-stone-500">Refund Status</span>
                  <span className="font-bold text-stone-900">{summary.refundStatus}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-stone-500">Inventory Released</span>
                  <span className="font-bold text-emerald-700">Yes</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-stone-500">WhatsApp Notification Sent</span>
                  <span className="font-bold text-emerald-700">Yes</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-stone-500">Email Notification Sent</span>
                  <span className="font-bold text-emerald-700">Yes</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={closeSuccess}
                className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md transition-all bg-rose-600 hover:bg-rose-700 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </ModalShell>
      ) : confirmOpen ? (
        <ModalShell
          header={
            <>
              <XCircle className="w-5 h-5" />
              <h2 className="font-bold text-base">Cancel Booking</h2>
            </>
          }
          onCloseClick={() => setConfirmOpen(false)}
        >
          <div className="p-6 flex flex-col gap-5 text-xs text-stone-800">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <div className="font-bold text-rose-900">Cancel Booking</div>
              <div className="mt-1">
                Hotel policy summary: <span className="font-mono text-rose-900/80">{cancellationPolicyText}</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-stone-900 mb-3">Confirmation</h3>
              <div className="bg-white border border-stone-200 rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-stone-500">Booking ID</span>
                    <span className="font-bold text-stone-900">{booking.id}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-stone-500">Room Type</span>
                    <span className="font-bold text-stone-900">{formattedRoomType}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-stone-500">Check-in</span>
                    <span className="font-bold text-stone-900">{formattedCheckIn}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-stone-500">Check-out</span>
                    <span className="font-bold text-stone-900">{formattedCheckOut}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-stone-500">Booking Amount</span>
                    <span className="font-bold text-stone-900">₹{summary.bookingAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-stone-500">Cancellation Fee</span>
                    <span className="font-bold text-rose-700">₹{summary.cancellationFee.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-stone-500">Refund Amount</span>
                    <span className="font-bold text-emerald-700">₹{summary.refundAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-stone-500">Refund Status</span>
                    <span className="font-bold text-stone-900">{summary.refundStatus}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-[10px] font-mono uppercase text-stone-500">Cancellation Policy</span>
                    <span className="font-bold text-stone-900">{cancellationPolicyText}</span>
                  </div>
                </div>
              </div>
            </div>

            {error ? <div className="text-rose-700 font-bold">{error}</div> : null}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 border border-stone-200 rounded-lg text-xs font-bold hover:bg-stone-50 cursor-pointer"
              >
                Keep My Booking
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!effectiveCanCancel || busy}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md transition-all ${
                  !effectiveCanCancel || busy
                    ? "bg-rose-200 text-rose-950 cursor-not-allowed"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
              >
                {busy ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>
          </div>
        </ModalShell>
      ) : (
        <ModalShell
          header={
            <>
              <XCircle className="w-5 h-5" />
              <h2 className="font-bold text-base">Cancel Booking</h2>
            </>
          }
          onCloseClick={onClose}
        >
          <div className="p-6 flex flex-col gap-5 text-xs text-stone-800">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <div className="font-bold text-rose-900">Booking: {booking.id}</div>
              <div className="mt-1">
                Hotel policy summary: <span className="font-mono text-rose-900/80">{summary.cancellationPolicyText}</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-stone-900 mb-3">Cancellation Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 border border-stone-200 rounded-xl p-4">
                <div>
                  <span className="block text-[10px] font-mono uppercase text-stone-500">Booking Amount</span>
                  <span className="font-bold text-stone-900">₹{summary.bookingAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-stone-500">Cancellation Fee</span>
                  <span className="font-bold text-rose-700">₹{summary.cancellationFee.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-stone-500">Refund Amount</span>
                  <span className="font-bold text-emerald-700">₹{summary.refundAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-stone-500">Refund Status</span>
                  <span className="font-bold text-stone-900">{summary.refundStatus}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-stone-900 mb-3">Cancellation Reason</h3>

              <div className="flex flex-col gap-2 bg-white border border-stone-200 rounded-xl p-4">
                <label className="text-[10px] font-mono uppercase font-bold text-stone-600">Select reason</label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value as CancellationReasonKey)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono bg-white"
                >
                  {reasonOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                {requiresOtherDetails && (
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-stone-600">Other</label>
                    <textarea
                      rows={3}
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      placeholder="Please specify cancellation reason..."
                      className="mt-2 w-full px-3 py-2 border border-stone-200 rounded-lg text-xs resize-none"
                    />
                  </div>
                )}

                <div className="text-[10px] text-stone-500">
                  {hotelContact?.phone || hotelContact?.email
                    ? `For assistance: ${hotelContact.phone || ""}${hotelContact.phone && hotelContact.email ? " • " : ""}${hotelContact.email || ""}`
                    : null}
                </div>
              </div>

              {error && <div className="mt-3 text-rose-700 font-bold">{error}</div>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-stone-200 rounded-lg text-xs font-bold hover:bg-stone-50 cursor-pointer"
              >
                Keep My Booking
              </button>

              <button
                type="button"
                onClick={openConfirm}
                disabled={!effectiveCanCancel || busy}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md transition-all ${
                  !effectiveCanCancel || busy
                    ? "bg-rose-200 text-rose-950 cursor-not-allowed"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
              >
                {busy ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>

            {currentUserLabel && (
              <div className="text-[10px] text-stone-500">
                Cancelled by: <span className="font-mono font-bold">{currentUserLabel}</span>
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </>
  );
}


