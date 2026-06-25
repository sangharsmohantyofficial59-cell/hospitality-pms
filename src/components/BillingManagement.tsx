/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Booking, Guest, RoomType, Payment } from "../types";
import { CreditCard, FileText, Plus, Search, Trash2, CheckCircle, Percent, Download, DollarSign, ListOrdered, ClipboardList, Ban } from "lucide-react";
import { handleExportInvoiceToPDF } from "./BookingManagement";

interface BillingManagementProps {
  bookings: Booking[];
  guests: Guest[];
  rooms: any[];
  roomTypes: RoomType[];
  payments?: Payment[];
  staffUser?: any;
  onUpdateBooking: (id: string, payload: any) => Promise<any>;
}

export default function BillingManagement({
  bookings,
  guests,
  rooms,
  roomTypes,
  payments = [],
  staffUser,
  onUpdateBooking
}: BillingManagementProps) {
  const [billingQueueTab, setBillingQueueTab] = useState<"Pending" | "Paid" | "Cancelled">("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBillingBooking, setSelectedBillingBooking] = useState<Booking | null>(null);

  // Invoice customized edits states
  const [newDesc, setNewDesc] = useState("");
  const [newAmt, setNewAmt] = useState<number>(0);
  const [rebateVal, setRebateVal] = useState<number>(0);
  const [rebateMethod, setRebateMethod] = useState<"flat" | "percent">("flat");
  const [customGst, setCustomGst] = useState<number>(12);

  // Mandatory discount governance states
  const [discountReason, setDiscountReason] = useState<string>("Guest Dissatisfaction");
  const [discountRemarks, setDiscountRemarks] = useState<string>("");
  const [discountApprovedVia, setDiscountApprovedVia] = useState<string>("Phone Call");

  React.useEffect(() => {
    if (selectedBillingBooking) {
      if (selectedBillingBooking.discountAmount) {
        setRebateVal(selectedBillingBooking.discountAmount);
        setRebateMethod("flat");
      } else if (selectedBillingBooking.discountPercent) {
        setRebateVal(selectedBillingBooking.discountPercent);
        setRebateMethod("percent");
      } else {
        setRebateVal(0);
        setRebateMethod("flat");
      }
      setDiscountReason(selectedBillingBooking.discountReason || "Guest Dissatisfaction");
      setDiscountRemarks(selectedBillingBooking.discountRemarks || "");
      setDiscountApprovedVia(selectedBillingBooking.discountApprovedVia || "Phone Call");
    }
  }, [selectedBillingBooking]);

  // Close Bill Modal states
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closingMethod, setClosingMethod] = useState<"Cash" | "UPI" | "Credit Card" | "Debit Card" | "Bank Transfer" | "Split Payment">("UPI");
  const [closingAmount, setClosingAmount] = useState<string>("");
  const [closingRef, setClosingRef] = useState<string>("");
  const [closingNotes, setClosingNotes] = useState<string>("");
  const [isSubmittingClose, setIsSubmittingClose] = useState(false);

  // Group bookings by billing category
  const filteredQueue = bookings.filter(b => {
    // Determine billing status category
    const isCancelled = b.status === "Cancelled";
    const isPaid = b.status === "Paid" || b.status === "Closed";
    const isPending = b.status === "Moved To Billing" || b.status === "Invoice Generated" || b.status === "Checked Out";

    if (billingQueueTab === "Pending" && !isPending) return false;
    if (billingQueueTab === "Paid" && !isPaid) return false;
    if (billingQueueTab === "Cancelled" && !isCancelled) return false;

    // Search query match
    const guest = guests.find(g => g.id === b.guestId);
    const text = searchQuery.toLowerCase();
    if (text) {
      return (
        b.id.toLowerCase().includes(text) ||
        (guest?.name || "").toLowerCase().includes(text) ||
        (b.roomId || "").toLowerCase().includes(text)
      );
    }
    return true;
  });

  // Load details and default form states upon selection
  const handleSelectBooking = (b: Booking) => {
    setSelectedBillingBooking(b);
    setRebateVal(b.discountAmount || b.discountPercent || 0);
    setRebateMethod(b.discountPercent ? "percent" : "flat");
    setNewDesc("");
    setNewAmt(0);
    setCustomGst(b.gstRate || 12);
  };

  // Billing calculation logic
  const performBillingCalculations = (b: Booking) => {
    const d1 = new Date(b.checkInDate);
    const d2 = new Date(b.checkOutDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const rt = roomTypes.find(type => type.id === b.roomTypeId);

    // 1. Room or Hall base charges
    const isHall = b.bookingType === "Conference Hall Booking";
    const baseTariff = rt?.basePrice || 2500;
    const baseAccommodationTotal = baseTariff * diffDays;

    // 2. Transport Charges
    const transportTotal = b.transport && b.transport.vehicleType ? (b.transport.cost || 500) : 0;

    // 3. Other/Custom charges
    const customLines = b.customServiceLines || [];
    const otherChargesTotal = customLines.reduce((sum, line) => sum + line.amount, 0);

    // Subtotal
    const subtotalRaw = baseAccommodationTotal + transportTotal + otherChargesTotal;

    // 4. Discounts applied
    let discountReductions = b.discountAmount || 0;
    if (b.discountPercent) {
      discountReductions = Math.round(subtotalRaw * (b.discountPercent / 100));
    }

    const netTaxableAmount = Math.max(0, subtotalRaw - discountReductions);

    // 5. GST Calculations
    const gstValue = Math.round(netTaxableAmount * (b.gstRate || 12) / 100);
    const totalGrandPayable = netTaxableAmount + gstValue;

    return {
      diffDays,
      rt,
      isHall,
      baseTariff,
      baseAccommodationTotal,
      transportTotal,
      otherChargesTotal,
      subtotalRaw,
      discountReductions,
      netTaxableAmount,
      gstValue,
      totalGrandPayable
    };
  };

  // Add customized charge line (Other Charges)
  const handleAddChargeLine = async () => {
    if (!selectedBillingBooking) return;
    if (!newDesc || newAmt <= 0) {
      alert("Please provide a valid description and charge amount.");
      return;
    }

    const activeLines = selectedBillingBooking.customServiceLines || [];
    const updatedLines = [
      ...activeLines,
      {
        id: `LINE-${Date.now()}`,
        description: newDesc,
        amount: Number(newAmt)
      }
    ];

    const currentLogs = selectedBillingBooking.auditLogs || [];
    const updatedBooking = {
      ...selectedBillingBooking,
      customServiceLines: updatedLines,
      auditLogs: [
        ...currentLogs,
        {
          timestamp: new Date().toISOString(),
          action: "Billing Line Added",
          user: "Hotel Accountant",
          notes: `Added charge: ${newDesc} (₹${newAmt})`
        }
      ]
    };

    // Calculate new total prices
    const calcs = performBillingCalculations(updatedBooking);
    updatedBooking.totalPrice = calcs.totalGrandPayable;

    const res = await onUpdateBooking(selectedBillingBooking.id, {
      customServiceLines: updatedLines,
      totalPrice: calcs.totalGrandPayable,
      auditLogs: updatedBooking.auditLogs
    });

    if (res.success) {
      setSelectedBillingBooking(updatedBooking);
      setNewDesc("");
      setNewAmt(0);
    }
  };

  // Remove customized charge line
  const handleRemoveChargeLine = async (lineId: string) => {
    if (!selectedBillingBooking) return;
    const activeLines = selectedBillingBooking.customServiceLines || [];
    const updatedLines = activeLines.filter(line => line.id !== lineId);

    const currentLogs = selectedBillingBooking.auditLogs || [];
    const updatedBooking = {
      ...selectedBillingBooking,
      customServiceLines: updatedLines,
      auditLogs: [
        ...currentLogs,
        {
          timestamp: new Date().toISOString(),
          action: "Billing Line Voided",
          user: "Hotel Accountant",
          notes: "Removed custom charge line in ledger."
        }
      ]
    };

    const calcs = performBillingCalculations(updatedBooking);
    updatedBooking.totalPrice = calcs.totalGrandPayable;

    const res = await onUpdateBooking(selectedBillingBooking.id, {
      customServiceLines: updatedLines,
      totalPrice: calcs.totalGrandPayable,
      auditLogs: updatedBooking.auditLogs
    });

    if (res.success) {
      setSelectedBillingBooking(updatedBooking);
    }
  };

  // Apply Discount Codes or rebates
  const handleApplyDiscountRebate = async () => {
    if (!selectedBillingBooking) return;

    const val = Number(rebateVal);
    if (val < 0) {
      alert("Discount amount/percent cannot be negative.");
      return;
    }

    if (val > 0) {
      if (!discountReason) {
        alert("Please select a mandatory Discount Reason.");
        return;
      }
      if (!discountRemarks.trim()) {
        alert("Mandatory field: Please enter 'Additional Remarks' introducing the discount context.");
        return;
      }
      if (!discountApprovedVia) {
        alert("Please select a mandatory 'Approved Via' channel option.");
        return;
      }
    }

    let discAmountValue = 0;
    let discPercentValue = 0;

    if (rebateMethod === "percent") {
      discPercentValue = val;
    } else {
      discAmountValue = val;
    }

    const currentLogs = selectedBillingBooking.auditLogs || [];
    const cashierName = staffUser?.name || "Front Desk Cashier";
    const updatedBooking = {
      ...selectedBillingBooking,
      discountAmount: discAmountValue,
      discountPercent: discPercentValue,
      discountReason: val > 0 ? discountReason : "",
      discountRemarks: val > 0 ? discountRemarks : "",
      discountApprovedVia: val > 0 ? discountApprovedVia : "",
      discountAppliedBy: val > 0 ? cashierName : "",
      auditLogs: [
        ...currentLogs,
        {
          timestamp: new Date().toISOString(),
          action: "Discount Applied",
          user: cashierName,
          notes: val > 0 
            ? `Discount of ₹${discAmountValue || (`${discPercentValue}%`)} applied. Reason: ${discountReason}. Approved via: ${discountApprovedVia}. Remarks: ${discountRemarks}`
            : `Removed discount adjustments.`
        }
      ]
    };

    const calcs = performBillingCalculations(updatedBooking);
    updatedBooking.totalPrice = calcs.totalGrandPayable;

    const res = await onUpdateBooking(selectedBillingBooking.id, {
      discountAmount: discAmountValue,
      discountPercent: discPercentValue,
      discountReason: val > 0 ? discountReason : "",
      discountRemarks: val > 0 ? discountRemarks : "",
      discountApprovedVia: val > 0 ? discountApprovedVia : "",
      discountAppliedBy: val > 0 ? cashierName : "",
      totalPrice: calcs.totalGrandPayable,
      auditLogs: updatedBooking.auditLogs
    });

    if (res.success) {
      setSelectedBillingBooking(updatedBooking);
      alert(val > 0 ? "✓ Discount applied and audit ledger logged successfully." : "✓ Discount adjustments reset successfully.");
    }
  };

  // Transition Operational state
  const handleTransitionWorkflow = async (nextStatus: "Invoice Generated" | "Paid" | "Closed") => {
    if (!selectedBillingBooking) return;

    try {
      const currentLogs = selectedBillingBooking.auditLogs || [];
      const updatedLogs = [
        ...currentLogs,
        {
          timestamp: new Date().toISOString(),
          action: `Billing Operational State: ${nextStatus}`,
          user: "Front Desk Cashier",
          notes: `Invoice shifted into operational terminal: ${nextStatus}`
        }
      ];

      const updateData: any = {
        status: nextStatus,
        auditLogs: updatedLogs
      };

      if (nextStatus === "Paid") {
        updateData.paymentStatus = "Paid";
      }

      const res = await onUpdateBooking(selectedBillingBooking.id, updateData);
      if (res.success) {
        const updatedBooking = {
          ...selectedBillingBooking,
          status: nextStatus,
          paymentStatus: nextStatus === "Paid" ? "Paid" as any : selectedBillingBooking.paymentStatus,
          auditLogs: updatedLogs
        };
        setSelectedBillingBooking(updatedBooking);
        alert(`✓ Invoice transitioned successfully to operational level: ${nextStatus}!`);
      }
    } catch (e) {
      alert("Error updating cashier levels.");
    }
  };

  const handleSettleAndCloseBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillingBooking) return;

    setIsSubmittingClose(true);
    try {
      const currentLogs = selectedBillingBooking.auditLogs || [];
      const updatedLogs = [
        ...currentLogs,
        {
          timestamp: new Date().toISOString(),
          action: "Payment Collection",
          user: "Front Desk Cashier",
          notes: `Marked paid & Closed via ${closingMethod}. Ref: ${closingRef}. Notes: ${closingNotes || "None"}.`
        },
        {
          timestamp: new Date().toISOString(),
          action: "Billing Operational State: Closed",
          user: "System Ledger",
          notes: "Folio closed fully."
        }
      ];

      const closedBillDetails = {
        paymentMethod: closingMethod,
        amountReceived: Number(closingAmount),
        refNumber: closingRef,
        notes: closingNotes,
        closedAt: new Date().toISOString()
      };

      const updateData = {
        status: "Closed" as const,
        paymentStatus: "Paid" as const,
        closedBillDetails,
        auditLogs: updatedLogs
      };

      const res = await onUpdateBooking(selectedBillingBooking.id, updateData);
      if (res.success) {
        // Post message events triggering simulation on server
        await fetch(`/api/pms/bookings/${selectedBillingBooking.id}/send-message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "check_out_confirmation", paymentMethod: closingMethod, amountReceived: closingAmount, refNumber: closingRef })
        }).catch(err => console.error("Error sending billing messages:", err));

        setSelectedBillingBooking({
          ...selectedBillingBooking,
          ...updateData
        });
        setIsCloseModalOpen(false);
        alert("✓ Bill Closed! Invoice PDF, Email and WhatsApp messages dispatched safely!");
      } else {
        alert(res.error || "Could not close bill.");
      }
    } catch (err) {
      console.error(err);
      alert("Error closing bill database record.");
    } finally {
      setIsSubmittingClose(false);
    }
  };

  return (
    <div id="billing-ledger-module" className="flex flex-col gap-6 font-sans">
      
      {/* 1. Header Area */}
      <div>
        <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-indigo-600" /> Cashier & Billing Management Cockpit
        </h1>
        <p className="text-stone-500 text-xs mt-0.5">
          Process checkout settles, audit taxable hospitality CGST/SGST itemization, and export verified digital invoices
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Side (xl:col-span-5): Billings Queue Filter and List */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          
          {/* Sub tabs filtering queue */}
          <div className="bg-white border border-stone-200 rounded-xl p-1.5 flex gap-1 shadow-sm">
            {[
              { id: "Pending", label: "⏳ Pending Bills", color: "text-amber-700 bg-amber-50" },
              { id: "Paid", label: "✓ Paid & Closed", color: "text-emerald-700 bg-emerald-50" },
              { id: "Cancelled", label: "✕ voided Bills", color: "text-red-700 bg-red-50" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setBillingQueueTab(tab.id as any);
                  setSelectedBillingBooking(null); // Clear selected workspace
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  billingQueueTab === tab.id
                    ? "bg-slate-900 text-white shadow-sm font-black"
                    : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-sm flex items-center relative">
            <Search className="absolute left-6 text-stone-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search queue by Code, Guest full name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-850 focus:outline-none"
            />
          </div>

          {/* List display */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100 max-h-[60vh] overflow-y-auto">
            {filteredQueue.length === 0 ? (
              <div className="p-8 text-center text-stone-400 font-mono text-[11px] leading-relaxed">
                ✕ No checkouts found in queue matching state: <span className="font-bold text-amber-700">{billingQueueTab}</span>.
              </div>
            ) : (
              filteredQueue.map((b) => {
                const guest = guests.find(g => g.id === b.guestId);
                const rt = roomTypes.find(type => type.id === b.roomTypeId);
                const isSelected = selectedBillingBooking?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBooking(b)}
                    className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${
                      isSelected ? "bg-amber-50/40 border-l-4 border-amber-600" : "hover:bg-stone-50/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900 text-xs bg-stone-100 px-1.5 py-0.5 rounded">
                          {b.id}
                        </span>
                        <span className="text-[10px] text-indigo-700 font-mono uppercase tracking-wider font-extrabold border border-indigo-200/50 px-1.5 rounded bg-indigo-50/50">
                          {b.bookingType || "Room Booking"}
                        </span>
                      </div>
                      <div className="font-bold text-stone-900 text-xs mt-1.5">{guest?.name || "Unverified Guest"}</div>
                      <div className="text-[10.5px] text-stone-500 mt-0.5 font-mono">
                        Stay: {b.checkInDate} to {b.checkOutDate} • Room: <strong>{b.roomId || "Unassigned"}</strong>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono font-bold text-stone-950 text-xs text-amber-900">
                        ₹{b.totalPrice?.toLocaleString()}
                      </div>
                      <span className={`inline-block mt-1 text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded border ${
                        b.status === "Moved To Billing" ? "bg-amber-100 text-amber-800 border-amber-300/30" :
                        b.status === "Invoice Generated" ? "bg-blue-100 text-blue-850 border-blue-200" :
                        b.status === "Paid" ? "bg-emerald-50 text-emerald-800 border-emerald-250/20" :
                        b.status === "Closed" ? "bg-slate-900 text-slate-100 border-none" : "bg-red-50 text-red-700"
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Side (xl:col-span-7): Dedicated billing checkout cockpit workspace */}
        <div className="xl:col-span-7">
          {selectedBillingBooking ? (() => {
            const b = selectedBillingBooking;
            const guest = guests.find(g => g.id === b.guestId);
            const calcs = performBillingCalculations(b);

            return (
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden divide-y divide-stone-100">
                
                {/* Cockpit header */}
                <div className="bg-stone-900 text-slate-100 p-5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-600 p-1.5 rounded font-mono font-bold text-[13px] text-stone-950 leading-none shadow-sm">
                      {b.id}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                        Active Stay Bill-Settle Ledger
                      </h3>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Level: <span className="text-amber-400 uppercase font-bold">{b.status}</span> • Payment: <span className="text-emerald-400 font-bold">{b.paymentStatus}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Operational workflows status buttons */}
                    {b.status !== "Closed" && (
                      <>
                        {b.status === "Moved To Billing" && (
                          <button
                            onClick={() => handleTransitionWorkflow("Invoice Generated")}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10.5px] font-bold font-mono uppercase cursor-pointer"
                          >
                            ⚡ Generate Invoice
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            const alreadyPaid = payments
                              .filter(p => p.bookingId === b.id && p.status === "Paid")
                              .reduce((sum, p) => sum + p.amount, 0);
                            const outstanding = Math.max(0, calcs.totalGrandPayable - alreadyPaid);
                            setClosingAmount(outstanding.toString());
                            setClosingMethod("UPI");
                            setClosingRef(`TXN-${Date.now().toString().slice(-6)}`);
                            setClosingNotes("Settle folio. Staff checkout completed successfully.");
                            setIsCloseModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10.5px] font-bold font-mono uppercase flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Mark As Paid & Close Bill
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Ledger Breakdown details block */}
                <div className="p-5 flex flex-col gap-4 text-xs text-stone-600">
                  <div className="grid grid-cols-2 gap-4 bg-stone-50 border border-stone-200/60 p-4 rounded-xl">
                    <div>
                      <span className="block text-[8px] font-mono font-bold text-stone-400 uppercase">Primary Guest Contact</span>
                      <strong className="text-stone-900 text-sm block mt-0.5">{guest?.name}</strong>
                      <span className="text-[10px] block mt-0.5">{guest?.phone} | {guest?.email}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-mono font-bold text-stone-400 uppercase">Itinerary specifics</span>
                      <span className="block text-[11px] mt-0.5">Stay dates: <strong>{b.checkInDate} to {b.checkOutDate}</strong></span>
                      <span className="block text-[10px] text-indigo-700 font-semibold mt-0.5">Accompanied Total: {calcs.diffDays} Nights in room {b.roomId || "Unassigned"}</span>
                    </div>
                  </div>

                  {b.status === "Closed" && (
                    <div id="bill-closed-summary-panel" className="bg-emerald-50 border-2 border-emerald-500/20 rounded-xl p-4 flex flex-col gap-2 shadow-xs text-emerald-950 font-sans text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <strong className="text-sm font-bold text-emerald-900">Live Stay Folio Closed & Audited</strong>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-normal">
                        This bill has been fully paid, itemized and marked as <strong className="uppercase font-mono">Closed</strong> in Niladri Resort PMS registry.
                      </p>
                      
                      <div className="bg-white/90 dark:bg-slate-900/40 p-3 rounded-lg border border-emerald-200/40 grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[10.5px] text-stone-700">
                        <div>
                          <span className="block text-[8px] font-bold text-stone-400 uppercase">Payment Method</span>
                          <span className="font-bold text-slate-800">{b.closedBillDetails?.paymentMethod || "UPI"}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-stone-400 uppercase">Amount Received</span>
                          <span className="font-bold text-emerald-700">₹{(b.closedBillDetails?.amountReceived || calcs.totalGrandPayable).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-stone-400 uppercase">Ref Transaction ID</span>
                          <span className="font-semibold text-slate-800 select-all">{b.closedBillDetails?.refNumber || "TXN-837190"}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-stone-400 uppercase">Closed Timestamp</span>
                          <span className="text-stone-500">{b.closedBillDetails?.closedAt ? new Date(b.closedBillDetails.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}</span>
                        </div>
                      </div>

                      {b.closedBillDetails?.notes && (
                        <div className="py-2 px-3 border border-emerald-100 bg-white/40 rounded-lg text-slate-700 text-[10.5px] italic">
                          💬 <strong>Auditor Notes:</strong> {b.closedBillDetails.notes}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1 mt-1 font-mono text-[9px]">
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase select-none flex items-center gap-1.5">
                          ✓ WhatsApp Invoice Sent
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase select-none flex items-center gap-1.5">
                          ✓ Email Invoice Sent
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase select-none flex items-center gap-1.5">
                          ✓ Invoice PDF Available
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Pricing Sheets Ledger table */}
                  <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs bg-white mt-2">
                    <div className="bg-stone-50 max-w-full p-2.5 font-mono text-[9px] uppercase font-bold text-stone-500 border-b border-stone-200 grid grid-cols-12">
                      <div className="col-span-6 pl-1">Accounting Line Description</div>
                      <div className="col-span-3 text-center">Calculated Net Rate</div>
                      <div className="col-span-3 text-right pr-1">Subtotal (₹)</div>
                    </div>

                    <div className="divide-y divide-stone-100">
                      
                      {/* 1. ROOM OR HALL CHARGES */}
                      <div className="p-3 grid grid-cols-12 items-center">
                        <div className="col-span-6 pl-1">
                          <strong className="text-stone-900 block font-semibold">{calcs.isHall ? "Conference Hall Booking Tariff" : `Room Accommodation Tariff (${calcs.rt?.name || "Standard Luxury Suite"})`}</strong>
                          <span className="text-[10px] text-stone-400 block">Primary hospitality resource reservation line.</span>
                        </div>
                        <div className="col-span-3 text-center font-mono text-slate-500">
                          ₹{calcs.baseTariff.toLocaleString()} x {calcs.diffDays} Nights
                        </div>
                        <div className="col-span-3 text-right pr-1 font-mono font-bold text-stone-900">
                          ₹{calcs.baseAccommodationTotal.toLocaleString()}
                        </div>
                      </div>

                      {/* 2. TRANSPORT CHARGES */}
                      {b.transport && b.transport.vehicleType && (
                        <div className="p-3 grid grid-cols-12 items-center bg-indigo-50/10">
                          <div className="col-span-6 pl-1">
                            <strong className="text-stone-900 block font-semibold">🚕 Transfer Shuttle - {b.transport.vehicleType} Fleet Class</strong>
                            <span className="text-[10px] text-stone-400 block">Transit Route: {b.transport.pickupAddress} to {b.transport.dropAddress}</span>
                          </div>
                          <div className="col-span-3 text-center font-mono text-slate-500">
                            1 Service Event Dispatch
                          </div>
                          <div className="col-span-3 text-right pr-1 font-mono font-bold text-stone-900">
                            ₹{calcs.transportTotal.toLocaleString()}
                          </div>
                        </div>
                      )}

                      {/* 3. OTHER EXTRA CHARGES */}
                      {(b.customServiceLines || []).map((line) => (
                        <div key={line.id} className="p-2.5 grid grid-cols-12 items-center bg-amber-50/15">
                          <div className="col-span-6 pl-1 flex items-center gap-1.5">
                            {b.status !== "Closed" && (
                              <button
                                onClick={() => handleRemoveChargeLine(line.id)}
                                title="Void ledger line charge"
                                className="text-rose-500 hover:text-rose-700 bg-rose-50 p-0.5 rounded cursor-pointer mr-1 text-[9px]"
                              >
                                ✕
                              </button>
                            )}
                            <div>
                              <strong className="text-stone-900 block font-semibold text-xs">{line.description}</strong>
                              <span className="text-[9.5px] text-stone-400 block font-mono">Supplement hotel incidental charge</span>
                            </div>
                          </div>
                          <div className="col-span-3 text-center font-mono text-stone-400">—</div>
                          <div className="col-span-3 text-right pr-1 font-mono font-bold text-stone-900">
                            ₹{line.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}

                    </div>

                    {/* Tax aggregate blocks */}
                    <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col gap-1.5 font-mono text-[10.5px]">
                      <div className="flex justify-between text-stone-500">
                        <span>Ledger Base Subtotal:</span>
                        <span className="text-stone-850">₹{calcs.subtotalRaw.toLocaleString()}</span>
                      </div>

                      {calcs.discountReductions > 0 && (
                        <div className="flex justify-between text-rose-700 font-bold">
                          <span>Rebate Reduction ({b.discountPercent ? `${b.discountPercent}%` : "Flat rate"}):</span>
                          <span>- ₹{calcs.discountReductions.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold text-stone-700 pt-1.5 border-t border-stone-200/60">
                        <span>Nett Taxable hospitality Value:</span>
                        <span>₹{calcs.netTaxableAmount.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between text-indigo-700 font-semibold">
                        <span>Hospitality GST Breakdown ({b.gstRate || 12}% tax - CGST 6% + SGST 6%):</span>
                        <span>₹{calcs.gstValue.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between border-t border-dotted border-stone-300 pt-2.5 text-stone-950 font-black text-[13px] flex items-center">
                        <span className="text-stone-900 font-bold uppercase tracking-tight">Ledger Invoiced Payable Total:</span>
                        <span className="text-stone-900 text-sm">₹{calcs.totalGrandPayable.toLocaleString()}</span>
                      </div>

                      {b.paymentOption === "Advance" && b.advancePaid !== undefined && (
                        <>
                          <div className="flex justify-between text-emerald-700 font-bold">
                            <span>(-) Deposit Advance Paid Online via Razorpay:</span>
                            <span>- ₹{b.advancePaid.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between border-t-2 border-double border-stone-300 pt-2.5 text-amber-800 font-black text-[13.5px]">
                            <span>Lobby Counter Balance Remaining:</span>
                            <span>₹{Math.max(0, calcs.totalGrandPayable - b.advancePaid).toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* cash edits controls pane */}
                  {b.status !== "Closed" && b.status !== "Cancelled" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      
                      {/* Supplemental other charges adding */}
                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                        <span className="text-[10px] font-mono font-bold text-stone-500 uppercase block mb-1">
                          ✍ Process supplement Incidentals / Other Charges
                        </span>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="block text-[8px] font-mono text-stone-400 mb-0.5">incidental Descr</label>
                            <input
                              type="text"
                              value={newDesc}
                              onChange={(e) => setNewDesc(e.target.value)}
                              placeholder="e.g. Shore Side Seafood dinner"
                              className="w-full px-2.5 py-1.5 border border-stone-200 bg-white rounded-lg text-stone-800 text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-mono text-stone-400 mb-0.5">cash charge (₹)</label>
                            <input
                              type="number"
                              value={newAmt || ""}
                              onChange={(e) => setNewAmt(Number(e.target.value))}
                              placeholder="₹ 1500"
                              className="w-full px-2.5 py-1.5 border border-stone-200 bg-white rounded-lg text-stone-800 text-[11px]"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleAddChargeLine}
                          type="button"
                          className="w-full mt-2.5 py-1.5 bg-stone-900 text-stone-100 hover:bg-stone-850 font-bold font-mono text-[10px] rounded-lg cursor-pointer"
                        >
                          ➕ Add Other Charge line
                        </button>
                      </div>

                      {/* Cash discount code adjustments */}
                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                        <span className="text-[10px] font-mono font-bold text-stone-500 uppercase block mb-1">
                          🏷️ Apply promo rebates / Cash reductions
                        </span>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="block text-[8px] font-mono text-stone-400 mb-0.5">reduction Type</label>
                            <select
                              value={rebateMethod}
                              onChange={(e) => setRebateMethod(e.target.value as any)}
                              className="w-full px-2 py-1.5 border border-stone-200 bg-white rounded-lg text-stone-800 text-[11px] font-bold"
                            >
                              <option value="percent">Percentage (%)</option>
                              <option value="flat">Flat Cash (₹)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[8px] font-mono text-stone-400 mb-0.5">rebate reduction value</label>
                            <input
                              type="number"
                              value={rebateVal || ""}
                              onChange={(e) => setRebateVal(Number(e.target.value))}
                              placeholder={rebateMethod === "percent" ? "10%" : "₹1000"}
                              className="w-full px-2.5 py-1.5 border border-stone-200 bg-white rounded-lg text-stone-800 text-[11px] font-bold font-mono"
                            />
                          </div>
                        </div>

                        {/* Governance Form Fields */}
                        <div className="mt-3 flex flex-col gap-2.5 border-t border-stone-250 border-stone-200/60 pt-3">
                          <div>
                            <label className="block text-[9px] font-bold font-mono text-stone-500 uppercase mb-1">
                              Discount Reason <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={discountReason}
                              onChange={(e) => setDiscountReason(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-stone-200 bg-white rounded-lg text-stone-800 text-[11px] font-medium"
                            >
                              <option value="Guest Dissatisfaction">Guest Dissatisfaction</option>
                              <option value="Early Checkout">Early Checkout</option>
                              <option value="Corporate Adjustment">Corporate Adjustment</option>
                              <option value="Loyal Customer">Loyal Customer</option>
                              <option value="Service Recovery">Service Recovery</option>
                              <option value="Room Issue">Room Issue</option>
                              <option value="Billing Adjustment">Billing Adjustment</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold font-mono text-stone-500 uppercase mb-1">
                              Approved Via <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={discountApprovedVia}
                              onChange={(e) => setDiscountApprovedVia(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-stone-200 bg-white rounded-lg text-stone-800 text-[11px] font-medium"
                            >
                              <option value="Phone Call">Phone Call</option>
                              <option value="WhatsApp">WhatsApp</option>
                              <option value="Manager Approval">Manager Approval</option>
                              <option value="Reception Authority">Reception Authority</option>
                              <option value="Owner Present">Owner Present</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold font-mono text-stone-500 uppercase mb-1">
                              Additional Remarks & Context <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              rows={2}
                              value={discountRemarks}
                              onChange={(e) => setDiscountRemarks(e.target.value)}
                              placeholder="Describe specific details (e.g., AC cooling issue in Room 204. Owner informed over phone.)"
                              className="w-full px-2.5 py-1.5 border border-stone-200 bg-white rounded-lg text-stone-850 text-stone-800 text-[11px] focus:outline-none focus:border-stone-400"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleApplyDiscountRebate}
                          type="button"
                          className="w-full mt-3 py-2 bg-amber-600 hover:bg-amber-700 text-stone-950 font-bold font-mono text-[10.5px] rounded-lg cursor-pointer transition-all"
                        >
                          🏷️ Apply Approved Reduction & Audit
                        </button>
                      </div>

                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-stone-150">
                    <span className="text-[10px] text-stone-400 leading-none">
                      👤 Auditor: Staff cashier terminal logged • GST rates: CP-A (12%)
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const roomType = roomTypes.find(rt => rt.id === b.roomTypeId);
                          handleExportInvoiceToPDF(b, guest, roomType);
                        } catch (e) {
                          alert("Export failed. Please check data parameters.");
                        }
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold leading-none flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-slate-750"
                    >
                      <Download className="w-3.5 h-3.5" /> Direct Export to PDF Receipt 🧾
                    </button>
                  </div>

                </div>

              </div>
            );
          })() : (
            <div className="bg-stone-50/50 border border-stone-200 rounded-xl p-16 text-center text-stone-400 font-mono text-xs shadow-inner h-[50vh] flex flex-col justify-center items-center gap-3">
              <ClipboardList className="w-12 h-12 text-stone-300" />
              <div>
                <p className="font-sans font-bold text-stone-500">Front Desk Settle Desk Area Closed</p>
                <p className="text-[11px] mt-1 text-stone-400 max-w-sm">Please pick an active, paid or cancelled staying profile billing file from the left queue list to start auditing charges.</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* CLOSE BILL MODAL WIZARD */}
      {isCloseModalOpen && selectedBillingBooking && (
        <div id="close-bill-entry-modal" className="fixed inset-0 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-stone-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight">Settle Payment & Close Stay Folio</h3>
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer font-mono font-bold text-sm"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSettleAndCloseBill} className="p-5 flex flex-col gap-4 text-xs font-sans">
              <div>
                <span className="block font-mono text-[10px] text-stone-400 uppercase">Active Folio ID</span>
                <strong className="text-stone-800 text-sm font-mono block">{selectedBillingBooking.id}</strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Payment Method *</label>
                  <select
                    required
                    value={closingMethod}
                    onChange={(e) => setClosingMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg text-stone-800 font-medium cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Split Payment">Split Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Amount Received (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={closingAmount}
                    onChange={(e) => setClosingAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg text-stone-800 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Reference Auth Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPI Ref / Bank Auth token"
                  value={closingRef}
                  onChange={(e) => setClosingRef(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg text-stone-800 font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Cashier & Checkout Notes *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Insert stay summaries or split notes..."
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg text-stone-800"
                />
              </div>

              <div className="bg-stone-50 border border-stone-200 p-3 rounded-lg flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] text-stone-500 font-mono leading-tight">
                  Upon completion, the Guest Folio state becomes <strong>Closed</strong>. Simulated Email & WhatsApp notification alerts will be dispatched to the guest immediately.
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClose}
                  className="px-4 py-2 bg-emerald-605 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {isSubmittingClose ? "Marking Paid..." : "Settle & Close Bill"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
