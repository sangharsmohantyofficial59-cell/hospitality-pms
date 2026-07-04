export const FACILITIES = [
  "Restaurant (multi-cuisine)",
  "Rooftop Bar",
  "Outdoor Pool + Kids' Pool",
  "Ocean Spa & Wellness Center",
  "24-hr Gym",
  "Conference Hall (200 pax)",
  "Business Center",
  "Kids' Play Area",
  "Valet & Self Parking",
  "EV Charging (2 points)",
  "Airport Pickup/Drop",
  "Travel Desk",
  "Same-day Laundry",
  "Banquet Hall (500 pax)",
  "Wedding Lawn (beachside)",
  "Local Temple Tour Desk (Jagannath Temple)",
  "24-hr Taxi Desk",
  "On-call Doctor",
  "Currency Exchange Counter",
] as const;

export type Facility = typeof FACILITIES[number];

