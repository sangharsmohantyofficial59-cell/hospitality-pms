/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Booking, Guest } from "../types";
import { ShieldCheck, Calendar, ArrowRight, UserCheck, UploadCloud, AlertCircle, Sparkles, CheckCircle, Plane, Train, Bus, Car, Plus, Trash2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface ECheckInPortalProps {
  bookings: Booking[];
  guests: Guest[];
  onUploadCheckin: (bookingId: string, payload: any) => Promise<any>;
  preselectedBookingId: string;
}

interface CoGuest {
  name: string;
  age: string;
  relation: string;
  idType: string;
  idNumber: string;
}

export default function ECheckInPortal({
  bookings,
  guests,
  onUploadCheckin,
  preselectedBookingId
}: ECheckInPortalProps) {
  const [bookingId, setBookingId] = useState("");
  const [activeBooking, setActiveBooking] = useState<any>(null);
  
  // E-Check-In states
  const [idType, setIdType] = useState("Aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [estimatedArrival, setEstimatedArrival] = useState("14:00");
  const [idProofName, setIdProofName] = useState("");
  const [idProofBase64, setIdProofBase64] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Arrival Intelligence
  const [arrivalMode, setArrivalMode] = useState<"Flight" | "Train" | "Bus" | "Self Drive">("Flight");
  const [arrivalDetails, setArrivalDetails] = useState("");
  
  // Accompanying Co-Guests
  const [coGuests, setCoGuests] = useState<CoGuest[]>([]);
  
  const [successResponse, setSuccessResponse] = useState<any>(null);
  const [errorText, setErrorText] = useState("");

  // Sync with preselected booking ID if accessed from customer lookups
  useEffect(() => {
    if (preselectedBookingId) {
      setBookingId(preselectedBookingId);
      handleSearchBooking(preselectedBookingId);
    }
  }, [preselectedBookingId, bookings, guests]);

  const handleSearchBooking = (idToSearch?: string) => {
    setErrorText("");
    const targetId = idToSearch || bookingId.toUpperCase().trim();
    if (!targetId) return;

    const b = bookings.find(x => x.id.toUpperCase() === targetId);
    if (!b) {
      setErrorText("No active reservation found matching this Reference ID. Try demo: BK-1002 or BK-1004");
      setActiveBooking(null);
      return;
    }

    const guest = guests.find(g => g.id === b.guestId);
    setActiveBooking({ ...b, guest });

    // Prepopulate form if guest already exists
    if (guest) {
      setGuestName(guest.name);
      setGuestPhone(guest.phone);
      if (guest.idType) setIdType(guest.idType);
      if (guest.idNumber) setIdNumber(guest.idNumber);
    }

    // Prepopulate arrival intelligence & co-guests if they exist inside booking
    if ((b as any).arrivalMode) setArrivalMode((b as any).arrivalMode);
    if ((b as any).arrivalDetails) setArrivalDetails((b as any).arrivalDetails);
    if ((b as any).eta) setEstimatedArrival((b as any).eta);
    if ((b as any).coGuests && Array.isArray((b as any).coGuests)) {
      setCoGuests((b as any).coGuests);
    } else {
      setCoGuests([]);
    }
  };

  // Co-Guest management
  const handleAddCoGuest = () => {
    setCoGuests(prev => [
      ...prev,
      { name: "", age: "", relation: "Spouse", idType: "Aadhaar", idNumber: "" }
    ]);
  };

  const handleUpdateCoGuest = (index: number, field: keyof CoGuest, value: string) => {
    setCoGuests(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveCoGuest = (index: number) => {
    setCoGuests(prev => prev.filter((_, idx) => idx !== index));
  };

  // Drag and drop mock handler
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setIdProofName(file.name);
      setIdProofBase64("simulated_base64_string_pms");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdProofName(file.name);
      setIdProofBase64("simulated_base64_string_pms");
    }
  };

  // Submit check-in details
  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber) {
      setErrorText("Please state your ID card identification serial number.");
      return;
    }
    setErrorText("");
    setIsUploading(true);


    try {
      const payload = {
        idType,
        idNumber,
        guestName,
        guestPhone,
        idProofBase64,
        idProofName: idProofName || "Uploaded_ID_Card.png",
        arrivalMode,
        arrivalDetails,
        coGuests,
        eta: estimatedArrival
      };

      const result = await onUploadCheckin(activeBooking.id, payload);
      if (result.success) {
        setSuccessResponse({
          guestName: result.guest.name,
          bookingId: result.booking.id,
          idType: result.guest.idType,
          idNumber: result.guest.idNumber,
          assignedRoom: result.booking.roomId,
          webCheckInStatus: result.booking.webCheckInStatus || "Pending Verification"
        });
        
        // Reset states
        setActiveBooking(null);
        setBookingId("");
        setIdNumber("");
        setIdProofName("");
        setIdProofBase64("");
        setCoGuests([]);
        setArrivalDetails("");
      } else {
        setErrorText(result.error || "Failed loading register uploads.");
      }
    } catch (err) {
      setErrorText("Connection failure posting E-Check-In packets.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* 1. SUCCESS STATE CARD */}
      {successResponse ? (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-emerald-300 dark:border-emerald-900 shadow-xl overflow-hidden p-6 sm:p-8 text-center relative text-xs">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold font-sans text-slate-905 dark:text-white">E-Check-In Process Complete!</h2>
          
          <div className="flex gap-2 justify-center mt-2.5">
            <span className="inline-block font-mono text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              ⏳ Status: Pending Verification
            </span>
            <span className="inline-block font-mono text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Reception Alerted
            </span>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-xs mt-4 leading-relaxed max-w-md mx-auto">
            Thank you, <strong>{successResponse.guestName}</strong>! Your ID card photo has been dispatched. Our front desk officer is currently auditing your submission.
          </p>

          <div className="border border-slate-205 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 font-mono text-[11px] text-slate-700 dark:text-slate-350 text-left my-6 flex flex-col gap-2 shadow-inner">
            <div className="flex justify-between"><span>Booking Ref ID:</span><span className="font-bold text-slate-900 dark:text-white">{successResponse.bookingId}</span></div>
            <div className="flex justify-between"><span>Identification Card:</span><span className="text-slate-800 dark:text-slate-200">{successResponse.idType} - {successResponse.idNumber.slice(0, 4)}****</span></div>
            <div className="flex justify-between"><span>Assigned Room Unit:</span><span className="font-bold text-indigo-700 dark:text-indigo-400">{successResponse.assignedRoom ? `Room ${successResponse.assignedRoom}` : "Guaranteed Category Lock"}</span></div>
            <div className="flex justify-between"><span>Workflow Verification:</span><span className="text-amber-600 dark:text-amber-400 font-bold">Pending Review (ETA 5 Mins)</span></div>
          </div>

          <div className="bg-indigo-50/50 dark:bg-indigo-950/15 p-4 border border-indigo-100 dark:border-indigo-900 rounded-xl text-left text-xs text-indigo-950 dark:text-indigo-300 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-650 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Instant Check-in Release:</strong> Once the front desk validates your documents, your status will change to <strong>Verified</strong>. Collect your physical keys immediately on arrival at Park Street with booking reference code <strong>{successResponse.bookingId}</strong>.
            </div>
          </div>

          <button
            onClick={() => setSuccessResponse(null)}
            className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-md shadow-indigo-600/10"
          >
            ← Check In Another Reservation
          </button>
        </div>
      ) : (
        /* 2. REGULAR LOOKUP & DOCKING FLOW */
        <div className="max-w-3xl mx-auto flex flex-col gap-6 text-xs">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-mono text-xs tracking-wider text-indigo-600 dark:text-indigo-400 uppercase font-bold">Express Digital Desk</span>
            <h1 className="text-3xl font-extrabold font-sans text-slate-905 dark:text-white mt-1">Lobby Web Check-In Unit</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
              Verify your booking details, state your travel schedule mode, and upload ID documents to skip standard front desk waiting.
            </p>
          </div>

          {!activeBooking ? (
            /* Search for active Booking */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-205 dark:border-slate-800 shadow-md p-6 sm:p-8 max-w-xl mx-auto w-full">
              <h3 className="font-sans font-bold text-slate-800 dark:text-slate-250 text-sm mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" /> Enter Booking Reference ID
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="e.g. BK-1002"
                  className="flex-grow uppercase font-mono px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => handleSearchBooking()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-705 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10 flex items-center justify-center font-sans whitespace-nowrap"
                >
                  Retrieve & Start Check-In <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </div>

              {errorText && (
                <div className="mt-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3 rounded-xl text-xs text-red-700 dark:text-red-400 flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Demo Code: BK-1002 or BK-1004</span>
                <span className="font-mono text-[10px]">Niladri Shore Resort Beachfront</span>
              </div>
            </div>
          ) : (
            /* ACTIVE BOOKING IN-FLIGHT FORM */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="bg-slate-900 dark:bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between text-white">
                <div>
                  <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase">Active Reservation</span>
                  <h3 className="font-mono text-base font-bold text-slate-100 uppercase">{activeBooking.id}</h3>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px]">Workflow Audit: </span>
                  <span className={`px-2.5 py-0.5 text-[9px] font-mono uppercase font-extrabold rounded-md ${
                    activeBooking.webCheckInStatus === "Verified" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/35" :
                    activeBooking.webCheckInStatus === "Rejected" ? "bg-rose-500/20 text-rose-400 border border-rose-500/35" :
                    activeBooking.webCheckInStatus === "Re-upload Required" ? "bg-amber-500/20 text-amber-400 border border-amber-500/35" :
                    activeBooking.webCheckInStatus === "Pending Verification" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    "bg-slate-500/20 text-slate-350 border border-slate-500/25"
                  }`}>
                    {activeBooking.webCheckInStatus || "Not Checked In"}
                  </span>
                </div>
              </div>

              {/* Status Conditional Banners */}
              {activeBooking.webCheckInStatus === "Verified" && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-900 p-4 text-emerald-800 dark:text-emerald-400 flex items-start gap-2.5 font-sans">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  <div>
                    <strong className="font-bold">Reservation Pre-Approved!</strong>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-500 mt-0.5">Your submitted document set has been successfully reviewed, verified, and approved by the front desk operations team. You do not need to re-upload files.</p>
                  </div>
                </div>
              )}

              {activeBooking.webCheckInStatus === "Rejected" && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border-b border-rose-200 dark:border-rose-900 p-4 text-rose-800 dark:text-rose-400 flex items-start gap-2.5 font-sans">
                  <XCircle className="w-5 h-5 shrink-0 text-rose-600 animate-pulse" />
                  <div>
                    <strong className="font-bold">Check-In Rejected by Front Desk</strong>
                    <p className="text-[11px] text-rose-700 dark:text-rose-500 mt-0.5">Your ID verification has been rejected. This is usually due to name mismatch or invalid identification credentials. Please review information below, correct your ID serial number or upload a fresh file to submit for re-audit.</p>
                  </div>
                </div>
              )}

              {activeBooking.webCheckInStatus === "Re-upload Required" && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900 p-4 text-amber-800 dark:text-amber-400 flex items-start gap-2.5 font-sans">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 animate-bounce" />
                  <div>
                    <strong className="font-bold">Document Re-upload Requested!</strong>
                    <p className="text-[11px] text-amber-700 dark:text-amber-500 mt-0.5">The receptionist flagged your uploaded ID photo as blurry or unreadable. Please upload a clear, high-resolution photo of your identification card (Aadhaar/Passport/DL) and submit again.</p>
                  </div>
                </div>
              )}

              {/* Booking Summary Section */}
              <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-205 dark:border-slate-800 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] font-mono text-slate-550">
                <div className="flex flex-col gap-1">
                  <span>Primary Guest Name: <strong className="text-slate-900 dark:text-slate-100 font-sans text-xs font-bold">{activeBooking.guest?.name}</strong></span>
                  <span>Registered Phone: <strong className="text-slate-900 dark:text-slate-100">{activeBooking.guest?.phone}</strong></span>
                  <span>Registered Email: <strong className="text-slate-900 dark:text-slate-100">{activeBooking.guest?.email}</strong></span>
                </div>
                <div className="flex flex-col gap-1">
                  <span>Check-In Schedule: <strong className="text-slate-900 dark:text-slate-100 font-sans">{activeBooking.checkInDate} (12:00 PM)</strong></span>
                  <span>Check-Out Schedule: <strong className="text-slate-900 dark:text-slate-100 font-sans">{activeBooking.checkOutDate} (11:00 AM)</strong></span>
                  <span>Financial Status: <strong className="text-emerald-700 dark:text-emerald-400 font-bold uppercase">{activeBooking.paymentStatus}</strong></span>
                </div>
              </div>

              {/* Form details */}
              <form onSubmit={handleCheckinSubmit} className="p-6 flex flex-col gap-5 text-xs">
                
                {/* ID & Profile Details */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    Step 1: Primary Guest Identity Credentials
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-semibold text-slate-500 uppercase mb-1.5">Verify Guest Full Name</label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-slate-50/50 dark:bg-slate-950/40 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-semibold text-slate-500 uppercase mb-1.5">Confirm Registered Mobile</label>
                      <input
                        type="text"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-slate-50/50 dark:bg-slate-950/40 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-semibold text-slate-500 uppercase mb-1.5">Document Proof Type</label>
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-slate-50/50 dark:bg-slate-950/40 font-semibold"
                      >
                        <option value="Aadhaar">Aadhaar (UID Card)</option>
                        <option value="Passport">Passport (International)</option>
                        <option value="Driver License">Driver License</option>
                        <option value="PAN Card">PAN Card (Income Tax)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono font-semibold text-slate-500 uppercase mb-1.5">Identification Ref Serial No.</label>
                      <input
                        type="text"
                        required
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="e.g. 1234-5678-9012 or Z-7654321"
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-slate-50/50 dark:bg-slate-950/40 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Arrival Intelligence */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    Step 2: Arrival Intelligence & ETA Schedules
                  </h4>

                  <div>
                    <label className="block text-[10px] font-mono font-semibold text-slate-500 uppercase mb-2">Select Mode of Hotel Arrival</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: "Flight", label: "Flight", icon: Plane, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900" },
                        { id: "Train", label: "Train", icon: Train, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900" },
                        { id: "Bus", label: "Bus", icon: Bus, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900" },
                        { id: "Self Drive", label: "Self Drive", icon: Car, color: "text-teal-600 bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900" }
                      ].map((item) => {
                        const IconComponent = item.icon;
                        const isSelected = arrivalMode === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setArrivalMode(item.id as any)}
                            className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                              isSelected 
                                ? "border-indigo-600 bg-indigo-600/5 shadow-sm" 
                                : "border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className={`p-1 rounded-lg ${item.color}`}>
                                <IconComponent className="w-4 h-4" />
                              </span>
                              {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                            </div>
                            <span className="font-sans font-bold text-slate-805 dark:text-slate-100">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-semibold text-slate-500 uppercase mb-1.5">Estimated Hotel Arrival (ETA)</label>
                      <input
                        type="time"
                        value={estimatedArrival}
                        onChange={(e) => setEstimatedArrival(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-slate-50/50 dark:bg-slate-950/40 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-semibold text-slate-500 uppercase mb-1.5">
                        {arrivalMode === "Flight" ? "Flight / Airline Number" :
                         arrivalMode === "Train" ? "Train / Express Number" :
                         arrivalMode === "Bus" ? "Bus Service / Ticket ID" : "Vehicle Registration / Remarks"}
                      </label>
                      <input
                        type="text"
                        value={arrivalDetails}
                        onChange={(e) => setArrivalDetails(e.target.value)}
                        placeholder={
                          arrivalMode === "Flight" ? "e.g. AI-873 AirIndia" :
                          arrivalMode === "Train" ? "e.g. 12802 Purushottam Exp" :
                          arrivalMode === "Bus" ? "e.g. Dolphin Sleeper Volv" : "e.g. OD-02-Y-9821 Ford"
                        }
                        className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-slate-50/50 dark:bg-slate-950/40 font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* Accompanying Co-Guests */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Step 3: Accompanying Co-Guests ({coGuests.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddCoGuest}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Co-Guest
                    </button>
                  </div>

                  {coGuests.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-850 italic text-[11px]">
                      No accompanying co-guests listed. Click "Add Co-Guest" if traveling with family or companions.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {coGuests.map((co, idx) => (
                        <div 
                          key={idx}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 space-y-3 relative group"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[9px] font-bold text-slate-500 uppercase">Companion #{idx + 1} Details</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCoGuest(idx)}
                              className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Remove Guest"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-4">
                              <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Companion Full Name</label>
                              <input
                                type="text"
                                required
                                placeholder="Guest full name"
                                value={co.name}
                                onChange={(e) => handleUpdateCoGuest(idx, "name", e.target.value)}
                                className="w-full p-2 text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Age</label>
                              <input
                                type="number"
                                required
                                placeholder="Age"
                                value={co.age}
                                onChange={(e) => handleUpdateCoGuest(idx, "age", e.target.value)}
                                className="w-full p-2 text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Relation</label>
                              <select
                                value={co.relation}
                                onChange={(e) => handleUpdateCoGuest(idx, "relation", e.target.value)}
                                className="w-full p-2 text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                              >
                                <option value="Spouse">Spouse</option>
                                <option value="Child">Child</option>
                                <option value="Friend">Friend</option>
                                <option value="Parent">Parent</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Colleague">Colleague</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">ID Type</label>
                              <select
                                value={co.idType}
                                onChange={(e) => handleUpdateCoGuest(idx, "idType", e.target.value)}
                                className="w-full p-2 text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                              >
                                <option value="Aadhaar">Aadhaar</option>
                                <option value="Passport">Passport</option>
                                <option value="Driver License">Driver Lic</option>
                                <option value="School Card">School ID</option>
                                <option value="None">None</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">ID Serial No.</label>
                              <input
                                type="text"
                                placeholder="ID serial"
                                value={co.idNumber}
                                disabled={co.idType === "None"}
                                onChange={(e) => handleUpdateCoGuest(idx, "idNumber", e.target.value)}
                                className="w-full p-2 text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Scanned file uploads */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    Step 4: Identification Card Photo upload
                  </h4>

                  <div>
                    <label className="block text-[10px] font-mono font-semibold text-slate-500 uppercase mb-1.5">Upload scanned image / photo ID proof</label>
                    
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all bg-slate-50/50 dark:bg-slate-950/10 cursor-pointer"
                    >
                      <input
                        type="file"
                        id="idProofInputID"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="idProofInputID" className="cursor-pointer flex flex-col items-center gap-2">
                        <UploadCloud className="w-8 h-8 text-indigo-600" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">Drag & Drop ID photo, or <span className="text-indigo-650 dark:text-indigo-400 underline font-bold">browse locally</span></span>
                        <p className="text-[10px] text-slate-450">Accepted formats: JPG, PNG, PDF max 5MB. Client-side verified.</p>
                      </label>
                    </div>

                    {idProofName && (
                      <div className="mt-3 bg-slate-100 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-805 text-xs text-slate-750 dark:text-slate-300 flex justify-between items-center font-mono">
                        <span>✓ Ready: {idProofName}</span>
                        <button type="button" onClick={() => { setIdProofName(""); setIdProofBase64(""); }} className="text-red-500 font-bold hover:underline cursor-pointer">Remove</button>
                      </div>
                    )}
                  </div>
                </div>

                {errorText && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3 rounded-xl text-xs text-red-750 dark:text-red-400 flex items-center gap-1.5 animate-pulse">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorText}</span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-150 dark:border-slate-800 flex flex-col gap-3 items-start">
                  {!activeBooking?.roomId && (
                    <div className="w-full bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-extrabold text-[11px] uppercase tracking-wider">⚠ Room Assignment Required</div>
                        <div className="font-sans text-[11px] mt-0.5">Please assign a room before checking in this guest.</div>
                      </div>
                    </div>
                  )}

                  <div className="w-full flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setActiveBooking(null)}
                      className="text-xs text-slate-500 hover:underline font-semibold cursor-pointer"
                    >
                      Change Reservation Code
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading || !activeBooking?.roomId}
                      className={`px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs ${
                        isUploading || !activeBooking?.roomId
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-80"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {isUploading ? "Uploading Proof Package..." : "Finalize Digital Check-In"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



