/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, Coffee, Clock, FileText, CheckCircle2, Search, Download, 
  Star, HelpCircle, MapPin, Send, AlertTriangle, Calendar, UserCheck, CreditCard, ChevronRight, Check, ArrowRight, ShieldCheck, HelpCircle as HelpIcon, ArrowUpCircle, BadgePercent, CheckCircle, Flame, Utensils, Car, Compass, User
} from "lucide-react";
import { Booking, Guest, RoomType, Room } from "../types";
import { handleExportInvoiceToPDF } from "./BookingManagement";
import { hotelConfig } from "../config/hotelConfig";
import GuestServicePortal from "./GuestServicePortal";
import ECheckInPortal from "./ECheckInPortal";
import BookingLookupPortal from "./BookingLookupPortal";

interface UnifiedGuestPortalProps {
  bookings: Booking[];
  guests: Guest[];
  roomTypes: RoomType[];
  rooms?: Room[];
  serviceRequests: any[];
  tourismInquiries: any[];
  feedbacks: any[];
  onAddRequest: (payload: any) => Promise<void>;
  onAddInquiry: (payload: any) => Promise<void>;
  onAddFeedback: (payload: any) => Promise<void>;
  onUploadCheckin: (bookingId: string, payload: any) => Promise<any>;
  onRoomUpgrade: (bookingId: string, payload: any) => Promise<any>;
}

export default function UnifiedGuestPortal({
  bookings = [],
  guests = [],
  roomTypes = [],
  rooms = [],
  serviceRequests = [],
  tourismInquiries = [],
  feedbacks = [],
  onAddRequest,
  onAddInquiry,
  onAddFeedback,
  onUploadCheckin,
  onRoomUpgrade
}: UnifiedGuestPortalProps) {
  
  // Guest authentication states
  const [isGuestLoggedIn, setIsGuestLoggedIn] = useState<boolean>(false);
  const [loginBookingId, setLoginBookingId] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginLastName, setLoginLastName] = useState("");
  const [loginMode, setLoginMode] = useState<"otp" | "lastname">("otp");
  
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Tab control
  const [activeTab, setActiveTab] = useState<"checkin" | "lookup" | "upgrade" | "concierge" | "dining" | "transport" | "invoice" | "reviews" | "profile">("checkin");
  
  // Loaded booking context (when they search or pick a pre-auth booking)
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [customRoom, setCustomRoom] = useState<string>("101");
  const [customGuestName, setCustomGuestName] = useState<string>("John Doe");

  // Pre-populate login form using URL query parameters if present
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bId = params.get("bookingId");
    if (bId) {
      const cleanBId = bId.trim().toUpperCase();
      setLoginBookingId(cleanBId);
      const booking = bookings.find(b => b.id.toUpperCase() === cleanBId);
      if (booking) {
        const guest = guests.find(g => g.id === booking.guestId);
        if (guest) {
          setLoginPhone(guest.phone);
          const nameParts = guest.name.trim().split(" ");
          setLoginLastName(nameParts[nameParts.length - 1] || "");
        }
      }
    }
  }, [bookings, guests]);

  // Login handler functions
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess("");

    const bId = loginBookingId.trim().toUpperCase();
    const phone = loginPhone.trim().replace(/\s+/g, "");

    if (!bId) {
      setLoginError("Please enter your Booking ID.");
      return;
    }
    if (!phone) {
      setLoginError("Please enter your registered Mobile Number.");
      return;
    }

    const booking = bookings.find(b => b.id.toUpperCase() === bId);
    if (!booking) {
      setLoginError(`No active reservation found for ID "${bId}". Try demo: BK-1002`);
      return;
    }

    const guest = guests.find(g => g.id === booking.guestId);
    if (!guest) {
      setLoginError("Guest profile not found for this reservation.");
      return;
    }

    const cleanGuestPhone = guest.phone.trim().replace(/\s+/g, "");
    const cleanInputPhone = phone.replace(/\+/g, "");
    if (!cleanGuestPhone.includes(cleanInputPhone) && !cleanInputPhone.includes(cleanGuestPhone)) {
      setLoginError("The mobile number entered does not match our reservation records.");
      return;
    }

    setIsSendingOtp(true);
    setTimeout(() => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setSimulatedOtp(code);
      setOtpSent(true);
      setIsSendingOtp(false);
      setLoginSuccess(`✓ Simulated SMS OTP sent to ${guest.phone}! Enter Code: ${code}`);
    }, 800);
  };

  const handleVerifyLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const entered = enteredOtp.trim();
    if (entered !== simulatedOtp && entered !== "1234") {
      setLoginError("Incorrect simulated verification code. Use '1234' or the code displayed in the green helper banner above.");
      return;
    }

    const bId = loginBookingId.trim().toUpperCase();
    const booking = bookings.find(b => b.id.toUpperCase() === bId);
    if (booking) {
      setIsGuestLoggedIn(true);
      setSelectedBookingId(booking.id);
      setActiveTab("checkin"); // Set "Mandatory E-CheckIn" as first screen
      setLoginSuccess("");
      setOtpSent(false);
    }
  };

  const handleLastNameLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess("");

    const bId = loginBookingId.trim().toUpperCase();
    const lName = loginLastName.trim().toLowerCase();

    if (!bId) {
      setLoginError("Please enter your Booking ID.");
      return;
    }
    if (!lName) {
      setLoginError("Please enter your Last Name.");
      return;
    }

    const booking = bookings.find(b => b.id.toUpperCase() === bId);
    if (!booking) {
      setLoginError(`No active reservation found for Booking ID "${bId}". Try demo: BK-1002`);
      return;
    }

    const guest = guests.find(g => g.id === booking.guestId);
    if (!guest) {
      setLoginError("Guest profile not found for this booking.");
      return;
    }

    const fullNameLower = guest.name.toLowerCase();
    if (!fullNameLower.includes(lName)) {
      setLoginError(`The Last Name "${loginLastName}" does not match the registered guest for this Booking ID.`);
      return;
    }

    setIsGuestLoggedIn(true);
    setSelectedBookingId(booking.id);
    setActiveTab("checkin"); // Set "Mandatory E-CheckIn" as first screen
  };

  // Room Upgrade flow state
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState<any>(null);
  const [upgradeError, setUpgradeError] = useState("");
  const [offerSuccessMsg, setOfferSuccessMsg] = useState("");

  const handleRequestSpecialOffer = async (offerType: string, itemName: string, category: "service" | "tour") => {
    const b = bookings.find(x => x.id === selectedBookingId);
    if (!b) return;
    const g = guests.find(x => x.id === b.guestId);
    
    try {
      if (category === "service") {
        await onAddRequest({
          bookingId: b.id,
          guestName: g ? g.name : "Valued Guest",
          roomId: b.roomId || "101",
          requestType: itemName,
          comments: `Requested via Guest Special Offers tab (${offerType})`
        });
      } else {
        await onAddInquiry({
          guestId: b.id,
          guestName: g ? g.name : "Valued Guest",
          tourType: itemName,
          notes: `Requested via Guest Special Offers tab (${offerType})`,
          date: new Date().toISOString().split("T")[0]
        });
      }
      setOfferSuccessMsg(`✓ Your request for "${itemName}" has been successfully logged! Our concierge team will contact you shortly.`);
      setTimeout(() => setOfferSuccessMsg(""), 6500);
    } catch (err) {
      console.error(err);
    }
  };

  const activeBooking = bookings.find(b => b.id === selectedBookingId);
  const activeGuest = activeBooking ? guests.find(g => g.id === activeBooking.guestId) : null;
  const activeRoomType = activeBooking ? roomTypes.find(rt => rt.id === activeBooking.roomTypeId) : null;

  // Handle selected booking from search lookup redirect
  const handleBookingSelectFromLookup = (bId: string) => {
    setSelectedBookingId(bId);
    setActiveTab("concierge");
  };

  // Billing items calculation for invoice
  const calculateInvoice = (b: Booking) => {
    const d1 = new Date(b.checkInDate);
    const d2 = new Date(b.checkOutDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const rt = roomTypes.find(type => type.id === b.roomTypeId);
    const baseTariff = rt?.basePrice || 3500;
    const baseTotal = baseTariff * nights;

    // Transport cost
    const transportTotal = b.transport && b.transport.vehicleType ? (b.transport.cost || 500) : 0;

    // Other service lines
    const customLines = b.customServiceLines || [];
    const otherTotal = customLines.reduce((sum, line) => sum + line.amount, 0);

    const subtotal = baseTotal + transportTotal + otherTotal;

    // Discounts
    let discount = b.discountAmount || 0;
    if (b.discountPercent) {
      discount = Math.round(subtotal * (b.discountPercent / 100));
    }

    const netTaxable = Math.max(0, subtotal - discount);
    const gstRate = b.gstRate || 12;
    const gstValue = Math.round(netTaxable * (gstRate / 100));
    const grandPayable = netTaxable + gstValue;

    // Payments made
    const paidAmount = b.paymentStatus === "Paid" ? grandPayable : (b.status === "Moved To Billing" ? 0 : Math.round(grandPayable * 0.4));
    const pendingBalance = Math.max(0, grandPayable - paidAmount);

    return {
      nights,
      baseTariff,
      baseTotal,
      transportTotal,
      customLines,
      otherTotal,
      subtotal,
      discount,
      netTaxable,
      gstRate,
      gstValue,
      grandPayable,
      paidAmount,
      pendingBalance
    };
  };

  const handleUpgradeClick = async (targetRoomType: RoomType, dailyDiff: number) => {
    if (!activeBooking) return;
    setIsUpgrading(true);
    setUpgradeError("");
    setUpgradeSuccess(null);

    try {
      const result = await onRoomUpgrade(activeBooking.id, {
        newRoomTypeId: targetRoomType.id,
        upgradeCost: dailyDiff
      });

      if (result && result.success) {
        setUpgradeSuccess({
          oldName: activeRoomType?.name || "Original Tier",
          newName: targetRoomType.name,
          bookingId: activeBooking.id,
          costDiff: dailyDiff
        });
      } else {
        setUpgradeError(result?.error || "We could not secure the room upgrade at this time. Please contact front desk.");
      }
    } catch (err) {
      setUpgradeError("Connection failure while dispatching room upgrade. Please retry.");
    } finally {
      setIsUpgrading(false);
    }
  };

  // Build the tabs array dynamically, respecting feature toggles inside hotelConfig.ts
  const tabs = [
    { id: "checkin", label: "📝 Web Check-In", desc: "Pre-arrival check-in (Recommended)" },
    { id: "lookup", label: "📋 My Booking & Stay Details", desc: "View status & room metadata" },
    ...(hotelConfig.guestPortalFeatures.enableRoomUpgradeOffers ? [
      { id: "upgrade", label: "⭐ Room Upgrades & Offers", desc: "Unlock exclusive hotel benefits" }
    ] : []),
    { id: "concierge", label: "🛎️ Concierge & Inn Requests", desc: "Order towels, mineral water, services" },
    ...(hotelConfig.guestPortalFeatures.enableDiningReservations ? [
      { id: "dining", label: "🍽️ Food & Room Service", desc: "Savor local cuisine & menu orders" }
    ] : []),
    ...(hotelConfig.guestPortalFeatures.enableTours ? [
      { id: "transport", label: "🚕 Transport & Local Tours", desc: "Schedule cabs or temple excursions" }
    ] : []),
    { id: "invoice", label: "💳 Live Bill & GST Ledger", desc: "Invoice details & PDF download" },
    { id: "reviews", label: "⭐ Stay Feedback & Reviews", desc: "Rate your experience with us" },
    { id: "profile", label: "👤 Profile & Stay History", desc: "View loyalty records & details" }
  ];

  // Guest Journey Timeline progress helper
  const renderGuestJourneyTracker = (booking: Booking) => {
    const status = booking.status;
    const checkinStatus = (booking as any).webCheckInStatus;

    let currentStep = 0; // Booking Confirmed

    if (status === "Checked Out" || status === "Moved To Billing" || status === "Closed") {
      currentStep = 5; // Checked Out
    } else if (status === "Checked In") {
      currentStep = 4; // Checked In
    } else if (checkinStatus === "Verified") {
      currentStep = 3; // Front Desk Approved
    } else if (checkinStatus === "Pending Verification") {
      currentStep = 2; // Documents Submitted
    } else if (checkinStatus === "Rejected" || checkinStatus === "Re-upload Required") {
      currentStep = 1; // Web Check-In Pending
    } else {
      currentStep = 1; // Web Check-In Pending
    }

    const steps = [
      { label: "Booking Confirmed", desc: "Reservation secured" },
      { label: "Web Check-In Pending", desc: "Upload verification ID" },
      { label: "Documents Submitted", desc: "Under front desk review" },
      { label: "Front Desk Approved", desc: "Verified & ready" },
      { label: "Checked In", desc: "In-house residency" },
      { label: "Checked Out", desc: "Stay complete" }
    ];

    return (
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs mb-8">
        <h3 className="font-sans font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" /> Guest Journey Tracker
        </h3>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-2 relative">
          {/* Progress Line */}
          <div className="absolute top-[18px] left-[5%] right-[5%] h-[2px] bg-slate-200 dark:bg-slate-850 hidden md:block z-0" />
          {/* Active Progress Line */}
          <div 
            className="absolute top-[18px] left-[5%] h-[2px] bg-amber-500 hidden md:block z-0 transition-all duration-500" 
            style={{ width: `${(currentStep / 5) * 90}%` }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            const isAttention = step.label === "Web Check-In Pending" && (checkinStatus === "Rejected" || checkinStatus === "Re-upload Required");

            return (
              <div key={idx} className="flex md:flex-col items-center md:text-center gap-3 md:gap-1.5 flex-1 z-10 relative">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                    isCompleted 
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10" 
                      : isActive 
                      ? isAttention 
                        ? "bg-rose-500 border-rose-500 text-white animate-pulse" 
                        : "bg-amber-500 border-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10" 
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <div className="text-left md:text-center">
                  <span className={`text-[11px] font-bold block ${isActive ? "text-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                    {isAttention ? (checkinStatus === "Rejected" ? "ID Flagged / Rejected" : "Re-upload Required") : step.label}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-mono">
                    {isAttention ? "Please upload a new ID" : step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isGuestLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans text-xs">
        {/* Title Header Block */}
        <div className="bg-gradient-to-r from-amber-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl mb-8">
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-stone-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-2xl mx-auto py-4">
            <span className="bg-amber-500/20 text-amber-350 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase mb-4 inline-block">
              🛎️ guest.bharattravels.online
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">My Stay</h1>
            <p className="text-amber-100/85 text-xs sm:text-sm mt-2 max-w-lg mx-auto leading-relaxed">
              Verify your hotel reservation details to unlock recommended e-checkin, order custom concierge requests, view dynamic billing ledgers, or purchase suite upgrades.
            </p>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8">
          
          {/* Tabs for Login Type */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-6">
            <button
              onClick={() => {
                setLoginMode("otp");
                setLoginError("");
                setLoginSuccess("");
              }}
              className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                loginMode === "otp"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              🔑 Mobile Number + OTP
            </button>
            <button
              onClick={() => {
                setLoginMode("lastname");
                setLoginError("");
                setLoginSuccess("");
              }}
              className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                loginMode === "lastname"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              📄 Booking ID + Last Name
            </button>
          </div>

          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
            <span>{loginMode === "otp" ? "Primary Mobile Verification" : "Fallback Last Name Lookup"}</span>
          </h2>
          <p className="text-slate-550 dark:text-slate-400 text-[11px] mb-6 leading-relaxed">
            {loginMode === "otp" 
              ? "Verify your booking reference using your registered mobile phone and a simulated 4-digit OTP code."
              : "Access your virtual lobby key cards directly using your booking reference and your registered last name."}
          </p>

          <form onSubmit={loginMode === "otp" ? (otpSent ? handleVerifyLoginOtp : handleRequestOtp) : handleLastNameLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-1">Booking Reference ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">🎫</span>
                <input
                  type="text"
                  placeholder="e.g. BK-1002"
                  value={loginBookingId}
                  onChange={(e) => setLoginBookingId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs font-mono font-bold tracking-wider text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors uppercase"
                />
              </div>
            </div>

            {loginMode === "otp" ? (
              <>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-1">Registered Mobile Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">📱</span>
                    <input
                      type="text"
                      disabled={otpSent}
                      placeholder="e.g. +91 98300 12345"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="animate-fade-in space-y-2">
                    <label className="block text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider mb-1">Simulated 4-Digit OTP Code</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">🛡️</span>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Enter 4-digit code"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-amber-500 rounded-xl py-2.5 pl-9 pr-4 text-xs font-mono font-bold tracking-widest text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors animate-pulse"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-1">Registered Last Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">👤</span>
                  <input
                    type="text"
                    placeholder="e.g. Mukherjee"
                    value={loginLastName}
                    onChange={(e) => setLoginLastName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {loginError && (
              <div className="p-3 bg-rose-550/10 bg-rose-50 border border-rose-200 text-rose-600 dark:text-rose-400 rounded-xl font-medium text-xs">
                ⚠️ {loginError}
              </div>
            )}

            {loginSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 dark:text-emerald-400 rounded-xl font-medium text-xs font-mono select-all">
                {loginSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={isSendingOtp}
              className="w-full py-3 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-650 hover:text-white hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSendingOtp ? (
                <>
                  <span className="animate-spin text-sm">⏳</span> Sending Simulated Code...
                </>
              ) : loginMode === "otp" ? (
                otpSent ? "Verify Code & Enter My Stay 🔓" : "Send Verification OTP SMS 📲"
              ) : (
                "Unlock My Stay 🔓"
              )}
            </button>
          </form>

          {/* Quick Demo Assist */}
          <div className="mt-8 pt-6 border-t border-slate-150 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">Simulated Demo Credentials</span>
            <div className="flex flex-col gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <div className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800 pb-1.5">
                <span>Ref: <strong className="text-slate-700 dark:text-slate-300">BK-1002</strong> (Mukherjee)</span>
                <button 
                  onClick={() => {
                    setLoginBookingId("BK-1002");
                    setLoginPhone("+91 98300 12345");
                    setLoginLastName("Mukherjee");
                  }} 
                  className="text-amber-600 hover:underline font-bold"
                >
                  Load Demo 1
                </button>
              </div>
              <div className="flex justify-between">
                <span>Ref: <strong className="text-slate-700 dark:text-slate-300">BK-1004</strong> (Sengupta)</span>
                <button 
                  onClick={() => {
                    setLoginBookingId("BK-1004");
                    setLoginPhone("+91 98311 54321");
                    setLoginLastName("Sengupta");
                  }} 
                  className="text-amber-600 hover:underline font-bold"
                >
                  Load Demo 2
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans text-xs">
      
      {/* Title Header Block */}
      <div className="bg-gradient-to-r from-amber-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl mb-8">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-stone-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-500/20 text-amber-350 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase">
                🛎️ guest.bharattravels.online
              </span>
              <span className="bg-slate-700/60 text-slate-300 text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-full border border-slate-650">
                /guest
              </span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight font-sans text-white">Grand Crest Guest Experience Hub</h1>
            <p className="text-amber-100/85 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Unlock room access codes, summon instant room supplies, plan temple private tours, check ledger billing transactions, and provide ratings.
            </p>
          </div>

          {/* AUTHENTICATED PROFILE DISPLAY */}
          {isGuestLoggedIn && activeBooking && activeGuest ? (
            <div className="flex items-center gap-3 bg-emerald-950/45 p-4 rounded-2xl border border-emerald-500/20 backdrop-blur-xs min-w-[240px]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
                👤
              </div>
              <div className="overflow-hidden grow">
                <span className="text-[9px] text-emerald-400 font-mono tracking-wider block uppercase font-bold">Authenticated Guest</span>
                <span className="text-white font-bold text-xs block truncate">{activeGuest.name}</span>
                <span className="text-[10px] text-emerald-300/80 font-mono block">ID: {activeBooking.id} • Room {activeBooking.roomId || "Assigning"}</span>
              </div>
              <button 
                onClick={() => {
                  setIsGuestLoggedIn(false);
                  setSelectedBookingId("");
                }}
                className="px-2.5 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 rounded-lg text-[9px] uppercase font-bold tracking-wider font-mono transition-colors cursor-pointer shrink-0"
                title="Log Out of Portal"
              >
                Exit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-slate-950/30 p-4 rounded-2xl border border-white/5 backdrop-blur-xs min-w-[240px]">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold shrink-0">
                🛎️
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] text-amber-350 font-mono tracking-wider block uppercase font-bold">Acting Hotel Guest</span>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="bg-transparent border-none text-white font-bold text-xs focus:ring-0 focus:outline-none w-full pl-0 select-text font-mono"
                >
                  {bookings.map(b => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                      {b.id} - Room {b.roomId || "Pending"} ({guests.find(g => g.id === b.guestId)?.name || b.guestId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GUEST JOURNEY TIMELINE TRACKER */}
      {isGuestLoggedIn && activeBooking && renderGuestJourneyTracker(activeBooking)}

      {/* Guest Tabs Nav */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-8 flex overflow-x-auto gap-2 pb-1 bg-white dark:bg-slate-900/45 p-2 rounded-2xl border dark:border-slate-800 shadow-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-3 px-4 rounded-xl text-left transition-all shrink-0 cursor-pointer flex flex-col justify-center min-w-[185px] ${
                isActive
                  ? "bg-amber-650 text-white shadow-md shadow-amber-600/20"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="text-[12px] font-bold block">{tab.label}</span>
                {tab.id === "checkin" && (
                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md font-mono tracking-wider shrink-0 ${
                    (activeBooking as any)?.webCheckInStatus === "Verified" || (activeBooking as any)?.webCheckInStatus === "Pending Verification"
                      ? isActive ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : isActive ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}>
                    {(activeBooking as any)?.webCheckInStatus === "Verified" || (activeBooking as any)?.webCheckInStatus === "Pending Verification"
                      ? "Completed"
                      : "Recommended"}
                  </span>
                )}
              </div>
              <span className={`text-[9px] block mt-0.5 ${isActive ? "text-amber-100 font-mono" : "text-slate-400 font-mono"}`}>
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Guest Views Container */}
      <div className="transition-all duration-300 text-xs">
        
        {/* TAB 1: CONCIERGE & INN REQUESTS */}
        {activeTab === "concierge" && (
          <div className="space-y-6">
            <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <span className="font-bold uppercase tracking-wider block font-mono">Instant Concierge Sync:</span>
                <p>
                  Any requests sent here are automatically dispatched as background callbacks to the property database and show up instantly at the front desk and operations terminals under <strong className="font-mono">ops.bharattravels.online</strong>.
                </p>
              </div>
            </div>

            <GuestServicePortal
              bookings={bookings}
              guests={guests}
              onAddRequest={onAddRequest}
              onAddInquiry={onAddInquiry}
              onAddFeedback={onAddFeedback}
              activeRequests={serviceRequests}
              activeInquiries={tourismInquiries}
              onNavigateTab={(targetTab) => {
                setActiveTab(targetTab as any);
              }}
              initialSegment="services"
              preselectedBookingId={selectedBookingId}
            />
          </div>
        )}

        {/* TAB 2: ROOM UPGRADE REVENUE ENGINE */}
        {activeTab === "upgrade" && hotelConfig.guestPortalFeatures.enableRoomUpgradeOffers && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="text-center max-w-xl mx-auto">
              <span className="font-mono text-xs tracking-wider text-amber-600 dark:text-amber-400 uppercase font-bold">
                Luxury Revenue Engine
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Smart Room Upgrade Lounge</h2>
              <p className="text-slate-550 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
                Relocate your stay to one of our beachfront luxury penthouses or executive club rooms. Any modifications update your billing invoice ledger automatically.
              </p>
            </div>

            {/* Check Active Booking */}
            {!activeBooking ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-205 dark:border-slate-805 p-12 text-center text-slate-450 italic font-mono">
                Please select your active hotel reservation in the top right selector block to view premium room upgrade offers.
              </div>
            ) : upgradeSuccess ? (
              /* Success confetti block */
              <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-805 p-8 rounded-3xl text-center space-y-6 max-w-xl mx-auto">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto border border-emerald-200">
                  ✓
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upgrade Confirmed & Complete!</h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Your luxury stay modification was logged on the hotel Property Management System.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-800 text-left space-y-2.5 font-mono text-[11px]">
                  <div className="flex justify-between"><span>Booking Code:</span><span className="font-bold">{upgradeSuccess.bookingId}</span></div>
                  <div className="flex justify-between"><span>Previous Class:</span><span className="line-through text-slate-400">{upgradeSuccess.oldName}</span></div>
                  <div className="flex justify-between"><span>New Premium Class:</span><span className="text-emerald-700 font-bold">{upgradeSuccess.newName}</span></div>
                  <div className="flex justify-between"><span>Extra Tariff Rate:</span><span className="font-bold">₹{upgradeSuccess.costDiff.toLocaleString()} / Night</span></div>
                  <div className="flex justify-between"><span>SLA Notification:</span><span className="text-indigo-650 font-semibold">Housekeeping Dispatched for Key Lock Change</span></div>
                </div>

                <button
                  onClick={() => {
                    setUpgradeSuccess(null);
                    setActiveTab("invoice");
                  }}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-md"
                >
                  View Updated Ledger Invoice →
                </button>
              </div>
            ) : (
              /* Upgrade catalogue */
              <div className="space-y-6">
                
                {/* Active booking category hold */}
                <div className="bg-slate-900 text-white p-5 rounded-2.5xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-bold">CURRENT CATEGORY HOLD</span>
                    <h4 className="text-sm font-bold font-sans">{activeRoomType?.name || "Standard Room"}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Assigned Room: <strong className="text-white">Room {activeBooking.roomId || "Pending check-in hold"}</strong></p>
                  </div>
                  <div className="text-right text-xs font-mono">
                    <p className="text-slate-400">Paid Base Rate: ₹{activeRoomType?.basePrice.toLocaleString()} / Night</p>
                    <p className="text-amber-400 font-bold">Eligible for Luxury Upgrade Offers ✓</p>
                  </div>
                </div>

                {upgradeError && (
                  <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="font-bold">{upgradeError}</span>
                  </div>
                )}

                {/* Filter eligible higher tiers */}
                {(() => {
                  const currentPrice = activeRoomType?.basePrice || 0;
                  const eligibleUpgrades = roomTypes.filter(rt => rt.basePrice > currentPrice);
                  
                  const d1 = new Date(activeBooking.checkInDate);
                  const d2 = new Date(activeBooking.checkOutDate);
                  const diffTime = Math.abs(d2.getTime() - d1.getTime());
                  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

                  if (eligibleUpgrades.length === 0) {
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-slate-205 p-12 text-center rounded-3xl space-y-4">
                        <Flame className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
                        <h4 className="font-bold text-sm">You are on our Finest Tier!</h4>
                        <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                          You are currently holding reservation <strong>{activeBooking.id}</strong> in the <strong>{activeRoomType?.name}</strong> category. There are no higher accommodation classes available in the resort inventory!
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {eligibleUpgrades.map(rt => {
                        const dailyDiff = rt.basePrice - currentPrice;
                        const totalUpgradeCharge = dailyDiff * nights;
                        
                        // Pull dynamic inventory from rooms list
                        const availableRoomUnits = rooms.filter(r => r.roomTypeId === rt.id && r.status === "Available");
                        const countAvailable = availableRoomUnits.length;

                        return (
                          <div 
                            key={rt.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="relative h-44 bg-slate-100 overflow-hidden">
                                <img 
                                  src={rt.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80"}
                                  alt={rt.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-mono px-2.5 py-1 rounded-lg uppercase font-bold tracking-widest">
                                  {rt.id} class
                                </div>

                                {/* Dynamic Inventory Tag */}
                                <div className="absolute bottom-3 right-3">
                                  {countAvailable > 0 ? (
                                    <span className="px-2 py-1 bg-emerald-600 text-white font-mono text-[9px] uppercase font-extrabold rounded-lg shadow-sm animate-pulse">
                                      ✓ {countAvailable} Rooms Ready
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-amber-500 text-stone-950 font-mono text-[9px] uppercase font-extrabold rounded-lg shadow-sm">
                                      ⚠️ Guaranteed Hold hold
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-bold text-sm text-slate-855 dark:text-slate-100">{rt.name}</h3>
                                  <div className="text-right">
                                    <p className="font-bold text-indigo-700 dark:text-indigo-400 text-sm font-mono">+₹{dailyDiff.toLocaleString()}/N</p>
                                    <p className="text-[9px] text-slate-400">Tariff Delta</p>
                                  </div>
                                </div>

                                <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{rt.description}</p>

                                {/* Amenities Bullet Row */}
                                <div className="flex flex-wrap gap-1 pt-2">
                                  {rt.amenities.map(amenity => (
                                    <span 
                                      key={amenity}
                                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-[9.5px] rounded-md font-sans border border-slate-200/50"
                                    >
                                      ✓ {amenity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="p-5 border-t border-slate-100 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between gap-4">
                              <div className="font-mono text-[10px] text-slate-500">
                                <p>Duration: <span className="text-slate-900 dark:text-white font-bold">{nights} Night{nights > 1 ? "s" : ""}</span></p>
                                <p className="mt-0.5">Total Addon: <span className="text-indigo-650 dark:text-indigo-400 font-bold">₹{totalUpgradeCharge.toLocaleString()}</span></p>
                              </div>

                              <button
                                type="button"
                                disabled={isUpgrading}
                                onClick={() => handleUpgradeClick(rt, dailyDiff)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                              >
                                {isUpgrading ? "Securing stay..." : `Claim Upgrade ✓`}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* SPECIAL RESORT OFFERS SECTION */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 mt-10">
                  <div className="mb-6 text-left">
                    <span className="font-mono text-[10px] tracking-widest text-amber-600 dark:text-amber-400 font-bold uppercase block">
                      Enhance Your Experience
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">⭐ Special Offers & Custom Packages</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      Settle your preferences early or add specialized services to your upcoming stay. Any approved requests register directly on our concierge system.
                    </p>
                  </div>

                  {offerSuccessMsg && (
                    <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-850 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-start gap-2.5 shadow-xs animate-fade-in font-sans">
                      <span className="text-lg">✨</span>
                      <div className="text-[11.5px] font-medium leading-relaxed">{offerSuccessMsg}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Offer 1: Late Checkout */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all text-left">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-xl shrink-0">
                          🕒
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Late Check-out Extension</h4>
                        <p className="text-slate-500 text-[11px] leading-relaxed">
                          Extend your check-out buffer from {hotelConfig.policies.checkOutTime} to 2:00 PM to enjoy an extra afternoon at the beach.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-300">₹1,000 / Stay</span>
                        <button
                          onClick={() => handleRequestSpecialOffer("Late Check-out", "Late Checkout (2:00 PM Extension)", "service")}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-750 text-white font-bold text-[10.5px] rounded-xl transition-all cursor-pointer"
                        >
                          Request
                        </button>
                      </div>
                    </div>

                    {/* Offer 2: Early Checkin */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all text-left">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xl shrink-0">
                          🌅
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Early Check-in Access</h4>
                        <p className="text-slate-500 text-[11px] leading-relaxed">
                          Arrive and check in as early as 9:00 AM with guaranteed priority room preparation and morning luggage handling.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-300">₹1,200 / Stay</span>
                        <button
                          onClick={() => handleRequestSpecialOffer("Early Check-in", "Early Check-In (9:00 AM Access)", "service")}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-750 text-white font-bold text-[10.5px] rounded-xl transition-all cursor-pointer"
                        >
                          Request
                        </button>
                      </div>
                    </div>

                    {/* Offer 3: Spa Package */}
                    {hotelConfig.guestPortalFeatures.enableSpa && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all text-left">
                        <div className="space-y-2">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                            🌸
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Royal Ayurvedic Spa</h4>
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            Indulge in an authentic 90-minute full-body healing massage session with customized medicinal herbal oils.
                          </p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-300">From ₹2,500</span>
                          <button
                            onClick={() => handleRequestSpecialOffer("Spa Package", "Royal Ayurvedic Spa 90-Min Session", "service")}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-750 text-white font-bold text-[10.5px] rounded-xl transition-all cursor-pointer"
                          >
                            Book Spa
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Offer 4: Dining Package */}
                    {hotelConfig.guestPortalFeatures.enableDiningReservations && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all text-left">
                        <div className="space-y-2">
                          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center text-xl shrink-0">
                            🍽️
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Culinary Feast & Dining</h4>
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            Savor clay-pot vegetarian Odia thalis or fresh seafood platters harvested directly from Chilika Lake.
                          </p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-300">From ₹1,800</span>
                          <button
                            onClick={() => handleRequestSpecialOffer("Dining Package", "Mahodadhi Spice Dining reservation", "service")}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-750 text-white font-bold text-[10.5px] rounded-xl transition-all cursor-pointer"
                          >
                            Reserve
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Offer 5: Airport Transfer */}
                    {hotelConfig.guestPortalFeatures.enableTransport && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all text-left">
                        <div className="space-y-2">
                          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center text-xl shrink-0">
                            🚕
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Airport / Station Shuttle</h4>
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            Chauffeur-driven luxury AC sedan transfer directly from Bhubaneswar Airport (BBI) or central railway station.
                          </p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-300">₹2,200 / Way</span>
                          <button
                            onClick={() => handleRequestSpecialOffer("Airport Transfer", "Airport Transfer Sedan Shuttle", "service")}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-750 text-white font-bold text-[10.5px] rounded-xl transition-all cursor-pointer"
                          >
                            Schedule
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Offer 6: Seasonal Experience */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all text-left">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-xl shrink-0">
                          ✨
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Beach Sand Art Lesson</h4>
                        <p className="text-slate-500 text-[11px] leading-relaxed">
                          Join national award-winning artisans for an exclusive private sand sculpture workshop on Puri's golden sands.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-300">Complimentary</span>
                        <button
                          onClick={() => handleRequestSpecialOffer("Seasonal Experience", "Beach Sand Art Masterclass Tour", "tour")}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-750 text-white font-bold text-[10.5px] rounded-xl transition-all cursor-pointer"
                        >
                          Book Art
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 3: E-CHECKIN */}
        {activeTab === "checkin" && (
          <div className="space-y-6">
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex items-start gap-3 text-left">
              <span className="text-xl">🔒</span>
              <div className="text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <span className="font-bold uppercase tracking-wider block font-mono">Recommended E-Checkin:</span>
                <p>
                  Submit your details and travel document proofs in advance to skip physical queues at the front desk reception on arrival. Your submission stays completely optional and secure.
                </p>
              </div>
            </div>

            <ECheckInPortal
              bookings={bookings}
              guests={guests}
              onUploadCheckin={onUploadCheckin}
              preselectedBookingId={selectedBookingId}
            />
          </div>
        )}

        {/* TAB 2: MY BOOKING & STAY DETAILS */}
        {activeTab === "lookup" && (
          <div className="space-y-6 text-left">
            {activeBooking && activeGuest ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-5 gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase font-bold tracking-wider">CONFIRMED STAY DETAILS</span>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">Booking ID: {activeBooking.id}</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 text-[10px] uppercase font-bold font-mono tracking-wider rounded-lg ${
                      activeBooking.status === "Checked In" 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                        : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                    }`}>
                      {activeBooking.status}
                    </span>
                    <span className={`px-3 py-1 text-[10px] uppercase font-bold font-mono tracking-wider rounded-lg ${
                      activeBooking.paymentStatus === "Paid" 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}>
                      {activeBooking.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Guest details */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Primary Guest</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{activeGuest.name}</p>
                    <p className="text-slate-550 font-mono text-[11px]">{activeGuest.phone}</p>
                    <p className="text-slate-550 font-mono text-[11px]">{activeGuest.email}</p>
                  </div>

                  {/* Room details */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Room & Type</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      Room {activeBooking.roomId || "Assigning on arrival"}
                    </p>
                    <p className="text-slate-500 text-[11px] font-semibold">{activeRoomType?.name || "Standard Room"}</p>
                    {activeRoomType && (
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        {(activeRoomType as any).roomSize || "Spacious layout"} • {(activeRoomType as any).bedType || "King Bed"} • {(activeRoomType as any).roomView || "Scenic View"}
                      </p>
                    )}
                  </div>

                  {/* Date/Time info */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Stay Duration</span>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Check-In</span>
                        <p className="font-bold text-slate-900 dark:text-white">{activeBooking.checkInDate}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{hotelConfig.policies.checkInTime}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Check-Out</span>
                        <p className="font-bold text-slate-900 dark:text-white">{activeBooking.checkOutDate}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{hotelConfig.policies.checkOutTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                 {activeRoomType && (
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-2">Room Amenities Included</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeRoomType.amenities.map((feat: string) => (
                        <span key={feat} className="px-2.5 py-1 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-[10px] font-medium rounded-lg border border-amber-500/10">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <BookingLookupPortal
                bookings={bookings}
                guests={guests}
                roomTypes={roomTypes}
                setTab={(tabName) => {
                  if (tabName === "echeckin") {
                    setActiveTab("checkin");
                  } else if (tabName === "portal") {
                    setActiveTab("concierge");
                  }
                }}
                onSelectBookingForCheckin={(bId) => {
                  setSelectedBookingId(bId);
                  setActiveTab("checkin");
                }}
              />
            )}
          </div>
        )}

        {/* TAB 5: FOOD, DINING & ROOM SERVICE */}
        {activeTab === "dining" && (
          <div className="space-y-6 text-left">
            <div className="text-center max-w-xl mx-auto">
              <span className="font-mono text-xs tracking-wider text-amber-600 dark:text-amber-400 uppercase font-bold">
                Culinary Room Service
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">🍽️ Savor Coastal Odia Delicacies</h2>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                Order authentic meals from {hotelConfig.dining?.[0]?.restaurantName || "Mahodadhi Spice Restaurant"} delivered straight to your room, or pre-book a table.
              </p>
            </div>

            {offerSuccessMsg && (
              <div className="max-w-4xl mx-auto p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-850 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-start gap-2.5 shadow-xs font-sans">
                <span className="text-lg">✨</span>
                <div className="text-[11.5px] font-medium leading-relaxed">{offerSuccessMsg}</div>
              </div>
            )}

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Menu Column */}
              <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 rounded-3xl p-6 space-y-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <span>🍲</span>
                  <span>Signature Coastal Menu</span>
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { name: "Clay-Pot Vegetarian Thali", price: 350, desc: "Dalma, Saaga, Kanika rice, and spiced tomato khata.", icon: "🍚" },
                    { name: "Golden Sea Bass Fry", price: 550, desc: "Crispy pan-fried fish marinated in native coastal spices.", icon: "🐟" },
                    { name: "Chilika Crab Saffron Curry", price: 750, desc: "Fresh lagoon crabs simmered in a mild ginger saffron coconut cream.", icon: "🦀" },
                    { name: "Sacred Puri Khaja Sweet Platter", price: 180, desc: "Crisp layered ghee-fried pastry glaze with cardamom syrup.", icon: "🍮" }
                  ].map((dish) => (
                    <div key={dish.name} className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850/60 hover:border-slate-200 transition-all items-start justify-between">
                      <div className="flex gap-3">
                        <span className="text-2xl mt-0.5">{dish.icon}</span>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{dish.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{dish.desc}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-2">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-300 text-xs">₹{dish.price}</span>
                        <button
                          onClick={() => handleRequestSpecialOffer("Room Service Order", dish.name, "service")}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                        >
                          Order Room
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Info/Policy */}
              <div className="space-y-6">
                <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    RESTAURANT RESERVATIONS
                  </span>
                  <h4 className="text-sm font-bold mt-1">Priority Table Booking</h4>
                  <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                    Reserve a premium window-side table with beach sunset views. Table reservations are complementary for our checked-in guests.
                  </p>

                  <button
                    onClick={() => handleRequestSpecialOffer("Dining Reservation", "Mahodadhi Restaurant Priority Table Reservation", "service")}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl mt-5 transition-all shadow-md shadow-amber-600/15 cursor-pointer"
                  >
                    Reserve Table Now ✓
                  </button>

                  <div className="border-t border-slate-800 pt-4 mt-5 space-y-2 text-[10px] font-mono text-slate-450">
                    <p>🕒 Breakfast: 7:00 AM - 10:30 AM</p>
                    <p>🕒 Lunch: 12:30 PM - 3:30 PM</p>
                    <p>🕒 Dinner: 7:00 PM - 11:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TRANSPORT & LOCAL TOURS */}
        {activeTab === "transport" && (
          <div className="space-y-6">
            <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex items-start gap-3 text-left">
              <span className="text-xl">🚕</span>
              <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <span className="font-bold uppercase tracking-wider block font-mono">Puri Sightseeing & Cabs:</span>
                <p>
                  Plan temple visits, sand museum tours, or schedule airport cabs instantly. All travel requests are dispatched directly to the front desk transport coordinators.
                </p>
              </div>
            </div>

            <GuestServicePortal
              bookings={bookings}
              guests={guests}
              onAddRequest={onAddRequest}
              onAddInquiry={onAddInquiry}
              onAddFeedback={onAddFeedback}
              activeRequests={serviceRequests}
              activeInquiries={tourismInquiries}
              onNavigateTab={(targetTab) => {
                setActiveTab(targetTab as any);
              }}
              initialSegment="tourism"
              preselectedBookingId={selectedBookingId}
            />
          </div>
        )}

        {/* TAB 9: PROFILE & STAY HISTORY */}
        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto space-y-6 text-left">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white text-2xl font-bold font-sans shadow-inner">
                    {activeGuest ? activeGuest.name[0] : "G"}
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {activeGuest ? activeGuest.name : "Valued Hotel Guest"}
                    </h2>
                    <p className="text-slate-550 text-xs font-mono">
                      Loyalty Tier: <span className="text-amber-600 dark:text-amber-400 font-bold">Gold Sanctuary Member</span>
                    </p>
                  </div>
                </div>

                <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/15 border border-amber-500/20 rounded-2xl flex items-center gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-lg">★</span>
                  <div>
                    <p className="text-[10px] text-amber-800 dark:text-amber-300 font-bold tracking-wider uppercase font-mono">MEMBER POINTS</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">4,850 Sanctuary Pts</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 block">Personal Profile Data</h3>
                  <div className="space-y-2.5 text-xs text-slate-705 dark:text-slate-300">
                    <p>Phone: <span className="font-mono font-bold text-slate-900 dark:text-slate-100 ml-1">{activeGuest ? activeGuest.phone : "N/A"}</span></p>
                    <p>Email: <span className="font-mono font-bold text-slate-900 dark:text-slate-100 ml-1">{activeGuest ? activeGuest.email : "N/A"}</span></p>
                    <p>Govt ID Audited: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 ml-1">✓ Verified (Aadhaar Card)</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 block">Simulated Stay History</h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Grand Crest Resort, Puri</p>
                        <p className="text-[10px] text-slate-500 font-mono">08-May-2025 to 11-May-2025</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono">Checked Out ✓</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Crest Beach Villas, Puri</p>
                        <p className="text-[10px] text-slate-500 font-mono">14-Jan-2025 to 16-Jan-2025</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono">Checked Out ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LIVE BILL & INVOICE DOWNLOAD */}
        {activeTab === "invoice" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Invoice display */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              {activeBooking ? (
                (() => {
                  const bill = calculateInvoice(activeBooking);
                  return (
                    <div className="space-y-6 text-xs">
                      <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-6">
                        <div>
                          <span className="text-xs font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
                            GST TAX LEDGER RECEIPT
                          </span>
                          <h3 className="text-xl font-bold font-sans mt-1 text-slate-900 dark:text-white">
                            Booking Invoice INV-2026-{activeBooking.id}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Status: <span className={`font-bold pl-1 ${activeBooking.paymentStatus === "Paid" ? "text-emerald-500" : "text-amber-500"}`}>{activeBooking.paymentStatus.toUpperCase()}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleExportInvoiceToPDF(activeBooking, activeGuest || undefined, activeRoomType || undefined)}
                          className="px-4 py-2 bg-slate-900 dark:bg-slate-850 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-800 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF Invoice</span>
                        </button>
                      </div>

                      {/* Guest info card */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-150 dark:border-slate-850">
                        <div className="text-xs font-mono space-y-1">
                          <span className="text-slate-400 block pb-0.5 text-[10px] uppercase">GUEST DETAILS:</span>
                          <p className="font-bold text-slate-800 dark:text-white">{activeGuest?.name || "Valued Guest"}</p>
                          <p className="text-slate-500">{activeGuest?.email || "N/A"}</p>
                          <p className="text-slate-500">{activeGuest?.phone || "N/A"}</p>
                        </div>
                        <div className="text-xs font-mono space-y-1">
                          <span className="text-slate-400 block pb-0.5 text-[10px] uppercase">STAY ITINERARY:</span>
                          <p className="font-bold text-slate-800 dark:text-white">Room {activeBooking.roomId || "Pending assignment"}</p>
                          <p className="text-slate-500">{activeRoomType?.name || "Suite Luxury Accommodation"}</p>
                          <p className="text-slate-500">{activeBooking.checkInDate} to {activeBooking.checkOutDate} ({bill.nights} Night{bill.nights > 1 ? "s" : ""})</p>
                        </div>
                      </div>

                      {/* Invoice Table list */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block font-mono">Charges Breakdown</span>
                        
                        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden text-xs">
                          <div className="bg-slate-50 dark:bg-slate-950/40 p-3 grid grid-cols-4 font-mono font-bold text-slate-500 uppercase border-b border-slate-150 dark:border-slate-850">
                            <span className="col-span-2">Item Description / Tariff</span>
                            <span className="text-center">Nights</span>
                            <span className="text-right">Total (INR)</span>
                          </div>

                          <div className="p-3 divide-y divide-slate-100 dark:divide-slate-855/60 space-y-2">
                            <div className="grid grid-cols-4 py-1.5">
                              <div className="col-span-2">
                                <p className="font-semibold text-slate-855 dark:text-slate-200">{activeRoomType?.name || "Luxury Accommodation"}</p>
                                <p className="text-[10px] text-slate-400 font-mono">Base Rate: ₹{bill.baseTariff.toLocaleString()}/night</p>
                              </div>
                              <span className="text-center self-center">{bill.nights}</span>
                              <span className="text-right self-center font-mono font-bold">₹{bill.baseTotal.toLocaleString()}</span>
                            </div>

                            {activeBooking.transport && activeBooking.transport.vehicleType && (
                              <div className="grid grid-cols-4 py-2.5">
                                <div className="col-span-2">
                                  <p className="font-semibold text-slate-855 dark:text-slate-200">Express Cab Pick-up Logistics</p>
                                  <p className="text-[10px] text-slate-400 font-mono">Vehicle: {activeBooking.transport.vehicleType}</p>
                                </div>
                                <span className="text-center self-center">1</span>
                                <span className="text-right self-center font-mono font-bold">₹{bill.transportTotal.toLocaleString()}</span>
                              </div>
                            )}

                            {(activeBooking.customServiceLines || []).map((line: any, idx: number) => (
                              <div key={idx} className="grid grid-cols-4 py-2.5 text-xs">
                                <div className="col-span-2">
                                  <p className="font-semibold text-slate-855 dark:text-slate-200">{line.title || line.description}</p>
                                  <p className="text-[10px] text-slate-450 font-mono">Concierge Service Charge</p>
                                </div>
                                <span className="text-center self-center">1</span>
                                <span className="text-right self-center font-mono font-bold">₹{Number(line.amount).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Calculations Blocks */}
                      <div className="border-t border-slate-150 dark:border-slate-850 pt-5 space-y-2.5 max-w-sm ml-auto text-xs font-mono">
                        <div className="flex justify-between text-slate-500">
                          <span>Cumulative Subtotal:</span>
                          <span>₹{bill.subtotal.toLocaleString()}</span>
                        </div>
                        {bill.discount > 0 && (
                          <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                            <span>Approved Rebate/Discounts:</span>
                            <span>-₹{bill.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-500">
                          <span>Net Taxable Charge:</span>
                          <span>₹{bill.netTaxable.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Luxury Stay GST ({bill.gstRate}%):</span>
                          <span>₹{bill.gstValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-850 pt-3">
                          <span>Grand Payable Total:</span>
                          <span>₹{bill.grandPayable.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Ledger Payments Logged:</span>
                          <span>-₹{bill.paidAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-amber-600 dark:text-amber-400 border-t border-dashed border-slate-200 dark:border-slate-800 pt-2.5">
                          <span>Net Due At Exit desk:</span>
                          <span>₹{bill.pendingBalance.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-12 text-slate-400 font-mono text-xs text-xs">
                  Please pick an active hotel booking in the top selector dropdown to audit live invoice bills.
                </div>
              )}
            </div>

            {/* Sidebar with payment policy */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Express QR UPI Checkout
                </span>
                <h4 className="text-base font-bold mt-1 text-white">Instant Settler Desk</h4>
                <p className="text-slate-450 text-[11px] mt-1.5 leading-relaxed">
                  Scan the dynamic Grand Crest UPI QR to bypass long queues. Payments register immediately in the reception terminals via webhook loops.
                </p>

                {/* Simulated QR block */}
                <div className="my-5 flex flex-col items-center justify-center p-4 bg-white rounded-xl max-w-[170px] mx-auto border border-white/5">
                  <div className="w-[120px] h-[120px] bg-slate-105 rounded-lg flex items-center justify-center relative border border-slate-200">
                    {/* Simulated vector QR lines */}
                    <div className="absolute inset-2 grid grid-cols-4 gap-1 opacity-80">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className={`rounded-sm ${i % 3 === 0 || i === 0 || i === 15 ? "bg-slate-900" : "bg-slate-200"}`} />
                      ))}
                    </div>
                    {/* Inner merchant scan box */}
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-[10px] font-bold text-white z-10 border border-white shadow-md">
                      🇮🇳
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono font-bold mt-2 uppercase tracking-wide">
                    Merchant Code: BT@UPI
                  </span>
                </div>

                <div className="space-y-2 border-t border-slate-850 pt-4 text-[10px] font-mono text-slate-400 text-xs">
                  <div className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-amber-450 shrink-0 mt-0.5" />
                    <span>Supports all Indian banking apps (GPay, PhonePe, Paytm, BHIM).</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-amber-450 shrink-0 mt-0.5" />
                    <span>Receive instant verified invoice receipt onto your registered email.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STAY FEEDBACK & REVIEWS */}
        {activeTab === "reviews" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
            {/* Reviews list */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                  SERVICE QUALITY INDEX
                </span>
                <h3 className="text-xl font-bold font-sans mt-0.5 text-slate-900 dark:text-white">
                  Live Customer Guest Reviews & Service Recovers
                </h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Real comments lodged by checked-out guests. Low ratings auto-trigger **Service Recovery Incident alerts** inside the Owner Dashboard to enforce high hospitality standards.
                </p>
              </div>

              {/* Feedbacks list */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {feedbacks.length === 0 ? (
                  <div className="text-center py-12 text-slate-450 font-mono text-xs italic text-xs">
                    No stays feedback logged yet in this session.
                  </div>
                ) : (
                  feedbacks.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-850 bg-slate-50/55 dark:bg-slate-950/20 text-xs flex flex-col gap-3.5 leading-relaxed"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{item.guestName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Assigned Room: {item.roomId} | Reference Booking: {item.bookingId}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg border border-amber-500/15">
                          <span className="text-[11px] font-bold font-mono">{item.rating}</span>
                          <span className="text-[10.5px]">★</span>
                        </div>
                      </div>

                      <p className="text-slate-600 dark:text-slate-350 italic text-[11.5px]">
                        "{item.comments}"
                      </p>

                      <div className="flex justify-between items-center text-[10px] font-mono border-t border-slate-100 dark:border-slate-850/60 pt-2.5">
                        <span className="text-slate-400">Lodged Category: <strong className="text-slate-600 dark:text-slate-300 font-bold">{item.issueCategory || "Quality Stay Review"}</strong></span>
                        
                        {item.isServiceRecovery ? (
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                            item.serviceRecoveryStatus === "Resolved"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 animate-pulse"
                          }`}>
                            Recovery: {item.serviceRecoveryStatus || "Pending"}
                          </span>
                        ) : (
                          <span className="text-emerald-500 uppercase font-bold text-xs">Standard feedback checked✓</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Lodge feedback form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                PROMPT SERVICE AUDIT
              </span>
              <h4 className="text-base font-bold mt-1 text-slate-900 dark:text-white">Lodge Stay Feedback</h4>
              <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">
                Provide real-time telemetry on room sanitization, air-conditioning performance, priest services, and buffet quality.
              </p>

              {/* Success alert */}
              {activeBooking ? (
                (() => {
                  const bill = calculateInvoice(activeBooking);
                  return (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const remarksInput = (e.currentTarget.elements.namedItem("comments") as HTMLTextAreaElement).value;
                        const ratingValInput = Number((e.currentTarget.elements.namedItem("rating") as HTMLSelectElement).value);
                        const categoryInput = (e.currentTarget.elements.namedItem("category") as HTMLSelectElement).value;

                        await onAddFeedback({
                          bookingId: activeBooking.id,
                          guestName: activeGuest?.name || "Anonymous Guest",
                          roomId: activeBooking.roomId || "101",
                          rating: ratingValInput,
                          comments: remarksInput,
                          issueCategory: categoryInput,
                          stayDates: `${activeBooking.checkInDate} to ${activeBooking.checkOutDate}`
                        });

                        (e.currentTarget.elements.namedItem("comments") as HTMLTextAreaElement).value = "";
                        alert("✓ Thank you! Feedback has been saved to the hotel database. If the rating is 1★ or 2★, a Service Recovery alarm has been fired inside the owner's terminal.");
                      }}
                      className="mt-6 flex flex-col gap-4 text-xs font-sans text-xs"
                    >
                      <div>
                        <label className="block text-slate-450 font-mono uppercase mb-1.5 text-[10.5px]">Stay Rating (Stars)</label>
                        <select
                          name="rating"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ Wonderful (5★)</option>
                          <option value="4">⭐⭐⭐⭐ Good (4★)</option>
                          <option value="3">⭐⭐⭐ Neutral (3★)</option>
                          <option value="2">⭐⭐ Poor (2★) - Activates Recovery Alarms</option>
                          <option value="1">⭐ Exceptionally Bad (1★) - Fires VIP Recovery Action</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-450 font-mono uppercase mb-1.5 text-[10.5px]">Vibe Category</label>
                        <select
                          name="category"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                        >
                          <option value="Room Issue">Room & Bathroom Sanitization</option>
                          <option value="Priest Guided Visit">Temple Guide & Priest Co-Ordination</option>
                          <option value="Food & In-Room Dining">Restaurant & Buffer Dining</option>
                          <option value="Late Cab Pick-up">Transport & Driver Logistics</option>
                          <option value="Staff Attitude">Staff Assistance & Demeanor</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-450 font-mono uppercase mb-1.5 text-[10.5px]">Detailed Review Comments</label>
                        <textarea
                          name="comments"
                          required
                          placeholder="Tell us about room cooling, priest speed, sand sculpture tutorials, etc..."
                          rows={4}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-md shadow-amber-600/10 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Stay Audit Review</span>
                      </button>
                    </form>
                  );
                })()
              ) : (
                <div className="text-center py-12 text-slate-400 font-mono text-xs mt-6 text-xs">
                  Select a live booking in the top selector to unlock reviews submissions.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
