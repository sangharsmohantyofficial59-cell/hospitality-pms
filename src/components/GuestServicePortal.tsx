/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, Coffee, Clock, Compass, Star, Check, AlertTriangle, 
  HelpCircle, MapPin, Send, ArrowRight, Waves, Heart, Plane, Car, User, FileText, Activity
} from "lucide-react";
import { Booking, Guest } from "../types";
import { hotelConfig } from "../config/hotelConfig";

interface GuestServicePortalProps {
  bookings: Booking[];
  guests: Guest[];
  onAddRequest: (payload: any) => Promise<void>;
  onAddInquiry: (payload: any) => Promise<void>;
  onAddFeedback: (payload: any) => Promise<void>;
  activeRequests: any[];
  activeInquiries: any[];
  onNavigateTab?: (tab: string) => void;
  initialSegment?: "services" | "tourism" | "feedback";
  preselectedBookingId?: string;
}

export default function GuestServicePortal({
  bookings = [],
  guests = [],
  onAddRequest,
  onAddInquiry,
  onAddFeedback,
  activeRequests = [],
  activeInquiries = [],
  onNavigateTab,
  initialSegment,
  preselectedBookingId
}: GuestServicePortalProps) {
  const [activeSegment, setActiveSegment] = useState<"services" | "tourism" | "feedback">(initialSegment || "services");

  React.useEffect(() => {
    if (initialSegment) {
      setActiveSegment(initialSegment);
    }
  }, [initialSegment]);

  // Simulated Selected Booking / Guest
  const [selectedBookingId, setSelectedBookingId] = useState<string>(preselectedBookingId || bookings[0]?.id || "");

  React.useEffect(() => {
    if (preselectedBookingId) {
      setSelectedBookingId(preselectedBookingId);
    }
  }, [preselectedBookingId]);
  const [customRoom, setCustomRoom] = useState<string>("101");
  const [customGuestName, setCustomGuestName] = useState<string>("John Doe");

  // Helper to resolve currently selected guest details
  const getSelectedDetails = () => {
    const booking = bookings.find(b => b.id === selectedBookingId);
    if (booking) {
      const guest = guests.find(g => g.id === booking.guestId);
      return {
        bookingId: booking.id,
        guestName: guest ? guest.name : "Valued Guest",
        roomId: booking.roomId || "102",
        dates: `${booking.checkInDate} to ${booking.checkOutDate}`
      };
    }
    return {
      bookingId: "Walk-In",
      guestName: customGuestName || "Walk-In Explorer",
      roomId: customRoom || "101",
      dates: "June 2026 Stay"
    };
  };

  // --- MODULE 2 STATES ---
  const [selectedService, setSelectedService] = useState<string>("Drinking Water");
  const [serviceComments, setServiceComments] = useState<string>("");
  const [serviceSuccess, setServiceSuccess] = useState(false);

  const servicesList = [
    { name: "Drinking Water", estTime: "5 - 10 Mins", desc: "Complimentary package of double mineral bottles." },
    { name: "Extra Towels", estTime: "10 Mins", desc: "Fresh Egyptian cotton bath/pool towels." },
    { name: "Housekeeping", estTime: "20 Mins", desc: "Full linen refresh and vanity cleaning service." },
    { name: "Laundry Pickup", estTime: "Today Evening", desc: "Express press and professional garment cleaning." },
    ...(hotelConfig.guestPortalFeatures.enableTransport ? [
      { name: "Taxi Service", estTime: "Immediate", desc: "Local AC auto or sedan for quick transport." },
      { name: "Airport Pickup", estTime: "Scheduled", desc: "Premium sedan pickup from Bhubaneswar (BBI) Airport." },
      { name: "Railway Pickup", estTime: "Scheduled", desc: "Complimentary resort auto pickup from Puri Railway Station." }
    ] : []),
    { name: "Late Checkout", estTime: "Admin Review", desc: "Extend stay checkout buffer to 2:00 PM." },
    { name: "Maintenance Request", estTime: "15 Mins", desc: "HVAC cooling, television or bathroom fixtures tuning." },
    ...(hotelConfig.guestPortalFeatures.enableDiningReservations ? [
      { name: "Restaurant Reservation", estTime: "Same day", desc: "Priority table booking at 'The Mahodadhi Room'." }
    ] : [])
  ];

  // --- MODULE 4 STATES ---
  const [selectedTour, setSelectedTour] = useState<string>("Jagannath Temple Visit");
  const [tourismNotes, setTourismNotes] = useState<string>("");
  const [tourismDate, setTourismDate] = useState<string>("2026-06-23");
  const [tourismSuccess, setTourismSuccess] = useState(false);

  const toursList = [
    { 
      name: "Jagannath Temple Visit", 
      estPrice: "₹1,500 for Group", 
      duration: "3 Hours",
      desc: "Includes VIP pandas priest assistance, priority access, and complimentary traditional Mahaprasad details.",
      itinerary: "06:30 AM departure from Niladri Shore → Guide escort to Singhadwara entrance → Custom Archana Puja → Return by shuttle."
    },
    { 
      name: "Konark Tour", 
      estPrice: "₹3,200", 
      duration: "6 Hours",
      desc: "Guided travel to the magnificent Chariot of Sun God, with Marine Drive view cruise stopping.",
      itinerary: "08:00 AM departure via Marine Drive AC sedan → Guided walkabout of medieval stone wheels → Lunch by beach → Back by 02:00 PM."
    },
    { 
      name: "Chilika Lake Tour", 
      estPrice: "₹4,800", 
      duration: "8 Hours",
      desc: "Full day excursion to the country's prime saltwater lagoon, complete with private pontoon boating.",
      itinerary: "07:30 AM departure to Satapada jetty → Dolphin sighting yacht ride → Seagull island stroll → Crab lunch feast → Return."
    },
    { 
      name: "Dolphin Watching", 
      estPrice: "₹2,400", 
      duration: "4 Hours",
      desc: "Excursion to Irrawaddy Dolphin reservation channels of Chilika estuary.",
      itinerary: "Private pick-up → Satellite boat booking → Visual tracing guide assistance."
    },
    { 
      name: "Local Sightseeing", 
      estPrice: "₹1,800", 
      duration: "5 Hours",
      desc: "Visits to Gundicha Temple, Lokanath Temple, and local craft bazaar alleys.",
      itinerary: "Depart by 09:30 AM via scenic open-deck vehicle → Guide-accompanied stroll."
    },
    { 
      name: "Beach Excursions", 
      estPrice: "₹800", 
      duration: "2 Hours",
      desc: "Traditional sand art classes and private deck-chair beach slots at Puri beach front.",
      itinerary: "Reserve beachfront deck canopy → Professional trainer for clay/sand molding lessons."
    },
    ...(hotelConfig.guestPortalFeatures.enableTransport ? [
      { 
        name: "Airport Transfer", 
        estPrice: "₹2,200 Uni-way", 
        duration: "1.5 Hours",
        desc: "Chauffeur driver in luxury sedan to Bhubaneswar BBI international departures.",
        itinerary: "Baggage assistance → Mineral water in vehicle → Flight delay tracking."
      },
      { 
        name: "Railway Transfer", 
        estPrice: "₹250", 
        duration: "15 Mins",
        desc: "Express resort Auto/Cab drop to Puri central terminal.",
        itinerary: "Lobby pickup → Central station deck delivery."
      },
      { 
        name: "Private Vehicle Booking", 
        estPrice: "₹3,500 / Day", 
        duration: "12 Hours",
        desc: "Exclusive ownership of private AC SUV and driver inside Puri constraints.",
        itinerary: "Choice of custom destination routes → Unlimited kilometers up to 100km total."
      }
    ] : [])
  ];

  // --- MODULE 5 STATES ---
  const [rating, setRating] = useState<number>(5);
  const [feedbackComments, setFeedbackComments] = useState<string>("");
  const [issueCategory, setIssueCategory] = useState<string>("Room Issue");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const details = getSelectedDetails();
    await onAddRequest({
      bookingId: details.bookingId,
      guestName: details.guestName,
      roomId: details.roomId,
      requestType: selectedService,
      comments: serviceComments
    });
    setServiceSuccess(true);
    setServiceComments("");
    setTimeout(() => setServiceSuccess(false), 4000);
  };

  const handleTourismSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const details = getSelectedDetails();
    await onAddInquiry({
      guestId: details.bookingId,
      guestName: details.guestName,
      tourType: selectedTour,
      notes: tourismNotes,
      date: tourismDate
    });
    setTourismSuccess(true);
    setTourismNotes("");
    setTimeout(() => setTourismSuccess(false), 4000);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const details = getSelectedDetails();
    await onAddFeedback({
      bookingId: details.bookingId,
      guestName: details.guestName,
      roomId: details.roomId,
      rating,
      comments: feedbackComments,
      issueCategory,
      stayDates: details.dates
    });
    setFeedbackSubmitted(true);
  };

  const handleResetFeedback = () => {
    setRating(5);
    setFeedbackComments("");
    setFeedbackSubmitted(false);
  };

  const details = getSelectedDetails();

  const renderActionIcon = (iconName: string) => {
    switch (iconName) {
      case "FileText": return <FileText className="w-5 h-5 text-indigo-650" />;
      case "Coffee": return <Coffee className="w-5 h-5 text-amber-600" />;
      case "Sparkles": return <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case "Activity": return <Activity className="w-5 h-5 text-rose-500" />;
      case "MapPin": return <MapPin className="w-5 h-5 text-emerald-600" />;
      case "Clock": return <Clock className="w-5 h-5 text-sky-600" />;
      default: return <HelpCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div id="guest-service-portal-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      
      {/* Selector banner for testing different bookings */}
      <div className="bg-amber-50 dark:bg-slate-900 border border-amber-200/50 dark:border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-400 font-mono">* GUEST DEMO WORKSPACE *</span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Submit requests representing any hotel booking below to verify cross-dashboard updates.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Acting as Guest Booking:</span>
          <select
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            className="p-1.5 text-xs rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono"
          >
            {bookings.map(b => (
              <option key={b.id} value={b.id}>
                {b.id} - Room {b.roomId || "N/A"} ({b.guestId})
              </option>
            ))}
            <option value="custom">-- Use Walk-In (Manual) --</option>
          </select>
          
          {selectedBookingId === "custom" && (
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Guest Name"
                value={customGuestName}
                onChange={(e) => setCustomGuestName(e.target.value)}
                className="p-1 text-xs rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-slate-900 dark:text-slate-100"
              />
              <input 
                type="text" 
                placeholder="Rm"
                value={customRoom}
                onChange={(e) => setCustomRoom(e.target.value)}
                className="p-1 w-12 text-xs rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Title & Nav Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-150 dark:border-slate-800 pb-4">
        <div>
          <span className="font-mono text-xs tracking-widest text-amber-600 dark:text-amber-400 font-bold uppercase block">
            Integrated Resort Companion
          </span>
          <h1 className="text-2xl font-extrabold text-slate-905 dark:text-white mt-0.5">
            Guest Experience Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
            Current Profile: <strong className="text-amber-700 dark:text-amber-400 font-mono uppercase bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px]">{details.guestName} (Room {details.roomId})</strong>
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 p-1 rounded-2xl select-none mt-4 md:mt-0 text-xs">
          <button
            onClick={() => setActiveSegment("services")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeSegment === "services" 
                ? "bg-amber-650 text-white shadow-sm font-bold" 
                : "text-slate-500 hover:text-slate-950 dark:hover:text-white"
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            Concierge Requests
          </button>
          {hotelConfig.guestPortalFeatures.enableTours && (
            <button
              onClick={() => setActiveSegment("tourism")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeSegment === "tourism" 
                  ? "bg-amber-650 text-white shadow-sm font-bold" 
                  : "text-slate-500 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Explore Puri
            </button>
          )}
          <button
            onClick={() => setActiveSegment("feedback")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeSegment === "feedback" 
                ? "bg-amber-650 text-white shadow-sm font-bold" 
                : "text-slate-500 hover:text-slate-950 dark:hover:text-white"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            Checkout & Reviews
          </button>
        </div>
      </div>

      {/* 1. GUEST SERVICE REQUESTS PORTAL */}
      {activeSegment === "services" && (
        <div className="space-y-6 text-xs">
          
          {/* Dynamic Quick Actions Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Express Guest Quick Actions
            </h3>
            <p className="text-slate-550 dark:text-slate-450 text-[11px] mb-4">
              Tap any dynamic action below to instantly pre-fill concierge tickets or launch premium guest lounges. Loaded dynamically from Configuration.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {hotelConfig.guestQuickActions
                .filter(action => {
                  if (action.id === "spa" && !hotelConfig.guestPortalFeatures.enableSpa) return false;
                  if (action.id === "tours" && !hotelConfig.guestPortalFeatures.enableTours) return false;
                  if (action.id === "pickup" && !hotelConfig.guestPortalFeatures.enableTransport) return false;
                  if (action.id === "upgrade" && !hotelConfig.guestPortalFeatures.enableRoomUpgradeOffers) return false;
                  return true;
                })
                .map(action => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                      if (action.id === "towels") {
                        setSelectedService("Extra Towels");
                        setServiceComments("Requested extra organic bath towels via Express Quick Action.");
                      } else if (action.id === "water") {
                        setSelectedService("Drinking Water");
                        setServiceComments("Requested complimentary pure mineral water bottles via Express Quick Action.");
                      } else if (action.id === "upgrade") {
                        if (onNavigateTab) onNavigateTab("upgrade");
                      } else if (action.id === "spa") {
                        setSelectedService("Maintenance Request");
                        setServiceComments("Inquiring about booking Ayurvedic Spa massage therapies.");
                      } else if (action.id === "tours") {
                        if (hotelConfig.guestPortalFeatures.enableTours) {
                          setActiveSegment("tourism");
                        }
                      } else if (action.id === "pickup") {
                        setSelectedService("Taxi Service");
                        setServiceComments("Airport/Station Shuttle transfer pickup details requested via Express Quick Action.");
                      }
                    }}
                    className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 border border-slate-200 dark:border-slate-805 hover:border-amber-400 dark:hover:border-amber-500 rounded-2xl transition-all text-left flex flex-col justify-between h-28 cursor-pointer select-none"
                  >
                    <span className="p-2 bg-white dark:bg-slate-900 rounded-xl inline-block shadow-xs border border-slate-100 dark:border-slate-800">
                      {renderActionIcon(action.icon)}
                    </span>
                    <div>
                      <strong className="block text-[11px] text-slate-800 dark:text-slate-100 leading-snug mt-1.5">{action.title}</strong>
                      <span className="text-[9.5px] text-slate-450 block mt-0.5 leading-tight line-clamp-1">{action.description}</span>
                    </div>
                  </button>
                ))
              }
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Service Request Form */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Order Cabin Service</h3>
                  <p className="text-[11px] text-slate-500">Service deliverable directly to your assigned room</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Select Service Item:</label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                  >
                    {servicesList.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Service description card */}
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/10 border border-amber-200/30 rounded-xl space-y-1">
                  <span className="font-mono text-[9px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">ITEM SPECIFICATION</span>
                  <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200">
                    {servicesList.find(s => s.name === selectedService)?.name || "Service Item"}
                  </p>
                  <p className="text-[10px] text-slate-550 leading-relaxed">
                    {servicesList.find(s => s.name === selectedService)?.desc || ""}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-amber-705 dark:text-amber-400 font-bold font-mono mt-2">
                    <Clock className="w-3 h-3" />
                    <span>Est Delivery SLA: {servicesList.find(s => s.name === selectedService)?.estTime || "Instant"}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Special Requests / Extra Instructions:</label>
                  <textarea
                    placeholder="Need specific water brand, cold or normal? Any towels preference?"
                    value={serviceComments}
                    onChange={(e) => setServiceComments(e.target.value)}
                    className="w-full p-2.5 h-20 rounded-xl border border-slate-255 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-750 text-white rounded-xl text-xs font-bold hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Service Ticket
                </button>
              </form>

              {serviceSuccess && (
                <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-250/20 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span className="font-bold">✓ Request submitted successfully. Reception notified!</span>
                </div>
              )}
            </div>

            {/* Right tracking pane */}
            <div className="lg:col-span-8 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 shadow-inner space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Service Tickets Tracker</h3>
                <p className="text-[11px] text-slate-500">Track current status of dispatched orders for Room {details.roomId}</p>
              </div>

              <div className="space-y-3" id="active-guest-requests-panel">
                {activeRequests.filter(r => r.roomId === details.roomId || r.bookingId === details.bookingId).length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl text-slate-500">
                    <Coffee className="w-8 h-8 text-amber-505 mx-auto mb-2" />
                    No pending cabin requests submitted for Room {details.roomId} today. Feel free to request water, towels, taxi or housekeeping!
                  </div>
                ) : (
                  activeRequests
                    .filter(r => r.roomId === details.roomId || r.bookingId === details.bookingId)
                    .map((req) => (
                      <div 
                        key={req.id}
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-xs">{req.requestType}</span>
                            <span className="font-mono text-[8px] font-bold text-slate-500 px-1 bg-slate-105 dark:bg-slate-800 rounded">
                              {req.id}
                            </span>
                          </div>
                          <p className="text-slate-500 italic text-[11px]">"{req.comments || "No comment description"}"</p>
                          <p className="text-[9px] font-mono text-slate-400">
                            SUBMITTED AT: {new Date(req.timestamp).toLocaleTimeString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {req.status === "Pending" && (
                            <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-lg bg-amber-50 text-amber-700 border border-amber-200/30 animate-pulse">
                              ⏳ Pending
                            </span>
                          )}
                          {req.status === "Assigned" && (
                            <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-lg bg-sky-50 text-sky-700 border border-sky-200/30">
                              ⚙ Assigned
                            </span>
                          )}
                          {req.status === "In Progress" && (
                            <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/30">
                              🚀 In Progress
                            </span>
                          )}
                          {req.status === "Completed" && (
                            <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/30">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 2. EXPLORE PURI CONCIERGE */}
      {activeSegment === "tourism" && hotelConfig.guestPortalFeatures.enableTours && (
        <div className="text-xs space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-3 text-xs">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-900 dark:text-amber-400 leading-relaxed font-medium">
              Explore the rich history, spiritual legends, and pristine coastline of Puri. Niladri Shore’s dedicated travel desk provides exclusive private cabs, panda guides for Temple Darshan, and custom marine itineraries.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Excursion selection catalogue (8 columns) */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Niladri Shore Destination Catalogue</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {toursList.map(t => (
                  <div 
                    key={t.name}
                    onClick={() => setSelectedTour(t.name)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                      selectedTour === t.name 
                        ? "bg-amber-600/5 dark:bg-amber-500/10 border-amber-500 shadow-sm" 
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-805 hover:border-amber-300"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 text-xs">
                        <span className="font-extrabold text-slate-805 dark:text-slate-100">{t.name}</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold ">{t.estPrice}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{t.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-amber-705 dark:text-amber-400">ESTIMATED ROUTAL ITINERARY</span>
                      <p className="text-[10px] text-slate-500 italic">"{t.itinerary}"</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">Duration: {t.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inquire booking form (4 columns) */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <form onSubmit={handleTourismSubmit} className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Submit Travel Inquiry</h3>
                  <p className="text-[11px] text-slate-500">Excursion bookings will map directly to your guest ledger</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Selected Tour Destination:</label>
                  <input
                    type="text"
                    disabled
                    value={selectedTour}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 font-bold text-slate-800 dark:text-slate-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Estimated Tour Date:</label>
                  <input
                    type="date"
                    value={tourismDate}
                    onChange={(e) => setTourismDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Excursion Companion Notes / Passengers counts:</label>
                  <textarea
                    placeholder="E.g., 4 adults and 1 child. Need child safety seat. Want morning depart."
                    value={tourismNotes}
                    onChange={(e) => setTourismNotes(e.target.value)}
                    className="w-full p-2.5 h-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 border-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Book Concierge Day-Tour
                </button>
              </form>

              {tourismSuccess && (
                <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/25 dark:text-emerald-400 border border-emerald-250/20 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span className="font-bold">✓ Excursion inquiry received! A concierge desk representative will contact you with booking confirmation.</span>
                </div>
              )}
            </div>

          </div>
          
          {/* Active Inquiries list */}
          <div className="p-6 bg-slate-50/60 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Excursion Orders</h3>
              <p className="text-[11px] text-slate-550">Overview of tourism requests registered for {details.guestName}</p>
            </div>

            <div className="space-y-3" id="active-tourism-inquiries-panel">
              {activeInquiries.filter(i => i.guestId === details.bookingId || i.guestName === details.guestName).length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 text-slate-400">
                  No tourism inquiries registered for your session yet. Select an excursion above to request travel arrangements.
                </div>
              ) : (
                activeInquiries
                  .filter(i => i.guestId === details.bookingId || i.guestName === details.guestName)
                  .map(inq => (
                    <div 
                      key={inq.id}
                      className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-855 flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-805 dark:text-white">{inq.tourType}</span>
                          <span className="font-mono text-[9px] text-amber-705 bg-amber-500/10 px-1 rounded font-bold">{inq.id}</span>
                        </div>
                        <p className="text-slate-500 italic text-[11px] mt-1">"Notes: {inq.notes || "None"}"</p>
                        <p className="text-[9px] font-mono text-slate-400 mt-0.5">ESTIMATED TOUR DATE: {inq.date}</p>
                      </div>

                      <div>
                        {inq.status === "Requested" && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-105 border font-mono font-bold uppercase text-slate-600 animate-pulse">
                            ⏳ Requested
                          </span>
                        )}
                        {inq.status === "Confirmed" && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-sky-50 border font-mono font-bold uppercase text-sky-600">
                            ★ Confirmed
                          </span>
                        )}
                        {inq.status === "Completed" && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 border font-mono font-bold uppercase text-emerald-600">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* 3. SMART FEEDBACK & REVIEWS */}
      {activeSegment === "feedback" && (
        <div className="max-w-xl mx-auto text-xs space-y-6">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase block">Niladri Shore Checkout Desk</span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans">Smart Feedback System</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              We hope you had a spiritual and comfortable beachfront stay! Please rate our service below.
            </p>
          </div>

          {!feedbackSubmitted ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              
              {/* Star selector */}
              <div className="text-center space-y-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Rate Your Whole Stay:</span>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starIdx) => (
                    <button
                      key={starIdx}
                      type="button"
                      onClick={() => setRating(starIdx)}
                      className="cursor-pointer text-slate-300 transition-transform hover:scale-115 active:scale-95 bg-transparent border-none"
                    >
                      <Star 
                        className={`w-9 h-9 ${
                          starIdx <= rating 
                            ? "fill-yellow-500 text-yellow-500 drop-shadow-sm" 
                            : "text-slate-200 dark:text-slate-800"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <p className="font-bold text-amber-700 dark:text-amber-400 font-mono text-[10px] uppercase">
                  {rating === 5 && "👑 Spectacular Luxury Haven!"}
                  {rating === 4 && "⭐ Exceeded Resort Comfort!"}
                  {rating === 3 && "⚡ Average / Needs tuning"}
                  {rating === 2 && "⚠️ Substandard SLA"}
                  {rating === 1 && "🔥 Highly Disappointed"}
                </p>
              </div>

              {/* Service recovery conditional warning */}
              {rating <= 3 && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border border-rose-250/25 rounded-2xl space-y-2 font-sans">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                    <span className="font-extrabold text-[11px] uppercase tracking-wider">Internal Service Recovery SLA Active</span>
                  </div>
                  <p className="text-[10px] leading-relaxed">
                    We deeply regret missing our premium service commitments. This rating automatically raises a high-priority <strong>Service Recovery Alert ticket</strong> directly to the owner and general manager's cockpit for live resolution.
                  </p>
                  
                  <div className="pt-2 space-y-1.5 text-xs">
                    <label className="font-bold block">Key Issue Category:</label>
                    <select
                      value={issueCategory}
                      onChange={(e) => setIssueCategory(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900 text-xs rounded-xl text-slate-800 dark:text-slate-200"
                    >
                      <option value="Room Issue">Room & Air Conditioning maintenance</option>
                      <option value="Staff behavior">Staff hospitality or frontdesk onboarding</option>
                      <option value="Restaurant / Food">Food quality, restaurant, breakfast SLA</option>
                      <option value="Transport delay">Taxi / Airport transit punctuality</option>
                      <option value="Billing discrepancy">Billing charges or unauthorized discount conflict</option>
                    </select>
                  </div>
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tell us what we did great or how to improve:</label>
                  <textarea
                    placeholder="Share your stay experience..."
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    required
                    className="w-full h-24 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-950 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-transform cursor-pointer shadow-sm"
                >
                  Submit Private Guest Review
                </button>
              </form>

            </div>
          ) : (
            /* AFTER SUBMISSION SCREEN - SMART CONDITIONAL WORKFLOW (MODULE 5) */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm text-center space-y-6">
              
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full w-14 h-14 flex items-center justify-center mx-auto border border-emerald-500/20">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Feedback Logged Successfully</h3>
                <p className="text-[11px] text-slate-500 mt-1 mt-0.5">
                  Thank you for contributing to Niladri Shore's traditional standard indices!
                </p>
              </div>

              {rating >= 4 ? (
                /* 4-5 STAR WORKFLOW: LEAVE GOOGLE REVIEW QR */
                <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2.5xl space-y-4">
                  <span className="font-mono text-[9px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest block">EXTEND COMFORT</span>
                  <h4 className="text-xs font-bold text-slate-905">Would you like to duplicate this as a Google Review?</h4>
                  <p className="text-[10px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Since you rated us <strong>{rating} Stars</strong>, you are eligible to participate in our beachfront review raffle. Scan the QR code below or click the portal button to share the joy with the world!
                  </p>
                  
                  {/* Styled QR Code representation */}
                  <div className="bg-white p-3 border border-slate-205 rounded-xl w-32 h-32 mx-auto shadow-inner flex flex-col items-center justify-center">
                    <div className="border-4 border-slate-950 p-1 rounded bg-white">
                      {/* Grid representation of QR */}
                      <div className="grid grid-cols-4 gap-0.5">
                        <div className="w-4 h-4 bg-slate-950"></div>
                        <div className="w-4 h-4 bg-slate-950"></div>
                        <div className="w-4 h-4 bg-white"></div>
                        <div className="w-4 h-4 bg-slate-950"></div>

                        <div className="w-4 h-4 bg-slate-100"></div>
                        <div className="w-4 h-4 bg-slate-950"></div>
                        <div className="w-4 h-4 bg-slate-950"></div>
                        <div className="w-4 h-4 bg-slate-100"></div>

                        <div className="w-4 h-4 bg-slate-950"></div>
                        <div className="w-4 h-4 bg-white"></div>
                        <div className="w-4 h-4 bg-slate-950"></div>
                        <div className="w-4 h-4 bg-slate-950"></div>

                        <div className="w-4 h-4 bg-slate-950"></div>
                        <div className="w-4 h-4 bg-slate-950"></div>
                        <div className="w-4 h-4 bg-white"></div>
                        <div className="w-4 h-4 bg-slate-950"></div>
                      </div>
                    </div>
                    <span className="font-mono text-[7px] text-slate-500 font-bold uppercase mt-1.5">GOOGLE_REVIEWS_QR</span>
                  </div>

                  <a 
                    href="https://google.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono cursor-pointer"
                  >
                    Post on Google Reviews <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                /* 1-3 STAR WORKFLOW: INTERNAL SERVICE RECOVERY SLA CONFIRM */
                <div className="bg-rose-500/5 border border-rose-500/20 p-5 rounded-2.5xl space-y-3">
                  <h4 className="text-xs font-bold text-rose-500">Internal Service Recovery SLA Initialized</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm mx-auto">
                    A service ticket has been dispatched under priority to the director of hospitality. The resort is committed to resolving your reported issue within our 1-hour service recovery timeline.
                  </p>
                  <p className="font-mono text-[9px] text-rose-500 font-bold">
                    TICKET REF: REC-{Date.now().toString().slice(-4)} • ROOM: {details.roomId}
                  </p>
                </div>
              )}

              <button
                onClick={handleResetFeedback}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 underline text-xs cursor-pointer font-semibold bg-transparent border-none"
              >
                ← Back to Rating Form
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
