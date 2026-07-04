export const TAXES = {
  gst: {
    slabBelowINR: 7500,
    rateBelowINR: 0.12,
    rateAboveOrEqualINR: 0.18,
    description:
      "12% (<₹7,500/night), 18% (≥₹7,500/night) — per current Indian slab (verify current rate at implementation).",
  },

  luxuryTax: {
    description: "As applicable per Odisha state tax rules.",
  },
} as const;

export type Taxes = typeof TAXES;

