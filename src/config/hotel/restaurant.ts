export const RESTAURANT = {
  outlets: {
    restaurant: {
      name: "Tidewater",
      outletType: "Multi-cuisine Restaurant",
    },
    bar: {
      name: "Anchor",
      outletType: "Rooftop Bar",
      happyHours: {
        time: "6–8 PM",
        discount: "20% off",
      },
    },
    breakfast: {
      type: "Buffet Breakfast",
      timeWindow: "7–10:30 AM",
    },
    lunch: {
      type: "Lunch",
      timeWindow: "12:30–3 PM",
    },
    dinner: {
      type: "Dinner",
      timeWindow: "7:30–11 PM",
    },
    roomService: {
      availability: "24-hr",
      slaMinutes: 30,
    },
  },
} as const;

export type RestaurantConfig = typeof RESTAURANT;

