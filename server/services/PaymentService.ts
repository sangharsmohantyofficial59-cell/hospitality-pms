import { Booking, PaymentStatus } from "../../src/types";

export type PaymentSummary = {
  payAmount: number;
  status: PaymentStatus;
};

export class PaymentService {
  static validatePayment(paymentMethod?: string, transactionId?: string) {
    if (!paymentMethod) {
      return { valid: false, reason: "Missing payment method" };
    }
    if (transactionId !== undefined && String(transactionId).trim() === "") {
      return { valid: false, reason: "Missing transaction id" };
    }
    return { valid: true };
  }

  static calculateGST(amount: number, gstRate?: number) {
    return Math.round(amount * (Number(gstRate || 12)) / 100);
  }

  static applyDiscount(subtotalRaw: number, discountAmount?: number, discountPercent?: number) {
    let discountReductions = Number(discountAmount || 0);
    if (discountPercent) {
      discountReductions = Math.round(subtotalRaw * (Number(discountPercent) / 100));
    }
    return discountReductions;
  }

  static calculatePendingBalance(totalPrice: number, paymentOption?: string, advancePaid?: number, pendingBalance?: number) {
    if (paymentOption === "Advance") {
      return Number(pendingBalance ?? Math.max(0, totalPrice - Number(advancePaid ?? (totalPrice / 2))));
    }
    return Number(pendingBalance ?? 0);
  }

  static calculateAdvancePayment(totalPrice: number, paymentOption?: string, advancePaid?: number) {
    if (paymentOption === "Advance") {
      return Number(advancePaid ?? (totalPrice / 2));
    }
    return Number(advancePaid ?? totalPrice);
  }

  static calculateFinalAmount(params: {
    subtotalRaw: number;
    discountAmount?: number;
    discountPercent?: number;
    gstRate?: number;
  }) {
    const discountReductions = this.applyDiscount(params.subtotalRaw, params.discountAmount, params.discountPercent);
    const netTaxableAmount = Math.max(0, params.subtotalRaw - discountReductions);
    const gstValue = this.calculateGST(netTaxableAmount, params.gstRate);
    return {
      discountReductions,
      netTaxableAmount,
      gstValue,
      totalPrice: netTaxableAmount + gstValue
    };
  }

  static calculatePaymentSummary(booking: Booking, requestedTotalPrice: number) {
    const payAmount = booking.paymentOption === "Advance"
      ? Number(booking.advancePaid)
      : Number(requestedTotalPrice);

    const status = booking.paymentOption === "Advance" ? PaymentStatus.PENDING : PaymentStatus.PAID;
    return { payAmount, status };
  }
}
