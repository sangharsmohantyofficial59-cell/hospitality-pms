import type { MediaItem } from "../../config/configTypes";


// Media architecture: centralized, slider/gallery/video-ready.
// All arrays are empty by default so the app remains build-safe even
// when actual media assets are added later into public/assets/hotel/...

export interface HeroImage {
  id: string;
  src: string;
  alt: string;
  sort: number;
}

export interface RoomMedia {
  // By category key (maps to room type ids)
  deluxe: string[];
  premium: string[];
  executive: string[];
  familySuite: string[];
  presidentialSuite: string[];
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  sort: number;
}

export interface AttractionMedia {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  sort: number;
}

export interface RestaurantMedia {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  sort: number;
}

export interface SpaMedia {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  sort: number;
}

export interface VideoMedia {
  id: string;
  posterSrc?: string;
  heroVideoSrc?: string;
  promos: Array<{
    id: string;
    src: string;
    title?: string;
  }>;
}

type LogoMedia = {
  src: string;
  alt: string;
};

type FaviconMedia = {
  appleTouch180: string;
  icon32: string;
  icon512: string;
};

const EMPTY_ARR: never[] = [] as never[];

export const MEDIA = {
  logo: {
    src: "/assets/hotel/logo/logo.png",
    alt: "Hotel logo",
  } satisfies LogoMedia,

  favicon: {
    appleTouch180: "/assets/hotel/logo/favicon/apple-touch-icon.png",
    icon32: "/assets/hotel/logo/favicon/favicon-32x32.png",
    icon512: "/assets/hotel/logo/favicon/favicon-512x512.png",
  } satisfies FaviconMedia,

  // Hero slider-ready (multiple images)
  heroImages: [
    { id: "hero-01", src: "/assets/hotel/hero/hero-01.jpg", alt: "Hotel hero 01", sort: 1 },
    { id: "hero-02", src: "/assets/hotel/hero/hero-02.jpg", alt: "Hotel hero 02", sort: 2 },
    { id: "hero-03", src: "/assets/hotel/hero/hero-03.jpg", alt: "Hotel hero 03", sort: 3 },
    { id: "hero-04", src: "/assets/hotel/hero/hero-04.jpg", alt: "Hotel hero 04", sort: 4 },
    { id: "hero-05", src: "/assets/hotel/hero/hero-05.jpg", alt: "Hotel hero 05", sort: 5 },
  ],

  // Room categories (multiple images per category). Keys align to UI categories.
  // - deluxe -> deluxe
  // - premium -> premium_sea_view
  // - executive -> executive_suite
  // - familySuite -> family_room
  // - presidentialSuite -> presidential_suite
  roomImages: {
    deluxe: ["/assets/hotel/rooms/deluxe/room-01.jpg", "/assets/hotel/rooms/deluxe/room-07.jpg"],
    premium: ["/assets/hotel/rooms/premium/room-04.jpg"],
    executive: ["/assets/hotel/rooms/executive/room-02.jpg"],
    familySuite: ["/assets/hotel/rooms/family-suite/room-03.jpg"],
    presidentialSuite: ["/assets/hotel/rooms/presidential-suite/room-06.jpg"],
  } satisfies RoomMedia,

  galleryImages: [
    { id: "gallery-01", src: "/assets/hotel/gallery/hero-02.jpg", alt: "Resort Exterior", sort: 1 },
    { id: "gallery-02", src: "/assets/hotel/gallery/hero-05.jpg", alt: "Garden View", sort: 2 },
    { id: "gallery-03", src: "/assets/hotel/gallery/pexels-quang-nguyen-vinh-222549-6875499.jpg", alt: "Resort Lobby", sort: 3 },
    { id: "gallery-04", src: "/assets/hotel/gallery/pexels-sokil-2159771144-38406370.jpg", alt: "Beachfront Balcony", sort: 4 },
    { id: "gallery-05", src: "/assets/hotel/gallery/restaurant-01.jpg", alt: "Dining Room", sort: 5 },
    { id: "gallery-06", src: "/assets/hotel/gallery/restaurant-02.jpg", alt: "Beachfront Lounge", sort: 6 },
    { id: "gallery-07", src: "/assets/hotel/gallery/room-03.jpg", alt: "Family Suite Bed", sort: 7 },
  ],

  // Dining
  restaurantImages: [
    { id: "restaurant-01", src: "/assets/hotel/restaurant/restaurant-01.jpg", alt: "Restaurant 01", sort: 1 },
    { id: "restaurant-02", src: "/assets/hotel/restaurant/restaurant-02.jpg", alt: "Restaurant 02", sort: 2 },
  ],

  // Wellness
  spaImages: [
    { id: "spa-01", src: "/assets/hotel/spa/spa-01.jpg", alt: "Spa 01", sort: 1 },
  ],

  // Wellness adjacent categories
  gymImages: [] as string[],
  poolImages: ["/assets/hotel/pool/pool-01.jpg", "/assets/hotel/pool/pool-02.jpg", "/assets/hotel/pool/pool-03.jpg"],
  banquetImages: [] as string[],

  // Experiences
  activityImages: [] as GalleryImage[],
  attractionImages: [] as AttractionMedia[],

  // Video
  videoGallery: {
    id: "hotel-video",
    promos: [] as VideoMedia["promos"],
  } satisfies VideoMedia,

  // Convenience: build-time helper for places expecting flat urls.
  // Not exported as part of the required API, but kept for readability.
  // (Safe because it’s derived and doesn’t contain empty-string urls.)
  _internal: {
    __legacyMediaItemArray: EMPTY_ARR as unknown as MediaItem[],

  },
} as const;

export type MediaType = typeof MEDIA;

