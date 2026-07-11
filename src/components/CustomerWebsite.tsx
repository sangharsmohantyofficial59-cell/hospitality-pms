
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { RoomType, Room, Booking, BookingSource, BookingStatus, PaymentStatus } from "../types";
import RoomCard from "./booking/RoomCard";
import type { MultiRoomSelection } from "../utils/booking";
import { calcNights as calcNightsFn } from "../utils/booking";



import {
  Coffee,
  Wifi,
  Tv,
  Thermometer,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Check,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CreditCard,
  Compass,
  Waves,
  Sun,
  Anchor,
  Heart,
  Utensils,
  BookOpen,
  Users,
  HelpCircle,
  Calendar,
  Building,
  Briefcase,
  Car,
  Clock,
  ExternalLink
} from "lucide-react";
import { hotelConfig } from "../config/hotelConfig";
import { MEDIA } from "../config/hotel/media";



// Dynamic Icon Mapping
const ICON_MAP: { [key: string]: React.ComponentType<any> } = {
  Waves: Waves,
  Sparkles: Sparkles,
  Heart: Heart,
  Wifi: Wifi,
  Utensils: Utensils,
  BookOpen: BookOpen,
  Coffee: Coffee,
  Tv: Tv,
  Thermometer: Thermometer,
  ShieldCheck: ShieldCheck,
  Phone: Phone,
  Mail: Mail,
  MapPin: MapPin,
  Compass: Compass,
  Sun: Sun,
  Anchor: Anchor,
  Users: Users,
  HelpCircle: HelpCircle,
  Calendar: Calendar,
  Building: Building,
  Briefcase: Briefcase,
  Car: Car
};

function getIconComponent(name: string) {
  return ICON_MAP[name] || Sparkles;
}

interface CustomerWebsiteProps {
  roomTypes: RoomType[];
  rooms: Room[];
  bookings: Booking[];
  currentTab: string;
  setTab: (tab: string) => void;
  onNewBooking: (formData: any) => Promise<any>;
}

export default function CustomerWebsite({
  roomTypes,
  rooms,
  bookings,
  currentTab,
  setTab,
  onNewBooking
}: CustomerWebsiteProps) {
  console.log("CustomerWebsite roomTypes", roomTypes);
  
  // Search parameters for Booking Engine
  const [checkIn, setCheckIn] = useState<string>("2026-06-21");
  const [checkOut, setCheckOut] = useState<string>("2026-06-23");
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");

  // -------- Media helpers (build-safe with empty arrays) --------
  const getRoomMediaImages = (roomTypeId: string): string[] => {
    // Map roomType ids -> MEDIA.roomImages keys
    const map: Record<string, keyof typeof MEDIA.roomImages> = {
      deluxe: "deluxe",
      premium_sea_view: "premium",
      executive_suite: "executive",
      family_room: "familySuite",
      presidential_suite: "presidentialSuite",
    };
    const key = map[roomTypeId];
    if (!key) return [];
    return MEDIA.roomImages[key] ?? [];
  };


  // Multi-room booking UI state (front-end only, payload structure unchanged)
  const [multiRoomSelections, setMultiRoomSelections] = useState<MultiRoomSelection[]>([
    {
      id: `rm_${Date.now()}`,
      roomTypeId: "",
      roomId: undefined,
      adults: 2,
      children: 0,
      rate: 0,
    },
  ]);


  // Ensure room type/rate is in sync when roomTypes update (front-end only)
  useEffect(() => {
    setMultiRoomSelections((prev) =>
      prev.length
        ? prev.map((s) => {
            const rt = roomTypes.find((r) => r.id === s.roomTypeId) || roomTypes[0];
            if (!rt) return s;
            return { ...s, roomTypeId: rt.id, rate: rt.basePrice };
          })
        : prev
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomTypes]);



  
  // Available categories result
  const [availabilityResults, setAvailabilityResults] = useState<{ [key: string]: number }>({});
  const [isCheckingDates, setIsCheckingDates] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Booking details form
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  // Payment UI states
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutBookingPayload, setCheckoutBookingPayload] = useState<any>(null);
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentSelection, setPaymentSelection] = useState<"Full" | "Advance">("Full");

  // Step-by-Step Booking Wizard state
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedBookingType, setSelectedBookingType] = useState<"Room Booking" | "Conference Hall Booking" | "Corporate Booking" | "Group Booking">("Room Booking");

  // Step 2 specific fields:
  // Conference Hall Booking
  const [evtName, setEvtName] = useState("");
  const [evtDate, setEvDate] = useState("");
  const [evtTimeSlot, setEvtTimeSlot] = useState("Morning Slot (9:00 AM - 1:00 PM)");
  const [expectedAttendees, setExpectedAttendees] = useState<number>(50);
  const [cateringPlan, setCateringPlan] = useState("None");
  const [avSetupPlan, setAvSetupPlan] = useState("None");

  // Corporate Booking
  const [corpCompanyName, setCorpCompanyName] = useState("");
  const [corpGstNumber, setCorpGstNumber] = useState("");
  const [corpContactPerson, setCorpContactPerson] = useState("");
  const [corpEmployeeCount, setCorpEmployeeCount] = useState<number>(10);

  // Group Booking
  const [groupName, setGroupName] = useState("");
  const [groupTourLeader, setGroupTourLeader] = useState("");
  const [groupNumGuests, setGroupNumGuests] = useState<number>(15);
  const [groupNumRooms, setGroupNumRooms] = useState<number>(5);

  // FAQ Accordion State
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // New visual states for Redesign
  const [activeGalleryImage, setActiveGalleryImage] = useState<string | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  // Destination Explorer States
  const [selectedLocalityCategory, setSelectedLocalityCategory] = useState<string>("All");
  const [selectedAttractionForTransport, setSelectedAttractionForTransport] = useState<any | null>(null);
  const [destTransportSubmitted, setDestTransportSubmitted] = useState<boolean>(false);
  const [destTransportDate, setDestTransportDate] = useState("");
  const [destTransportTime, setDestTransportTime] = useState("");
  const [destTransportRoomNo, setDestTransportRoomNo] = useState("");
  const [destTransportPassengers, setDestTransportPassengers] = useState("2");

  // Step 3 specific fields (Transport Add-On)
  const [requireTransport, setRequireTransport] = useState<boolean>(false);
  const [transportPickup, setTransportPickup] = useState("");
  const [transportDrop, setTransportDrop] = useState("");
  const [transportDate, setTransportDate] = useState("");
  const [transportTime, setTransportTime] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<"Auto" | "Sedan" | "SUV" | "Innova" | "Tempo Traveller" | "Mini Bus" | "Bus" | "">("Sedan");

  // Auto set initial default dates to tomorrow/day-after-tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);

    const pad = (n: number) => n.toString().padStart(2, "0");
    const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    setCheckIn(formatDate(tomorrow));
    setCheckOut(formatDate(dayAfter));
  }, []);

  // SEO Metadata Update
  useEffect(() => {
    if (hotelConfig?.seo) {
      document.title = hotelConfig.seo.pageTitle;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', hotelConfig.seo.metaDescription);

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', hotelConfig.seo.keywords.join(", "));
    }
  }, []);

  // Recalculate room counts available per room type for selected dates
  const handleCheckAvailability = (e?: React.FormEvent) => {

    if (e) e.preventDefault();
    setIsCheckingDates(true);
    setErrorMessage("");

    // Simulate search delay
    setTimeout(() => {
      const results: { [key: string]: number } = {};

      roomTypes.forEach(type => {
        // Find total rooms of this type
        const totalRoomsOfCategory = rooms.filter(r => r.roomTypeId === type.id);

        // Find which rooms are booked during selected dates
        const bookedRoomIds = bookings
          .filter(b => {
            if (b.status === BookingStatus.CANCELLED) return false;
            // Overlapping date check: CheckInA < CheckOutB AND CheckInB < CheckOutA
            return checkIn < b.checkOutDate && b.checkInDate < checkOut;
          })
          .map(b => b.roomId)
          .filter(Boolean);

        // Available rooms = rooms of this type not in bookedRoomIds
        const availableRooms = totalRoomsOfCategory.filter(r => !bookedRoomIds.includes(r.id));
        results[type.id] = availableRooms.length;
      });

      setAvailabilityResults(results);
      setIsCheckingDates(false);
      setShowResults(true);
    }, 600);
  };

  // Trigger from "Rooms" Tab or homepage featured room
  const initiateBookingForCategory = (typeId: string) => {
    setSelectedRoomTypeId(typeId);
    setSelectedBookingType("Room Booking");
    setWizardStep(2); // Jump straight to Step 2 since room is chosen
    setTab("booking");
    handleCheckAvailability();
  };

  // Calculating pricing
  const getSelectedType = () => roomTypes.find(t => t.id === (selectedRoomTypeId || roomTypes[0].id));
  const getSelectedBasePrice = () => getSelectedType()?.basePrice || 2200;



  const calcNights = () => calcNightsFn(checkIn, checkOut);



  // New Wizard-based comprehensive cost calculation helper
  const calculateGuestWizardCosts = () => {
    let baseCharge = 0;
    let transportCost = 0;
    let cateringCost = 0;
    let avCost = 0;
    let discountAmount = 0;
    let description = "";

    const nights = calcNights();

    if (selectedBookingType === "Room Booking") {
      const rt = roomTypes.find(t => t.id === (selectedRoomTypeId || roomTypes[0]?.id));
      const roomBase = rt?.basePrice || 2200;
      baseCharge = roomBase * nights;
      description = `Suite accommodation: ${rt?.name || "Luxury Suite"} (${nights} Nights)`;
    } 
    else if (selectedBookingType === "Conference Hall Booking") {
      baseCharge = 15000; // Base Hall Rent per day
      description = `Conference Hall Reservation Rent`;
      
      if (cateringPlan === "High Tea & Snacks Plan (₹180/head)") {
        cateringCost = expectedAttendees * 180;
      } else if (cateringPlan === "Exclusive Lunch Buffet (₹450/head)") {
        cateringCost = expectedAttendees * 450;
      }
      
      if (avSetupPlan === "Standard Projections & Screens (₹1,500)") {
        avCost = 1500;
      } else if (avSetupPlan === "Full Stereo Speaker & Dual Wireless Mics (₹3,500)") {
        avCost = 3500;
      }
    } 
    else if (selectedBookingType === "Corporate Booking") {
      const rt = roomTypes.find(t => t.id === (selectedRoomTypeId || roomTypes[0]?.id));
      const roomBase = rt?.basePrice || 2200;
      baseCharge = roomBase * nights;
      // 15% custom Corporate contract rebate
      discountAmount = Math.round(baseCharge * 0.15);
      description = `Corporate Suite: ${rt?.name || "Luxury Suite"} with 15% Preferred Rebate`;
    } 
    else if (selectedBookingType === "Group Booking") {
      const rt = roomTypes.find(t => t.id === (selectedRoomTypeId || roomTypes[0]?.id));
      const roomBase = rt?.basePrice || 2200;
      baseCharge = roomBase * nights * groupNumRooms;
      description = `Group block stay: ${groupNumRooms}x ${rt?.name || "Luxury Suites"} (${nights} Nights)`;
    }

    // Transport cost calculation
    if (requireTransport && selectedVehicle) {
      const vehicleCosts: { [key: string]: number } = {
        "Auto": 300,
        "Sedan": 1000,
        "SUV": 1800,
        "Innova": 2500,
        "Tempo Traveller": 4500,
        "Mini Bus": 8000,
        "Bus": 12000
      };
      transportCost = vehicleCosts[selectedVehicle] || 0;
    }

    const subtotal = baseCharge + cateringCost + avCost + transportCost - discountAmount;
    const taxes = Math.round(subtotal * 0.12);
    const total = subtotal + taxes;

    return {
      baseCharge,
      cateringCost,
      avCost,
      transportCost,
      discountAmount,
      subtotal,
      taxes,
      total,
      description
    };
  };

  // Compile booking notes summarizing details
  const getCompiledWizardNotes = () => {
    let summary = "";
    if (selectedBookingType === "Room Booking") {
      summary = `[ROOM RESERVATION]\nSpecial Requests: ${specialNotes}`;
    } else if (selectedBookingType === "Conference Hall Booking") {
      summary = `[CONFERENCE HALL RESERVATION]\nEvent Name: ${evtName}\nTime Slot: ${evtTimeSlot}\nCatering Required: ${cateringPlan}\nAV Needed: ${avSetupPlan}\nRemarks: ${specialNotes}`;
    } else if (selectedBookingType === "Corporate Booking") {
      summary = `[CORPORATE RESERVATION]\nCompany: ${corpCompanyName}\nGST: ${corpGstNumber}\nContact: ${corpContactPerson}\nEmployees: ${corpEmployeeCount}\nRemarks: ${specialNotes}`;
    } else if (selectedBookingType === "Group Booking") {
      summary = `[GROUP BLOCK RESERVATION]\nGroup Name: ${groupName}\nLeader: ${groupTourLeader}\nRooms Blocked: ${groupNumRooms}\nGuests: ${groupNumGuests}\nRemarks: ${specialNotes}`;
    }

    if (requireTransport) {
      summary += `\n\n[TRANSPORT INCLUDED]\nVehicle: ${selectedVehicle}\nPickup: ${transportPickup}\nDrop: ${transportDrop}\nSchedule Date/Time: ${transportDate} at ${transportTime}`;
    }
    return summary;
  };

  // Compile subtotal breakdown as custom service lines to sync to PMS / admin view
  const getCompiledCustomServiceLines = () => {
    const lines = [];
    const costs = calculateGuestWizardCosts();
    
    if (selectedBookingType === "Conference Hall Booking") {
      lines.push({
        id: `GUEST-HALL-${Date.now()}`,
        description: `Conference Hall Booking: ${evtName}`,
        amount: costs.baseCharge
      });
      if (costs.cateringCost > 0) {
        lines.push({
          id: `GUEST-CAT-${Date.now()}`,
          description: `Catering Package: ${cateringPlan}`,
          amount: costs.cateringCost
        });
      }
      if (costs.avCost > 0) {
        lines.push({
          id: `GUEST-AV-${Date.now()}`,
          description: `Audio/Visual Setup: ${avSetupPlan}`,
          amount: costs.avCost
        });
      }
    }

    if (requireTransport && selectedVehicle) {
      lines.push({
        id: `GUEST-TR-${Date.now()}`,
        description: `Transportation Transfer Service (${selectedVehicle})`,
        amount: costs.transportCost
      });
    }

    return lines;
  };

  // Trigger simulated payment
  const handleProceedToPayment = () => {
    const billingName = selectedBookingType === "Corporate Booking" ? corpContactPerson : (selectedBookingType === "Group Booking" ? groupTourLeader : guestName);
    
    if (!billingName || !guestEmail || !guestPhone) {
      setErrorMessage("Please input your name, email, and mobile phone number.");
      return;
    }
    setErrorMessage("");

    const totalCost = calculateGuestWizardCosts().total;
    const isAdvance = paymentSelection === "Advance";
    const advAmount = isAdvance ? Math.round(totalCost / 2) : totalCost;
    const pendBalance = isAdvance ? totalCost - advAmount : 0;

    // Package the booking data for execution
    const firstRoom = multiRoomSelections[0];
    const legacyRoomTypeId = firstRoom?.roomTypeId || selectedRoomTypeId || roomTypes[0].id;
    const legacyRoomId = firstRoom?.roomId ?? null;
    const legacyNumberOfGuests = selectedBookingType === "Conference Hall Booking"
      ? expectedAttendees
      : (selectedBookingType === "Group Booking" ? groupNumGuests : (firstRoom?.adults ?? guestsCount));

    const bookingRooms = (multiRoomSelections || []).map(r => ({
      roomTypeId: r.roomTypeId,
      roomId: r.roomId ?? undefined,
      adults: r.adults,
      children: r.children,
      rate: r.rate,
    }));

    const bookingPayload = {
      guestName: billingName,
      guestEmail,
      guestPhone,
      // Legacy compatibility fields (backend still uses these)
      roomTypeId: legacyRoomTypeId,
      roomId: legacyRoomId,
      checkInDate: selectedBookingType === "Conference Hall Booking" ? evtDate : checkIn,
      checkOutDate: selectedBookingType === "Conference Hall Booking" ? evtDate : checkOut,
      numberOfGuests: legacyNumberOfGuests,
      totalPrice: totalCost,
      source: BookingSource.WEBSITE,
      notes: getCompiledWizardNotes(),
      paymentMethod: "Razorpay",
      paymentStatus: PaymentStatus.PAID,
      bookingType: selectedBookingType,
      customServiceLines: getCompiledCustomServiceLines(),
      discountAmount: calculateGuestWizardCosts().discountAmount,
      paymentOption: paymentSelection,
      advancePaid: advAmount,
      pendingBalance: pendBalance,
      // New multi-room payload (architecture-only; not persisted yet)
      bookingRooms,
      transport: requireTransport ? {
        vehicleType: selectedVehicle,
        pickupAddress: transportPickup,
        dropAddress: transportDrop,
        scheduleTime: `${transportDate} ${transportTime}`,
        status: "Pending" as const,
        cost: calculateGuestWizardCosts().transportCost
      } : undefined
    };

    setCheckoutBookingPayload(bookingPayload);
    setIsRazorpayOpen(true);
  };

  // Payment confirmation completion
  const submitBookingPayment = async () => {

    setIsPaying(true);
    try {
      const transactionId = `pay_rzp_${Date.now().toString().slice(-6)}`;
      const finalPayload = {
        ...checkoutBookingPayload,
        transactionId
      };

      const result = await onNewBooking(finalPayload);
      if (result.success) {
        setBookingConfirmation({
          bookingId: result.booking.id,
          guestName: result.guest.name,
          roomType: result.booking.bookingType === "Conference Hall Booking" ? "Conference banquet Hall" : (roomTypes.find(r => r.id === result.booking.roomTypeId)?.name || "Classic Room"),
          totalPrice: result.booking.totalPrice,
          paymentOption: result.booking.paymentOption,
          advancePaid: result.booking.advancePaid,
          pendingBalance: result.booking.pendingBalance,
          transactionId,
          checkIn: result.booking.checkInDate,
          checkOut: result.booking.checkOutDate
        });
        
        // Advance wizard to Step 5 (Submit / Confirmed step)
        setWizardStep(5);

        // Reset booking form values
        setGuestName("");
        setGuestEmail("");
        setGuestPhone("");
        setSpecialNotes("");
        setEvtName("");
        setEvDate("");
        setCorpCompanyName("");
        setCorpGstNumber("");
        setCorpContactPerson("");
        setGroupName("");
        setGroupTourLeader("");
        setRequireTransport(false);
        setTransportPickup("");
        setTransportDrop("");
        setShowResults(false);
      } else {
        // HTTP 409: Room type sold out during confirmation (backend source of truth)
        if (result?.status === 409 || result?.error?.toLowerCase().includes("no rooms of this type")) {
          setErrorMessage(
            "⚠ Room Type Sold Out\nNo rooms of the selected type are available for the selected dates.\nPlease choose another room type or different dates."
          );
          return;
        }
        setErrorMessage(result.error || "Could not book. Check values.");
      }
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 409) {
        setErrorMessage(
          "⚠ Room Type Sold Out\nNo rooms of the selected type are available for the selected dates.\nPlease choose another room type or different dates."
        );
      } else {
        setErrorMessage("Network error processing payment checkouts.");
      }
    } finally {
      setIsPaying(false);
      setIsRazorpayOpen(false);
    }
  };

  // Configuration-driven Attractions, Experiences, and Travel Tips
  const NEARBY_ATTRACTIONS = hotelConfig.attractions.map((att) => ({
    title: att.name,
    category: "Scenic Highlight",
    distance: att.distance,
    time: "Resort Tours Available",
    description: att.description,
    tips: hotelConfig.policies.additionalRules.join(" ") || "Please consult our help desk.",
    image: att.images?.[0] || ""
  }));

  const LOCAL_EXPERIENCES = hotelConfig.activities.map((act) => ({
    title: act.name,
    badge: "Special Activity",
    description: act.description,
    image: act.images?.[0] || ""
  }));


  const TRAVEL_TIPS = hotelConfig.faqs.map((f) => ({
    title: f.question,
    info: f.answer
  }));

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 transition-colors">
      
      {/* 1. HOME TAB */}
      {currentTab === "home" && (
        <div id="customer-home-tab">
          
          {/* HERO SECTION */}
          <div className="relative bg-slate-950 overflow-hidden min-h-[700px] lg:min-h-[820px] flex items-center">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
              <img
                src={hotelConfig.hero.images[0]}
                alt={hotelConfig.info.name}
                className="w-full h-full object-cover opacity-50 scale-100 transition-transform duration-1000 ease-out"
                referrerPolicy="no-referrer"
              />
              {/* Grand Luxury Hotel Dark-Slate & Sand Gold Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent"></div>
            </div>

            {/* Sacred Jagannath Chakra Motif Graphic - Subtle Aesthetic Overlay */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 hidden xl:block z-10 pointer-events-none">
              <div className="w-[600px] h-[600px] rounded-full border-12 border-amber-400 border-dashed flex items-center justify-center p-16">
                <div className="w-full h-full rounded-full border-4 border-amber-400 flex items-center justify-center relative">
                  <div className="absolute w-full h-[2px] bg-amber-400 rotate-0"></div>
                  <div className="absolute w-full h-[2px] bg-amber-400 rotate-30"></div>
                  <div className="absolute w-full h-[2px] bg-amber-400 rotate-60"></div>
                  <div className="absolute w-full h-[2px] bg-amber-400 rotate-90"></div>
                  <div className="absolute w-full h-[2px] bg-amber-400 rotate-120"></div>
                  <div className="absolute w-full h-[2px] bg-amber-400 rotate-150"></div>
                  <div className="w-32 h-32 rounded-full bg-slate-950 border-8 border-amber-400 flex items-center justify-center">
                    <span className="text-amber-400 font-bold font-mono text-center text-xs">{hotelConfig.info.name.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-left">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-405 text-xs font-mono font-semibold tracking-widest uppercase mb-8 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> 
                <span>{hotelConfig.info.tagline}</span>
              </div>
              
              {/* Hotel Name */}
              <p className="font-serif font-light text-xl tracking-widest text-amber-450 dark:text-amber-400 uppercase mb-3">
                {hotelConfig.info.name}
              </p>
              
              {/* Grand Title */}
              <h1 className="font-serif font-normal text-5xl sm:text-6xl lg:text-7xl tracking-wide leading-tight max-w-4xl text-white">
                {hotelConfig.hero.title}
              </h1>
              
              {/* Subtitle */}
              <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed font-light">
                {hotelConfig.hero.subtitle}
              </p>

              {/* Highlights Block */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-3xl">
                {hotelConfig.highlights.map((highlight, index) => {
                  const IconComp = getIconComponent(highlight.icon);
                  return (
                    <div key={index} className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm hover:border-amber-500/30 transition-all">
                      <div className="p-1.5 bg-amber-500/10 rounded-lg">
                        <IconComp className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      </div>
                      <span className="text-sm font-semibold tracking-wide text-slate-200">{highlight.title}</span>
                    </div>
                  );
                })}
              </div>

              {/* CTA Row */}
              <div className="mt-12 flex flex-wrap gap-5">
                <button
                  onClick={() => {
                    setSelectedRoomTypeId(roomTypes[0]?.id || "");
                    setTab("booking");
                  }}
                  className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white dark:text-slate-950 dark:bg-amber-400 dark:hover:bg-amber-500 font-bold text-sm tracking-widest uppercase rounded-lg transition-all shadow-xl hover:shadow-amber-500/10 hover:scale-102 duration-300 cursor-pointer"
                >
                  Book Your Stay
                </button>

                <button
                  onClick={() => setTab("rooms")}
                  className="px-8 py-4 bg-transparent border-2 border-slate-300 hover:border-amber-400 text-white hover:text-amber-400 font-semibold text-sm tracking-widest uppercase rounded-lg transition-all duration-300 cursor-pointer"
                >
                  Explore Rooms
                </button>
              </div>
            </div>
          </div>

          {/* QUICK CHECK AVAILABILITY BAR */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800 p-5 sm:p-6 backdrop-blur-md">
              <div className="text-center mb-4 flex items-center justify-center gap-2">
                <Compass className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Select Check-In Dates & Plan Your Puri Pilgrimage
                </span>
              </div>
              <form onSubmit={handleCheckAvailability} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Check-In</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-600 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Check-Out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-600 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Accompaniment</label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-850 dark:text-slate-100 focus:outline-none focus:border-amber-600 bg-slate-50 dark:bg-slate-950 font-medium"
                  >
                    <option value={1}>1 Pilgrim / Traveler</option>
                    <option value={2}>2 Guests / Family</option>
                    <option value={3}>3 Guests / Family</option>
                    <option value={4}>4 Guests / Family</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-650 text-slate-950 font-bold rounded-lg text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Waves className="w-4 h-4 text-slate-950" /> Verify Live Rates
                </button>
              </form>
            </div>
          </div>

          {/* HERITAGE BRAND STORY */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <span className="font-mono text-xs tracking-wider text-amber-605 dark:text-amber-400 uppercase font-bold">
              {hotelConfig.info.type}
            </span>
            <h2 className="text-3xl font-extrabold font-sans text-slate-900 dark:text-white mt-2 max-w-2xl mx-auto tracking-tight">
              {hotelConfig.info.tagline}
            </h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mt-4 mb-6"></div>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-3xl mx-auto leading-relaxed">
              {hotelConfig.info.longDescription}
            </p>
          </section>

          {/* FEATURED SUITES SECTION */}
          <div className="bg-slate-100 dark:bg-slate-900/60 border-y border-slate-200/40 dark:border-slate-800/40 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12">
                <div>
                  <span className="font-mono text-xs tracking-wider text-amber-600 dark:text-amber-400 uppercase font-bold">Oceanfront Sanctuary</span>
                  <h2 className="text-3xl font-bold font-sans text-slate-900 dark:text-white mt-2">Puri Heritage Suite Collections</h2>
                </div>
                <button
                  onClick={() => setTab("rooms")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors cursor-pointer mt-3 md:mt-0"
                >
                  View Ocean Suite Plans <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {roomTypes.map((room) => (
                  <div key={room.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/55 dark:border-slate-800 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="h-52 relative overflow-hidden">
                      <img 
                        src={room.imageUrl} 
                        alt={room.name} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 right-3 bg-slate-950/75 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono rounded-lg border border-amber-450/40 font-bold text-amber-400">
                        ₹{room.basePrice}/Night
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-sans font-bold text-base text-slate-800 dark:text-slate-100">{room.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed flex-grow">{room.description}</p>
                      
                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400 dark:text-slate-500">Max Capacity: <strong className="text-slate-650 dark:text-slate-350 font-semibold">{room.maxGuests} Adults</strong></span>
                        <button
                          onClick={() => initiateBookingForCategory(room.id)}
                          className="px-4 py-1.5 bg-amber-500 text-slate-900 rounded-md text-xs hover:bg-amber-600 hover:text-white transition-all font-bold cursor-pointer"
                        >
                          Reserve Suite
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NEARBY ATTRACTIONS */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="font-mono text-xs tracking-wider text-amber-600 dark:text-amber-400 uppercase font-bold">Unveil the Wonders</span>
              <h2 className="text-3xl font-bold font-sans text-slate-900 dark:text-white mt-2">Puri Sacred & Scenic Wonders</h2>
              <div className="w-12 h-1 bg-amber-500 mx-auto mt-3"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {NEARBY_ATTRACTIONS.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-205 dark:border-slate-800 flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-full sm:w-5/12 h-56 sm:h-auto relative">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-3 left-3 px-2 py-1 bg-slate-950/80 backdrop-blur-xs text-[10px] font-mono text-amber-400 font-bold rounded uppercase">
                      {item.category}
                    </span>
                  </div>
                  <div className="w-full sm:w-7/12 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-slate-50">{item.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-amber-655 dark:text-amber-400 font-mono font-bold mt-1.5 uppercase">
                        <MapPin className="w-3.5 h-3.5 inline" /> {item.distance} • {item.time}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-3.5 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-dashed border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
                      <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">PRO-TIP:</span>
                      {item.tips}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LOCAL EXPERIENCES */}
          <div className="bg-slate-950 text-white py-20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-color-dodge">
              <div className="absolute top-1/4 left-1/10 w-96 h-96 rounded-full bg-amber-500 filter blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-xl mx-auto mb-16">
                <span className="font-mono text-xs tracking-wider text-amber-400 uppercase font-bold">Curated Adventures</span>
                <h2 className="text-3xl font-bold font-sans text-white mt-2">Bespoke Local Journeys in Odisha</h2>
                <div className="w-12 h-1 bg-amber-500 mx-auto mt-3"></div>
                <p className="text-slate-400 text-xs mt-4">We connect you beyond general tourism. Our staff leads, hosts, and preserves custom excursions tailored to cultural enthusiasts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {LOCAL_EXPERIENCES.map((exp, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-amber-400/30 transition-all flex flex-col h-full group">
                    <div className="h-44 relative overflow-hidden">
                      <img 
                        src={exp.image} 
                        alt={exp.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" 
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-mono text-[9px] uppercase font-bold py-0.5 px-2 rounded-full">
                        {exp.badge}
                      </span>
                    </div>
                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div>
                        <h4 className="font-bold font-sans text-base text-white tracking-tight">{exp.title}</h4>
                        <p className="text-slate-400 text-xs mt-3 leading-relaxed">{exp.description}</p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-slate-800/60">
                        <button
                          onClick={() => {
                            alert(`Our Royal Butler Concierge is ready to arrange: ${exp.title}. It can be bundled directly with your room booking!`);
                          }}
                          className="text-amber-450 hover:text-amber-400 text-[11px] font-bold font-mono tracking-wider flex items-center gap-1 group-hover:underline"
                        >
                          REQUEST DETAIL CONCIERGE <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GALLERY SECTION */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="font-mono text-xs tracking-wider text-amber-600 dark:text-amber-400 uppercase font-bold">Visual Splendor</span>
              <h2 className="text-3xl font-bold font-sans text-slate-900 dark:text-white mt-2">{hotelConfig.info.name} Gallery</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">Glimpses of {hotelConfig.info.name} accommodations, services, and local attractions.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {hotelConfig.gallery.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden h-48 md:h-60 border border-slate-200/50 dark:border-slate-800 shadow-sm">
                  <img 
                    src={img.url} 
                    alt={img.caption} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white text-xs font-semibold tracking-wide font-sans">{img.caption}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SPONSOR / BOOKING ESCAPES BANNER */}
          <section className="bg-amber-500 text-slate-950 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider bg-white/30 px-3 py-1 rounded-full">
                  Spiritual Escape Packages
                </span>
                <h3 className="text-3xl font-bold font-sans mt-4 max-w-md tracking-tight">
                  Promote your family peace or spiritual journey
                </h3>
                <p className="text-slate-900 text-sm mt-3 leading-relaxed">
                  Enjoy custom itineraries combined with verified local experiences, divine chariot darshan seats, and direct sea-view double sun decks at Niladri Shore. Perfect for family temple vacations and seaside tranquility.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  onClick={() => {
                    initiateBookingForCategory("suite");
                  }}
                  className="px-6 py-3 bg-slate-950 text-white hover:bg-slate-900 font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md"
                >
                  Book Mahodadhi Royal Suite
                </button>
                <button
                  onClick={() => setTab("explore")}
                  className="px-6 py-3 bg-white text-slate-950 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
                >
                  Explore Puri Guide
                </button>
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="font-mono text-xs tracking-wider text-amber-600 dark:text-amber-400 uppercase font-bold">True Guest Accounts</span>
              <h2 className="text-3xl font-bold font-sans text-slate-900 dark:text-white mt-2 animate-fade-in">Treasured by Families & Spiritual Seekers</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hotelConfig.testimonials.map((t, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-201 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed italic">"{t.review}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-extrabold border border-amber-200/50 dark:border-amber-900/30 rounded-full flex items-center justify-center text-xs">
                      {t.guestName.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.guestName}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. EXPLORE PURI GUIDE TAB */}
      {currentTab === "explore" && (
        <div id="customer-explore-tab" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-mono text-xs tracking-wider text-amber-605 dark:text-amber-400 uppercase font-bold">
              Local Destination Compendium
            </span>
            <h1 className="text-3.5xl font-extrabold text-slate-900 dark:text-white mt-2 font-sans tracking-tight">
              Puri Travel Companion & Guide
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed">
              Plan your travel perfectly. Below are curated routes, direct ocean distances from Niladri Shore, and helpful traditional customs to assist your tour planning.
            </p>
          </div>

          {/* Quick Route Guide Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-205 dark:border-slate-800 shadow-md overflow-hidden mb-12">
            <div className="bg-slate-950 text-white p-5 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-sm tracking-tight">Resort Proximity Chart</h3>
                <p className="text-[10px] text-slate-400 font-mono font-bold">DIRECT DISTANCE FROM NILADRI SHORE BEACHFRONT</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-850 font-mono text-[10px] uppercase font-bold">
                    <th className="p-4">Destination</th>
                    <th className="p-4">Distance</th>
                    <th className="p-4 font-normal">Method of Commute</th>
                    <th className="p-4">Est. Commute Duration</th>
                    <th className="p-4 text-right">Access Assistance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-50">Shree Jagannath Temple Entrance</td>
                    <td className="p-4 font-mono font-bold text-amber-600 dark:text-amber-400">1.8 km</td>
                    <td className="p-4">Resort Luxury Shuttle / Auto</td>
                    <td className="p-4">8 - 10 Minutes</td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-405 font-mono text-[10px] font-bold border border-amber-250/20">
                        VIP darshan cards
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-50">Konark Sun Temple Pagoda</td>
                    <td className="p-4 font-mono font-bold text-amber-600 dark:text-amber-400">31 km</td>
                    <td className="p-4">Scenic Marine Drive Car Hire</td>
                    <td className="p-4">35 - 40 Minutes</td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 font-mono text-[10px] font-bold border border-sky-200/20">
                        Guide Included Tour
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-50">Chilika Lake Satapada Jetty</td>
                    <td className="p-4 font-mono font-bold text-amber-600 dark:text-amber-400">45 km</td>
                    <td className="p-4">Resort AC Day Cab</td>
                    <td className="p-4">55 Minutes</td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-200/20">
                        Dolphin Yacht Tour
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-50">Raghurajpur Heritage Craft Village</td>
                    <td className="p-4 font-mono font-bold text-amber-600 dark:text-amber-400">14 km</td>
                    <td className="p-4">Local Auto / Day Taxi</td>
                    <td className="p-4">20 Minutes</td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-405 font-mono text-[10px] font-bold border border-amber-250/20">
                        Palm Art Lessons
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-50">Puri Railway Station (PUI)</td>
                    <td className="p-4 font-mono font-bold text-amber-600 dark:text-amber-400">2.5 km</td>
                    <td className="p-4">Complimentary Pick & Drop Auto</td>
                    <td className="p-4">12 Minutes</td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-mono text-[10px] font-bold border border-slate-200/25">
                        Free Pick-up Only
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-50">Bhubaneswar International Airport (BBI)</td>
                    <td className="p-4 font-mono font-bold text-amber-600 dark:text-amber-400">60 km</td>
                    <td className="p-4">Resort Airport AC Sedan Transfer</td>
                    <td className="p-4">1 Hour 15 Mins</td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-amber-550/10 text-amber-700 dark:text-amber-450 font-mono text-[10px] font-bold border border-amber-300/10">
                        Paid AC Sedan Pick
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Interactive FAQ Accordion Component */}
            <div id="faq-accordion-container" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6">
              <h3 className="font-sans font-extrabold text-base text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <span>Frequently Asked Questions & Travel Tips</span>
              </h3>
              <div className="flex flex-col gap-3">
                {hotelConfig.faqs.map((faq, idx) => {
                  const isExpanded = expandedFaqIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                        isExpanded 
                          ? "border-amber-500/30 bg-amber-50/5 dark:bg-amber-950/5" 
                          : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-transparent"
                      }`}
                    >
                      <button
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left transition-colors font-sans focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl cursor-pointer"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex gap-3 items-center">
                          <span className={`w-6 h-6 rounded-full font-mono text-xs font-bold flex items-center justify-center transition-colors ${
                            isExpanded 
                              ? "bg-amber-500 text-slate-950" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={`text-xs font-bold transition-colors ${
                            isExpanded ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-slate-200"
                          }`}>
                            {faq.question}
                          </span>
                        </div>
                        <ChevronDown 
                          className={`w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0 ml-2 ${
                            isExpanded ? "transform rotate-180 text-amber-500" : ""
                          }`} 
                        />
                      </button>
                      
                      <div 
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isExpanded 
                            ? "max-h-40 opacity-100 border-t border-amber-500/10" 
                            : "max-h-0 opacity-0 pointer-events-none"
                        }`}
                      >
                        <p className="p-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-900/50">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Travel Guide Video/Imagery Promo Map Mockup */}
            <div className="bg-slate-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between h-full relative overflow-hidden self-stretch border border-slate-800 shadow-lg">
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <img 
                  src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80" 
                  alt="Background Sunrise Map" 
                  className="w-full h-full object-cover scale-150 filter blur-xs" 
                />
              </div>
              <div className="relative z-10">
                <span className="font-mono text-[9px] uppercase font-bold tracking-wider text-amber-405 text-amber-400 bg-white/10 px-2 py-0.5 rounded">
                  Explore Odisha Tourism Portal
                </span>
                <h4 className="text-xl font-bold font-sans mt-4 max-w-sm">Curated Seaside Temple Vacation packages</h4>
                <p className="text-slate-350 text-xs leading-relaxed mt-3">
                  Puri is the holy soul of eastern India. We recommend coordinating with our booking staff to pre-book specialized day tours. We provide AC sedans, highly knowledgeable bilingual Odia/English travel guides, secure drinking water, and custom sand art demonstrations on Golden Beach.
                </p>

                <div className="mt-8 flex flex-col gap-3 text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Private AC Sedan Darshan Cars</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Authorized Temple Pujari accompaniment</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Complete Seafood lunch on Chilika lagoon</div>
                </div>
              </div>

              <div className="mt-10 self-baseline relative z-10">
                <button
                  onClick={() => {
                    setSelectedRoomTypeId("suite");
                    setTab("booking");
                  }}
                  className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded font-mono hover:bg-amber-600 hover:text-white transition-all cursor-pointer"
                >
                  Configure Luxury Stay + Tour Packages
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ROOMS TAB */}
      {currentTab === "rooms" && (
        <div id="customer-rooms-tab" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-10 text-center">
            <span className="font-mono text-xs tracking-wider text-amber-600 dark:text-amber-400 uppercase font-bold">Resort Portfolios</span>
            <h1 className="text-3.5xl font-extrabold font-sans text-slate-900 dark:text-white mt-1 tracking-tight">Available Oceanfront Room Tiers</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mt-2">Choose the perfect tier that suits your family pilgrimage or deep coastal peace vacation. All rooms offer temple and ocean-inspired gold detailing.</p>
          </div>

          <div className="flex flex-col gap-10">
            {roomTypes.map((room, idx) => (
              <div
                key={room.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-805 shadow-sm flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow ${
                  idx % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="w-full md:w-5/12 h-64 md:h-96 relative">
                  <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {/* Total count of rooms badge */}
                  <span className="absolute top-4 left-4 bg-slate-950/90 border border-amber-400/20 text-white px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider">
                    Tier Inventory: {rooms.filter(cr => cr.roomTypeId === room.id).length} rooms
                  </span>
                </div>

                <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h2 className="text-2.5xl font-sans font-bold text-slate-900 dark:text-white leading-tight">{room.name}</h2>
                        <span className="inline-block mt-1 font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-705 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                          Odisha Tourism Classic Certification
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2.5xl font-black text-amber-600 dark:text-amber-450 font-mono">₹{room.basePrice}</span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase">Plus 12% Hotel Tax</p>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-4 leading-relaxed">{room.description}</p>

                    <div className="mt-6">
                      <h4 className="text-[10px] font-mono font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Exclusive Suite Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((am, amIdx) => (
                          <span key={amIdx} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs rounded-lg border border-slate-200/50 dark:border-slate-800">
                            <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" /> {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap justify-between items-center gap-4">
                    <div className="text-xs text-slate-550 dark:text-slate-400 font-mono">
                      Maximum occupancy capacity: <strong className="text-slate-700 dark:text-slate-200">{room.maxGuests} Adults</strong>
                    </div>
                    <button
                      onClick={() => initiateBookingForCategory(room.id)}
                      className="px-6 py-2.5 bg-amber-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-amber-600 hover:text-white transition-all shadow-md cursor-pointer"
                    >
                      Check Availability & Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. BOOKING TAB */}
      {currentTab === "booking" && (
        <div id="customer-booking-tab" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8 text-center max-w-xl mx-auto">
            <span className="font-mono text-xs tracking-wider text-amber-605 dark:text-amber-400 uppercase font-bold">Resort Experience Wizard</span>
            <h1 className="text-3.5xl font-extrabold font-sans text-slate-900 dark:text-white tracking-tight mt-1">Reserve Your Experience</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed">Customize your luxury beachfront sanctuary, business convention, or local block. Follow our step-by-step booking pipeline.</p>
          </div>

          {/* Progress Wizard Header Bar */}
          <div className="max-w-3xl mx-auto mb-10 px-4">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => wizardStep > 1 && wizardStep < 5 && setWizardStep(1)}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-sans border-2 transition-all ${wizardStep === 1 ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20' : (wizardStep > 1 ? 'bg-emerald-550 text-white bg-emerald-600 border-emerald-600' : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-400')}`}>
                  {wizardStep > 1 ? "✓" : "1"}
                </div>
                <span className={wizardStep === 1 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}>Type</span>
              </div>
              <div className={`flex-1 h-[2px] transition-all -mt-5 mx-2 ${wizardStep >= 2 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => wizardStep > 2 && wizardStep < 5 && setWizardStep(2)}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-sans border-2 transition-all ${wizardStep === 2 ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20' : (wizardStep > 2 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-805 text-slate-400')}`}>
                  {wizardStep > 2 ? "✓" : "2"}
                </div>
                <span className={wizardStep === 2 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}>Details</span>
              </div>
              <div className={`flex-1 h-[2px] transition-all -mt-5 mx-2 ${wizardStep >= 3 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => wizardStep > 3 && wizardStep < 5 && setWizardStep(3)}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-sans border-2 transition-all ${wizardStep === 3 ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20' : (wizardStep > 3 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-400')}`}>
                  {wizardStep > 3 ? "✓" : "3"}
                </div>
                <span className={wizardStep === 3 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}>Transport</span>
              </div>
              <div className={`flex-1 h-[2px] transition-all -mt-5 mx-2 ${wizardStep >= 4 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>

              {/* Step 4 */}
              <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => wizardStep > 4 && wizardStep < 5 && setWizardStep(4)}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-sans border-2 transition-all ${wizardStep === 4 ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20' : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-400'}`}>
                  4
                </div>
                <span className={wizardStep === 4 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}>Review</span>
              </div>
              <div className={`flex-1 h-[2px] transition-all -mt-5 mx-2 ${wizardStep >= 5 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>

              {/* Step 5 */}
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-sans border-2 transition-all ${wizardStep === 5 ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-400'}`}>
                  5
                </div>
                <span className={wizardStep === 5 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'}>Confirm</span>
              </div>
            </div>
          </div>

          {/* error box */}
          {errorMessage && (
            <div className="max-w-3xl mx-auto mb-6 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/10 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: SELECT RESERVATION TYPE */}
          {wizardStep === 1 && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">Select Reservation Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Room Booking */}
                <div 
                  onClick={() => {
                    setSelectedBookingType("Room Booking");
                    setWizardStep(2);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer text-left flex gap-4 ${selectedBookingType === "Room Booking" ? 'bg-amber-500/5 dark:bg-amber-900/10 border-amber-500 shadow-md' : 'bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-800 border-slate-200 dark:border-slate-850'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Room Booking</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Enjoy our premium sea-facing heritage luxury suites, high speed wifi, and direct Blue Flag beachfront frontage access.</p>
                  </div>
                </div>

                {/* 2. Conference Hall Booking */}
                <div 
                  onClick={() => {
                    setSelectedBookingType("Conference Hall Booking");
                    setWizardStep(2);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer text-left flex gap-4 ${selectedBookingType === "Conference Hall Booking" ? 'bg-amber-500/5 dark:bg-amber-900/10 border-amber-500 shadow-md' : 'bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-800 border-slate-200 dark:border-slate-850'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Conference Banquet Hall</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Host board meetings, conventions, high-end family banquets, or state leadership seminars with premium catering & audio/visual help.</p>
                  </div>
                </div>

                {/* 3. Corporate Booking */}
                <div 
                  onClick={() => {
                    setSelectedBookingType("Corporate Booking");
                    setWizardStep(2);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer text-left flex gap-4 ${selectedBookingType === "Corporate Booking" ? 'bg-amber-500/5 dark:bg-amber-900/10 border-amber-500 shadow-md' : 'bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-801 border-slate-200 dark:border-slate-850'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Corporate Booking</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Discounted corporate contract plans, high-fidelity accommodations, unified Billing, and hassle-free GST invoices.</p>
                  </div>
                </div>

                {/* 4. Group Booking */}
                <div 
                  onClick={() => {
                    setSelectedBookingType("Group Booking");
                    setWizardStep(2);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer text-left flex gap-4 ${selectedBookingType === "Group Booking" ? 'bg-amber-500/5 dark:bg-amber-900/10 border-amber-500 shadow-md' : 'bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-800 border-slate-200 dark:border-slate-850'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Group Booking</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Block accommodations for pilgrim tours, marriage parties, spiritual retreats, and customized tourist guides.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 hover:text-white rounded-lg text-xs transition-shadow flex items-center gap-1 cursor-pointer shadow"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DYNAMIC FORM FIELD BASED ON SELECTED RESERVATION TYPE */}
          {wizardStep === 2 && (
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800">Step 2</span>
                <span>Configure {selectedBookingType} details</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 border-b border-slate-100 dark:border-slate-850 pb-3">Complete the form below. Contact parameters are verified for check-in verification.</p>

              <div className="flex flex-col gap-6">
                
                {/* 2A: ROOM BOOKING SPECIFIC FORM */}
                {selectedBookingType === "Room Booking" && (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Check-In</label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => {
                            setCheckIn(e.target.value);
                            setShowResults(false);
                          }}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Check-Out</label>
                        <input
                          type="date"
                          value={checkOut}
                          disabled={!checkIn}
                          onChange={(e) => {
                            setCheckOut(e.target.value);
                            setShowResults(false);
                          }}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Multi-room cards */}
                    <div className="flex flex-col gap-3">
                      {multiRoomSelections.map((selection, idx) => {
                        const rt = roomTypes.find(r => r.id === selection.roomTypeId);
                        return (
                          <RoomCard
                            selection={selection}

                            roomType={rt}
                            roomTypes={roomTypes}
                            cardIndex={idx}
                            disableRemove={multiRoomSelections.length <= 1}
                            onChangeAdults={(adults) => {
                              setMultiRoomSelections((prev) =>
                                prev.map((s) => (s.id === selection.id ? { ...s, adults } : s))
                              );
                            }}
                            onChangeChildren={(children) => {
                              setMultiRoomSelections((prev) =>
                                prev.map((s) => (s.id === selection.id ? { ...s, children } : s))
                              );
                            }}
                            onChangeRoomTypeId={(roomTypeId) => {
                              const rtForId = roomTypes.find((r) => r.id === roomTypeId);
                              setMultiRoomSelections((prev) =>
                                prev.map((s) =>
                                  s.id === selection.id
                                    ? {
                                        ...s,
                                        roomTypeId,
                                        rate: rtForId?.basePrice ?? s.rate,
                                      }
                                    : s
                                )
                              );
                            }}
                            onRemove={() => {
                              setMultiRoomSelections((prev) => prev.filter((s) => s.id !== selection.id));
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Add Room button */}
                    <div className="flex justify-start">
                      <button
                        type="button"
                        onClick={() => {
                          const firstRoomType = roomTypes[0];
                          if (!firstRoomType) return;

                          setMultiRoomSelections(prev => [
                            ...prev,
                            {
                              id: `rm_${Date.now()}`,
                              roomTypeId: firstRoomType.id,
                              roomId: undefined,
                              adults: 2,
                              children: 0,
                            rate: firstRoomType.basePrice,
                            },
                          ]);
                        }}
                        className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 hover:text-white rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        + Add Room
                      </button>
                    </div>
                  </div>
                )}


                {/* 2B: CONFERENCE HALL BOOKING SPECIFIC FORM */}
                {selectedBookingType === "Conference Hall Booking" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Event Name / Occasion</label>
                      <input
                        type="text"
                        required
                        value={evtName}
                        onChange={(e) => setEvtName(e.target.value)}
                        placeholder="Odia Tech Leadership Round 2026"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Event Date</label>
                      <input
                        type="date"
                        required
                        value={evtDate}
                        onChange={(e) => setEvDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Time Slot preference</label>
                      <select
                        value={evtTimeSlot}
                        onChange={(e) => setEvtTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      >
                        <option value="Morning Slot (9:00 AM - 1:00 PM)">Morning Slot (9:00 AM - 1:00 PM)</option>
                        <option value="Evening Slot (2:00 PM - 6:00 PM)">Evening Slot (2:00 PM - 6:00 PM)</option>
                        <option value="Full Day Event (9:00 AM - 10:00 PM)">Full Day Event (9:00 AM - 10:00 PM)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Expected Attendees Count</label>
                      <input
                        type="number"
                        min={10}
                        max={300}
                        required
                        value={expectedAttendees}
                        onChange={(e) => setExpectedAttendees(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Catering Services</label>
                      <select
                        value={cateringPlan}
                        onChange={(e) => setCateringPlan(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
                      >
                        <option value="None">None (Hall Rent Only)</option>
                        <option value="High Tea & Snacks Plan (₹180/head)">High Tea & Snacks (₹180/head)</option>
                        <option value="Exclusive Lunch Buffet (₹450/head)">Exclusive Lunch Buffet (₹450/head)</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Audio/Visual Setup Required</label>
                      <select
                        value={avSetupPlan}
                        onChange={(e) => setAvSetupPlan(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
                      >
                        <option value="None">No (Client arranges themselves)</option>
                        <option value="Standard Projections & Screens (₹1,500)">Standard Projection & Screens (₹1,500)</option>
                        <option value="Full Stereo Speaker & Dual Wireless Mics (₹3,500)">Full Stereo & Wireless Mics (₹3,500)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 2C: CORPORATE BOOKING SPECIFIC FORM */}
                {selectedBookingType === "Corporate Booking" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Company Name</label>
                      <input
                        type="text"
                        required
                        value={corpCompanyName}
                        onChange={(e) => setCorpCompanyName(e.target.value)}
                        placeholder="Odisha Minerals Dev Corp"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">GST Number</label>
                      <input
                        type="text"
                        required
                        value={corpGstNumber}
                        onChange={(e) => setCorpGstNumber(e.target.value)}
                        placeholder="21AAAAA1111A1Z1"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Contact Person / Lead Coordinator</label>
                      <input
                        type="text"
                        required
                        value={corpContactPerson}
                        onChange={(e) => setCorpContactPerson(e.target.value)}
                        placeholder="Sanjay Das (Admin HR)"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Employee Count</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={corpEmployeeCount}
                        onChange={(e) => setCorpEmployeeCount(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Stay Check-In</label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Stay Check-Out</label>
                      <input
                        type="date"
                        value={checkOut}
                        disabled={!checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Preferred Room Suite Tier</label>
                      <select
                        value={selectedRoomTypeId}
                        onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
                      >
                        {roomTypes.map(r => (
                          <option key={r.id} value={r.id}>{r.name} (Preferred corporate rate: ₹{Math.round(r.basePrice * 0.85)}/N)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 2D: GROUP BOOKING SPECIFIC FORM */}
                {selectedBookingType === "Group Booking" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Group / Family Name</label>
                      <input
                        type="text"
                        required
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Patnaik Family Pilgrim Block"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Tour Leader / Coordinator</label>
                      <input
                        type="text"
                        required
                        value={groupTourLeader}
                        onChange={(e) => setGroupTourLeader(e.target.value)}
                        placeholder="Devendra Patnaik"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Number of Guests</label>
                      <input
                        type="number"
                        min={4}
                        required
                        value={groupNumGuests}
                        onChange={(e) => setGroupNumGuests(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Number of Rooms Blocked</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={groupNumRooms}
                        onChange={(e) => setGroupNumRooms(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Check-In</label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Check-Out</label>
                      <input
                        type="date"
                        value={checkOut}
                        disabled={!checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Preferred Room Type</label>
                      <select
                        value={selectedRoomTypeId}
                        onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
                      >
                        {roomTypes.map(r => (
                          <option key={r.id} value={r.id}>{r.name} (from ₹{r.basePrice}/N)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

              {/* Lead Coordinator / Billing Profile Contact */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-amber-600 dark:text-amber-400">Primary Booking Contact</h4>
                <p className="text-[11px] text-slate-400 -mt-2 leading-relaxed">Provide email and mobile credentials to receive digital web check-in tokens and text confirmation.</p>
                
                {selectedBookingType !== "Corporate Booking" && selectedBookingType !== "Group Booking" && (
                  <div>
                    <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase mb-1">Lead Guest Full Name</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Bijay Mohapatra"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-805 dark:text-slate-100"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase mb-1 font-bold">Email Address</label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="coordinator@domain.com"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase mb-1 font-bold">Mobile Phone No</label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+91 94370 22011"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase mb-1 font-semibold">Special Requests (Optional)</label>
                  <textarea
                    rows={2}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Requesting specific room blocks, food preferences, senior assistance, early check-in, etc."
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 resize-none"
                  ></textarea>
                </div>
              </div>

              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center">

                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  ← Change Type
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Simple validation check before advancing
                    const activeName = selectedBookingType === "Corporate Booking" ? corpContactPerson : (selectedBookingType === "Group Booking" ? groupTourLeader : guestName);
                    if (!activeName || !guestEmail || !guestPhone) {
                      setErrorMessage("Please fill out complete Name, Email and Mobile credentials to continue.");
                      return;
                    }
                    if (selectedBookingType === "Conference Hall Booking" && (!evtName || !evtDate)) {
                      setErrorMessage("Please specify Event Name and Date.");
                      return;
                    }
                    if (selectedBookingType === "Corporate Booking" && (!corpCompanyName || !corpGstNumber)) {
                      setErrorMessage("Please specify Corporate Company Name and GST identification.");
                      return;
                    }
                    if (selectedBookingType === "Group Booking" && (!groupName || !groupTourLeader)) {
                      setErrorMessage("Please specify Group Name and Leader Name.");
                      return;
                    }
                    setErrorMessage("");
                    setWizardStep(3); // Advance
                  }}
                  className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 hover:text-white rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-md"
                >
                  Continue to Add-On <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TRANSPORT SERVICE ADD-ON SECTION */}
          {wizardStep === 3 && (
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800">Step 3</span>
                <span>Select Luxury Transport Transfers</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6 font-light">Choose optional airport / railway station pickup/drop shuttle services on call.</p>

              {/* Yes/No Choice Container */}
              <div className="bg-slate-550/10 bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border border-slate-201 dark:border-slate-800 text-center mb-6">
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100 font-mono text-[13px] uppercase tracking-wide">Do you require transportation services?</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">Our premium luxury resort fleet runs 24/7 matching train and flight schedules at Bhubaneswar (BBI) and Puri (PUI).</p>
                
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setRequireTransport(true);
                      // Set default date if empty
                      if (!transportDate) {
                        setTransportDate(checkIn || new Date().toISOString().split("T")[0]);
                      }
                      if (!transportTime) {
                        setTransportTime("12:00");
                      }
                    }}
                    className={`px-8 py-3 rounded-xl border-2 font-bold font-sans text-xs transition-all ${requireTransport ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    🚀 Yes, Add Transport
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRequireTransport(false);
                    }}
                    className={`px-8 py-3 rounded-xl border-2 font-bold font-sans text-xs transition-all ${!requireTransport ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-slate-900 dark:border-slate-100 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    No, I'll commute myself
                  </button>
                </div>
              </div>

              {/* Conditional transport params */}
              {requireTransport && (
                <div className="p-5 border border-amber-500/10 rounded-2xl bg-amber-500/5 dark:bg-amber-950/10 flex flex-col gap-5 animate-fade-in">
                  <h4 className="text-xs font-mono font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">Configure Vehicle Transfers</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase mb-1">Pickup Location / Address</label>
                      <input
                        type="text"
                        required
                        value={transportPickup}
                        onChange={(e) => setTransportPickup(e.target.value)}
                        placeholder="E.g., Puri Railway Station Platform-1 / Bhubaneswar Airport T1"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase mb-1">Drop Location / Address</label>
                      <input
                        type="text"
                        required
                        value={transportDrop}
                        onChange={(e) => setTransportDrop(e.target.value)}
                        placeholder="E.g., Niladri Shore Resort Front Desk Lobby"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase mb-1">Pickup Date</label>
                      <input
                        type="date"
                        required
                        value={transportDate}
                        onChange={(e) => setTransportDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase mb-1">Pickup Time</label>
                      <input
                        type="time"
                        required
                        value={transportTime}
                        onChange={(e) => setTransportTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Vehicle Chooser Grid with Prices */}
                  <div>
                    <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase mb-2">Select Vehicle Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { title: "Auto", desc: "Local TukTuk", cost: 305, rate: "₹300" },
                        { title: "Sedan", desc: "Dzire / Etios", cost: 1000, rate: "₹1,000" },
                        { title: "SUV", desc: "Ertiga / Creta", cost: 1800, rate: "₹1,800" },
                        { title: "Innova", desc: "Premium Crysta", cost: 2500, rate: "₹2,500" },
                        { title: "Tempo Traveller", desc: "12-Seater AC", cost: 4500, rate: "₹4,500" },
                        { title: "Mini Bus", desc: "26-Seater AC Coach", cost: 8000, rate: "₹8,000" },
                        { title: "Bus", desc: "45-Seater Luxury AC", cost: 12000, rate: "₹12,000" },
                      ].map((v) => (
                        <div
                          key={v.title}
                          onClick={() => setSelectedVehicle(v.title as any)}
                          className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${selectedVehicle === v.title ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-205 border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                        >
                          <Car className="w-5 h-5 mx-auto mb-1 opacity-80" />
                          <h5 className="font-bold text-xs tracking-tight">{v.title}</h5>
                          <span className={`text-[9px] block ${selectedVehicle === v.title ? 'text-slate-900 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>{v.desc}</span>
                          <span className="text-[10px] uppercase font-bold font-mono block mt-1.5">{v.rate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  ← Back to Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (requireTransport && (!transportPickup || !transportDrop)) {
                      setErrorMessage("Please type Pickup address and Dropoff addresses to proceed.");
                      return;
                    }
                    setErrorMessage("");
                    setWizardStep(4); // Advance to Review
                  }}
                  className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 hover:text-white rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow"
                >
                  Review Booking Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW RESERVATION */}
          {wizardStep === 4 && (
            <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
              
              {/* Left review block */}
              <div className="w-full lg:w-7/12 flex flex-col gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h3 className="font-sans font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                    <span className="text-amber-600">✓</span> Double Verification Profile
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-mono">RESERVATION TIER:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold text-sm uppercase">{selectedBookingType}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">BILLING COORDINATOR:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedBookingType === "Corporate Booking" ? corpContactPerson : (selectedBookingType === "Group Booking" ? groupTourLeader : guestName)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">EMAIL ADDRESS:</span>
                      <span className="text-slate-700 dark:text-slate-350">{guestEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">MOBILE CALLING:</span>
                      <span className="text-slate-705 dark:text-slate-350 font-mono font-bold">{guestPhone}</span>
                    </div>
                  </div>

                  {/* Booking Specific Summary Card */}
                  <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
                    <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Chosen Configuration Parameters</span>
                    
                    {selectedBookingType === "Room Booking" && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-slate-400">Selected Suite:</span> <strong className="text-slate-750 dark:text-white font-semibold">{getSelectedType()?.name}</strong></div>
                        <div><span className="text-slate-400">Total Nights:</span> <strong className="font-bold text-slate-700 dark:text-slate-200">{calcNights()} Night(s)</strong></div>
                        <div><span className="text-slate-400">Total Guests:</span> <strong className="text-slate-700 dark:text-slate-200 font-medium">{guestsCount} Adults</strong></div>
                        <div><span className="text-slate-400">Dates Stay:</span> <span className="font-mono text-amber-655 dark:text-amber-400 font-bold">{checkIn} to {checkOut}</span></div>
                      </div>
                    )}

                    {selectedBookingType === "Conference Hall Booking" && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="col-span-2"><span className="text-slate-400">Event Occasion:</span> <strong className="text-slate-750 dark:text-white font-bold">{evtName}</strong></div>
                        <div><span className="text-slate-400">Event Date:</span> <strong className="font-mono text-amber-600 dark:text-amber-400 font-bold">{evtDate}</strong></div>
                        <div><span className="text-slate-400">Time Slot:</span> <strong className="text-slate-700 dark:text-slate-200 font-semibold">{evtTimeSlot}</strong></div>
                        <div><span className="text-slate-400">Attendees:</span> <strong className="text-slate-705 dark:text-slate-200">{expectedAttendees} Guests</strong></div>
                        <div><span className="text-slate-400">Catering Package:</span> <strong className="text-slate-700 dark:text-slate-200 font-medium">{cateringPlan}</strong></div>
                        <div className="col-span-2"><span className="text-slate-400">Audio/Visual accessories:</span> <strong className="text-slate-650 dark:text-slate-350">{avSetupPlan}</strong></div>
                      </div>
                    )}

                    {selectedBookingType === "Corporate Booking" && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-slate-400">Corporate Company:</span> <strong className="text-slate-750 dark:text-white font-bold">{corpCompanyName}</strong></div>
                        <div><span className="text-slate-400">GST Registration:</span> <strong className="font-mono text-slate-700 dark:text-slate-205 font-bold uppercase">{corpGstNumber}</strong></div>
                        <div><span className="text-slate-400">Coordinator Admin:</span> <strong className="text-slate-705 dark:text-slate-200">{corpContactPerson}</strong></div>
                        <div><span className="text-slate-400">Employee Count:</span> <strong className="text-slate-700 dark:text-slate-200">{corpEmployeeCount} Staff</strong></div>
                        <div><span className="text-slate-400">Accomodation:</span> <strong className="text-slate-700 dark:text-slate-205 font-medium">{getSelectedType()?.name}</strong></div>
                        <div><span className="text-slate-404">Stay Duration:</span> <strong className="font-mono text-amber-600 dark:text-amber-400 font-bold">{checkIn} to {checkOut} ({calcNights()} Nights)</strong></div>
                      </div>
                    )}

                    {selectedBookingType === "Group Booking" && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-slate-400">Group Name:</span> <strong className="text-slate-755 dark:text-white font-bold">{groupName}</strong></div>
                        <div><span className="text-slate-400">Tour Leader:</span> <strong className="text-slate-705 dark:text-slate-200 font-semibold">{groupTourLeader}</strong></div>
                        <div><span className="text-slate-400">Total Block Rooms:</span> <strong className="text-slate-700 dark:text-slate-205">{groupNumRooms}x Room(s)</strong></div>
                        <div><span className="text-slate-400">Total Group Guests:</span> <strong className="text-slate-700 dark:text-slate-105">{groupNumGuests} Guests</strong></div>
                        <div><span className="text-slate-400">Accomodation Block:</span> <strong className="text-slate-700 dark:text-slate-200 font-medium">{getSelectedType()?.name}</strong></div>
                        <div><span className="text-slate-404">Duration:</span> <strong className="font-mono text-amber-611 dark:text-amber-400 font-bold">{checkIn} to {checkOut} ({calcNights()} Nights)</strong></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transportation Block */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h3 className="font-sans font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                    <Car className="w-5 h-5 text-amber-500 animate-pulse" />
                    <span>Selected Transport Options</span>
                  </h3>
                  {requireTransport ? (
                    <div className="grid grid-cols-2 gap-3 text-xs animate-fade-in">
                      <div><span className="text-slate-400 block font-mono">SELECTED VEHICLE:</span> <strong className="text-amber-600 dark:text-amber-400 text-sm font-bold uppercase">{selectedVehicle}</strong></div>
                      <div><span className="text-slate-400 block font-mono">PICKUP SHUTTLE COST:</span> <strong className="text-slate-805 dark:text-slate-105 font-bold">₹{calculateGuestWizardCosts().transportCost.toLocaleString()}</strong></div>
                      <div className="col-span-2"><span className="text-slate-400 block font-mono text-[10px]">PICKUP LOCATION ADDRESS:</span> <span className="text-slate-750 dark:text-white">{transportPickup}</span></div>
                      <div className="col-span-2"><span className="text-slate-400 block font-mono text-[10px]">DROP CORRIDOR TERMINAL:</span> <span className="text-slate-750 dark:text-white">{transportDrop}</span></div>
                      <div className="col-span-2"><span className="text-slate-404 block font-mono">SCHEDULE ARRIVAL WINDOW:</span> <span className="font-bold text-slate-800 dark:text-slate-205">{transportDate} at {transportTime} hrs</span></div>
                    </div>
                  ) : (
                  <div className="text-center py-4 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-500 dark:text-slate-400">
                      No transport transfers selected. You can arrange local cabs later at check-in.
                    </div>

                  )}
                </div>
              </div>

              {/* Right quote block */}
              <div className="w-full lg:w-5/12 sticky top-24">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-808 p-6 shadow-md text-left">
                  <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center gap-2">
                    <Waves className="w-4 h-4 text-amber-500" />
                    <span>Coastal Experience Invoice Quote</span>
                  </h3>

                  {/* Custom invoice itemized table */}
                  <div className="flex flex-col gap-3 font-mono text-xs text-slate-600 dark:text-slate-400 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                    
                    {/* Base Rent item */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-850 dark:text-slate-105 block font-sans">Base Resort Fee:</span>
                        <span className="text-[10px] text-slate-400">{calculateGuestWizardCosts().description}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-50 font-mono">₹{calculateGuestWizardCosts().baseCharge.toLocaleString()}</span>
                    </div>

                    {/* Catering charges line */}
                    {calculateGuestWizardCosts().cateringCost > 0 && (
                      <div className="flex justify-between items-start pt-1.5 border-t border-dotted border-slate-200/50 dark:border-slate-800">
                        <div>
                          <span className="font-bold text-slate-850 dark:text-slate-105 block font-sans">Convention Catering:</span>
                          <span className="text-[10px] text-slate-400">{cateringPlan}</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-slate-50 font-mono">₹{calculateGuestWizardCosts().cateringCost.toLocaleString()}</span>
                      </div>
                    )}

                    {/* AV Accessories line */}
                    {calculateGuestWizardCosts().avCost > 0 && (
                      <div className="flex justify-between items-start pt-1.5 border-t border-dotted border-slate-200/50 dark:border-slate-800">
                        <div>
                          <span className="font-bold text-slate-850 dark:text-slate-105 block font-sans">Audio / Visual Setup:</span>
                          <span className="text-[10px] text-slate-400">{avSetupPlan}</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-slate-50 font-mono">₹{calculateGuestWizardCosts().avCost.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Transport Line */}
                    {requireTransport && calculateGuestWizardCosts().transportCost > 0 && (
                      <div className="flex justify-between items-start pt-1.5 border-t border-dotted border-slate-200/50 dark:border-slate-800">
                        <div>
                          <span className="font-bold text-slate-850 dark:text-slate-105 block font-sans">Transport Transfers:</span>
                          <span className="text-[10px] text-slate-400">{selectedVehicle} Shuttle Add-On</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-slate-50 font-mono">₹{calculateGuestWizardCosts().transportCost.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Preferred Discount line */}
                    {calculateGuestWizardCosts().discountAmount > 0 && (
                      <div className="flex justify-between items-start text-emerald-600 dark:text-emerald-400">
                        <div>
                          <span className="font-bold block font-sans">Corporate Discount (15%):</span>
                        </div>
                        <span className="font-bold font-mono">-₹{calculateGuestWizardCosts().discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                  </div>

                  <div className="flex flex-col gap-2 font-mono text-[11px] text-slate-550 dark:text-slate-450 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <div className="flex justify-between"><span>Subtotal Invoice:</span><span>₹{calculateGuestWizardCosts().subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Odisha Luxury Tax (12%):</span><span>₹{calculateGuestWizardCosts().taxes.toLocaleString()}</span></div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-855 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-205 dark:border-slate-800 mb-5">
                    <span className="block text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">
                      💳 SELECT PAYMENT OPTION
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPaymentSelection("Full")}
                        className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          paymentSelection === "Full"
                            ? "bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-705"
                        }`}
                      >
                        <span className="text-[11px] font-bold">Pay Full Amount</span>
                        <span className="text-[12px] font-mono font-bold mt-1 text-slate-900 dark:text-white">
                          ₹{calculateGuestWizardCosts().total.toLocaleString()}
                        </span>
                    </button>

                    <button

                        type="button"
                        onClick={() => setPaymentSelection("Advance")}
                        className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          paymentSelection === "Advance"
                            ? "bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-705"
                        }`}
                      >
                        <span className="text-[11px] font-bold font-sans">Pay 50% Advance</span>
                        <span className="text-[12px] font-mono font-bold mt-1 text-slate-900 dark:text-white">
                          ₹{Math.round(calculateGuestWizardCosts().total / 2).toLocaleString()}
                        </span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-mono leading-normal">
                      {paymentSelection === "Advance" 
                        ? `🔒 Pay ₹${Math.round(calculateGuestWizardCosts().total / 2).toLocaleString()} now. Balance ₹${(calculateGuestWizardCosts().total - Math.round(calculateGuestWizardCosts().total / 2)).toLocaleString()} is due at check-in.`
                        : "✓ Pay entire outstanding amount securely now."
                      }
                    </p>
                  </div>

                  <div className="flex justify-between items-baseline mb-6">
                    <span className="font-sans font-extrabold text-[11px] text-slate-900 dark:text-white uppercase tracking-wider">
                      {paymentSelection === "Advance" ? "Deposit Advance Due Now:" : "Grand Total Amount Due:"}
                    </span>
                    <span className="font-sans font-extrabold text-2xl text-amber-600 dark:text-amber-400 font-mono">
                      ₹{(paymentSelection === "Advance" ? Math.round(calculateGuestWizardCosts().total / 2) : calculateGuestWizardCosts().total).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 hover:text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" /> Secure payment gateway
                    </button>

                    
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      ← Edit Add-On Details
                    </button>
                  </div>


                </div>
              </div>

            </div>
          )}

          {/* STEP 5: SUBMIT RESERVATION SUCCESS STATUS RECEIVED */}
          {wizardStep === 5 && bookingConfirmation && (
            <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500/20 shadow-xl overflow-hidden p-6 sm:p-8 relative">
              <div className="absolute top-0 right-0 py-1.5 px-3 bg-emerald-555 bg-emerald-600 text-white font-mono text-[9px] uppercase font-bold rounded-bl-lg tracking-wider">
                Residency Confirmed
              </div>
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900/10 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  ✓
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Resort Reservation Successful!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Your beachfront resort stay has been successfully logged on the PMS calendar.</p>
              </div>

              <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4 my-4 flex flex-col gap-3 font-mono text-xs text-slate-650 dark:text-slate-350">
                <div className="flex justify-between"><span>Booking Token:</span><span className="font-bold text-slate-900 dark:text-slate-50">{bookingConfirmation.bookingId}</span></div>
                <div className="sr-only">Assigned to: {bookingConfirmation.guestName}</div>
                <div className="flex justify-between"><span>Lead Guest:</span><span className="text-slate-850 dark:text-slate-200 font-bold">{bookingConfirmation.guestName}</span></div>
                <div className="flex justify-between font-sans"><span>Reservation Core:</span><span className="text-slate-800 dark:text-slate-250 uppercase text-[10px] font-bold">{selectedBookingType}</span></div>
                <div className="flex justify-between"><span>Assigned Option:</span><span className="text-slate-850 dark:text-slate-200">{bookingConfirmation.roomType}</span></div>
                <div className="flex justify-between"><span>Arrival date:</span><span className="text-slate-800 dark:text-slate-200">{bookingConfirmation.checkIn} (12:00 PM)</span></div>
                <div className="flex justify-between"><span>Departure date:</span><span className="text-slate-800 dark:text-slate-200">{bookingConfirmation.checkOut} (11:00 AM)</span></div>
                
                {requireTransport && (
                  <div className="py-2 px-3 bg-amber-500/10 border border-amber-500/10 rounded-lg text-[10px] leading-relaxed select-all">
                    🚖 <strong>Transport Booked:</strong> Pickup scheduled for {transportDate} at {transportTime} via {selectedVehicle}.
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-dashed border-slate-200 dark:border-slate-850">
                  <span>{bookingConfirmation.paymentOption === "Advance" ? "Deposit Advance Paid (Razorpay):" : "Grand Paid Net (Razorpay):"}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                    ₹{(bookingConfirmation.paymentOption === "Advance" ? bookingConfirmation.advancePaid : bookingConfirmation.totalPrice).toLocaleString()}
                  </span>
                </div>
                {bookingConfirmation.paymentOption === "Advance" && (
                  <div className="flex justify-between text-amber-700 dark:text-amber-500 font-bold">
                    <span>Pending balance (At Lobby Desk Check-In):</span>
                    <span>₹{bookingConfirmation.pendingBalance.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between"><span>Invoice Transaction ID:</span><span className="text-slate-405 text-slate-400 lowercase">{bookingConfirmation.transactionId}</span></div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 dark:text-amber-300 font-sans">Mandatory Check-In Steps Required</h4>
                    <p className="text-slate-650 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                      Your booking reference is <strong className="font-mono text-amber-800 dark:text-amber-400">{bookingConfirmation.bookingId}</strong>. You must complete E-Check-In with a government photo ID prior to arrival.
                    </p>
                  </div>
                </div>

                {/* MY STAY URL GENERATION */}
                <div className="mt-2 pt-3 border-t border-amber-200/40">
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-bold tracking-wider block mb-1">Generated My Stay Link</span>
                  <div className="flex gap-2 items-center bg-white dark:bg-slate-950 p-2 rounded-lg border border-amber-200/50">
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/guest?bookingId=${bookingConfirmation.bookingId}`}
                      className="bg-transparent border-none text-[10px] text-slate-700 dark:text-slate-350 select-all font-mono grow p-0 focus:outline-none focus:ring-0"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/guest?bookingId=${bookingConfirmation.bookingId}`);
                        alert("✓ My Stay URL copied to clipboard!");
                      }}
                      className="px-2 py-1 bg-amber-500 text-slate-950 text-[10px] font-bold rounded hover:bg-amber-600 hover:text-white transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                {/* NOTIFICATION HOOKS STATUS */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-center gap-1.5">
                    <span className="text-emerald-500">📧</span>
                    <div>
                      <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 block">Email Sent</span>
                      <span className="text-[8px] text-slate-400 block font-mono">Status: Queued</span>

                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-center gap-1.5">
                    <span className="text-emerald-500">💬</span>
                    <div>
                      <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 block">WhatsApp Sent</span>
                      <span className="text-[8px] text-slate-400 block font-mono">Status: Delivered</span>
                    </div>

                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setBookingConfirmation(null);
                    setWizardStep(1);
                    setTab("home");
                  }}
                  className="px-6 py-2.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-600 hover:text-white hover:shadow-lg transition-all cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5. DINING TAB */}
      {currentTab === "dining" && (
        <div id="customer-dining-tab" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
          <div className="mb-12 text-center">
            <span className="font-mono text-xs tracking-wider text-amber-600 dark:text-amber-400 uppercase font-bold">Gourmet Pleasures</span>
            <h1 className="text-4xl font-serif font-normal text-slate-900 dark:text-white mt-2 tracking-tight">Fine Culinary Encounters</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto mt-2">Savor high-end satvik temple recipes, rich coastal seafood grills, and custom curated sunset drinks crafted by Niladri Shore's master chefs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden h-[400px] shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80" 
                alt="Signature dining room" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-6">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Signature Restaurant</span>
              <h2 className="text-3xl font-serif font-semibold text-slate-900 dark:text-white">The Mahodadhi Pavilion</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Overlooking the gorgeous Bay of Bengal beach, our main dining room serves a carefully preserved collection of royal Odia delicacies and seafood plates. Prepared under strict purity standardizations, the menu also boasts classic pan-Asian and continental alternatives.
              </p>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-500">
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">HOURS</strong>
                  <span>Breakfast: 7:00 AM - 10:30 AM<br />Dinner: 7:00 PM - 11:00 PM</span>
                </div>
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">RESERVATIONS</strong>
                  <span>Complimentary for in-house guests</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-20">
            <div className="space-y-6 md:order-2">
              <div className="rounded-2xl overflow-hidden h-[400px] shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80" 
                  alt="Scenic beachfront lounge bar" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="space-y-6 md:order-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Open-Air Lounge Deck</span>
              <h2 className="text-3xl font-serif font-semibold text-slate-900 dark:text-white">Blue Horizon Lounge</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Enjoy high-end fusion coolers, mocktails, and fresh ocean juices at our open-air beach-facing deck. Watch the sunset illuminate the coast while gentle live sitar music sets the perfect beach mood.
              </p>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-500">
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">HOURS</strong>
                  <span>Daily: 11:00 AM - 10:00 PM</span>
                </div>
                <div>
                  <strong className="block text-slate-800 dark:text-slate-200">AMBIENCE</strong>
                  <span>Smart Casual, Sea Breeze, Acoustic Sitar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. GALLERY TAB */}
      {currentTab === "gallery" && (
        <div id="customer-gallery-tab" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
          <div className="mb-12 text-center">
            <span className="font-mono text-xs tracking-wider text-amber-600 dark:text-amber-400 uppercase font-bold">Visual Grandeur</span>
            <h1 className="text-4xl font-serif font-normal text-slate-900 dark:text-white mt-2 tracking-tight">Our Resort Portfolio</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto mt-2">Step inside a breathtaking preview of Niladri Shore Resort's luxury beachfront landscapes, elegant royal suites, and premium amenities.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80", title: "Majestic Golden Beach Sunrise" },
              { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", title: "Luxury Royal Sea Suite" },
              { url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", title: "Infinity Beach Lounge Pool" },
              { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80", title: "The Mahodadhi Pavilion Fine Dining" },
              { url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", title: "Sunset Yoga on Beachfront Deck" },
              { url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80", title: "Main Lobby & Concierge" },
              { url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", title: "Ayurvedic Treatment & Spa Room" },
              { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", title: "Odisha Coastline Vista" }
            ].map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveGalleryImage(img.url)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl aspect-[4/3] border border-slate-200/50 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white text-xs font-semibold tracking-wide font-sans">{img.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* GALLERY LIGHTBOX */}
          {activeGalleryImage && (
            <div 
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setActiveGalleryImage(null)}
            >
              <button className="absolute top-6 right-6 text-white text-3xl font-light hover:text-amber-500 transition-colors">×</button>
              <div className="max-w-5xl max-h-[85vh] overflow-hidden rounded-xl">
                <img src={activeGalleryImage} className="max-w-full max-h-[80vh] object-contain mx-auto" alt="Full screen preview" referrerPolicy="no-referrer" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. OFFERS TAB */}
      {currentTab === "offers" && (
        <div id="customer-offers-tab" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
          <div className="mb-12 text-center">
            <span className="font-mono text-xs tracking-wider text-amber-600 dark:text-amber-400 uppercase font-bold">Resort Exclusives</span>
            <h1 className="text-4xl font-serif font-normal text-slate-900 dark:text-white mt-2 tracking-tight">Special Privileges & Packages</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto mt-2">Unlock exceptional ocean deals, spiritual retreats, and family vacation offers curated for your Puri stay.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Spiritual Serenity Package",
                tag: "Recommended",
                desc: "Combine deep sea tranquility with holy temple blessings. Save 15% on any suite, including pre-arranged VIP temple darshan cards and private roundtrip shuttle services.",
                savings: "15% OFF",
                badge: "Temple Darshan Guide"
              },
              {
                title: "Coastal Romance Package",
                tag: "Exclusive",
                desc: "Unwind on the pristine bay beach. Features beach sun deck breakfast, complimentary premium high tea at Blue Horizon lounge, and late check-out options.",
                savings: "Free Dining Perks",
                badge: "High Tea Included"
              },
              {
                title: "Early Bird Coastal Deal",
                tag: "Seasonal",
                desc: "Secure your holy sanctuary early. Book your hotel rooms at least 14 days before your arrival check-in date to unlock a solid 20% discount rate on our premium inventory.",
                savings: "20% OFF",
                badge: "Advanced Booking Lock"
              }
            ].map((deal, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-500/10 hover:border-amber-500/30 p-8 flex flex-col justify-between shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-mono text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
                  {deal.tag}
                </div>
                <div>
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {deal.badge}
                  </span>
                  <h3 className="text-xl font-serif font-semibold text-slate-900 dark:text-white mt-4">{deal.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 leading-relaxed">{deal.desc}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">OFFER VALUE</span>
                    <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{deal.savings}</p>
                  </div>
                  <button
                    onClick={() => {
                      setTab("booking");
                    }}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 hover:text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    Claim Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DESTINATION EXPLORER TAB */}
      {currentTab === "locality" && (
        <div id="customer-locality-tab" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
          {/* Header */}
          <div className="mb-12 text-center">
            <span className="font-mono text-xs tracking-widest text-amber-600 dark:text-amber-400 uppercase font-bold">
              Local Heritage & Excursions
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-normal text-slate-900 dark:text-white mt-2 tracking-tight">
              Explore {hotelConfig.destinationExplorer?.localityName || "Our Locality"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto mt-3">
              Immerse yourself in legendary attractions, sacred monuments, and pristine natural reserves curated by our local guides. Secure dynamic transport arrangements directly through the hotel.
            </p>
          </div>

          {/* Category Filter Pills */}
          {hotelConfig.destinationExplorer?.attractions && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {["All", ...Array.from(new Set(hotelConfig.destinationExplorer.attractions.map(att => att.category)))].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedLocalityCategory(category)}
                  className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-full transition-all duration-300 ${
                    selectedLocalityCategory === category
                      ? "bg-amber-600 text-white dark:bg-amber-400 dark:text-slate-950 shadow-md shadow-amber-600/10"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Attractions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotelConfig.destinationExplorer?.attractions
              ?.filter(att => selectedLocalityCategory === "All" || att.category === selectedLocalityCategory)
              ?.map((attraction, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Hero Image Section */}
                  <div className="relative h-[220px] overflow-hidden">
                    <img
                      src={attraction.heroImage}
                      alt={attraction.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    {/* Category Tag */}
                    <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/10">
                      {attraction.category}
                    </span>
                    {/* Featured Badge */}
                    {attraction.featuredBadge && (
                      <span className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow">
                        {attraction.featuredBadge}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-serif font-semibold text-slate-900 dark:text-white leading-snug">
                        {attraction.name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-2.5 leading-relaxed">
                        {attraction.shortDescription}
                      </p>

                      {/* Travel Badges Grid */}
                      <div className="grid grid-cols-2 gap-3 my-5">
                        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900">
                          <MapPin className="w-4 h-4 text-amber-550 flex-shrink-0" />
                          <div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase block leading-none">DISTANCE</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{attraction.distance}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900">
                          <Clock className="w-4 h-4 text-amber-550 flex-shrink-0" />
                          <div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase block leading-none">TRAVEL TIME</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{attraction.travelTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Details Accordion */}
                      <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 mb-4 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Best Visiting Time:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold text-right max-w-[180px]">{attraction.bestTime}</span>
                        </div>
                        {attraction.entryFee && (
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Entry Fees:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-semibold">{attraction.entryFee}</span>
                          </div>
                        )}
                        {attraction.openingHours && (
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Opening Hours:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-semibold">{attraction.openingHours}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transport & Navigation Row */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
                      {attraction.transportAvailable ? (
                        <div className="flex items-center justify-between bg-amber-500/10 dark:bg-amber-400/5 border border-amber-500/20 px-3 py-2 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 tracking-wide">
                              Transportation Available
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedAttractionForTransport(attraction);
                              setDestTransportSubmitted(false);
                            }}
                            className="text-[11px] font-bold uppercase tracking-wider text-amber-700 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer"
                          >
                            Arrange Cab →
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-xl">
                          <Compass className="w-4 h-4 text-slate-400" />
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            Independent Travel Recommended
                          </span>
                        </div>
                      )}

                      <a
                        href={attraction.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Navigate with Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* CAB ARRANGEMENT MODAL DIALOG */}
          {selectedAttractionForTransport && (
            <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-5 text-white flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-100">
                      Hotel Fleet Concierge
                    </span>
                    <h3 className="text-lg font-serif font-bold">Arrange Private Cab</h3>
                  </div>
                  <button
                    onClick={() => setSelectedAttractionForTransport(null)}
                    className="text-white hover:text-amber-200 text-xl font-light cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6">
                  {destTransportSubmitted ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-amber-550 dark:text-amber-400 animate-pulse" />
                      </div>
                      <h4 className="text-xl font-serif font-semibold text-slate-900 dark:text-white">
                        Cab Booking Dispatched!
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                        Your private cab request to <strong>{selectedAttractionForTransport.name}</strong> has been registered under room <strong>#{destTransportRoomNo}</strong>.
                      </p>
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-900 text-left text-xs max-w-xs mx-auto space-y-1.5 font-mono">
                        <p className="text-slate-400">Date: <span className="text-slate-700 dark:text-slate-300 font-bold">{destTransportDate}</span></p>
                        <p className="text-slate-400">Time: <span className="text-slate-700 dark:text-slate-300 font-bold">{destTransportTime}</span></p>
                        <p className="text-slate-400">Passengers: <span className="text-slate-700 dark:text-slate-300 font-bold">{destTransportPassengers} Guests</span></p>
                      </div>
                      <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase font-bold animate-pulse">
                        ✓ Our driver will contact you 15 minutes prior.
                      </p>
                      <button
                        onClick={() => setSelectedAttractionForTransport(null)}
                        className="mt-4 px-6 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Close Window
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        // Hard guarantee: never allow native submit navigation/refresh.
                        e.preventDefault();
                        e.stopPropagation();
                        if (!destTransportDate || !destTransportTime || !destTransportRoomNo) return;
                        setDestTransportSubmitted(true);
                      }}
                      className="space-y-4"
                    >
                      <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl flex gap-3">
                        <img
                          src={selectedAttractionForTransport.heroImage}
                          alt={selectedAttractionForTransport.name}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedAttractionForTransport.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Distance: {selectedAttractionForTransport.distance}</p>
                          <span className="inline-block mt-1 text-[8px] bg-amber-500 text-slate-950 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {selectedAttractionForTransport.category}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1.5">Preferred Date</label>
                          <input
                            type="date"
                            required
                            value={destTransportDate}
                            onChange={(e) => setDestTransportDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1.5">Preferred Time</label>
                          <input
                            type="time"
                            required
                            value={destTransportTime}
                            onChange={(e) => setDestTransportTime(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1.5">Room Number</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 104"
                            value={destTransportRoomNo}
                            onChange={(e) => setDestTransportRoomNo(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1.5">Passengers</label>
                          <select
                            value={destTransportPassengers}
                            onChange={(e) => setDestTransportPassengers(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                          >
                            <option value="1">1 Passenger</option>
                            <option value="2">2 Passengers</option>
                            <option value="3">3 Passengers</option>
                            <option value="4">4 Passengers</option>
                            <option value="5">5+ Passengers (Innova/SUV)</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          Confirm Hotel Cab Request
                        </button>
                        <p className="text-[10px] text-slate-400 text-center mt-2.5 leading-tight">
                          Charges will be dynamically applied directly to your dynamic billing ledger at checkout.
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. CONTACT TAB */}
      {currentTab === "contact" && (
        <div id="customer-contact-tab" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
          <div className="mb-12 text-center">
            <span className="font-mono text-xs tracking-wider text-amber-600 dark:text-amber-400 uppercase font-bold">Reach Out</span>
            <h1 className="text-4xl font-serif font-normal text-slate-900 dark:text-white mt-2 tracking-tight">Connect with Niladri Shore</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto mt-2">Whether planning a grand pilgrimage, ocean wedding, or corporate block, our dedicated staff is ready to help.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
              {contactSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <span className="text-5xl">💌</span>
                  <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Message Dispatched!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Thank you for your interest. A luxury concierge will contact you at {contactEmail} within 2 hours.</p>
                  <button 
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactName("");
                      setContactEmail("");
                      setContactMessage("");
                    }}
                    className="mt-6 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!contactName || !contactEmail || !contactMessage) return;
                    setContactSubmitted(true);
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-500 uppercase mb-2">Guest Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Priyesh Mohapatra"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-500 uppercase mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. guest@luxurymail.com"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-500 uppercase mb-2">Private Message / Inquiry</label>
                    <textarea 
                      required
                      rows={5}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Please details your request (e.g. family group booking rate, VIP temple guides assistance)"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Submit Private Inquiry
                  </button>
                </form>
              )}
            </div>

            {/* Address & Visual Map Info */}
            <div className="space-y-8 flex flex-col justify-between">
              <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 space-y-6">
                <div>
                  <h4 className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">RESORT LOCATION</h4>
                  <p className="text-sm font-semibold mt-1.5 text-slate-800 dark:text-slate-200">Niladri Shore Beachfront, Golden Beach Sector 4, Puri, Odisha, 752001, India</p>
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">DIRECT HOTLINES</h4>
                  <p className="text-sm font-semibold mt-1.5 text-slate-800 dark:text-slate-200">Main Office: +91 6752 234567<br />Luxury Concierge: +91 98765 43210</p>
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">EMAIL</h4>
                  <p className="text-sm font-semibold mt-1.5 text-slate-800 dark:text-slate-200">reservations@niladrishoreresort.com</p>
                </div>
              </div>

              {/* Map coordinates visual panel */}

              <div className="h-[240px] bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-800 flex items-center justify-center text-center">
                <div className="absolute inset-0 opacity-20">
                  <img 
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" 
                    alt="Map Grid" 
                    className="w-full h-full object-cover filter saturate-0 contrast-125" 
                  />
                </div>
                <div className="relative z-10 px-6">
                  <MapPin className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-bounce" />
                  <span className="font-mono text-[10px] text-amber-405 font-bold uppercase block tracking-widest">NILADRI COORDINATES</span>
                  <p className="text-sm font-semibold mt-1 text-white">19.7982° N, 85.8249° E</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">Located directly on Golden Beach (Odisha Tourism Sector)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RAZORPAY MODAL INTERFACE */}
      {isRazorpayOpen && (
        <div id="razorpay-checkout-modal" className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f2847] w-full max-w-sm rounded-[15px] overflow-hidden text-stone-100 shadow-2xl border border-blue-500/10">
            {/* Header */}
            <div className="bg-[#181f37] p-5 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm">
                  R
                </div>
                <div>
                  <span className="text-xs text-stone-400 lowercase">paying to</span>
                  <p className="text-sm font-bold text-white tracking-tight -mt-0.5">Niladri Shore Resort</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 font-mono block">AMOUNT</span>
                <span className="text-sm font-bold text-blue-400 font-mono">₹{calculateGuestWizardCosts().total.toLocaleString()}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex flex-col gap-4 text-xs font-mono">
              <div className="bg-[#13192f] p-3 rounded-lg border border-white/5">
                <div className="text-blue-300 font-bold mb-1.5 uppercase text-[10px] tracking-wide">Secure Payment Checkout</div>

                <div className="flex flex-col gap-1 text-stone-300">
                  <div className="flex justify-between"><span>Service Name:</span><span className="text-white">Suite Booking</span></div>
                  <div className="flex justify-between"><span>Billing Guest:</span><span className="text-white">{guestName}</span></div>
                  <div className="flex justify-between"><span>Mobile:</span><span className="text-white">{guestPhone}</span></div>
                </div>
              </div>

              <div className="border border-white/5 rounded-lg p-3 bg-[#181f37] flex flex-col gap-2">
                <span className="text-[10px] text-stone-400">Confirm and proceed with payment</span>
                <button
                  type="button"
                  onClick={submitBookingPayment}
                  disabled={isPaying}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPaying ? "Processing payment..." : "Pay now"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage("Payment cancelled.");
                    setIsRazorpayOpen(false);
                  }}
                  className="w-full py-1.5 bg-red-950/40 hover:bg-red-950 border border-red-950/80 text-red-200/90 rounded text-[11px] transition-colors"
                >
                  Cancel
                </button>
              </div>

            </div>

            {/* Footer lock */}
            <div className="bg-[#13192f] py-3.5 px-5 text-center text-[10px] text-stone-400/80 flex items-center justify-center gap-1">
              <span>Secure connection</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
