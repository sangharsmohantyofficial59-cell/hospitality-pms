export const POLICIES = {
  cancellation: {
    description:
      "Free cancellation up to 48 hrs before check-in (BAR); non-refundable for advance-purchase rates.",
  },

  refund: {
    timeline: "5–7 business days",
    description: "Processed within 5–7 business days to original payment method.",
  },

  noShow: {
    description: "First night charged in full.",
  },

  earlyCheckIn: {
    description: "Subject to availability; free before 8 AM otherwise 50% of nightly rate.",
  },

  lateCheckout: {
    description: "Free till 1 PM; 50% charge till 4 PM; full night charge after.",
  },

  extraBed: {
    description: "As per Room Type table above; max 1 extra bed/room.",
    maxExtraBedsPerRoom: 1,
  },

  child: {
    description: "Below 5 yrs free (no extra bed); 5–12 yrs extra child charge applies.",
  },

  pet: {
    description: "Not allowed except service animals.",
  },

  smoking: {
    description: "Designated balconies/outdoor areas only; ₹5,000 cleaning fee for violation.",
    violationFeeINR: 5000,
  },

  visitors: {
    description: "Visitors allowed till 9 PM with ID registration at front desk.",
  },

  parking: {
    description: "Complimentary for in-house guests.",
  },

  gst: {
    description:
      "12% (<₹7,500/night), 18% (≥₹7,500/night) — per current Indian slab (verify current rate at implementation).",
  },

  luxuryTax: {
    description: "As applicable per Odisha state tax rules.",
  },

  serviceCharge: {
    description: "Optional, restaurant only.",
  },

  lostAndFound: {
    description: "Items held 90 days, logged with photo + description.",
    holdDays: 90,
  },

  damage: {
    description: "Charged as per replacement/repair cost, billed to folio.",
  },
} as const;

export type Policies = typeof POLICIES;

