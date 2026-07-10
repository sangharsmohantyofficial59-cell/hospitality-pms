export const BRANDING = {
  // Centralized brand presentation values.
  // NOTE: These are production-presentation config only.
  hotelName: "Serene Bay Resort & Spa",
  brandName: "Serene Collection",

  logo: {
    // Keep as-is (no business logic) but remove placeholder marker.
    // If you have real assets, replace these paths with real URLs/files.
    placeholderSvg: "",
    placeholderPng: "",
  },

  primaryColor: "#0B5D6F",
  secondaryColor: "#E8A33D",
  typography: {
    headings: "Playfair Display",
    body: "Inter",
  },

  // Support contact details (used across UI/email/PDF).
  email: "reservations@serenebayresort.com",
  phone: "+91-6752-223344",
  website: "www.serenebayresort.com",

  // Favicon/manifest references.
  // These must point to actual public assets when deploying.
  favicon: {
    appleTouch180: "",
    icon32: "",
    icon512: "",
  },

  invoiceHeaderNote: "Logo left; GSTIN/CIN right; hotel address centered",
} as const;


export type Branding = typeof BRANDING;


