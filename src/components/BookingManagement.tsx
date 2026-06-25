/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Booking, Guest, Room, RoomType, BookingSource, BookingStatus, PaymentStatus, RoomStatus } from "../types";
import { PlusCircle, Search, Trash2, Edit3, CheckCircle2, UserPlus, LogIn, LogOut, XCircle, Calendar, CreditCard, ChevronDown, Download, FileText } from "lucide-react";
import { jsPDF } from "jspdf";

export function handleExportInvoiceToPDF(booking: Booking, guest: Guest | undefined, roomType: RoomType | undefined) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Color Definitions matching Niladri Shore Resort Brand
  const primaryColor = [180, 83, 9];    // Amber-700 / Gold
  const secondaryColor = [30, 41, 59];  // Slate-800
  const lightGray = [100, 116, 139];    // Slate-500

  // 1. Draw top brand color header strip
  doc.setFillColor(180, 83, 9);
  doc.rect(0, 0, 210, 8, "F");

  // 2. Main Title & Resort Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(180, 83, 9);
  doc.text("NILADRI SHORE RESORT & SPA", 15, 23);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Puri’s Royal Heritage & Coastal Sanctuary", 15, 28);
  doc.text("Golden Sands Boulevard, Puri Beach, Puri - 752002, Odisha, India", 15, 33);
  doc.text("Phone: +91 (6752) 224400 | Email: stay@niladrishoreresort.com", 15, 38);

  // Invoice Details Header (Right Aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("INVOICE RECEIPT", 145, 23);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Invoice No: INV-2026-${booking.id.toUpperCase()}`, 145, 28);
  const printDate = new Date().toLocaleDateString("en-IN", { dateStyle: "long" });
  doc.text(`Issue Date: ${printDate}`, 145, 33);
  doc.text(`Ref ID: ${booking.id}`, 145, 38);

  // Horizontal Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, 43, 195, 43);

  // 3. Guest Details and Reservation columns
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9);
  doc.text("GUEST REGISTRATION DETAILS", 15, 52);
  doc.text("STAY & CHANNELS", 115, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  // Left column: Guest Info
  doc.text(`Name: ${guest?.name || "N/A"}`, 15, 60);
  doc.text(`Email: ${guest?.email || "N/A"}`, 15, 66);
  doc.text(`Phone: ${guest?.phone || "N/A"}`, 15, 72);
  doc.text(`ID Reference: ${guest?.idType ? `${guest.idType} (${guest.idNumber})` : "Unverified / Pending Desk Check-in"}`, 15, 78);

  // Right column: Stay info
  doc.text(`Check-In: ${booking.checkInDate}`, 115, 60);
  doc.text(`Check-Out: ${booking.checkOutDate}`, 115, 66);

  // Calculate duration
  const d1 = new Date(booking.checkInDate);
  const d2 = new Date(booking.checkOutDate);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  doc.text(`Duration: ${diffDays} Night(s)`, 115, 72);
  doc.text(`Guests count: ${booking.numberOfGuests} Adult(s)`, 115, 78);

  // Horizontal Divider
  doc.line(15, 85, 195, 85);

  // 4. Room category details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9);
  doc.text("ALLOTTED CHAMBER & ACCOMMODATION", 15, 94);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Suite Category: ${roomType?.name || "Niladri Premium Room"}`, 15, 102);
  doc.text(`Allocated Room Number: ${booking.roomId ? `Room ${booking.roomId}` : "Unassigned category booking"}`, 15, 108);
  doc.text(`Booking Channel: ${booking.source}`, 15, 114);

  // Horizontal Divider
  doc.line(15, 120, 195, 120);

  // 5. Breakout ledger pricing grid header
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 127, 180, 8, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, 127, 180, 8, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Description", 18, 132);
  doc.text("Unit Price (INR)", 95, 132);
  doc.text("Quantity", 135, 132);
  doc.text("Amount (INR)", 165, 132);

  const basePrice = roomType?.basePrice || Math.round(booking.totalPrice / 1.12 / diffDays);
  const accommodationTotal = basePrice * diffDays;
  
  // Sum up custom service lines
  const servicesTotal = (booking.customServiceLines || []).reduce((sum: number, line: any) => sum + line.amount, 0);
  const baseSubtotal = accommodationTotal + servicesTotal;
  
  // Calculate dynamic discounts applied
  let calculatedDiscount = booking.discountAmount || 0;
  if (booking.discountPercent) {
    calculatedDiscount = Math.round(baseSubtotal * (booking.discountPercent / 100));
  }

  const subtotal = Math.max(0, baseSubtotal - calculatedDiscount);
  const luxuryTax = Math.round(subtotal * 0.12);
  const grandTotal = subtotal + luxuryTax;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  
  let curY = 143;
  doc.text(`${roomType?.name || "Resort Stay Accommodation"}`, 18, curY);
  doc.text(`INR ${basePrice.toLocaleString()}`, 95, curY);
  doc.text(`${diffDays} Night(s)`, 135, curY);
  doc.text(`INR ${accommodationTotal.toLocaleString()}`, 165, curY);

  // Add extra service line items on PDF dynamically
  (booking.customServiceLines || []).forEach((line: any) => {
    curY += 6;
    doc.text(`${line.description}`, 18, curY);
    doc.text(`—`, 95, curY);
    doc.text(`1 qty`, 135, curY);
    doc.text(`INR ${line.amount.toLocaleString()}`, 165, curY);
  });

  // Line separating item and totals
  curY += 6;
  doc.line(15, curY, 195, curY);

  // Totals calculations
  curY += 7;
  doc.setFont("helvetica", "normal");
  doc.text("Base Subtotal Rate:", 120, curY);
  doc.text(`INR ${baseSubtotal.toLocaleString()}`, 165, curY);

  if (calculatedDiscount > 0) {
    curY += 6;
    doc.text("Loyalty Discount Rebate:", 120, curY);
    doc.text(`- INR ${calculatedDiscount.toLocaleString()}`, 165, curY);
  }

  curY += 6;
  doc.text("Nett Taxable Amount:", 120, curY);
  doc.text(`INR ${subtotal.toLocaleString()}`, 165, curY);

  curY += 6;
  doc.text("Luxury Tax & GST (12%):", 120, curY);
  doc.text(`INR ${luxuryTax.toLocaleString()}`, 165, curY);

  // Grand total highlight box
  curY += 4;
  doc.setFillColor(254, 243, 199); // Light Gold/Yellow-50
  doc.rect(115, curY, 80, 10, "F");
  doc.rect(115, curY, 80, 10, "S");

  doc.setFont("helvetica", "bold");
  doc.text("Grand Total:", 120, curY + 6.5);
  doc.text(`INR ${grandTotal.toLocaleString()}`, 165, curY + 6.5);

  // 6. Payment status info
  curY += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("PAYMENT INFORMATION", 15, curY);

  curY += 7;
  doc.setFont("helvetica", "normal");
  doc.text(`Manner of payment: ${(booking as any).paymentMethod || "Razorpay Pre-Paid Gateway"}`, 15, curY);
  
  curY += 6;
  doc.text(`Receipt Status: ${booking.paymentStatus}`, 15, curY);
  if ((booking as any).transactionId) {
    curY += 6;
    doc.text(`Transaction Reference: ${(booking as any).transactionId}`, 15, curY);
  }

  // 7. Policy and Temple note box
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 215, 180, 30, "F");
  doc.rect(15, 215, 180, 30, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text("NILADRI POLICIES & TRADITIONAL DISCLOSURES:", 18, 221);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("• Government photo proof (Aadhaar/Passports) is required of all guests upon physical check-in.", 18, 226);
  doc.text("• Cleanliness is holy. We recommend decent traditional attire when using our temple shuttle.", 18, 231);
  doc.text("• Standard check-out must be finished before 11:00 AM so chamber sweepers can prepare the suites.", 18, 236);
  doc.text("• For custom seafood shore tours, connect directly with our butler desk 2 hours in advance.", 18, 241);

  // 8. Chariot Wheel bottom motif / Blessing
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9);
  doc.text("May the divine blessings of Lord Jagannath guide your journeys.", 105, 260, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Niladri Shore Property Management invoice receipt generator. Powered by Google Cloud.", 105, 265, { align: "center" });

  // Save the PDF
  doc.save(`Invoice_${booking.id.toUpperCase()}.pdf`);
}

interface BookingManagementProps {
  bookings: Booking[];
  guests: Guest[];
  rooms: Room[];
  roomTypes: RoomType[];
  onNewBooking: (formData: any) => Promise<any>;
  onUpdateBooking: (id: string, payload: any) => Promise<any>;
  messageLogs?: any[];
  onNavigateToTab?: (tabId: string) => void;
}

export default function BookingManagement({
  bookings,
  guests,
  rooms,
  roomTypes,
  onNewBooking,
  onUpdateBooking,
  messageLogs,
  onNavigateToTab
}: BookingManagementProps) {
  
  // Filtering states
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Manual Reservation Form States
  const [mName, setMName] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mPhone, setMPhone] = useState("");
  const [mRoomTypeId, setMRoomTypeId] = useState("std");
  const [mRoomId, setMRoomId] = useState("");
  const [mCheckIn, setMCheckIn] = useState("2026-06-20");
  const [mCheckOut, setMCheckOut] = useState("2026-06-22");
  const [mGuests, setMGuests] = useState(2);
  const [mPrice, setMPrice] = useState(3000);
  const [mSource, setMSource] = useState<BookingSource>(BookingSource.WALK_IN);
  const [mNotes, setMNotes] = useState("");
  const [mPayMethod, setMPayMethod] = useState("Cash");
  const [mPayStatus, setMPayStatus] = useState<PaymentStatus>(PaymentStatus.PAID);
  const [mBookingType, setMBookingType] = useState<"Room Booking" | "Conference Hall Booking" | "Corporate Booking" | "Group Booking">("Room Booking");
  
  // Custom states for Hotel Reservation workflows
  const [mHallName, setMHallName] = useState("Grand Ballroom");
  const [mHallLayout, setMHallLayout] = useState("Theater Style");
  const [mHallCatering, setMHallCatering] = useState("Standard Tea / Snacks");
  const [mHallAVOption, setMHallAVOption] = useState("Full AV/Wireless Mic Array");

  const [mCompanyName, setMCompanyName] = useState("");
  const [mCompanyGST, setMCompanyGST] = useState("");
  const [mEmployeeId, setMEmployeeId] = useState("");
  const [mDesignation, setMDesignation] = useState("");
  const [mCorporateBillingOption, setMCorporateBillingOption] = useState("Credit Card");
  const [mBusinessEmail, setMBusinessEmail] = useState("");

  const [mAgencyName, setMAgencyName] = useState("");
  const [mGroupRoomCount, setMGroupRoomCount] = useState(2);
  const [mGroupMealPlan, setMGroupMealPlan] = useState("CP (Buffet Breakfast)");
  const [mGroupLeader, setMGroupLeader] = useState("");
  
  // Room assignment dropdown state tracking
  const [assigningBookingId, setAssigningBookingId] = useState<string | null>(null);

  // Advanced Demonstration Tabs and Forms State tracking
  const [detailTab, setDetailTab] = useState<"invoice" | "extend" | "early_checkout" | "transport" | "audit" | "verification">("invoice");
  const [customLineDesc, setCustomLineDesc] = useState("");
  const [customLineAmt, setCustomLineAmt] = useState<number>(0);
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [discountMethod, setDiscountMethod] = useState<"flat" | "percent">("flat");
  const [extNights, setExtNights] = useState<number>(1);
  const [valChecked, setValChecked] = useState<boolean>(false);
  const [valAvailable, setValAvailable] = useState<boolean | null>(null);
  const [earlyDaysToSub, setEarlyDaysToSub] = useState<number>(1);
  const [earlySettleDone, setEarlySettleDone] = useState<boolean>(false);
  const [transVeh, setTransVeh] = useState<"Auto" | "Sedan" | "SUV" | "Innova" | "Tempo Traveller" | "Mini Bus" | "Bus" | "">("");
  const [transPickLoc, setTransPickLoc] = useState("");
  const [transDropLoc, setTransDropLoc] = useState("");
  const [transTimeSch, setTransTimeSch] = useState("");
  const [cancReason, setCancReason] = useState("");
  const [showQrCta, setShowQrCta] = useState<boolean>(false);

  // Sync state variables smoothly whenever a new booking invoice modal is loaded
  useEffect(() => {
    if (selectedBooking) {
      setDetailTab("invoice");
      setDiscountVal(selectedBooking.discountAmount || selectedBooking.discountPercent || 0);
      setDiscountMethod(selectedBooking.discountPercent ? "percent" : "flat");
      setCustomLineDesc("");
      setCustomLineAmt(0);
      setValChecked(false);
      setValAvailable(null);
      setEarlySettleDone(false);
      
      const tr = selectedBooking.transport || { vehicleType: "", pickupAddress: "", dropAddress: "", scheduleTime: "" };
      setTransVeh(tr.vehicleType as any || "");
      setTransPickLoc(tr.pickupAddress || "");
      setTransDropLoc(tr.dropAddress || "");
      setTransTimeSch(tr.scheduleTime || "");
      setCancReason("");
      setShowQrCta(false);
    }
  }, [selectedBooking]);

  // Manual trigger alerts worker helper
  const handleManualMessageDispatch = async (bookingId: string, event: string) => {
    try {
      const res = await fetch(`/api/pms/bookings/${bookingId}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Successfully dispatched guest ${event.replace(/_/g, " ")} through Email & WhatsApp!`);
        // Refresh full state
        await onUpdateBooking(bookingId, {});
      } else {
        alert(data.error || "Failed delivering notification dispatch alert.");
      }
    } catch (e) {
      alert("Error dispatching manual request.");
    }
  };

  // Filter & Search computation
  const filteredBookings = bookings.filter(b => {
    // 1. Status Filter
    if (filterStatus !== "All" && b.status !== filterStatus) return false;

    // 2. Text Search
    const g = guests.find(cu => cu.id === b.guestId);
    const text = searchQuery.toLowerCase();
    if (text) {
      const matchName = g?.name.toLowerCase().includes(text);
      const matchEmail = g?.email.toLowerCase().includes(text);
      const matchPhone = g?.phone.replace(/\s+/g, "").includes(text);
      const matchId = b.id.toLowerCase().includes(text);
      return matchName || matchEmail || matchPhone || matchId;
    }
    return true;
  });

  // Calculate pricing for manual forms
  const handleRecalculatePrice = (typeId: string, inDate: string, outDate: string) => {
    const selectedType = roomTypes.find(r => r.id === typeId);
    
    const d1 = new Date(inDate);
    const d2 = new Date(outDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const base = selectedType?.basePrice || 1500;
    const taxes = Math.round(base * diffDays * 0.12);
    setMPrice(base * diffDays + taxes);
  };

  const handleManualFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName || !mEmail || !mPhone) {
      alert("Please state customer details.");
      return;
    }
    setIsSubmitting(true);

    try {
      let compiledNotes = mNotes || "";
      let customServiceLines: any[] = [];
      let finalPrice = mPrice;

      if (mBookingType === "Conference Hall Booking") {
        compiledNotes = `[CONFERENCE HALL SUMMARY]
Hall: ${mHallName}
Setup Style: ${mHallLayout}
Catering Plan: ${mHallCatering}
AV Options: ${mHallAVOption}
Remarks: ${mNotes}`;

        customServiceLines.push({
          id: `SERV-HALL-${Date.now()}`,
          description: `Conference Hall Booking: ${mHallName} (${mHallLayout})`,
          amount: Math.round(mPrice / 1.12)
        });
      } else if (mBookingType === "Corporate Booking") {
        compiledNotes = `[CORPORATE ACCOMMODATION SUMMARY]
Company Name: ${mCompanyName}
GSTIN Number: ${mCompanyGST}
Employee Profile: ${mDesignation} (ID: ${mEmployeeId})
Business Email: ${mBusinessEmail}
Billing Method: ${mCorporateBillingOption}
Remarks: ${mNotes}`;

        // Apply a structured corporate discount rebate
        const corpDiscount = Math.round(mPrice * 0.15);
        finalPrice = Math.max(1000, mPrice - corpDiscount);
        compiledNotes += `\n✓ Auto Corporate Rate Applied (15% Preferred Base Discount: -₹${corpDiscount})`;
      } else if (mBookingType === "Group Booking") {
        compiledNotes = `[GROUP BLOCK SUMMARY]
Tour Agency Organiser: ${mAgencyName}
Rooms Required: ${mGroupRoomCount} Units
Meal Package: ${mGroupMealPlan}
Group Tour Leader Name: ${mGroupLeader}
Remarks: ${mNotes}`;
      }

      const payload = {
        guestName: mName,
        guestEmail: mEmail,
        guestPhone: mPhone,
        roomTypeId: mRoomTypeId,
        roomId: mRoomId || null,
        checkInDate: mCheckIn,
        checkOutDate: mCheckOut,
        numberOfGuests: mGuests,
        totalPrice: finalPrice,
        source: mSource,
        notes: compiledNotes,
        paymentMethod: mPayMethod,
        paymentStatus: mPayStatus,
        bookingType: mBookingType,
        customServiceLines: customServiceLines,
        discountAmount: mBookingType === "Corporate Booking" ? Math.round(mPrice * 0.15) : 0
      };

      const res = await onNewBooking(payload);
      if (res.success) {
        setShowAddModal(false);
        // Reset manual forms
        setMName("");
        setMEmail("");
        setMPhone("");
        setMNotes("");
        setMRoomId("");
        setMCompanyName("");
        setMCompanyGST("");
        setMEmployeeId("");
        setMDesignation("");
        setMAgencyName("");
        setMGroupLeader("");
      } else {
        alert(res.error || "Failed registering reservation.");
      }
    } catch (err) {
      alert("Error posting manual booking package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assign room API trigger
  const handleRoomAssignment = async (bookingId: string, roomId: string) => {
    try {
      await onUpdateBooking(bookingId, { roomId });
      setAssigningBookingId(null);
    } catch (err) {
      alert("Failed room assignment.");
    }
  };

  // Change booking status triggers
  const handleStatusUpdate = async (bookingId: string, status: BookingStatus) => {
    try {
      await onUpdateBooking(bookingId, { status });
      if (status === BookingStatus.CHECKED_OUT && onNavigateToTab) {
        if (confirm("✓ Guest Checked-Out successfully!\n\nNavigate to the Billing Cockpit & GST Queue to apply optional discounts and close the bill?")) {
          onNavigateToTab("billing");
        }
      }
    } catch (err) {
      alert("Error updating booking status.");
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* 1. SECTION LOG CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Reservations & Bookings Register</h1>
          <p className="text-stone-500 text-xs mt-0.5">Audit complete scheduler lists and manual walk-in creation</p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            handleRecalculatePrice("std", "2026-06-20", "2026-06-22");
          }}
          className="px-4 py-2.5 bg-amber-600 font-bold text-stone-950 text-xs rounded-lg hover:bg-amber-700 hover:text-white transition-all shadow-md shadow-amber-600/10 flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Add Reception Booking
        </button>
      </div>

      {/* 2. REGULATION FILTERS */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2 flex-grow max-w-md">
          <Search className="w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings by ID, guest name, email, phone..."
            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-850 bg-stone-50/50 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-mono font-bold text-stone-400 uppercase mr-1.5">Filter status:</span>
          {["All", "Pending", "Confirmed", "Checked In", "Checked Out", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                filterStatus === st
                  ? "bg-stone-900 text-stone-100 border-stone-900 shadow-sm"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 3. LISTING TABLE REGISTER */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 uppercase font-mono text-[10px] text-stone-500 font-bold">
              <tr>
                <th className="px-5 py-3">Ref ID</th>
                <th className="px-5 py-3">Guest Contact Info</th>
                <th className="px-5 py-3">Itinerary Details</th>
                <th className="px-5 py-3">Suite/Room</th>
                <th className="px-5 py-3">Payment Ledger</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Desk Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-stone-400 font-mono">
                    No matching ledger reservations in this state. Try altering keywords.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const guest = guests.find(g => g.id === b.guestId);
                  const rt = roomTypes.find(t => t.id === b.roomTypeId);

                  // Extract rooms eligible for assignment
                  const vacantRoomsMatchingType = rooms.filter(
                    rm => rm.roomTypeId === b.roomTypeId && rm.status === RoomStatus.AVAILABLE
                  );

                  return (
                    <tr key={b.id} className="hover:bg-stone-50/50 transition-colors">
                      {/* Ref ID & Source */}
                      <td className="px-5 py-4 font-mono">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          title="Click to view detailed invoice receipt and export as PDF"
                          className="text-stone-900 hover:text-amber-700 hover:underline font-bold block text-sm text-left cursor-pointer transition-colors"
                        >
                          {b.id}
                        </button>
                        <span className="text-[9px] font-semibold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block">
                          {b.source}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block ml-1 ${
                          b.bookingType === "Conference Hall Booking" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                          b.bookingType === "Corporate Booking" ? "bg-cyan-50 text-cyan-800 border border-cyan-200" :
                          b.bookingType === "Group Booking" ? "bg-purple-50 text-purple-800 border border-purple-200" :
                          "bg-slate-50 text-slate-705 border border-slate-200"
                        }`}>
                          {b.bookingType || "Room Booking"}
                        </span>
                      </td>

                      {/* Guest Info */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-stone-900 text-sm block">{guest?.name}</span>
                        <span className="text-[10px] text-stone-400 font-mono block mt-0.5">
                          {guest?.phone} • {guest?.email}
                        </span>
                        {guest?.idType && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-800 font-semibold bg-emerald-50 rounded-full py-0.5 px-2 mt-1.5 border border-emerald-100">
                            ✓ E-CheckIn Complete
                          </span>
                        )}
                      </td>

                      {/* Itinerary */}
                      <td className="px-5 py-4 font-mono leading-normal">
                        <div className="flex flex-col gap-0.5">
                          <span>CheckIn: <strong>{b.checkInDate}</strong></span>
                          <span>CheckOut: <strong>{b.checkOutDate}</strong></span>
                        </div>
                        <span className="text-[10px] text-stone-400 block mt-1">{b.numberOfGuests} Guest(s)</span>
                      </td>

                      {/* Room Assignment */}
                      <td className="px-5 py-4 font-mono">
                        {b.roomId ? (
                          <div>
                            <span className="font-bold text-stone-900 bg-stone-100 px-2 py-1 border border-stone-200 rounded text-xs">
                              Room {b.roomId}
                            </span>
                            <span className="text-[10px] text-stone-400 block mt-1.5">{rt?.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-stone-400 text-[11px] italic">Category Lock:</span>
                            <span className="text-[10px] text-amber-700 font-semibold">{rt?.name}</span>
                            
                            {/* In-Line Room Assignment triggers */}
                            {b.status !== BookingStatus.CANCELLED && b.status !== BookingStatus.CHECKED_OUT && (
                              <div className="relative mt-1">
                                {assigningBookingId === b.id ? (
                                  <select
                                    onChange={(e) => handleRoomAssignment(b.id, e.target.value)}
                                    className="px-2 py-1 border border-amber-600 bg-white rounded font-mono text-[10px]"
                                    defaultValue=""
                                  >
                                    <option value="" disabled>Select Room...</option>
                                    {vacantRoomsMatchingType.map(vr => (
                                      <option key={vr.id} value={vr.id}>Room {vr.id}</option>
                                    ))}
                                    {vacantRoomsMatchingType.length === 0 && (
                                      <option disabled>No vacants available</option>
                                    )}
                                  </select>
                                ) : (
                                  <button
                                    onClick={() => setAssigningBookingId(b.id)}
                                    className="text-[10px] font-bold text-amber-700 hover:underline flex items-center gap-0.5"
                                  >
                                    Assign Room <ChevronDown className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4 font-mono leading-relaxed">
                        <span className="font-bold text-stone-900 block">Total: ₹{b.totalPrice.toLocaleString()}</span>
                        {b.paymentOption === "Advance" && b.advancePaid !== undefined && (
                          <div className="text-[10px] leading-tight text-stone-500 mt-1">
                            <span className="block text-emerald-700 font-medium">Paid Adv: ₹{b.advancePaid?.toLocaleString()}</span>
                            <span className="block text-amber-800 font-bold">Pending: ₹{b.pendingBalance?.toLocaleString()}</span>
                          </div>
                        )}
                        <span className={`inline-block mt-1 text-[9px] font-bold uppercase rounded px-1.5 py-0.5 ${
                          b.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                          "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}>
                          {b.paymentStatus}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold rounded-full border ${
                          b.status === "Checked In" ? "bg-blue-50 text-blue-800 border-blue-200" :
                          b.status === "Checked Out" ? "bg-stone-100 text-stone-500 border-stone-200" :
                          b.status === "Cancelled" ? "bg-red-50 text-red-800 border-red-200" :
                          "bg-amber-50 text-amber-850 border-amber-200"
                        }`}>
                          {b.status}
                        </span>
                      </td>

                      {/* Controls */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex gap-1.5 justify-end items-center">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            title="Review details and export PDF invoice"
                            className="px-2 py-1 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-800 rounded font-bold font-mono text-[10px] flex items-center gap-1 cursor-pointer border border-stone-200 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-600" /> Invoice 🧾
                          </button>

                          {b.status === BookingStatus.CONFIRMED && b.roomId && (
                            <button
                              onClick={() => handleStatusUpdate(b.id, BookingStatus.CHECKED_IN)}
                              title="Process check-in key handoff"
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <LogIn className="w-3.5 h-3.5" /> Check-In
                            </button>
                          )}

                          {b.status === BookingStatus.CHECKED_IN && (
                            <button
                              onClick={() => handleStatusUpdate(b.id, BookingStatus.CHECKED_OUT)}
                              title="Process key returns and check-out room cleaning"
                              className="px-2.5 py-1 bg-stone-900 hover:bg-stone-850 text-white rounded font-bold font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <LogOut className="w-3.5 h-3.5 text-indigo-700" /> Check-Out
                            </button>
                          )}

                          {b.status !== BookingStatus.CANCELLED && (
                            <div className="relative inline-block text-left">
                              <select
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    handleManualMessageDispatch(b.id, val);
                                    e.target.value = "";
                                  }
                                }}
                                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded font-mono text-[10px] cursor-pointer border border-stone-200 outline-none"
                                defaultValue=""
                              >
                                <option value="" disabled>🔔 Notify Guest...</option>
                                <option value="booking_confirmation">📧 Booking Confirm</option>
                                <option value="check_in_reminder">🛎️ Check-in Guide</option>
                                <option value="check_out_confirmation">🧾 Checkout Invoice</option>
                              </select>
                            </div>
                          )}

                          {b.status !== BookingStatus.CANCELLED && b.status !== BookingStatus.CHECKED_OUT && (
                            <button
                              onClick={() => handleStatusUpdate(b.id, BookingStatus.CANCELLED)}
                              title="Cancel room booking"
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {(b.status === BookingStatus.CANCELLED || b.status === BookingStatus.CHECKED_OUT) && (
                            <span className="text-[10px] text-stone-400 italic">Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MANUAL RESERVATION POPUP FORM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-stone-200 shadow-2xl overflow-hidden text-stone-800">
            {/* Header */}
            <div className="bg-stone-900 text-white px-6 py-4 flex justify-between items-center border-b border-stone-800">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" /> Create Manual Reception Booking
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleManualFormSubmit} className="p-6 flex flex-col gap-4 text-xs">
              {/* Row 1: Guest contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-stone-500 uppercase mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-stone-500 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={mEmail}
                    onChange={(e) => setMEmail(e.target.value)}
                    placeholder="sharma@example.com"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-stone-500 uppercase mb-1">Mobile Num</label>
                  <input
                    type="text"
                    required
                    value={mPhone}
                    onChange={(e) => setMPhone(e.target.value)}
                    placeholder="+91 90022 33445"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* RESERVATION TYPE SELECTOR TABS */}
              <div className="bg-stone-100 p-1 rounded-xl flex gap-1 border border-stone-200 mt-2">
                {[
                  { id: "Room Booking", label: "🛎️ Room Booking" },
                  { id: "Conference Hall Booking", label: "🏛️ Hall Booking" },
                  { id: "Corporate Booking", label: "💼 Corporate Booking" },
                  { id: "Group Booking", label: "👥 Group booking" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMBookingType(tab.id as any);
                      // Recalculate based on specific defaults
                      if (tab.id === "Conference Hall Booking") {
                        setMPrice(15000); // Default Hall Rate
                      } else {
                        handleRecalculatePrice(mRoomTypeId, mCheckIn, mCheckOut);
                      }
                    }}
                    className={`flex-1 py-2 text-center rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      mBookingType === tab.id
                        ? "bg-stone-900 text-white shadow-xs font-black"
                        : "text-stone-500 hover:text-stone-850 hover:bg-stone-200/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* DYNAMICAL DEDICATED BOOKING WORKFLOW SCHEME FORM */}
              <div className="border border-stone-200/70 p-4 rounded-xl bg-stone-50/60 flex flex-col gap-4">
                
                {/* 1. ROOM BOOKING DEDICATED SCHEME */}
                {mBookingType === "Room Booking" && (
                  <div className="flex flex-col gap-4">
                    <span className="block text-[10px] font-mono font-bold text-stone-500 uppercase flex items-center gap-1">✓ Room Stay Allocation Specs</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">ROOM CATEGORY</label>
                        <select
                          value={mRoomTypeId}
                          onChange={(e) => {
                            setMRoomTypeId(e.target.value);
                            handleRecalculatePrice(e.target.value, mCheckIn, mCheckOut);
                            setMRoomId("");
                          }}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800"
                        >
                          {roomTypes.map(r => (
                            <option key={r.id} value={r.id}>{r.name} (from ₹{r.basePrice}/N)</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">ROOM UNIT ASSIGNMENT</label>
                        <select
                          value={mRoomId}
                          onChange={(e) => setMRoomId(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-850 font-mono"
                        >
                          <option value="">Guaranteed category (Unassigned)</option>
                          {rooms
                            .filter(r => r.roomTypeId === mRoomTypeId && r.status === RoomStatus.AVAILABLE)
                            .map(r => (
                              <option key={r.id} value={r.id}>Room {r.id}</option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">CAPACITY</label>
                        <select
                          value={mGuests}
                          onChange={(e) => setMGuests(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg text-xs text-stone-800"
                        >
                          <option value={1}>1 Guest stay</option>
                          <option value={2}>2 Guests standard</option>
                          <option value={3}>3 Guests triple share</option>
                          <option value={4}>4 Guests Quad share</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">CHECK-IN CALENDAR</label>
                        <input
                          type="date"
                          required
                          value={mCheckIn}
                          onChange={(e) => {
                            setMCheckIn(e.target.value);
                            handleRecalculatePrice(mRoomTypeId, e.target.value, mCheckOut);
                          }}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-mono"
                        >
                        </input>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">CHECK-OUT CALENDAR</label>
                        <input
                          type="date"
                          required
                          value={mCheckOut}
                          onChange={(e) => {
                            setMCheckOut(e.target.value);
                            handleRecalculatePrice(mRoomTypeId, mCheckIn, e.target.value);
                          }}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-mono"
                        >
                        </input>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">BOOKING SOURCE CHANNEL</label>
                        <select
                          value={mSource}
                          onChange={(e) => setMSource(e.target.value as BookingSource)}
                          className="w-full px-3 py-1.5 border border-stone-200 bg-white rounded-lg text-xs text-stone-800"
                        >
                          <option value={BookingSource.WALK_IN}>Walk-in registration</option>
                          <option value={BookingSource.PHONE}>Phone reservation</option>
                          <option value={BookingSource.BOOKING_COM}>Booking.com</option>
                          <option value={BookingSource.MAKEMYTRIP}>MakeMyTrip</option>
                          <option value={BookingSource.AGODA}>Agoda</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CONFERENCE HALL BOOKING DEDICATED SCHEME */}
                {mBookingType === "Conference Hall Booking" && (
                  <div className="flex flex-col gap-4">
                    <span className="block text-[10px] font-mono font-bold text-stone-500 uppercase flex items-center gap-1">✓ Conference Hall Reservation specifics</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">SELECT CONFERENCE HALL</label>
                        <select
                          value={mHallName}
                          onChange={(e) => {
                            setMHallName(e.target.value);
                            // Adjust hall price rates dynamically
                            let rate = 15000;
                            if (e.target.value === "Ocean View Seminar Deck") rate = 8000;
                            if (e.target.value === "Coastal Executive Boardroom") rate = 5000;
                            if (e.target.value === "Grand Ballroom") rate = 25000;
                            setMPrice(rate);
                          }}
                          className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg text-xs text-stone-800 font-semibold"
                        >
                          <option value="Grand Ballroom">Grand Ballroom Banquet Space (Pargana) - ₹25k/D</option>
                          <option value="Ocean View Seminar Deck">Ocean View Seminar Deck (Mahodadhi) - ₹8k/D</option>
                          <option value="Coastal Executive Boardroom">Coastal Executive Boardroom (Chakra) - ₹5k/D</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">ARRANGEMENT CLASS</label>
                        <select
                          value={mHallLayout}
                          onChange={(e) => setMHallLayout(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg text-xs text-stone-800"
                        >
                          <option value="Theater Style">Theater Style seating (Delegates block)</option>
                          <option value="U-Shape Seating">U-Shape arrangement layout</option>
                          <option value="Classroom Seating">Classroom Seating Setup</option>
                          <option value="Banquet Board">Banquet Round tables</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">CATERING SERVICES PROGRAM</label>
                        <select
                          value={mHallCatering}
                          onChange={(e) => setMHallCatering(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 bg-white bg-white rounded-lg text-xs text-stone-800"
                        >
                          <option value="Standard Tea / Snacks">Standard High Tea & Snacks Package</option>
                          <option value="Executive Lunch Buffet">Full Executive Lunch Buffet</option>
                          <option value="VIP Coastal Feast">VIP Coastal Seafood Feast Plan</option>
                          <option value="None">No Food Service (Accommodation Only)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">AV ACCESSORIES SETUP</label>
                        <select
                          value={mHallAVOption}
                          onChange={(e) => setMHallAVOption(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg text-xs text-stone-800"
                        >
                          <option value="Full AV/Wireless Mic Array">Full Stereo AV Integration + Dual wireless mics</option>
                          <option value="Projector & Dual Screens">Overhead Projector, Whiteboard & Screens</option>
                          <option value="Hybrid Conferencing Rig">Hybrid Meeting setup (Omni mics + Tracking Cam)</option>
                          <option value="None">No additional sound accessories</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">EVENT DATE</label>
                        <input
                          type="date"
                          value={mCheckIn}
                          onChange={(e) => {
                            setMCheckIn(e.target.value);
                            setMCheckOut(e.target.value); // Hall events default 1 day
                          }}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">BOOKING SOURCE CHANNEL</label>
                        <select
                          value={mSource}
                          onChange={(e) => setMSource(e.target.value as BookingSource)}
                          className="w-full px-3 py-1.5 border border-stone-200 bg-white rounded-lg text-xs text-stone-805"
                        >
                          <option value={BookingSource.WALK_IN}>Walk-in Desk order</option>
                          <option value={BookingSource.PHONE}>Phone Order</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. CORPORATE BOOKING DEDICATED SCHEME */}
                {mBookingType === "Corporate Booking" && (
                  <div className="flex flex-col gap-4">
                    <span className="block text-[10px] font-mono font-bold text-stone-500 uppercase flex items-center gap-1">✓ Corporate Legal Contract info</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">COMPANY FULL REGISTERED NAME</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. TATA Consultancy Ltd"
                          value={mCompanyName}
                          onChange={(e) => setMCompanyName(e.target.value)}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-800 bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">GSTIN REGISTRATION NUMBER</label>
                        <input
                          type="text"
                          required
                          placeholder="GST No: 19AAAAA0000A1Z5"
                          value={mCompanyGST}
                          onChange={(e) => setMCompanyGST(e.target.value)}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-800 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">VERIFIED BUSINESS EMAIL</label>
                        <input
                          type="email"
                          required
                          placeholder="executive@corporate.com"
                          value={mBusinessEmail}
                          onChange={(e) => setMBusinessEmail(e.target.value)}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-800 bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">DESIGNATION TYPE</label>
                        <input
                          type="text"
                          placeholder="e.g. Lead Managing Architect"
                          value={mDesignation}
                          onChange={(e) => setMDesignation(e.target.value)}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-800 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">EMPLOYEE REGISTRATION ID</label>
                        <input
                          type="text"
                          placeholder="e.g. EMP-99221"
                          value={mEmployeeId}
                          onChange={(e) => setMEmployeeId(e.target.value)}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-800 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">SETTLEMENT METHOD STYLE</label>
                        <select
                          value={mCorporateBillingOption}
                          onChange={(e) => setMCorporateBillingOption(e.target.value)}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs bg-white text-stone-805"
                        >
                          <option value="Credit Card">Executive Credit Card Settlement</option>
                          <option value="Invoice Transfer">Invoice Transfer to corporate account</option>
                          <option value="Direct Cash">Self reimbursement desk check-out (Cash)</option>
                        </select>
                      </div>
                    </div>

                    {/* Stay selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-stone-100">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">ROOM TYPE CATEGORY</label>
                        <select
                          value={mRoomTypeId}
                          onChange={(e) => {
                            setMRoomTypeId(e.target.value);
                            handleRecalculatePrice(e.target.value, mCheckIn, mCheckOut);
                          }}
                          className="w-full px-3 py-1.5 border border-stone-200 bg-white rounded-lg text-xs text-stone-800"
                        >
                          {roomTypes.map(r => (
                            <option key={r.id} value={r.id}>{r.name} (from ₹{r.basePrice}/N)</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">CHECK-IN</label>
                        <input
                          type="date"
                          value={mCheckIn}
                          onChange={(e) => {
                            setMCheckIn(e.target.value);
                            handleRecalculatePrice(mRoomTypeId, e.target.value, mCheckOut);
                          }}
                          className="w-full px-3 py-1 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">CHECK-OUT</label>
                        <input
                          type="date"
                          value={mCheckOut}
                          onChange={(e) => {
                            setMCheckOut(e.target.value);
                            handleRecalculatePrice(mRoomTypeId, mCheckIn, e.target.value);
                          }}
                          className="w-full px-3 py-1 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. GROUP BOOKING DEDICATED SCHEME */}
                {mBookingType === "Group Booking" && (
                  <div className="flex flex-col gap-4">
                    <span className="block text-[10px] font-mono font-bold text-stone-500 uppercase flex items-center gap-1">✓ Group Block Reservation details</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">TOUR AGENCY / MAIN ORGANIZER</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Royal Pilgrimage Tours"
                          value={mAgencyName}
                          onChange={(e) => setMAgencyName(e.target.value)}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-800 bg-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">ROOMS QUANTITY BLOCK REQUIRED</label>
                        <select
                          value={mGroupRoomCount}
                          onChange={(e) => {
                            const cnt = Number(e.target.value);
                            setMGroupRoomCount(cnt);
                            // Set custom group rate
                            const rt = roomTypes.find(r => r.id === mRoomTypeId);
                            setMPrice((rt?.basePrice || 2000) * cnt * 2); // 2 nights standard estimate
                          }}
                          className="w-full px-3 py-1.5 border border-stone-200 bg-white rounded-lg text-xs text-stone-800 font-bold"
                        >
                          {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(v => (
                            <option key={v} value={v}>{v} Rooms block allocation</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">GROUP MEALS PLAN</label>
                        <select
                          value={mGroupMealPlan}
                          onChange={(e) => setMGroupMealPlan(e.target.value)}
                          className="w-full px-3 py-1.5 border border-stone-200 bg-white rounded-lg text-xs text-stone-805"
                        >
                          <option value="EP (Room Only)">EP (European Plan - Accommodation Only)</option>
                          <option value="CP (Buffet Breakfast)">CP (Continental Plan - Buffet Breakfast)</option>
                          <option value="MAP (Breakfast + Dinner)">MAP (Modified Plan - Breakfast + Corporate Feast)</option>
                          <option value="AP (All Meals buffet)">AP (American Plan - Breakfast + Lunch + Dinner)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">TOUR COORDINATOR LEADER NAME</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. S.K. Mohapatra (Captain)"
                          value={mGroupLeader}
                          onChange={(e) => setMGroupLeader(e.target.value)}
                          className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-800 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">CHECK-IN DATE</label>
                        <input
                          type="date"
                          value={mCheckIn}
                          onChange={(e) => {
                            setMCheckIn(e.target.value);
                            handleRecalculatePrice(mRoomTypeId, e.target.value, mCheckOut);
                          }}
                          className="w-full px-3 py-1 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 mb-0.5">CHECK-OUT DATE</label>
                        <input
                          type="date"
                          value={mCheckOut}
                          onChange={(e) => {
                            setMCheckOut(e.target.value);
                            handleRecalculatePrice(mRoomTypeId, mCheckIn, e.target.value);
                          }}
                          className="w-full px-3 py-1 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 4: Pricing & Payment Modes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200/50">
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-stone-500 uppercase mb-1">Net Invoice Nett Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={mPrice}
                    onChange={(e) => setMPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm font-bold text-amber-700 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-stone-500 uppercase mb-1">Payment Method</label>
                  <select
                    value={mPayMethod}
                    onChange={(e) => setMPayMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs"
                  >
                    <option value="Cash">Cash at Desk</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="Razorpay">Razorpay Checkout Gateway</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-stone-500 uppercase mb-1">Receipt Status</label>
                  <select
                    value={mPayStatus}
                    onChange={(e) => setMPayStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs"
                  >
                    <option value={PaymentStatus.PAID}>Paid</option>
                    <option value={PaymentStatus.PENDING}>Pending Collection</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-mono font-semibold text-stone-500 uppercase mb-1.5">Internal Desk Remarks</label>
                <textarea
                  rows={2}
                  value={mNotes}
                  onChange={(e) => setMNotes(e.target.value)}
                  placeholder="Late check-in requested or special butler layouts..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm resize-none"
                ></textarea>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-lg font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-lg font-bold hover:bg-amber-600 hover:text-stone-950 transition-all cursor-pointer shadow-md"
                >
                  {isSubmitting ? "Bookings compiling..." : "Process Desk Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Dispatch alerts stream */}
      <div className="mt-8 bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden p-6 mb-12 text-stone-800">
        <div className="flex justify-between items-center mb-5 border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Property Notification Dispatch Stream</h3>
            <p className="text-stone-400 text-[10px] font-mono uppercase mt-0.5">Real-time SMTP (Ethereal) & WhatsApp twilio delivery dispatches</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] font-mono font-bold leading-none uppercase">Alerts Terminal</span>
        </div>

        {(!messageLogs || messageLogs.length === 0) ? (
          <div className="py-8 text-center text-stone-400 font-mono text-xs">
            <span>No automatic or manual notification logs registered in this session. Create a booking to test automatic dispatches!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
            {messageLogs.map((log: any) => (
              <div key={log.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between gap-3 text-xs shadow-xs hover:border-stone-300 transition-all">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono ${
                        log.type === "email" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-teal-100 text-teal-800 border border-teal-200"
                      }`}>
                        {log.type}
                      </span>
                      <strong className="text-stone-800 font-bold capitalize">{log.event.replace(/_/g, " ")}</strong>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono block mt-1">Recipient: <strong className="text-stone-600">{log.recipient}</strong> ({log.guestName})</span>
                    <span className="text-[10px] text-stone-400 font-mono block">Booking: <strong className="text-stone-600">{log.bookingId}</strong></span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold font-mono tracking-wider uppercase ${
                    log.status === "Sent" ? "bg-emerald-100 text-emerald-850 border border-emerald-250 font-bold" :
                    log.status === "Simulated" ? "bg-amber-105 text-amber-850 border border-amber-205 font-bold" :
                    "bg-rose-100 text-rose-800 border border-rose-250 font-bold"
                  }`}>
                    {log.status}
                  </span>
                </div>

                <div className="border-t border-stone-150 pt-2.5 flex justify-between items-center mt-1">
                  <span className="text-[10px] text-stone-450 font-mono">
                    {new Date(log.sentAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                  </span>
                  <div className="flex gap-2">
                    {log.etherealUrl && (
                      <a
                        href={log.etherealUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-[9px] font-mono font-bold hover:bg-indigo-100 transition-colors"
                      >
                        Open Ethereal Mailbox ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. DETAILED INVOICE & STAY PROFILE MODAL (WITH EXPORT TO PDF) */}
      {selectedBooking && (() => {
        const b = selectedBooking;
        const guest = guests.find(g => g.id === b.guestId);
        const rt = roomTypes.find(t => t.id === b.roomTypeId);
        
        // Calculate staying duration
        const d1 = new Date(b.checkInDate);
        const d2 = new Date(b.checkOutDate);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        // Base price calculation matching base system state
        const basePrice = rt?.basePrice || Math.round(b.totalPrice / 1.12 / diffDays);
        const accommodationTotal = basePrice * diffDays;
        
        // Sum up custom service lines
        const servicesTotal = (b.customServiceLines || []).reduce((sum: number, line: any) => sum + line.amount, 0);
        const baseSubtotal = accommodationTotal + servicesTotal;
        
        // Calculate dynamic discounts applied
        let calculatedDiscount = b.discountAmount || 0;
        if (b.discountPercent) {
          calculatedDiscount = Math.round(baseSubtotal * (b.discountPercent / 100));
        }

        const subtotal = Math.max(0, baseSubtotal - calculatedDiscount);
        const luxuryTax = Math.round(subtotal * 0.12);
        const grandTotal = subtotal + luxuryTax;

        // Interactive Event logs (synthesized gracefully for the demo)
        const currentLogs = b.auditLogs || [
          { timestamp: b.createdAt || new Date().toISOString(), action: "Booking Created", user: guest?.name || "Client", notes: "Registered through beach website gateway." }
        ];

        // Recalculates extend stay prices live
        const extendedCheckoutDate = (() => {
          const d = new Date(b.checkOutDate);
          d.setDate(d.getDate() + Number(extNights));
          return d.toISOString().split("T")[0];
        })();
        const extensionAccommodationTotal = basePrice * (diffDays + Number(extNights));
        const extensionSubtotal = Math.max(0, extensionAccommodationTotal + servicesTotal - calculatedDiscount);
        const extensionTax = Math.round(extensionSubtotal * 0.12);
        const extensionGrandTotal = extensionSubtotal + extensionTax;

        // Early checkout calculations
        const earlyCheckoutNights = Math.max(1, diffDays - Number(earlyDaysToSub));
        const adjustedAccommodationTotal = basePrice * earlyCheckoutNights;
        const adjustedSubtotal = Math.max(0, adjustedAccommodationTotal + servicesTotal - calculatedDiscount);
        const adjustedTax = Math.round(adjustedSubtotal * 0.12);
        const adjustedGrandTotal = adjustedSubtotal + adjustedTax;
        const earlyCheckoutDate = (() => {
          const d = new Date(b.checkInDate);
          d.setDate(d.getDate() + earlyCheckoutNights);
          return d.toISOString().split("T")[0];
        })();

        // Handler functions saving straight to backend database for demonstration sturdiness
        const handleAddCustomCharge = async () => {
          if (!customLineDesc || customLineAmt <= 0) {
            alert("Please state a description and a valid decimal amount.");
            return;
          }
          const lines = b.customServiceLines || [];
          const newLine = { description: customLineDesc, amount: Number(customLineAmt), addedAt: new Date().toISOString() };
          const updatedLines = [...lines, newLine];
          
          const logPayload = [
            ...currentLogs,
            { timestamp: new Date().toISOString(), action: "Service Added", user: "Front Desk Staff", notes: `Invoiced: ${customLineDesc} for ₹${customLineAmt}` }
          ];

          await onUpdateBooking(b.id, { 
            customServiceLines: updatedLines,
            auditLogs: logPayload
          });
          
          // Force update local hook state to reflect in UI
          setSelectedBooking({ ...b, customServiceLines: updatedLines, auditLogs: logPayload });
          setCustomLineDesc("");
          setCustomLineAmt(0);
        };

        const handleApplyDiscount = async () => {
          let discAmtVal = 0;
          let discPctVal = 0;
          
          if (discountMethod === "percent") {
            discPctVal = Number(discountVal);
          } else {
            discAmtVal = Number(discountVal);
          }

          const logPayload = [
            ...currentLogs,
            { timestamp: new Date().toISOString(), action: "Discount Modified", user: "Front Desk Staff", notes: `Applied ${discountVal}${discountMethod === "percent" ? "%" : " flat cash"}` }
          ];

          await onUpdateBooking(b.id, {
            discountAmount: discAmtVal,
            discountPercent: discPctVal,
            auditLogs: logPayload
          });

          setSelectedBooking({ ...b, discountAmount: discAmtVal, discountPercent: discPctVal, auditLogs: logPayload });
          alert("✓ Discount applied successfully!");
        };

        const handleRemoveServiceLine = async (index: number) => {
          const lines = b.customServiceLines || [];
          const updatedLines = lines.filter((_: any, i: number) => i !== index);
          
          const logPayload = [
            ...currentLogs,
            { timestamp: new Date().toISOString(), action: "Service Removed", user: "Front Desk Staff", notes: "Surgically extracted custom ledger line" }
          ];

          await onUpdateBooking(b.id, {
            customServiceLines: updatedLines,
            auditLogs: logPayload
          });
          setSelectedBooking({ ...b, customServiceLines: updatedLines, auditLogs: logPayload });
        };

        const handleScheduleTransport = async () => {
          if (!transVeh) {
            alert("Please select a transport shuttle type.");
            return;
          }
          const newTransport = {
            vehicleType: transVeh,
            pickupAddress: transPickLoc || "Resort Main Entry Gates",
            dropAddress: transDropLoc || "City Airport Terminal",
            scheduleTime: transTimeSch || "12:00 PM (Liaison)",
            status: "Scheduled"
          };

          const logPayload = [
            ...currentLogs,
            { timestamp: new Date().toISOString(), action: "Transport Liaison", user: "Front Desk Staff", notes: `Scheduled ${transVeh} - ${transPickLoc} to ${transDropLoc}` }
          ];

          await onUpdateBooking(b.id, {
            transport: newTransport,
            auditLogs: logPayload
          });

          setSelectedBooking({ ...b, transport: newTransport, auditLogs: logPayload });
          alert(`✓ Transfer booked! ${transVeh} shuttle scheduled.`);
        };

        const handleConfirmExtend = async () => {
          const updatedLogs = [
            ...currentLogs,
            { timestamp: new Date().toISOString(), action: "Stay Extended", user: "Front Desk Staff", notes: `Extension: +${extNights} Nights. checkout date updated to ${extendedCheckoutDate}.` }
          ];

          await onUpdateBooking(b.id, {
            checkOutDate: extendedCheckoutDate,
            totalPrice: extensionGrandTotal,
            auditLogs: updatedLogs
          });

          setSelectedBooking({ ...b, checkOutDate: extendedCheckoutDate, totalPrice: extensionGrandTotal, auditLogs: updatedLogs });
          setValChecked(false);
          setValAvailable(null);
          alert("✓ Stay extended successfully in local database and synchronized live!");
        };

        const handleExecuteEarlyCheckout = async () => {
          const updatedLogs = [
            ...currentLogs,
            { timestamp: new Date().toISOString(), action: "Early Checkout Complete", user: "Front Desk Staff", notes: `Checked-out early. Stay shortened to ${earlyCheckoutNights} Nights. Settlement Amount: ₹${adjustedGrandTotal}` }
          ];

          await onUpdateBooking(b.id, {
            status: BookingStatus.CHECKED_OUT,
            checkOutDate: earlyCheckoutDate,
            totalPrice: adjustedGrandTotal,
            paymentStatus: PaymentStatus.PAID,
            auditLogs: updatedLogs
          });

          setSelectedBooking({ 
            ...b, 
            status: BookingStatus.CHECKED_OUT, 
            checkOutDate: earlyCheckoutDate, 
            totalPrice: adjustedGrandTotal, 
            paymentStatus: PaymentStatus.PAID,
            auditLogs: updatedLogs 
          });
          setEarlySettleDone(true);
        };

        const handlePerformCancellation = async () => {
          if (!cancReason) {
            alert("A cancellation reason is required for administrative auditing.");
            return;
          }

          const updatedLogs = [
            ...currentLogs,
            { timestamp: new Date().toISOString(), action: "Reservation Cancelled", user: "Front Desk Staff", notes: `Admin Cancel Event: ${cancReason}` }
          ];

          await onUpdateBooking(b.id, {
            status: BookingStatus.CANCELLED,
            cancellationReason: cancReason,
            auditLogs: updatedLogs
          });

          setSelectedBooking({
            ...b,
            status: BookingStatus.CANCELLED,
            cancellationReason: cancReason,
            auditLogs: updatedLogs
          });

          alert("⚠ Reservation has been successfully cancelled & logged.");
        };

        return (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl border border-stone-200 shadow-2xl overflow-hidden text-stone-850 flex flex-col my-8 max-h-[92vh]">
              
              {/* Header with quick booking code */}
              <div className="bg-stone-900 text-white px-6 py-4 flex justify-between items-center border-none">
                <div className="flex items-center gap-2.5">
                  <div className="bg-amber-600 p-1.5 rounded-lg text-stone-950 font-bold font-mono text-sm leading-none">
                    {b.id}
                  </div>
                  <div>
                    <h2 className="font-bold text-sm tracking-tight flex items-center gap-2">
                       Guest Stay Profile & Service Coordinator
                    </h2>
                    <span className="text-[10px] text-slate-400 font-mono">Channel: <span className="text-amber-500 font-bold uppercase">{b.source}</span> • Type: <strong>{b.bookingType || "Room Booking"}</strong></span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="text-stone-400 hover:text-white font-bold cursor-pointer transition-colors p-1"
                >
                  ✕
                </button>
              </div>

              {/* Sub Navigation Tabs Bar */}
              <div className="bg-slate-100 border-b border-stone-200 px-4 flex gap-1 overflow-x-auto">
                {[
                  { id: "invoice", label: "🧾 Billing & GST Preview" },
                  { id: "verification", label: "🔑 Web Check-In Check" },
                  { id: "transport", label: "🚕 Shuttle Transport" },
                  { id: "extend", label: "🗓️ Extend Booking Study" },
                  { id: "early_checkout", label: "🚪 Early Checkout Settler" },
                  { id: "audit", label: "🕵️ Audit Trails & Cancel" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setDetailTab(tab.id as any);
                    }}
                    className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                      detailTab === tab.id
                        ? "border-amber-600 text-amber-800 bg-white font-bold"
                        : "border-transparent text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Contents */}
              <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-6 max-h-[60vh]">
                
                {detailTab === "verification" && (
                  <div className="flex flex-col gap-5">
                    <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 text-xs">
                      <h3 className="font-bold text-sm text-stone-900 mb-3 flex items-center gap-2">
                        <span className="p-1 bg-indigo-150 text-indigo-700 rounded-lg">📋</span>
                        Guest Self Web Check-In Verification
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-mono text-[9px] text-stone-400 uppercase tracking-wider">Web Check-In Status</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`px-2.5 py-1 text-[11px] font-bold font-mono rounded uppercase ${
                              (b as any).webCheckInStatus === "Verified" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                              (b as any).webCheckInStatus === "Rejected" ? "bg-rose-100 text-rose-800 border border-rose-200" :
                              (b as any).webCheckInStatus === "Re-upload Required" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                              (b as any).webCheckInStatus === "Pending Verification" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                              "bg-stone-100 text-stone-600 border border-stone-200"
                            }`}>
                              {(b as any).webCheckInStatus || "Not Checked-In Yet"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="font-mono text-[9px] text-stone-400 uppercase tracking-wider">Arrival Intelligence</p>
                          <div className="mt-1">
                            <span className="font-semibold text-stone-800 font-sans">Mode: </span>
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold text-slate-700">
                              {(b as any).arrivalMode || "Self Drive"}
                            </span>
                            {(b as any).eta && (
                              <p className="mt-1 text-stone-500">
                                ETA: <strong className="text-stone-700">{(b as any).eta}</strong>
                              </p>
                            )}
                            {(b as any).arrivalDetails && (
                              <p className="text-stone-500 italic mt-0.5">{(b as any).arrivalDetails}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Co-Guests */}
                      <div className="mt-4 pt-4 border-t border-stone-200">
                        <p className="font-mono text-[9px] text-stone-400 uppercase tracking-wider mb-2 font-bold text-stone-500">Accompanying Co-Guests</p>
                        {((b as any).coGuests && (b as any).coGuests.length > 0) ? (
                          <div className="flex flex-col gap-1">
                            {((b as any).coGuests || []).map((cg: any, i: number) => (
                              <div key={i} className="bg-white p-2.5 rounded-lg border border-stone-200 flex justify-between items-center text-xs">
                                <div>
                                  <strong className="text-stone-800">{cg.name}</strong>
                                  <span className="text-stone-500 ml-2">Age: {cg.age} • Relation: {cg.relation}</span>
                                </div>
                                <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 font-mono font-bold">
                                  ID Type: {cg.idType || "Aadhaar"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-stone-400 italic">No additional guests declared during web check-in.</p>
                        )}
                      </div>

                      {/* Document Proof Section */}
                      <div className="mt-4 pt-4 border-t border-stone-200">
                        <p className="font-mono text-[9px] text-stone-400 uppercase tracking-wider mb-2 font-bold text-stone-500">Uploaded Document Proof</p>
                        {guest?.idType ? (
                          <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <span className="text-3xl">🪪</span>
                              <div>
                                <strong className="text-stone-800 text-sm block">{guest.idType} Card Uploaded</strong>
                                <span className="text-xs text-stone-550 block font-mono mt-0.5">Reference Number: <span className="font-bold text-stone-800">{guest.idNumber}</span></span>
                                <span className="text-[10px] text-indigo-600 block hover:underline font-mono mt-1 cursor-pointer">
                                  📄 View Fullscreen Document Proof (simulated_id.jpg)
                                </span>
                              </div>
                            </div>
                            <div className="bg-stone-50 p-2 border border-dashed border-stone-300 rounded-lg text-center max-w-xs">
                              <p className="text-[10px] text-stone-500 font-mono">Simulated ID Proof Image</p>
                              <div className="mt-1 bg-stone-200 text-[10px] text-stone-700 px-4 py-3 rounded border border-stone-300 select-none font-mono">
                                GUEST_GOVT_ID: {guest.idNumber}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-stone-400 italic">No official ID uploaded yet. E-Check-In has not been started.</p>
                        )}
                      </div>

                      {/* FRONT DESK ACTION BUTTONS */}
                      <div className="mt-5 pt-4 border-t border-stone-200 flex flex-wrap gap-2 justify-end">
                        <button
                          type="button"
                          onClick={async () => {
                            const updatedLogs = [
                              ...currentLogs,
                              { timestamp: new Date().toISOString(), action: "E-CheckIn Verified", user: "Front Desk Staff", notes: "Governing receptionist verified & approved guest documentation." }
                            ];
                            await onUpdateBooking(b.id, {
                              webCheckInStatus: "Verified",
                              auditLogs: updatedLogs
                            });
                            setSelectedBooking({ ...b, webCheckInStatus: "Verified", auditLogs: updatedLogs });
                            alert("✓ Document verified & Web Check-In approved!");
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer transition-colors text-xs flex items-center gap-1"
                        >
                          Verify & Approve ID ✓
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const updatedLogs = [
                              ...currentLogs,
                              { timestamp: new Date().toISOString(), action: "E-CheckIn Rejected", user: "Front Desk Staff", notes: "Receptionist rejected uploaded documents. Re-upload request dispatched." }
                            ];
                            await onUpdateBooking(b.id, {
                              webCheckInStatus: "Rejected",
                              auditLogs: updatedLogs
                            });
                            setSelectedBooking({ ...b, webCheckInStatus: "Rejected", auditLogs: updatedLogs });
                            alert("✓ Document verification rejected!");
                          }}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer transition-colors text-xs flex items-center gap-1"
                        >
                          Reject Verification ✕
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const updatedLogs = [
                              ...currentLogs,
                              { timestamp: new Date().toISOString(), action: "Re-upload Required", user: "Front Desk Staff", notes: "Marked uploaded proof as illegible. Prompted guest to re-upload ID." }
                            ];
                            await onUpdateBooking(b.id, {
                              webCheckInStatus: "Re-upload Required",
                              auditLogs: updatedLogs
                            });
                            setSelectedBooking({ ...b, webCheckInStatus: "Re-upload Required", auditLogs: updatedLogs });
                            alert("✓ Marked as 'Re-upload Required'!");
                          }}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg cursor-pointer transition-colors text-xs flex items-center gap-1"
                        >
                          Request Re-upload 🔁
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 1: BILLING & INVOICE CUSTOMIZATION */}
                {detailTab === "invoice" && (
                  <div className="flex flex-col gap-5">
                    
                    {/* Header Guest Registry */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200/60 text-xs text-slate-800">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-400 block mb-1 font-mono">GUEST INFORMATION</span>
                        <div className="font-bold text-sm text-stone-900">{guest?.name}</div>
                        <div className="text-stone-405 mt-0.5">{guest?.phone} • {guest?.email}</div>
                        {guest?.idType && (
                          <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-100 rounded px-1.5 py-0.5 text-[9px] font-bold mt-1.5 uppercase">
                            ✓ Verified Id: {guest.idType} ({guest.idNumber})
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-stone-400 block mb-1 font-mono">STAY PERIOD SUMMARY</span>
                        <div>Check-in: <strong>{b.checkInDate}</strong></div>
                        <div>Check-out: <strong>{b.checkOutDate}</strong></div>
                        <div className="text-amber-800 font-bold mt-1.5">{diffDays} Night(s) staying in {rt?.name} (Room {b.roomId || "Unassigned"})</div>
                      </div>
                    </div>

                    {/* REPEAT GUEST INTELLIGENCE PROFILE (Module 3) */}
                    {guest && (() => {
                      // Detect if has historical or current other stays
                      const otherBookings = bookings.filter(bk => bk.guestId === guest.id && bk.id !== b.id);
                      const isRepeatGuest = otherBookings.length > 0 || guest.name.includes("Mishra") || guest.name.includes("Patnaik") || guest.name.includes("Sangharsh") || guest.name.includes("Doe") || guest.name.includes("Sharma");
                      
                      if (!isRepeatGuest) return null;
                      
                      const pastVisitsCount = Math.max(1, otherBookings.length) + (guest.name.includes("Mishra") ? 3 : guest.name.includes("Doe") ? 1 : 2);
                      const totalNightsStayed = Math.max(3, otherBookings.reduce((sum, bk) => {
                        const d1 = new Date(bk.checkInDate);
                        const d2 = new Date(bk.checkOutDate);
                        return sum + Math.max(1, Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
                      }, 0)) + (guest.name.includes("Mishra") ? 8 : 4);
                      
                      const lastStayDate = otherBookings[0]?.checkOutDate || "2026-05-18";
                      const preferredRoomType = otherBookings[0] ? roomTypes.find(rt => rt.id === otherBookings[0].roomTypeId)?.name : "Mahodadhi Sea-Facing Royal Suite";
                      const preferredServices = guest.name.includes("Mishra") ? "Drinking Water, Extra Towels, Temple Priest Escort" : "Housekeeping, Airport Shuttle, Laundry Service";
                      const avgFeedbackRating = "4.8 / 5";
                      const prevDiscountsGiven = "10% VIP Privilege discount, phone-call approved";
                      const transportHistory = "Puri Railway Station Pick-Up & Marine Drive Safari Shuttle";

                      return (
                        <div id="repeat-guest-profile-card" className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-4 border border-amber-250 rounded-2xl space-y-3 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-amber-800 font-extrabold text-xs">
                              👑 RETURNING GUEST - INTEL PASS ACTIVE
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 font-mono text-[9px] font-bold uppercase tracking-wider border border-amber-500/20">
                              Returning Guest Badge
                            </span>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-[11px] text-slate-700">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-stone-400 block font-mono">Previous Visits</span>
                              <p className="font-extrabold text-slate-900">{pastVisitsCount} visits logged</p>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-stone-400 block font-mono">Last Stay Date</span>
                              <p className="font-extrabold text-slate-900">{lastStayDate}</p>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-stone-400 block font-mono">Total Nights Stayed</span>
                              <p className="font-extrabold text-slate-900">{totalNightsStayed} nights total</p>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-stone-400 block font-mono">Preferred Room Type</span>
                              <p className="font-extrabold text-slate-900">{preferredRoomType || "Ocean Suite Room"}</p>
                            </div>
                            <div className="lg:col-span-2">
                              <span className="text-[9px] uppercase font-bold text-stone-400 block font-mono">Preferred Services</span>
                              <p className="font-extrabold text-amber-800">{preferredServices}</p>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-stone-400 block font-mono">Previous Discounts Given</span>
                              <p className="font-extrabold text-slate-900">{prevDiscountsGiven}</p>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-stone-400 block font-mono">Transport History</span>
                              <p className="font-extrabold text-slate-900">{transportHistory}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-amber-250/20 text-[10px] text-amber-900">
                            <span className="font-bold flex items-center gap-1 text-[10px]">💡 Front Desk Advisory:</span>
                            <span className="italic">Greet returning patron by name. Gifting complementary holy sand art ticket adds premium delight.</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Pricing Breakdown Sheet */}
                    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs">
                      <div className="bg-stone-50 p-3 font-mono text-[10px] uppercase font-bold text-stone-500 border-b border-stone-200 grid grid-cols-4">
                        <span className="col-span-2">Invoice Description</span>
                        <span className="text-center">Calculated Net Rate</span>
                        <span className="text-right">Total Amount</span>
                      </div>
                      
                      <div className="divide-y divide-stone-100 text-xs">
                        {/* Accommodation Standard Stay Line */}
                        <div className="p-3 grid grid-cols-4 items-center">
                          <div className="col-span-2">
                            <span className="font-bold text-stone-900 block">{rt?.name || "Suite Stay Luxury"}</span>
                            <span className="text-[10px] text-stone-400 block">Standard resort stay tariff</span>
                          </div>
                          <div className="text-center font-mono">₹{basePrice.toLocaleString()} x {diffDays} night(s)</div>
                          <div className="text-right font-mono font-bold text-stone-900">₹{accommodationTotal.toLocaleString()}</div>
                        </div>

                        {/* Extra customised service charges added by Receptionist */}
                        {(b.customServiceLines || []).map((line: any, idx: number) => (
                          <div key={idx} className="p-3 grid grid-cols-4 items-center bg-amber-50/15">
                            <div className="col-span-2 flex items-center gap-1.5">
                              <button 
                                onClick={() => handleRemoveServiceLine(idx)}
                                title="Void this line"
                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-0.5 rounded cursor-pointer font-bold mr-1"
                              >
                                ✕
                              </button>
                              <div>
                                <span className="font-semibold text-stone-900 text-xs">{line.description}</span>
                                <span className="text-[9px] text-stone-400 block font-mono">Added desk service fee</span>
                              </div>
                            </div>
                            <div className="text-center font-mono text-stone-400">—</div>
                            <div className="text-right font-mono text-stone-900 font-bold">₹{line.amount.toLocaleString()}</div>
                          </div>
                        ))}

                        {/* Totals and GST breakdown */}
                        <div className="p-4 bg-stone-50/50 flex flex-col gap-2 font-mono text-[11px] text-stone-500 border-t border-stone-200">
                          <div className="flex justify-between">
                            <span>Base Stay Subtotal:</span>
                            <span className="text-stone-800">₹{baseSubtotal.toLocaleString()}</span>
                          </div>

                          {calculatedDiscount > 0 && (
                            <div className="flex justify-between text-rose-700 font-bold">
                              <span>Applied Ledger Discount ({b.discountPercent ? `${b.discountPercent}%` : `Flat Cash`}):</span>
                              <span>- ₹{calculatedDiscount.toLocaleString()}</span>
                            </div>
                          )}

                          <div className="flex justify-between border-t border-dashed border-stone-200 pt-2 text-stone-700">
                            <span>Invoiced Nett Taxable Value:</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                          </div>

                          <div className="flex justify-between text-xs text-indigo-700 font-semibold">
                            <span>Hospitality GST breakdown (CGST 6% + SGST 6%):</span>
                            <span>₹{luxuryTax.toLocaleString()}</span>
                          </div>

                          <div className="flex justify-between border-t border-dotted border-stone-300 pt-2.5 text-stone-950 font-black text-sm">
                            <span className="flex items-center gap-1 text-stone-900 uppercase tracking-tight">
                              Total Invoice Payable Ledger Amount:
                            </span>
                            <span className="text-amber-800">₹{grandTotal.toLocaleString()}</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* INTERACTIVE DESK BILLING ENHANCEMENTS DRAWER */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      
                      {/* Form 1: Edit Invoice / Add Service Charge */}
                      <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 flex flex-col gap-3">
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-500 block border-b border-stone-200 pb-1.5">
                          ✍ Edit Invoice: Supplement extra service
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="block text-[9px] font-mono text-stone-500 mb-0.5">Charge Description</label>
                            <input 
                              type="text" 
                              value={customLineDesc}
                              onChange={(e) => setCustomLineDesc(e.target.value)}
                              placeholder="e.g. Lobster shore dinner" 
                              className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900" 
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-stone-500 mb-0.5">Amount (₹)</label>
                            <input 
                              type="number" 
                              value={customLineAmt || ""}
                              onChange={(e) => setCustomLineAmt(Number(e.target.value))}
                              placeholder="1200" 
                              className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono" 
                            />
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={handleAddCustomCharge}
                          className="w-full py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                        >
                          ➕ Supplement extra service charge
                        </button>
                      </div>

                      {/* Form 2: Apply Discount */}
                      <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 flex flex-col gap-3">
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-500 block border-b border-stone-200 pb-1.5">
                          🏷️ Apply Discount Code Or Rebates
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9px] font-mono text-stone-500 mb-0.5">Rebate Type</label>
                            <select 
                              value={discountMethod}
                              onChange={(e) => setDiscountMethod(e.target.value as any)}
                              className="w-full text-xs px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-semibold"
                            >
                              <option value="percent">Percentage (%)</option>
                              <option value="flat">Flat Cash (₹)</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[9px] font-mono text-stone-500 mb-0.5">Reduction value</label>
                            <input 
                              type="number" 
                              value={discountVal || ""}
                              onChange={(e) => setDiscountVal(Number(e.target.value))}
                              placeholder={discountMethod === "percent" ? "10 for 10%" : "2000 for ₹2000"} 
                              className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono font-bold text-amber-800" 
                            />
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={handleApplyDiscount}
                          className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold text-xs rounded-lg transition-all cursor-pointer"
                        >
                          🏷️ Apply Discount Code instantly
                        </button>
                      </div>

                    </div>

                  </div>
                )}

                {/* TAB 2: TRANSPORT BOOKING MODULE */}
                {detailTab === "transport" && (
                  <div className="flex flex-col gap-5 text-stone-800">
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">Hospitality Luxury Shuttle & Transport Logistics</h3>
                      <p className="text-slate-500 text-xs mt-0.5">Assign airport pickup or pilgrim temple drop tours for the guest</p>
                    </div>

                    {b.transport && b.transport.vehicleType ? (
                      <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-amber-500/20 shadow-lg relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="absolute right-0 top-0 text-7xl opacity-[0.03] select-none pointer-events-none">🚗</div>
                        <div className="z-10">
                          <span className="font-mono text-[9px] uppercase font-bold tracking-wider text-amber-400 block mb-1">CONFIRMED SHUTTLE BOARDING PASS</span>
                          <h4 className="text-lg font-bold font-sans text-amber-300 tracking-tight flex items-center gap-2">
                            {b.transport.vehicleType} Transfer service ({b.transport.status})
                          </h4>
                          <div className="font-mono text-xs text-slate-300 mt-2 space-y-1">
                            <div>📍 Pickup place: <strong>{b.transport.pickupAddress}</strong></div>
                            <div>🗺 Drop destination: <strong>{b.transport.dropAddress}</strong></div>
                            <div>⏰ Schedule Liaison Time: <strong>{b.transport.scheduleTime}</strong></div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 z-10 bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 text-center">
                          <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block mb-1">MOCK LOGISTICS DRIVER</span>
                          <div className="font-bold text-xs">Arbind Tripathy</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">+91 94002 91823</div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 text-center text-stone-400 font-mono text-xs">
                        ⚠ No transport liaison scheduled for this stay yet. Assign below!
                      </div>
                    )}

                    {/* Reservation Transport Booking form */}
                    <div className="bg-stone-50 rounded-xl border border-stone-200 p-5 mt-2 flex flex-col gap-4">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-500 block border-b border-stone-200 pb-1.5 mb-2">
                        🚗 Schedule transport shuttle liaison
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono font-semibold text-stone-500 uppercase mb-1">Shuttle vehicle class</label>
                          <select 
                            value={transVeh}
                            onChange={(e) => setTransVeh(e.target.value as any)}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-semibold"
                          >
                            <option value="">-- Choose fleet level --</option>
                            <option value="Auto">Auto Rickshaw (Traditional Desk drop)</option>
                            <option value="Sedan">Sedan (Dzire Class Standard)</option>
                            <option value="SUV">SUV (Ertiga / Spacious)</option>
                            <option value="Innova">Luxury Innova Crysta executive</option>
                            <option value="Tempo Traveller">Tempo Traveller (Group blocks - 14 seater)</option>
                            <option value="Mini Bus">Mini Bus (Conference Hall delegates)</option>
                            <option value="Bus">Luxury AC Bus coach</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-semibold text-stone-500 uppercase mb-1">Pickup origin</label>
                          <input 
                            type="text" 
                            value={transPickLoc}
                            onChange={(e) => setTransPickLoc(e.target.value)}
                            placeholder="e.g. Bhubaneswar Airport (BBI)" 
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-normal"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-semibold text-stone-500 uppercase mb-1">Drop destination</label>
                          <input 
                            type="text" 
                            value={transDropLoc}
                            onChange={(e) => setTransDropLoc(e.target.value)}
                            placeholder="e.g. Resort main corridor lobby" 
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-normal"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-semibold text-stone-500 uppercase mb-1">Pickup dispatch time</label>
                          <input 
                            type="text" 
                            value={transTimeSch}
                            onChange={(e) => setTransTimeSch(e.target.value)}
                            placeholder="e.g. Jun 20 at 3:15 PM" 
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <button 
                        type="button"
                        onClick={handleScheduleTransport}
                        className="py-2.5 bg-[#1b233a] hover:bg-[#232d4b] text-blue-300 font-bold text-xs rounded-lg border border-blue-500/10 flex items-center justify-center gap-1 transition-all cursor-pointer uppercase font-mono tracking-wider"
                      >
                        ⚡ Book Transport Dispatch And Sync Boarding Ledger
                      </button>
                    </div>

                  </div>
                )}

                {/* TAB 3: EXTEND STAY WORKFLOW */}
                {detailTab === "extend" && (
                  <div className="flex flex-col gap-4 text-stone-800">
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">Study Extend Stay Options</h3>
                      <p className="text-slate-500 text-xs mt-0.5">Perform room verification simulations and recalculate invoice ledger charges</p>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl flex flex-col gap-3 font-mono text-xs">
                      <div className="grid grid-cols-2 gap-3 pb-1 border-b border-amber-250/20">
                        <div>CURRENT OUTBOUND DATE: <strong>{b.checkOutDate}</strong></div>
                        <div className="text-right text-indigo-700">EXTENDED OUTBOUND DATE: <strong>{extendedCheckoutDate}</strong></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pb-1">
                        <div>Room base rates: ₹{basePrice.toLocaleString()}/Night</div>
                        <div className="text-right">Stay Nights: {diffDays} + {extNights} ({diffDays + Number(extNights)} nights)</div>
                      </div>
                      <div className="border-t border-dotted border-amber-300 pt-2 grid grid-cols-2 text-stone-950 font-bold text-sm flex items-center">
                        <span>ESTIMATED TOTAL BALANCE FEE:</span>
                        <div className="text-right">
                          <span className="text-stone-400 text-xs font-normal line-through mr-1.5">₹{grandTotal.toLocaleString()}</span>
                          <span className="text-amber-800">₹{extensionGrandTotal.toLocaleString()}</span> 
                          <span className="text-[10px] text-stone-500 font-normal block tracking-tight">Includes CGST + SGST (12%)</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-stone-200 bg-stone-50 rounded-xl p-4 flex flex-col gap-3">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">Extend Stay details controller</span>
                      <div className="grid grid-cols-3 gap-3 items-center">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-mono font-semibold text-stone-500 uppercase mb-1"> nights count extension</label>
                          <select 
                            value={extNights}
                            onChange={(e) => {
                              setExtNights(Number(e.target.value));
                              setValChecked(false);
                            }}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-semibold"
                          >
                            <option value={1}>+1 Night Extension study</option>
                            <option value={2}>+2 Night Extension study</option>
                            <option value={3}>+3 Night Extension study</option>
                            <option value={5}>+5 Night Extension study</option>
                            <option value={7}>+7 Night block extended study</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-semibold text-transparent mb-1">Verify</label>
                          <button 
                            type="button"
                            onClick={() => {
                              setValChecked(true);
                              // Simulated room search verification
                              const isVacant = !rooms.some(rm => rm.id === b.roomId && (rm.status === RoomStatus.CLEANING || rm.status === RoomStatus.MAINTENANCE));
                              setValAvailable(isVacant);
                            }}
                            className="w-full py-1.5 border border-indigo-600 bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg transition-all cursor-pointer font-sans"
                          >
                            Verify vacancy
                          </button>
                        </div>
                      </div>

                      {valChecked && (
                        <div className={`p-3 rounded-lg border font-mono text-xs flex items-center gap-2 ${
                          valAvailable ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-250 text-rose-800"
                        }`}>
                          <span>{valAvailable ? "✓ System Availability Verified!" : "⚠ Allocation Notice:"}</span>
                          <span>
                            {valAvailable 
                              ? `Suite category is free. Room ${b.roomId || "assigned"} cleared to extend stay in block ${extNights} Nights` 
                              : `Room ${b.roomId || "assigned"} has a cleaning/maintenance block scheduled, but category is guaranteed.`}
                          </span>
                        </div>
                      )}

                      <button 
                        type="button"
                        disabled={valChecked && !valAvailable}
                        onClick={handleConfirmExtend}
                        className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer uppercase tracking-wider block text-center"
                      >
                        💾 Apply & Synchronize hotel check-out date update
                      </button>
                    </div>

                  </div>
                )}

                {/* TAB 4: EARLY CHECKOUT WORKFLOW */}
                {detailTab === "early_checkout" && (
                  <div className="flex flex-col gap-4 text-stone-850">
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">🚪 Advanced Early Checkout Adjustments</h3>
                      <p className="text-slate-500 text-xs mt-0.5">Surgically recalculate stay nights and perform final fiscal settlement</p>
                    </div>

                    {earlySettleDone ? (
                      /* GOOGLE REVIEW CTA IN CHECK_OUT_COMPLETE SCREEN */
                      <div className="bg-emerald-900 text-emerald-100 rounded-2xl p-6 border border-emerald-400/20 shadow-xl flex flex-col items-center text-center gap-4 py-8">
                        <div className="text-4xl">🚪✨</div>
                        <h4 className="text-xl font-bold font-sans tracking-tight text-white mb-1">Checkout complete! Stay charges settled</h4>
                        <p className="text-xs text-emerald-250 max-w-md leading-relaxed font-normal">
                          Late checkout/Early departure invoice logs saved to property servers. Grand Crest accounts ledger cleared. Sending final receipt to registered physical email: <strong>{guest?.email}</strong>.
                        </p>
                        
                        <div className="border border-emerald-500/20 bg-emerald-950/40 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 max-w-lg mt-3">
                          {/* QR placeholder */}
                          <div className="w-24 h-24 bg-white p-1 rounded-xl flex items-center justify-center flex-shrink-0 relative">
                            <div className="grid grid-cols-5 gap-0.5 w-full h-full p-2 grayscale">
                              {[...Array(25)].map((_, i) => (
                                <div key={i} className={`rounded-[1px] ${
                                  (i%2===0 && i%3===0) || (i<5) || (i%5===0) || (i>20) ? "bg-slate-900" : "bg-transparent"
                                }`}></div>
                              ))}
                            </div>
                            <span className="absolute bottom-0 inset-x-0 text-[7px] text-zinc-400 font-sans tracking-tight text-center font-bold pb-0.5 bg-white rounded-b-xl">REVIEW QR</span>
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] font-mono tracking-wider font-bold text-amber-400 uppercase">GOOGLE REVIEW CONCIERGE DIRECT</span>
                            <h5 className="font-bold text-sm text-white mt-0.5">Help us thrive on Google Beach review listings!</h5>
                            <p className="text-[11px] text-emerald-200 mt-1">Excellent experiences deserve simple stars. Pull up your mobile camera and capture review CTA code.</p>
                            <a
                              href="https://google.com/search?q=puri+hotel+review+placeholder"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block mt-2 font-black text-[10px] px-3 py-1 bg-amber-500 text-stone-950 uppercase rounded-full hover:bg-amber-600 transition-colors cursor-pointer"
                            >
                              ⭐️ Share experience on Google immediately 
                            </a>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="bg-slate-50 border border-stone-200 p-4 rounded-xl flex flex-col gap-3 font-mono text-xs text-stone-800">
                          <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider font-bold">RECALCULATING EARLY SETTLEMENT SHEET</span>
                          <div className="grid grid-cols-2 gap-3 pb-1 border-b border-stone-150">
                            <div>STANDARD DURATION: <strong>{diffDays} Night(s)</strong></div>
                            <div className="text-right text-rose-700">ADJUSTED EARLY DURATION: <strong>{earlyCheckoutNights} Night(s)</strong></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 pb-1 text-[11px]">
                            <div>Nett rates adjustment:</div>
                            <div className="text-right">₹{basePrice.toLocaleString()} x {earlyCheckoutNights} Night(s) = ₹{adjustedAccommodationTotal.toLocaleString()}</div>
                          </div>
                          {servicesTotal > 0 && (
                            <div className="grid grid-cols-2 gap-3 pb-1 text-[11px]">
                              <div>Desks Extra Service:</div>
                              <div className="text-right">+ ₹{servicesTotal.toLocaleString()}</div>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-3 border-t border-dotted border-stone-300 pt-2 text-stone-900 font-bold text-sm">
                            <span>REVISED GRAND PAYABLE NETT COSTA:</span>
                            <div className="text-right text-emerald-700">
                              <span className="text-stone-400 text-xs font-normal line-through mr-1 text-slate-400">₹{grandTotal.toLocaleString()}</span>
                              ₹{adjustedGrandTotal.toLocaleString()}
                              <span className="text-[9px] text-stone-500 font-normal block">Includes CGST + SGST (12%)</span>
                            </div>
                          </div>
                        </div>

                        <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 flex flex-col gap-3">
                          <label className="block text-[10px] font-mono font-semibold text-stone-500 uppercase mb-1">Shorten Stay length by</label>
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <div className="col-span-2">
                              <select 
                                value={earlyDaysToSub}
                                onChange={(e) => setEarlyDaysToSub(Number(e.target.value))}
                                className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-semibold"
                              >
                                {[...Array(Math.max(1, diffDays - 1))].map((_, i) => (
                                  <option key={i+1} value={i+1}>Shorten stay by -{i+1} Night(s)</option>
                                ))}
                              </select>
                            </div>
                            <button 
                              type="button"
                              onClick={handleExecuteEarlyCheckout}
                              className="py-2.5 bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold text-xs rounded-lg transition-all cursor-pointer font-sans"
                            >
                              Settle & Checkout🚪
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB 5: AUDIT LOGS & CANCELLATION */}
                {detailTab === "audit" && (
                  <div className="flex flex-col gap-5 text-stone-800">
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">Hotel Audit Chronicle Log Trails</h3>
                      <p className="text-slate-500 text-xs mt-0.5">Detailed receptionist and owner-level manual operations chronicle timeline</p>
                    </div>

                    <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50/50 p-4 font-mono text-xs flex flex-col gap-3.5 max-h-48 overflow-y-auto">
                      {currentLogs.map((log: any, idx: number) => (
                        <div key={idx} className="flex gap-2.5 items-start text-[11px] border-b border-stone-100 pb-2.5 last:border-0 last:pb-0">
                          <span className="text-stone-400 whitespace-nowrap">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <div>
                            <span className="font-extrabold text-stone-900">{log.action}</span>
                            <span className="text-stone-400 mx-1">•</span>
                            <span className="text-amber-800 font-semibold italic">by {log.user}</span>
                            <p className="text-[10px] text-stone-500 mt-1 leading-normal">{log.notes || "System trace saved."}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Booking Cancellation module */}
                    {b.status !== BookingStatus.CANCELLED && b.status !== BookingStatus.CHECKED_OUT && (
                      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col gap-3.5 mt-2">
                        <div>
                          <h4 className="font-bold text-sm text-rose-900 uppercase tracking-tight">Administrative Booking Cancellation</h4>
                          <p className="text-[11px] text-rose-700 leading-normal">Cancelling this reservation releases the guaranteed suites back into the vacant available room matrix immediately. This action cannot be undone.</p>
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-mono font-semibold text-rose-800 uppercase mb-1">State administrative cancellation reason</label>
                          <textarea 
                            value={cancReason}
                            onChange={(e) => setCancReason(e.target.value)}
                            rows={2}
                            placeholder="e.g. Travel plan canceled by guest / overbooking resolution..." 
                            className="w-full text-xs px-3 py-2 bg-white border border-rose-200 text-rose-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </div>

                        <button 
                          type="button"
                          onClick={handlePerformCancellation}
                          className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer font-sans uppercase tracking-wider block text-center"
                        >
                          💸 Confirm Cancellation completely & update audit ledger
                        </button>
                      </div>
                    )}

                    {b.status === BookingStatus.CANCELLED && (
                      <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-800">
                        <span className="font-mono uppercase font-bold text-[10px] block mb-1">CANCELLATION ARCHIVE FILE</span>
                        <strong>REASON STATEMENTED: </strong>
                        <p className="mt-1 italic p-2.5 bg-white rounded border border-rose-100">{b.cancellationReason || "No statement specified."}</p>
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Action Controls Footer */}
              <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex flex-wrap gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 border border-stone-200 bg-white rounded-lg text-xs font-semibold hover:bg-stone-100 cursor-pointer"
                >
                  Close Stay Drawer
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    try {
                      handleExportInvoiceToPDF(b, guest, rt);
                    } catch (e) {
                      alert("Error generating PDF invoice. Please check the values.");
                    }
                  }}
                  className="px-5 py-2 bg-amber-600 font-bold text-stone-950 hover:bg-amber-700 hover:text-white rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Export GST invoice
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
