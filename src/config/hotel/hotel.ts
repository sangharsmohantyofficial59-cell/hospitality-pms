export const HOTEL = {
  general: {
    hotelName: "Serene Bay Resort & Spa",
    brandName: "Serene Collection",
    hotelGroup: "Serene Hospitality Pvt. Ltd.",
    starCategory: "4-Star",
    hotelType: "Beach Resort / Business & Leisure",
    yearEstablished: 2015,
    numberOfRooms: 84,
    numberOfFloors: 6,
    numberOfBuildings: "2 (Main Tower + Garden Wing)",
  },

  address: {
    line1: "Plot 14, Marina Beach Road, Sector 9",
    city: "Puri",
    state: "Odisha",
    country: "India",
    pin: 752002,
  },

  legal: {
    gstin: "21ABCDE1234F1Z5 (demo)",
    pan: "ABCDE1234F (demo)",
    cin: "U55101OR2015PTC012345 (demo)",
  },

  checkIn: {
    time: "2:00 PM",
  },

  checkOut: {
    time: "11:00 AM",
  },

  coordinates: {
    lat: 19.8135,
    lng: 85.8312,
  },
} as const;

export type Hotel = typeof HOTEL;

