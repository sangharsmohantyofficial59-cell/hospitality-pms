import React, { useState } from "react";
import { Booking, Guest } from "../types";
import { Mail, CheckCircle, Smartphone, Send, ArrowRight, Layout, RefreshCcw } from "lucide-react";

interface MessageTemplatesProps {
  bookings: Booking[];
  guests: Guest[];
  onSendMessage?: (bookingId: string, event: string) => Promise<any>;
}

export default function MessageTemplates({ bookings, guests, onSendMessage }: MessageTemplatesProps) {
  // Setup selectors
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    bookings.length > 0 ? bookings[0].id : ""
  );
  const [selectedTemplate, setSelectedTemplate] = useState<"confirmation" | "checkin" | "invoice">("confirmation");
  const [selectedChannel, setSelectedChannel] = useState<"email" | "whatsapp">("email");

  // Customizer fields
  const [customGreeting, setCustomGreeting] = useState("We are absolutely thrilled to welcome you to the resort!");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Retrieve current records
  const currentBooking = bookings.find(b => b.id === selectedBookingId) || bookings[0];
  const currentGuest = currentBooking ? guests.find(g => g.id === currentBooking.guestId) : null;

  const handleSendSimulated = async () => {
    if (!currentBooking) return;
    setIsSending(true);
    setSentSuccess(false);
    try {
      // Hit messaging endpoint or simulate delay
      await new Promise(r => setTimeout(r, 1000));
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 3000);
    } catch {
      alert("Simulated delivery offline.");
    } finally {
      setIsSending(false);
    }
  };

  // Helper template strings
  const getTemplateContent = () => {
    const guestName = currentGuest ? currentGuest.name : "Valued Guest";
    const bId = currentBooking ? currentBooking.id : "BK-NILADRI-999";
    const checkIn = currentBooking ? currentBooking.checkInDate : "Tomorrow";
    const checkOut = currentBooking ? currentBooking.checkOutDate : "Day After";
    const bType = currentBooking ? currentBooking.bookingType : "Classic Room stay";
    const totalRaw = currentBooking ? currentBooking.totalPrice : 15500;
    const paidSum = currentBooking?.paymentOption === "Advance" ? (currentBooking.advancePaid ?? Math.round(totalRaw/2)) : totalRaw;
    const pendingSum = currentBooking?.paymentOption === "Advance" ? (currentBooking.pendingBalance ?? (totalRaw - paidSum)) : 0;

    switch (selectedTemplate) {
      case "confirmation":
        return {
          subject: `✓ Resort Confirmation: Booking Ref #${bId} - Niladri Ocean Retreat & Spa`,
          bodyIntro: `Dear ${guestName},\n\nYour luxurious seaside residence is fully confirmed for check-in on ${checkIn}. ${customGreeting}`,
          bodyMain: `Our front desk squad has secured a beautiful ${bType} specifically for you. Below are the reservations details for your verification:`,
          pricingInfo: `• Deposit Paid Online: ₹${paidSum.toLocaleString()}\n• Pending At Desk Settlement: ₹${pendingSum.toLocaleString()}\n• Scheduled Checkout: ${checkOut}`,
          ctaText: "Upload ID Proof & Pre Check-In Digital Link",
          ctaUrl: "https://niladri-resorts.com/e-checkin",
          signature: "General Manager,\nNiladri Beachfront Resorts Operations"
        };
      case "checkin":
        return {
          subject: `⏳ Digital Web Check-In Invitation - Booking Reference #${bId}`,
          bodyIntro: `Namaskar ${guestName},\n\nTo ensure a completely seamless, contactless greeting at our beachfront lobby, we invite you to bypass the reception desk arrivals queues by completing your e-check-in verification in advance.`,
          bodyMain: `By sharing your mandated Aadhaar / Passport information and selfie ID beforehand, your smart-assigned keycard will be programmed and ready upon arrival on ${checkIn}.`,
          pricingInfo: `• Accommodated stay: ${bType}\n• Total nights folio: ${Math.round(totalRaw / 7500) || 2} Nights\n• Check-In Ref Token: ${bId}`,
          ctaText: "Launch Secure Guest ID Upload Portal",
          ctaUrl: "https://niladri-resorts.com/e-checkin",
          signature: "Front Desk & Guest Experience Team,\nNiladri Resorts"
        };
      case "invoice":
        return {
          subject: `🧾 Settled Tax Invoice Folio & Checkout Certificate - Booking #${bId}`,
          bodyIntro: `Dear ${guestName},\n\nThank you for choosing Niladri Ocean Retreat & Spa for your luxury getaway. It has been a pleasure hosting you during your beachfront getaway.`,
          bodyMain: `We have finalized your final reservation statement. Please find your detailed, audit-compliant digital invoice specifications below:`,
          pricingInfo: `• Invoiced Amount Settle Net: ₹${totalRaw.toLocaleString()}\n• Payment Method Registered: Razorpay / Hand-desk Settlement\n• Checkout Timestamp: ${checkOut} (11:00 AM)`,
          ctaText: "Download Full Itemized Invoice PDF Receipt",
          ctaUrl: "https://niladri-resorts.com/invoice-pdf-download",
          signature: "Finance Auditor Team,\nNiladri Beachfront Resorts"
        };
    }
  };

  const textData = getTemplateContent();

  return (
    <div id="message-templates-wrapper" className="bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-sm overflow-hidden text-stone-700">
      
      {/* Tab Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" /> Automated Multichannel Preview Center
          </h2>
          <p className="text-stone-500 text-xs mt-0.5">
            Audit and preview tailored Email drafts and WhatsApp mobile notification messages before final dispatch.
          </p>
        </div>
        
        <div className="flex items-center gap-2 font-mono text-[11px] bg-white p-1 rounded-lg border border-stone-200 shadow-sm">
          <span className="px-2.5 py-1 text-stone-400">SELECT STAY BOOKING:</span>
          <select
            value={selectedBookingId}
            onChange={(e) => {
              setSelectedBookingId(e.target.value);
              setSentSuccess(false);
            }}
            className="px-2 py-0.5 border-none font-bold bg-transparent text-indigo-700 focus:outline-none"
          >
            {bookings.length === 0 ? (
              <option value="">Zero Active Bookings</option>
            ) : (
              bookings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.id} - {guests.find(g => g.id === b.guestId)?.name || "Guest"}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {!currentBooking ? (
        <div className="p-10 text-center font-mono text-xs text-stone-400">
          No stay data loaded to parse placeholders. Please configure bookings first on Niladri PMS.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT CHANNEL SELECT PANEL */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Category selection */}
            <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs">
              <span className="block font-mono text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                1. Select Guest Lifecycle Milestone
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { id: "confirmation", label: "Booking Confirmation Template", desc: "Sent on creation with payment logs" },
                  { id: "checkin", label: "Web Check-In Invitation", desc: "Sent pre-arrival with secure ID upload link" },
                  { id: "invoice", label: "Invoice & Checkout Summary", desc: "Sent on final safe checkout & closure" }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(t.id as any);
                      setSentSuccess(false);
                      if (t.id === "confirmation") {
                        setCustomGreeting("We are absolutely thrilled to welcome you to the resort!");
                      } else if (t.id === "checkin") {
                        setCustomGreeting("To bypass arrival lobby queues, please upload your Aadhaar/Passport proof.");
                      } else {
                        setCustomGreeting("We hope you had a luxurious restorative stay at Odisha coast.");
                      }
                    }}
                    className={`p-2.5 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
                      selectedTemplate === t.id
                        ? "bg-indigo-600/5 border-indigo-600/70 text-stone-900"
                        : "bg-stone-50/50 border-stone-200 hover:bg-stone-50 text-stone-500"
                    }`}
                  >
                    <span className="text-[11.5px] font-bold">{t.label}</span>
                    <span className="text-[10px] text-stone-400 mt-0.5 leading-tight">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Channel Selection */}
            <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs">
              <span className="block font-mono text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                2. Select Distribution Channel
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChannel("email")}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedChannel === "email"
                      ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                      : "bg-stone-50/50 border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-xs">Email Template</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannel("whatsapp")}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedChannel === "whatsapp"
                      ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                      : "bg-stone-50/50 border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs">WhatsApp Push</span>
                </button>
              </div>
            </div>

            {/* Customizer Input */}
            <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs">
              <span className="block font-mono text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                ✏️ Customize Greeting Text (Live-Updated)
              </span>
              <textarea
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                placeholder="Type real-time custom greeting notes..."
                rows={2}
                className="w-full px-3 py-2 border border-stone-200 bg-white rounded-lg text-stone-850 text-xs focus:outline-none focus:border-indigo-600"
              />
              <p className="text-[10px] text-stone-405 text-stone-400 mt-1 italic">
                Any text typed here modifies the placeholder fields in the live mockup preview box.
              </p>
            </div>

            {/* Send simulated action */}
            <button
              onClick={handleSendSimulated}
              disabled={isSending}
              className="py-3 bg-stone-900 hover:bg-stone-850 text-white font-bold rounded-xl text-xs uppercase font-mono tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {isSending ? (
                <span>Dispatching Test Signal...</span>
              ) : sentSuccess ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  ✓ DISPATCHED GUEST ALERT SUCCESSFULLY
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Trigger Simulated Message Broadcast
                </>
              )}
            </button>

          </div>

          {/* RIGHT LIVE MOCKUP DRAFT */}
          <div className="lg:col-span-7">
            
            {selectedChannel === "email" ? (
              // EMAIL RICH CARD PREVIEW
              <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden font-sans">
                {/* Email meta values */}
                <div className="bg-stone-100 p-4 border-b border-stone-200 text-xs text-stone-600 flex flex-col gap-1 font-mono">
                  <div><span className="text-stone-400 font-bold">To:</span> {currentGuest?.email || "reception@niladriOcean.com"}</div>
                  <div><span className="text-stone-400 font-bold">From:</span> auto-reply@niladriOcean.com</div>
                  <div className="text-stone-900 font-bold truncate">
                    <span className="text-stone-400 font-bold">Subject:</span> {textData.subject}
                  </div>
                </div>

                {/* Simulated Web Card Content */}
                <div className="p-6 md:p-8 bg-stone-50 select-text">
                  <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs pb-6">
                    {/* Niladri Header */}
                    <div className="bg-stone-950 p-6 text-center text-white">
                      <h1 className="text-sm font-black uppercase tracking-widest font-sans text-amber-400">
                        NILADRI RESORT & SPA
                      </h1>
                      <span className="text-[8px] font-mono tracking-wider text-slate-400">PURI BEACHFRONT RETREAT, ODISHA</span>
                    </div>

                    {/* Email message body */}
                    <div className="p-6 text-stone-700 leading-relaxed text-xs flex flex-col gap-3.5">
                      <p className="whitespace-pre-line text-stone-900 font-sans">
                        {textData.bodyIntro}
                      </p>
                      
                      <p>{customGreeting}</p>

                      <p>{textData.bodyMain}</p>

                      <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-200 font-mono text-[10.5px] text-stone-850 flex flex-col gap-1 cursor-text select-all">
                        {textData.pricingInfo.split("\n").map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                      </div>

                      <div className="text-center pt-3 select-none">
                        <a
                          href="#simulate"
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 text-stone-950 font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow-sm"
                        >
                          {textData.ctaText} <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <p className="text-[10px] text-stone-400 mt-4 border-t border-stone-100 pt-3 whitespace-pre-line font-mono">
                        {textData.signature}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // WHATSAPP SMARTPHONE PREVIEW
              <div className="bg-stone-950 rounded-[40px] p-4 max-w-sm mx-auto shadow-2xl border-4 border-stone-800 relative select-none">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-stone-800 rounded-b-xl z-20"></div>
                
                {/* WhatsApp header */}
                <div className="bg-emerald-800 text-white pt-6 pb-3 px-4 rounded-t-[30px] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs">
                    N
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Niladri Resorts Support</h4>
                    <span className="text-[8px] text-emerald-250 font-mono">Online</span>
                  </div>
                </div>

                {/* Smartphone Content body */}
                <div className="bg-[#efeae2] p-4 h-96 overflow-y-auto flex flex-col justify-end">
                  <div className="bg-white p-3 rounded-2xl shadow-xs border-r-2 border-b-2 border-stone-200/50 max-w-[90%] text-stone-800 text-[11px] leading-relaxed self-start flex flex-col gap-2 relative">
                    {/* Tail bubble */}
                    <div className="absolute top-0 left-[-6px] border-8 border-transparent border-t-white"></div>
                    
                    <p className="whitespace-pre-line text-xs font-semibold">
                      *Niladri Ocean Resorts Alert* 🌊
                    </p>

                    <p className="whitespace-pre-line truncate-2-lines">
                      {textData.bodyIntro.slice(0, 300)}
                    </p>

                    <p className="text-amber-800 font-bold border-l-2 border-amber-500 pl-2 bg-amber-50/20 py-1 font-mono">
                      {textData.pricingInfo.slice(0, 300)}
                    </p>

                    <p className="text-[10px] text-indigo-700 underline font-mono select-all font-bold">
                      {textData.ctaUrl}
                    </p>

                    <span className="text-[8px] text-stone-400 font-mono self-end">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                    </span>
                  </div>
                </div>

                {/* WhatsApp bottom input bar */}
                <div className="bg-stone-100 p-3 rounded-b-[30px] flex gap-2 items-center">
                  <div className="bg-white flex-grow rounded-full px-3 py-1.5 text-[10px] text-stone-400 font-sans border border-stone-200">
                    Type a message...
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                    🎤
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
