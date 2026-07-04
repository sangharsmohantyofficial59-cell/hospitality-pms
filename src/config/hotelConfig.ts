import type {
  AmenityConfig,
  AttractionConfig,
  BanquetConfig,
  BookingSettings,
  ContactConfig,
  DestinationConfig,
  DiningConfig,
  FAQItem,
  GalleryItem,
  GuestPortalFeatures,
  HighlightItem,
  HeroConfig,
  HotelConfig,
  HotelInfo,
  MediaItem,
  PoliciesConfig,
  PoliciesConfig as PoliciesConfigType,
  QuickAction,
  RoomConfig,
  SEOConfig,
  TestimonialItem,
} from "./configTypes";

import {
  BRANDING,
  HOTEL,
  POLICIES,
  TAXES,
  RESTAURANT,
  FACILITIES,
  ROOM_TYPES,
  ROOMS,
} from "./hotel";

/**
 * Compatibility adapter.
 *
 * Preserves the existing `hotelConfig` API/shape expected by the current UI.
 * Single source of truth: values come from `src/config/hotel/*`.
 */

const info: HotelInfo = {
  id: "hotel-1",
  name: HOTEL.general.hotelName,
  type: HOTEL.general.hotelType,
  tagline: HOTEL.general.brandName,
  shortDescription: HOTEL.general.hotelGroup,
  longDescription: `${HOTEL.general.hotelType} located in ${HOTEL.address.city}, ${HOTEL.address.state}.`,
  logo: BRANDING.logo.placeholderPng,
  favicon: BRANDING.favicon.icon32,
  themeColors: {
    primary: BRANDING.primaryColor,
    secondary: BRANDING.secondaryColor,
    accent: BRANDING.secondaryColor,
  },
};

const hero: HeroConfig = {
  title: info.name,
  subtitle: HOTEL.general.starCategory,
  ctaText: "Book Your Stay",
  images: [BRANDING.logo.placeholderPng],
};

const gallery: GalleryItem[] = [
  {
    url: BRANDING.logo.placeholderPng,
    category: "Gallery",
    caption: info.name,
  },
];

const roomConfigs: RoomConfig[] = ROOM_TYPES.map((rt) => {
  // Adapter fields to the UI room card expectations
  const occupancy = rt.occupancy;
  const maxGuests = occupancy.max;
  return {
    id: rt.id,
    name: rt.name,
    description: rt.description,
    basePrice: rt.baseRateINR,
    occupancy: rt.occupancy.base,
    roomSize: "—",
    bedType: rt.bed.size,
    roomView: "—",
    features: [...rt.mealPlanOptions],
    images: [],
    featured: rt.id === "executive_suite" || rt.id === "premium_sea_view",
    // UI may reference maxGuests
    // (HotelConfig's RoomConfig type here doesn't include maxGuests, but the UI uses `room.maxGuests` from roomTypes passed in props;
    // those props come from other config modules in the app. We keep this adapter minimal.)
  } as any;
});

const amenities: AmenityConfig[] = FACILITIES.map((f) => ({
  name: f,
  icon: "Sparkles",
  description: f,
}));

const dining: DiningConfig[] = [
  {
    restaurantName: RESTAURANT.outlets.restaurant.name,
    cuisine: RESTAURANT.outlets.restaurant.outletType,
    timings: "Breakfast 7–10:30 AM, Lunch 12:30–3 PM, Dinner 7:30–11 PM",
    description: "On-site multi-cuisine dining.",
    images: [],
  },
];

// Website CMS content (attractions/activities/highlights/testimonials/faqs/mediaLibrary/etc.) is intentionally deferred.
// This file represents PMS operational configuration only, so we keep these arrays out of the PMS layer.
const activities: any[] = [];
const banquet: BanquetConfig[] = [];
const attractions: AttractionConfig[] = [];


const policies: PoliciesConfig = {
  checkInTime: HOTEL.checkIn.time,
  checkOutTime: HOTEL.checkOut.time,
  cancellation: POLICIES.cancellation.description,
  child: POLICIES.child.description,
  pet: POLICIES.pet.description,
  additionalRules: [
    POLICIES.earlyCheckIn.description,
    POLICIES.lateCheckout.description,
    POLICIES.visitors.description,
    POLICIES.parking.description,
    POLICIES.gst.description,
  ],
};

const contact: ContactConfig = {
  phone: BRANDING.phone,
  email: BRANDING.email,
  website: BRANDING.website,
  address: `${HOTEL.address.line1}, ${HOTEL.address.city}, ${HOTEL.address.state} ${HOTEL.address.pin}, ${HOTEL.address.country}`,
};

const seo: SEOConfig = {
  pageTitle: `${info.name} - Hotel Booking`,
  metaDescription: info.longDescription,
  keywords: [info.name, "hotel booking", HOTEL.address.city],
  canonicalUrl: "",
  ogImage: "",
};

const highlights: HighlightItem[] = [];
const testimonials: TestimonialItem[] = [];
const faqs: FAQItem[] = [];

const cta = {
  primaryButtonText: "Book Your Stay",
  secondaryButtonText: "Explore Offers",
  whatsappNumber: "",
};

const mediaLibrary: MediaItem[] = [];

const booking: BookingSettings = {
  enableOnlineBooking: true,
  enableWhatsappBooking: false,
  enableDirectCallBooking: true,
  defaultWhatsappNumber: "",
};

const guestPortalFeatures: GuestPortalFeatures = {
  enableSpa: true,
  enableTours: true,
  enableTransport: true,
  enableDiningReservations: true,
  enableConferenceBookings: true,
  enableRoomUpgradeOffers: true,
};

const guestQuickActions: QuickAction[] = [];

const destinationExplorer: DestinationConfig = {
  localityName: HOTEL.address.city,
  attractions: [],
};

export const hotelConfig: HotelConfig = {

  info,
  hero,
  gallery,
  rooms: ROOMS as any,
  amenities,
  dining,
  activities,
  banquet,
  attractions,
  contact,
  social: {},
  maps: {
    coordinates: { lat: HOTEL.coordinates.lat, lng: HOTEL.coordinates.lng },
    url: "",
  },
  policies,
  seo,
  highlights,
  testimonials,
  faqs,
  cta,
  mediaLibrary,
  booking,
  guestPortalFeatures,
  guestQuickActions,
  destinationExplorer,
};





