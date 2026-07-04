export const BRANDING = {
  hotelName: "Serene Bay Resort & Spa",
  brandName: "Serene Collection",

  logo: {
    placeholderSvg: "[UPLOAD: hotel logo SVG placeholder]",
    placeholderPng: "[UPLOAD: hotel logo PNG placeholder]",
  },

  primaryColor: "#0B5D6F",
  secondaryColor: "#E8A33D",
  typography: {
    headings: "Playfair Display",
    body: "Inter",
  },

  email: "reservations@serenebayresort.demo",
  phone: "+91-6752-223344",
  website: "www.serenebayresort.demo",

  favicon: {
    appleTouch180: "[UPLOAD: favicon 180x180 placeholder]",
    icon32: "[UPLOAD: favicon 32x32 placeholder]",
    icon512: "[UPLOAD: favicon 512x512 placeholder]",
  },

  invoiceHeaderNote: "Logo left; GSTIN/CIN right; hotel address centered",
} as const;

export type Branding = typeof BRANDING;

