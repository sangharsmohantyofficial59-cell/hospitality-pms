/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HotelInfo {
  id: string;
  name: string;
  type: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  logo: string;
  favicon: string;
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  ctaText: string;
  images: string[];
}

export interface GalleryItem {
  url: string;
  category: string;
  caption: string;
}

export interface RoomConfig {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  occupancy: number;
  roomSize: string;
  bedType: string;
  roomView: string;
  features: string[];
  images: string[];
  featured: boolean;
}

export interface AmenityConfig {
  name: string;
  icon: string;
  description: string;
}

export interface DiningConfig {
  restaurantName: string;
  cuisine: string;
  timings: string;
  description: string;
  images: string[];
}

export interface ActivityConfig {
  name: string;
  description: string;
  images: string[];
}

export interface BanquetConfig {
  hallName: string;
  capacity: number;
  facilities: string[];
  images: string[];
}

export interface AttractionConfig {
  name: string;
  distance: string;
  description: string;
  images: string[];
}

export interface ContactConfig {
  phone: string;
  email: string;
  website: string;
  address: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  whatsapp?: string;
}

export interface MapConfig {
  coordinates: {
    lat: number;
    lng: number;
  };
  url: string;
}

export interface PoliciesConfig {
  checkInTime: string;
  checkOutTime: string;
  cancellation: string;
  child: string;
  pet: string;
  additionalRules: string[];
}

export interface SEOConfig {
  pageTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string;
}

export interface HighlightItem {
  title: string;
  description: string;
  icon: string;
}

export interface TestimonialItem {
  guestName: string;
  location: string;
  rating: number;
  review: string;
  image: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface CTAConfig {
  primaryButtonText: string;
  secondaryButtonText: string;
  whatsappNumber: string;
}

export interface MediaItem {
  id: string;
  url: string;
  category: string;
  altText: string;
}

export interface BookingSettings {
  enableOnlineBooking: boolean;
  enableWhatsappBooking: boolean;
  enableDirectCallBooking: boolean;
  defaultWhatsappNumber: string;
}

export interface GuestPortalFeatures {
  enableSpa: boolean;
  enableTours: boolean;
  enableTransport: boolean;
  enableDiningReservations: boolean;
  enableConferenceBookings: boolean;
  enableRoomUpgradeOffers: boolean;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  description: string;
  category: "service" | "revenue" | "general";
}

export interface DestinationAttraction {
  name: string;
  category: "Historical Sites" | "Temples" | "Beaches" | "Lakes" | "Mountains" | "Adventure" | "Museums" | "Shopping" | "Food Streets" | "Cafes" | "Wildlife" | "Entertainment" | "Local Markets" | "Parks" | "Cultural Experiences" | string;
  heroImage: string;
  shortDescription: string;
  distance: string;
  travelTime: string;
  mapsUrl: string;
  bestTime: string;
  entryFee?: string;
  openingHours?: string;
  transportAvailable: boolean;
  featuredBadge?: string;
}

export interface DestinationConfig {
  localityName: string; // e.g. "Puri", "Bhubaneswar", "Indore", "Goa"
  attractions: DestinationAttraction[];
}

export interface HotelConfig {
  info: HotelInfo;
  hero: HeroConfig;
  gallery: GalleryItem[];
  rooms: RoomConfig[];
  amenities: AmenityConfig[];
  dining: DiningConfig[];
  activities: ActivityConfig[];
  banquet: BanquetConfig[];
  attractions: AttractionConfig[];
  contact: ContactConfig;
  social: SocialLinks;
  maps: MapConfig;
  policies: PoliciesConfig;
  seo: SEOConfig;
  highlights: HighlightItem[];
  testimonials: TestimonialItem[];
  faqs: FAQItem[];
  cta: CTAConfig;
  mediaLibrary: MediaItem[];
  booking: BookingSettings;
  guestPortalFeatures: GuestPortalFeatures;
  guestQuickActions: QuickAction[];
  destinationExplorer: DestinationConfig;
}
