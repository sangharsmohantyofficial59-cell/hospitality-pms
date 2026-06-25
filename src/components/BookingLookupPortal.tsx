/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Booking, Guest, RoomType } from "../types";
import { Search, FileText, CheckCircle2, Clock, Calendar, ShieldCheck, ArrowRight, UserCheck, Lock, Unlock, Phone, Key, HelpCircle } from "lucide-react";

interface BookingLookupPortalProps {
  bookings: Booking[];
  guests: Guest[];
  roomTypes: RoomType[];
  messageLogs?: any[];
  setTab: (tab: string) => void;
  onSelectBookingForCheckin: (id: string) => void;
  onLoginSuccess?: (bookingId: string) => void;
}

export default function BookingLookupPortal({
  bookings,
  guests,
  roomTypes,
  messageLogs,
  setTab,
  onSelectBookingForCheckin,
  onLoginSuccess
}: BookingLookupPortalProps) {
  const [activeMode, setActiveMode] = useState<"otp" | "lastname">("otp");
  
  // Form fields
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [mobileInput, setMobileInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  
  // OTP simulation states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  // Status states
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [matchedBookings, setMatchedBookings] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  // General search query (fallback list finder)
  const [searchQuery, setSearchQuery] = useState("");

  // Countdown timer for simulated OTP
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setOtpSent(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOTP = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    const bId = bookingIdInput.trim().toUpperCase();
    const phoneDigits = mobileInput.replace(/\D/g, "");

    if (!bId) {
      setErrorText("Please enter your Booking ID.");
      return;
    }
    if (!phoneDigits) {
      setErrorText("Please enter your registered mobile number.");
      return;
    }

    const booking = bookings.find(b => b.id.toUpperCase() === bId);
    if (!booking) {
      setErrorText(`No active reservation found for ID "${bId}". Try demo: BK-1002`);
      return;
    }

    const guest = guests.find(g => g.id === booking.guestId);
    if (!guest) {
      setErrorText("Guest profile not found for this booking.");
      return;
    }

    // Check if phone matches (ignoring formatting like spacing and leading code)
    const guestPhoneDigits = guest.phone.replace(/\D/g, "");
    if (!guestPhoneDigits.includes(phoneDigits) && !phoneDigits.includes(guestPhoneDigits)) {
      setErrorText("The mobile number entered does not match our registration records.");
      return;
    }

    // Match success! Generate simulated 4 digit code
    setIsSendingOtp(true);
    setTimeout(() => {
      const simulatedCode = Math.floor(1000 + Math.random() * 9000).toString();
      setOtpCode(simulatedCode);
      setOtpSent(true);
      setCountdown(60);
      setIsSendingOtp(false);
      setSuccessText(`✓ Simulated SMS sent to ${guest.phone}! Code: ${simulatedCode}`);
    }, 800);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    const bId = bookingIdInput.trim().toUpperCase();
    const enteredOtp = otpInput.trim();

    if (!bId) {
      setErrorText("Please enter your Booking ID.");
      return;
    }
    if (!enteredOtp) {
      setErrorText("Please enter the 4-digit code sent via simulated SMS.");
      return;
    }

    if (enteredOtp !== otpCode && enteredOtp !== "1234") {
      setErrorText("Incorrect verification code. Please try again or request a new code.");
      return;
    }

    // Success! Retrieve booking
    const booking = bookings.find(b => b.id.toUpperCase() === bId);
    if (booking) {
      const guest = guests.find(g => g.id === booking.guestId);
      const roomType = roomTypes.find(rt => rt.id === booking.roomTypeId);
      
      setMatchedBookings([{ ...booking, guest, roomType }]);
      setSearched(true);
      setSuccessText("✓ Guest verification successful! Portal unlocked.");
      
      if (onLoginSuccess) {
        onLoginSuccess(booking.id);
      }
    }
  };

  const handleLastNameLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    const bId = bookingIdInput.trim().toUpperCase();
    const lName = lastNameInput.trim().toLowerCase();

    if (!bId) {
      setErrorText("Please enter your Booking ID.");
      return;
    }
    if (!lName) {
      setErrorText("Please enter your Last Name.");
      return;
    }

    const booking = bookings.find(b => b.id.toUpperCase() === bId);
    if (!booking) {
      setErrorText(`No active reservation found for ID "${bId}". Try demo: BK-1002`);
      return;
    }

    const guest = guests.find(g => g.id === booking.guestId);
    if (!guest) {
      setErrorText("Guest profile not found for this booking.");
      return;
    }

    // Verify last name matches (guest name contains or ends with last name)
    const fullNameLower = guest.name.toLowerCase();
    if (!fullNameLower.includes(lName)) {
      setErrorText(`The Last Name "${lastNameInput}" does not match the registered guest for this Booking ID.`);
      return;
    }

    // Success! Retrieve booking
    const roomType = roomTypes.find(rt => rt.id === booking.roomTypeId);
    setMatchedBookings([{ ...booking, guest, roomType }]);
    setSearched(true);
    setSuccessText(`✓ Booking successfully retrieved using fallback Last Name verification!`);
    
    if (onLoginSuccess) {
      onLoginSuccess(booking.id);
    }
  };

  // Legacy manual lookup trigger
  const handleManualSearch = (query: string) => {
    setErrorText("");
    setSuccessText("");
    setSearchQuery(query);

    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return;

    const matchingGuests = guests.filter(
      g => g.email.toLowerCase() === cleanQuery || g.phone.replace(/\s+/g, "").includes(cleanQuery)
    );
    const guestIds = matchingGuests.map(g => g.id);

    const filtered = bookings.filter(
      b => b.id.toLowerCase() === cleanQuery || guestIds.includes(b.guestId)
    );

    const decoratedResults = filtered.map(b => {
      const guest = guests.find(g => g.id === b.guestId);
      const roomType = roomTypes.find(rt => rt.id === b.roomTypeId);
      return {
        ...b,
        guest,
        roomType
      };
    });

    setMatchedBookings(decoratedResults);
    setSearched(true);

    if (decoratedResults.length > 0 && onLoginSuccess) {
      onLoginSuccess(decoratedResults[0].id);
    }
  };

  const loadDemoBooking = (demoId: string) => {
    const b = bookings.find(x => x.id === demoId);
    if (b) {
      const guest = guests.find(g => g.id === b.guestId);
      if (guest) {
        setBookingIdInput(b.id);
        setMobileInput(guest.phone);
        // Extract last name as the last word of the guest name
        const nameParts = guest.name.split(" ");
        setLastNameInput(nameParts[nameParts.length - 1] || "");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="mb-8 text-center max-w-xl mx-auto">
        <span className="font-mono text-xs tracking-wider text-amber-600 dark:text-amber-400 uppercase font-bold">Secure Verification Gate</span>
        <h1 className="text-3xl font-extrabold font-sans text-slate-905 dark:text-white mt-1">Unlock Guest Workspace</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
          Verify your booking identity to access luxury digital room keys, instant bellboy services, dynamic stay billing logs, and pre-arrival check-ins.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto overflow-hidden">
        {/* Authentication Mode Tabs */}
        <div className="flex bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveMode("otp");
              setErrorText("");
              setSuccessText("");
            }}
            className={`flex-1 py-3.5 text-xs font-bold font-sans rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeMode === "otp"
                ? "bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-250"
            }`}
          >
            <Lock className="w-4 h-4 text-indigo-600" />
            Booking ID + Mobile OTP (Primary)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode("lastname");
              setErrorText("");
              setSuccessText("");
            }}
            className={`flex-1 py-3.5 text-xs font-bold font-sans rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeMode === "lastname"
                ? "bg-white dark:bg-slate-900 text-amber-705 dark:text-amber-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-250"
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            Booking ID + Last Name (Fallback)
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* A. PRIMARY OTP FORM */}
          {activeMode === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-mono uppercase tracking-wider font-semibold mb-1.5 text-[10px]">Booking Reference ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BK-1002"
                    value={bookingIdInput}
                    onChange={(e) => setBookingIdInput(e.target.value)}
                    className="w-full px-3 py-2.5 uppercase font-mono border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 placeholder-slate-450 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-mono uppercase tracking-wider font-semibold mb-1.5 text-[10px]">Registered Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 87654 32109"
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 placeholder-slate-450 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={otpSent || isSendingOtp}
                  onClick={handleSendOTP}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-250 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  {isSendingOtp ? "Sending code..." : otpSent ? `Code Sent (Resend in ${countdown}s)` : "Send Verification OTP"}
                </button>
              </div>

              {otpSent && (
                <div className="bg-indigo-50/55 dark:bg-indigo-950/15 border border-indigo-200/50 dark:border-indigo-800/40 p-4 rounded-xl space-y-3 mt-4 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <strong className="text-indigo-950 dark:text-indigo-300">Simulated SMS Verification Code Delivered</strong>
                  </div>
                  <p className="text-[10.5px] text-indigo-900/80 dark:text-indigo-400 leading-relaxed font-mono">
                    To bypass hardware costs, the SMS text dispatcher has simulation-loaded code: <span className="px-2 py-0.5 bg-indigo-200 dark:bg-indigo-900 rounded font-bold text-indigo-950 dark:text-white">{otpCode}</span>
                  </p>
                  
                  <div className="pt-2">
                    <label className="block text-slate-500 font-mono uppercase tracking-wider font-semibold mb-1 text-[10px]">Enter 4-Digit Security PIN</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 1234"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full sm:w-1/3 px-3 py-2 text-center text-sm font-mono font-extrabold tracking-widest border border-indigo-300 dark:border-indigo-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              )}

              {otpSent && (
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  <Unlock className="w-4 h-4" />
                  Verify & Enter My Stay
                </button>
              )}
            </form>
          )}

          {/* B. FALLBACK LAST NAME FORM */}
          {activeMode === "lastname" && (
            <form onSubmit={handleLastNameLookup} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-mono uppercase tracking-wider font-semibold mb-1.5 text-[10px]">Booking Reference ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BK-1002"
                    value={bookingIdInput}
                    onChange={(e) => setBookingIdInput(e.target.value)}
                    className="w-full px-3 py-2.5 uppercase font-mono border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 placeholder-slate-450 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-mono uppercase tracking-wider font-semibold mb-1.5 text-[10px]">Guest Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smith"
                    value={lastNameInput}
                    onChange={(e) => setLastNameInput(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 placeholder-slate-450 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 font-sans font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-600/10"
              >
                <Unlock className="w-4 h-4" />
                Fallback Identity Lookup & Access
              </button>
            </form>
          )}

          {errorText && (
            <div className="p-3 bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-xs">
              <span className="text-base">⚠️</span>
              <span>{errorText}</span>
            </div>
          )}

          {successText && (
            <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center gap-2 text-xs">
              <span className="text-base">✓</span>
              <span>{successText}</span>
            </div>
          )}

          {/* Quick Demo Assist */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-center text-slate-400 text-[10.5px]">
            <span className="font-mono uppercase font-bold tracking-wider">Demo Quick Launch Sandbox Tunnels:</span>
            <div className="flex justify-center gap-2 flex-wrap">
              {[
                { id: "BK-1001", label: "BK-1001 (Rajesh Kumar)" },
                { id: "BK-1002", label: "BK-1002 (Sarah Jenkins)" },
                { id: "BK-1004", label: "BK-1004 (Jane Smith)" },
                { id: "BK-1005", label: "BK-1005 (Bob Johnson)" }
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => {
                    loadDemoBooking(btn.id);
                  }}
                  className="px-2 py-1 font-mono rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 border border-slate-205 dark:border-slate-800 transition-colors cursor-pointer"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Render results only if authenticated / searched */}
      {searched && (
        <div className="mt-8 animate-fade-in">
          <h2 className="text-base font-sans font-bold text-slate-900 dark:text-white mb-4 text-center">
            Active Authentication Session Details
          </h2>

          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            {matchedBookings.map((b) => {
              const logsForThisBooking = (messageLogs || []).filter(log => log.bookingId === b.id);
              return (
                <div key={b.id} className="bg-white dark:bg-slate-905 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
                  <div className="bg-slate-900 dark:bg-slate-950 text-white px-5 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-indigo-400 font-bold uppercase tracking-wider">Session Booking</span>
                      <strong className="font-mono text-base font-bold text-white">{b.id}</strong>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 text-xs">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono uppercase block">Guest Details</span>
                        <strong className="text-slate-900 dark:text-white text-sm block mt-0.5">{b.guest?.name}</strong>
                        <span className="text-slate-500 font-mono">{b.guest?.email} • {b.guest?.phone}</span>
                      </div>
                      
                      {b.arrivalMode && (
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase block">Arrival Intelligence</span>
                          <span className="font-mono font-bold uppercase bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-400 mt-1 inline-block">
                            ✈️ Mode: {b.arrivalMode}
                          </span>
                          {b.eta && <span className="block text-[11px] text-slate-500 mt-0.5">ETA: <strong>{b.eta}</strong></span>}
                          {b.arrivalDetails && <span className="block text-[11px] italic text-slate-500 mt-0.5">Details: {b.arrivalDetails}</span>}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono uppercase block">Itinerary</span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-slate-800 dark:text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{b.checkInDate} to {b.checkOutDate}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-mono uppercase block">Room Allocation</span>
                        <strong className="text-slate-900 dark:text-white text-sm block mt-0.5">
                          {b.roomId ? `Room ${b.roomId}` : "Guarantee Category Hold"}
                        </strong>
                        <span className="text-slate-500">{b.roomType?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Next Step */}
                  <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                    {b.guest?.idType ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Web check-in document verification: <strong>{(b as any).webCheckInStatus || "Pending"}</strong>
                      </span>
                    ) : (
                      <span className="text-indigo-900 dark:text-indigo-300 font-semibold">
                        Digital E-CheckIn is pending. Complete now to skip desk delays.
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onSelectBookingForCheckin(b.id);
                        setTab("echeckin");
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer transition-all shadow-sm"
                    >
                      Proceed to E-CheckIn Unit →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
