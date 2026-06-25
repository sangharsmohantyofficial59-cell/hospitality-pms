import { HotelConfig } from "./configTypes";

export const hotelConfig: HotelConfig = {
  info: {
    id: "Test Paradise Resort ",
    name: "Test Paradise Resort ",
    type: "Luxury Coastal Resort",
    tagline: "Puri’s Prime Coastal Luxury Sanctuary",
    shortDescription: "A premium coastal haven on Golden Puri Beach, inspired by Lord Jagannath’s heritage, local handloom, and Odisha’s mystical marine treasures.",
    longDescription: "Niladri Shore is not merely a hotel; it is an immersive tribute. Crafted under the supervision of local Odia artists, our interiors utilize warm temple gold palettes, famous Pipili chandua hand-stitched craft patterns, and exquisite coastal timber accents. Unravel spiritual bliss and shoreline silence in a secure, high-luxury boutique resort.",
    logo: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=100&q=80",
    favicon: "favicon.ico",
    themeColors: {
      primary: "amber-500",
      secondary: "slate-950",
      accent: "cyan-400"
    }
  },
  hero: {
    title: "Where the Majestic Ocean Meets the Golden Sacred Soul",
    subtitle: "Experience Niladri Shore Resort—a premium coastal haven on Golden Puri Beach. Inspired by Lord Jagannath’s heritage, local handloom, and Odisha’s mystical marine treasures.",
    ctaText: "Configure Spiritual Getaway",
    images: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=90"
    ]
  },
  gallery: [
    {
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
      category: "Beach",
      caption: "Beach Sunrise Yoga"
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      category: "Beach",
      caption: "Blue Flag Beach Sands"
    },
    {
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
      category: "Suite",
      caption: "Oceanfront Suite Jacuzzi"
    },
    {
      url: "https://images.unsplash.com/photo-1621259182978-f09e5e2cd0ca?auto=format&fit=crop&w=600&q=80",
      category: "Exterior",
      caption: "Temple Gopuram Heritage"
    },
    {
      url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
      category: "Suite",
      caption: "Handloomed Silk Suite Setup"
    },
    {
      url: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80",
      category: "Excursion",
      caption: "Chilika Cruise Yachts"
    },
    {
      url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
      category: "Dining",
      caption: "Authentic Seafood Platters"
    },
    {
      url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80",
      category: "Lobby",
      caption: "Sand Art Workshops"
    }
  ],
  rooms: [
    {
      id: "std",
      name: "Niladri Cozy Sanctuary",
      description: "Centrally air-conditioned cozy sanctuary perfect for solo pilgrims, spiritual seekers, or solo travelers. Offers elegant local handloom drapery, a dynamic work desk, and side views of Puri town.",
      basePrice: 2200,
      occupancy: 1,
      roomSize: "280 sq. ft.",
      bedType: "Queen Size",
      roomView: "Puri Town & Side Garden View",
      features: ["Centrally Air Conditioned", "High-speed Wi-Fi", "Odia Handloom Drapery", "Spiritual Puja Guidebook"],
      images: [
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
      ],
      featured: false
    },
    {
      id: "deluxe",
      name: "Chakra Golden Sands Deluxe",
      description: "Spacious air-conditioned deluxe chambers featuring majestic ocean breezes, customized golden-sand decor, premium ivory cotton bedding, and private step-out balconies overlooking the beach.",
      basePrice: 3800,
      occupancy: 2,
      roomSize: "420 sq. ft.",
      bedType: "King Size",
      roomView: "Puri Golden Beach & Sunrise View",
      features: ["Private Balcony", "Premium Ivory Bedding", "Daily Puri Mahaprasad Offering", "Rain Shower Bathroom"],
      images: [
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
      ],
      featured: true
    },
    {
      id: "exec",
      name: "Jagannath Temple Heritage Family",
      description: "Designed for families on a spiritual vacation, incorporating traditional Odia handloom decor, majestic double workspaces, twin supreme beds, and dedicated private temple service assistance.",
      basePrice: 5500,
      occupancy: 3,
      roomSize: "550 sq. ft.",
      bedType: "Twin Supreme Beds",
      roomView: "Temple Towers & Side Beach View",
      features: ["Temple Service Assistant on call", "Traditional Handloom Interiors", "VIP Jagannath Darshan Help", "Complimentary Seafood Breakfast"],
      images: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
      ],
      featured: true
    },
    {
      id: "suite",
      name: "Mahodadhi Sea-Facing Royal Suite",
      description: "The crown jewel of Puri luxury. Features boundless private panoramic balconies, high-contrast gold fixtures, a hand-crafted chariot wheel wheel mockup, an infinity jacuzzi, and private chef dining.",
      basePrice: 12500,
      occupancy: 4,
      roomSize: "850 sq. ft.",
      bedType: "Royal Chariot Emperor Bed",
      roomView: "Boundless 180° Panoramic Ocean View",
      features: ["Private Infinity Jacuzzi", "Dedicated 24/7 Royal Butler", "Hand-crafted Chariot Wheel Mockup", "Separate Spiritual Altar"],
      images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
      ],
      featured: true
    }
  ],
  amenities: [
    {
      name: "Blue Flag Private Sands",
      icon: "Waves",
      description: "Steps away from safe, certified, pristine golden sands with dedicated lifeguards and sunbeds."
    },
    {
      name: "Divine Temple Seva Help",
      icon: "Sparkles",
      description: "On-site help for Puri Jagannath Temple darshan protocols, traditional attire, and Mahaprasad bookings."
    },
    {
      name: "Royal Wellness Spa",
      icon: "Heart",
      description: "Indulge in authentic Ayurvedic body massages and wellness sessions with customized herbal oils."
    },
    {
      name: "High-Speed Wi-Fi",
      icon: "Wifi",
      description: "Seamless high-fidelity fiber connection running 24/7 across suites, lounge, and beach frontage."
    },
    {
      name: "Mahodadhi Fine Dining",
      icon: "Utensils",
      description: "Enjoy Chilika Lake silver pomfret fish curries, ginger mud crabs, and sacred vegetarian specialties."
    },
    {
      name: "Spiritual Library",
      icon: "BookOpen",
      description: "A peaceful sanctuary housing ancient scriptures, local histories of Odisha, and sacred journals."
    }
  ],
  dining: [
    {
      restaurantName: "Mahodadhi Spice",
      cuisine: "Authentic Seafood & Local Odia Thali",
      timings: "7:00 AM - 11:00 PM",
      description: "Savor local clay-pot cooked vegetarian delicacies and enjoy premium hand-spiced silver pomfret fish curries, ginger mud crabs, and smoked prawns harvested fresh from Chilika Lake.",
      images: [
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"
      ]
    }
  ],
  activities: [
    {
      name: "Beach Sand Art Masterclass",
      description: "Puri is the cradle of international sand sculpture. Join our resort’s exclusive weekend beach workshops taught by national award-winning artisans of Odisha.",
      images: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      name: "Dolphin Watching Coastal Cruise",
      description: "Embark on a private yacht cruise in Satapada bay. Experience the serene biodiversity of Chilika lagoon, spotting wild Irrawaddy dolphins breaching in their natural home.",
      images: [
        "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      name: "Raghurajpur Heritage & Pattachitra Art Tour",
      description: "Explore the nearby ancient craft village. Witness families drawing divine sagas on dried palm leaves and treated silk cloth, and listen to the soulful rhythms of classical Gotipua singers.",
      images: [
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
      ]
    }
  ],
  banquet: [
    {
      hallName: "Niladri Durbar Hall",
      capacity: 300,
      facilities: ["Premium AC Lounge", "Standard Projection & Screens", "Custom Catering Packages", "Stereo Speaker & Wireless Mics"],
      images: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
      ]
    }
  ],
  attractions: [
    {
      name: "Shree Jagannath Temple",
      distance: "1.8 km",
      description: "The 12th-century sacred temple housing Lord Jagannath, Balabhadra, and Devi Subhadra. A monument of deep spiritual devotion, architectural excellence, and the famous Mahaprasad legacy.",
      images: [
        "https://images.unsplash.com/photo-1621259182978-f09e5e2cd0ca?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      name: "Golden Puri Beach & Surf",
      distance: "0 km (Direct Private Resort Frontage)",
      description: "Globally recognized with the prestigious 'Blue Flag' certification for its safety, pristine water, and cleanliness. Known for majestic sky-painting sunrises and soft gold sands.",
      images: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      name: "Konark Sun Temple (Black Pagoda)",
      distance: "31 km via Marine Drive",
      description: "A monumental 13th-century stone temple shaped as a giant cosmic chariot of the Sun God Surya, complete with 24 beautifully carved solar wheels that track time perfectly.",
      images: [
        "https://images.unsplash.com/photo-1581019163814-3d622ab1d290?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      name: "Chilika Lake (Satapada Sanctuary)",
      distance: "45 km",
      description: "Asia's largest brackish water lagoon, home to rare Irrawaddy dolphins and millions of migrating birds. It offers tranquil nature sailing and unique island dining.",
      images: [
        "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80"
      ]
    }
  ],
  contact: {
    phone: "+91 94370 22011",
    email: "contact@niladrishoreresort.com",
    website: "www.niladrishoreresort.com",
    address: "Golden Puri Beachfront, Marine Drive Road, Puri, Odisha - 752002, India"
  },
  social: {
    facebook: "https://facebook.com/niladrishoreresort",
    instagram: "https://instagram.com/niladrishoreresort",
    youtube: "https://youtube.com/niladrishoreresort",
    whatsapp: "+919437022011"
  },
  maps: {
    coordinates: {
      lat: 19.8049,
      lng: 85.8178
    },
    url: "https://maps.google.com/?q=Puri+Beach+Odisha"
  },
  policies: {
    checkInTime: "12:00 PM",
    checkOutTime: "11:00 AM",
    cancellation: "Cancel up to 24 hours prior to check-in for a full 100% refund.",
    child: "Children below 6 years can stay complimentary on room-only plan using existing bedding.",
    pet: "Pets are not allowed inside the main resort rooms or public restaurant zones to maintain hygiene standards.",
    additionalRules: [
      "Traditional clothing is recommended for temple darshan excursions.",
      "Footwear, mobile phones, and leather items are strictly barred inside the Jagannath Temple premises."
    ]
  },
  seo: {
    pageTitle: "Test Paradise Resort | Luxury Beachfront Puri Hotel",
    metaDescription: "Book your premium coastal stay at Test Paradise Resort on Golden Puri Beach. Indulge in private sea-facing suites, authentic local cuisine, and sacred temple assistance.",
    keywords: ["Test Paradise Resort", "Puri luxury resort", "Puri beach resort", "luxury hotel Puri", "Golden Beach Puri hotel", "best resort in Puri", "sea facing suites Puri"],
    canonicalUrl: "https://www.niladrishoreresort.com",
    ogImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
  },
  highlights: [
    {
      title: "Blue Flag Private Sands",
      description: "Direct resort frontage with pristine sands and professional lifeguard supervision.",
      icon: "Waves"
    },
    {
      title: "Divine Temple Seva Assist",
      description: "Complete hassle-free coordination for sacred darshan, local guides, and temple Mahaprasad.",
      icon: "Sparkles"
    },
    {
      title: "Ayurvedic Spa & Healing",
      description: "Rejuvenate your soul with authentic Ayurvedic herbal oil treatments and massage rituals.",
      icon: "Heart"
    }
  ],
  testimonials: [
    {
      guestName: "Prashant Mohanty",
      location: "Delhi, India",
      rating: 5,
      review: "Truly a majestic hotel. Niladri Shore simplified our Shree Jagannath Temple visit completely. The staff arranged VIP darshan cards, guided us on traditional dress protocols, and delivered fresh hot Prasad directly at our bedside. Amazing!",
      image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=100&q=80"
    },
    {
      guestName: "Dr. Arundhati Nayak",
      location: "London, UK",
      rating: 5,
      review: "The Mahodadhi Royal Suite was breathtaking! Waking up to the golden sunrise over our private pool-deck was deeply peaceful. Plus, our kids enjoyed the weekend sand-sculpting lesson held on the private beach sands.",
      image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=100&q=80"
    },
    {
      guestName: "Siddharth Sen",
      location: "Bangalore, India",
      rating: 5,
      review: "Outstanding coastal hospitality! The Odia handloom silk drapery and traditional wood carvings on the suite ceilings are highly decorative. The seafood tour was the best highlight—the Chilika mud-crab dish is a masterpiece!",
      image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=100&q=80"
    }
  ],
  faqs: [
    {
      question: "What are the standard Check-In and Check-Out timings?",
      answer: "Our standard check-in time is 12:00 PM and check-out is 11:00 AM. Early check-in or late check-out is subject to room availability and minor charges."
    },
    {
      question: "Do you assist with VIP temple visits in Puri?",
      answer: "Yes, our Royal Butler Concierge helps coordinate temple entry guides, traditional clothing options, safe locker facilities, and fresh bedside Mahaprasad orders."
    },
    {
      question: "Are airport/railway transfers available?",
      answer: "Absolutely. We offer customized pick-up/drop-off transport services from Bhubaneswar Airport (BBI) and Puri Railway Station (PUI) which can be added directly during booking."
    },
    {
      question: "Is the beach fronting the resort clean and safe?",
      answer: "Yes, Niladri Shore is situated on Golden Puri Beach which has received the global Blue Flag certification for safety, hygiene, and pristine environmental standards."
    }
  ],
  cta: {
    primaryButtonText: "Configure Spiritual Getaway",
    secondaryButtonText: "View Sea-Facing Suites",
    whatsappNumber: "+919437022011"
  },
  mediaLibrary: [
    {
      id: "beach_sunrise",
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=90",
      category: "Beach",
      altText: "Prisinte beach sunrise at Puri"
    },
    {
      id: "golden_beach",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      category: "Beach",
      altText: "Puri Golden Beach Sand frontage"
    }
  ],
  booking: {
    enableOnlineBooking: true,
    enableWhatsappBooking: true,
    enableDirectCallBooking: true,
    defaultWhatsappNumber: "+919437022011"
  },
  guestPortalFeatures: {
    enableSpa: true,
    enableTours: true,
    enableTransport: true,
    enableDiningReservations: true,
    enableConferenceBookings: true,
    enableRoomUpgradeOffers: true
  },
  guestQuickActions: [
    {
      id: "towels",
      title: "Request Extra Towels",
      icon: "FileText",
      description: "Plush organic cotton towels delivered to your room",
      category: "service"
    },
    {
      id: "water",
      title: "Order Water Bottles",
      icon: "Coffee",
      description: "Chilled pure mineral water bottles",
      category: "service"
    },
    {
      id: "upgrade",
      title: "Explore Room Upgrades",
      icon: "Sparkles",
      description: "Secure premium suite room upgrades dynamically",
      category: "revenue"
    },
    {
      id: "spa",
      title: "Book Ayurvedic Spa",
      icon: "Activity",
      description: "Traditional healing and full-body massages",
      category: "revenue"
    },
    {
      id: "tours",
      title: "Book Local Sightseeing",
      icon: "MapPin",
      description: "Excursions to Jagannath Temple or Chilika Lake",
      category: "revenue"
    },
    {
      id: "pickup",
      title: "Airport/Station Shuttle",
      icon: "Clock",
      description: "Schedule reliable AC transfers dynamically",
      category: "revenue"
    }
  ],
  destinationExplorer: {
    localityName: "Puri",
    attractions: [
      {
        name: "Shree Jagannath Temple",
        category: "Temples",
        heroImage: "https://images.unsplash.com/photo-1621259182978-f09e5e2cd0ca?auto=format&fit=crop&w=800&q=80",
        shortDescription: "The famous 12th-century holy shrine of Lord Jagannath, featuring profound spiritual rituals, monumental architectural carvings, and the world's largest heritage kitchen.",
        distance: "1.8 km",
        travelTime: "10 mins",
        mapsUrl: "https://maps.google.com/?q=Shree+Jagannath+Temple+Puri",
        bestTime: "5:00 AM - 8:00 AM (Morning Aarati) or late evening",
        entryFee: "Free",
        openingHours: "5:30 AM - 10:00 PM",
        transportAvailable: true,
        featuredBadge: "Spiritual Core"
      },
      {
        name: "Golden Beach & Promenade",
        category: "Beaches",
        heroImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        shortDescription: "A prestigious 'Blue Flag' certified beach praised globally for its safety, water quality, and cleanliness. Known for majestic sky-painting sunrises and local seashell markets.",
        distance: "0 km (Direct Frontage)",
        travelTime: "Immediate",
        mapsUrl: "https://maps.google.com/?q=Golden+Beach+Puri",
        bestTime: "6:00 AM - 8:00 AM (Sunrise) or Sunset walking",
        entryFee: "Free",
        openingHours: "24 Hours",
        transportAvailable: false,
        featuredBadge: "Resort Frontage"
      },
      {
        name: "Konark Sun Temple (Black Pagoda)",
        category: "Historical Sites",
        heroImage: "https://images.unsplash.com/photo-1581019163814-3d622ab1d290?auto=format&fit=crop&w=800&q=80",
        shortDescription: "A magnificent 13th-century stone temple shaped like a giant cosmic chariot of the Sun God Surya, featuring 24 intricately carved stone wheels that track solar hours perfectly.",
        distance: "31 km via Marine Drive",
        travelTime: "45 mins",
        mapsUrl: "https://maps.google.com/?q=Konark+Sun+Temple",
        bestTime: "October to March (Early afternoon for golden photogenic views)",
        entryFee: "Rs. 40 (Indians), Rs. 600 (Foreigners)",
        openingHours: "6:00 AM - 8:00 PM",
        transportAvailable: true,
        featuredBadge: "UNESCO Heritage"
      },
      {
        name: "Raghurajpur Heritage Craft Village",
        category: "Cultural Experiences",
        heroImage: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
        shortDescription: "An ancient craft village where every family creates masterpieces. Home to Pattachitra dry palm-leaf canvas paintings, papier-mâché masks, and traditional Gotipua dances.",
        distance: "12 km",
        travelTime: "25 mins",
        mapsUrl: "https://maps.google.com/?q=Raghurajpur+Heritage+Village",
        bestTime: "9:00 AM - 12:00 PM or 3:00 PM - 5:00 PM",
        entryFee: "Free Admission",
        openingHours: "9:00 AM - 6:00 PM",
        transportAvailable: true,
        featuredBadge: "Art & Heritage"
      },
      {
        name: "Chilika Lake (Satapada Sanctuary)",
        category: "Lakes",
        heroImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
        shortDescription: "Asia's largest brackish water lagoon, hosting rare wild Irrawaddy dolphins and millions of colorful migrating winter birds. Perfect for private scenic boat tours.",
        distance: "45 km",
        travelTime: "1 hour 15 mins",
        mapsUrl: "https://maps.google.com/?q=Satapada+Chilika+Lake",
        bestTime: "November to February (Morning cruise)",
        entryFee: "Free Entry (Boat rides vary)",
        openingHours: "6:00 AM - 5:00 PM",
        transportAvailable: true,
        featuredBadge: "Wildlife Eco-Tour"
      }
    ]
  }
};
