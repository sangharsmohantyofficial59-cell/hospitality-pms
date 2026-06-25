/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Guest, Booking, UploadedDocument } from "../types";
import { User, Mail, Phone, Calendar, History, Eye, ShieldAlert, BadgeCheck, FileText } from "lucide-react";

interface GuestProfileListProps {
  guests: Guest[];
  bookings: Booking[];
  documents: UploadedDocument[];
}

export default function GuestProfileList({ guests, bookings, documents }: GuestProfileListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuestForHistory, setSelectedGuestForHistory] = useState<Guest | null>(null);
  const [viewingDocument, setViewingDocument] = useState<any | null>(null);

  // Search filter
  const filteredGuests = guests.filter(g => {
    const text = searchTerm.toLowerCase().trim();
    if (!text) return true;
    return (
      g.name.toLowerCase().includes(text) ||
      g.email.toLowerCase().includes(text) ||
      g.phone.replace(/\s+/g, "").includes(text)
    );
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="text-xl font-bold text-stone-900">Hotel Guest Directory</h1>
        <p className="text-stone-500 text-xs mt-0.5">Verify visitor checkout logs, contact records, and uploaded ID proofs</p>
      </div>

      {/* Filter and search */}
      <div className="max-w-md bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-2">
        <span className="text-stone-400">🔍</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter guests by name, email, or mobile..."
          className="w-full text-xs text-stone-850 focus:outline-none"
        />
      </div>

      {/* Guest Profiles Layout Splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Guest Directory cards */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-stone-100">
              {filteredGuests.length === 0 ? (
                <div className="p-8 text-center text-stone-400 font-mono text-xs">
                  No matching registered guest profiles found.
                </div>
              ) : (
                filteredGuests.map((g) => {
                  const guestBookings = bookings.filter(b => b.guestId === g.id);
                  const matchingDoc = documents.find(d => d.guestId === g.id);

                  return (
                    <div key={g.id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-stone-50/40 transition-colors">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 bg-amber-100 text-amber-800 border border-amber-200/80 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                          {g.name.split(" ").map(w => w[0]).join("")}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-sans font-bold text-base text-stone-900">{g.name}</h3>
                            <span className="font-mono text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                              {g.id}
                            </span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 font-mono text-[11px] text-stone-500 mt-1">
                            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-stone-400" /> {g.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-stone-400" /> {g.phone}</span>
                          </div>

                          {/* ID proof status */}
                          <div className="mt-3 flex items-center gap-3">
                            {g.idType ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-semibold bg-emerald-50 rounded-full py-0.5 px-2 border border-emerald-100">
                                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> ID Verified ({g.idType})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 font-semibold bg-amber-50 rounded-full py-0.5 px-2 border border-amber-100">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> ID Pending
                              </span>
                            )}

                            {g.idType && (
                              <button
                                onClick={() => setViewingDocument({
                                  guest: g,
                                  type: g.idType,
                                  number: g.idNumber,
                                  url: g.idProofUrl
                                })}
                                className="text-[10px] uppercase font-mono font-bold text-amber-700 hover:underline flex items-center gap-0.5 bg-amber-50/50 hover:bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50"
                              >
                                <Eye className="w-3 h-3" /> View Scanned ID
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="text-right flex sm:flex-col justify-between items-center sm:items-end gap-2 flex-shrink-0 pt-3 sm:pt-0 border-t border-dashed border-stone-100 sm:border-0">
                        <span className="text-[10px] text-stone-400 font-mono block">Registered since: {new Date(g.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => setSelectedGuestForHistory(g)}
                          className="px-3.5 py-1.5 border border-stone-200 hover:border-amber-600 hover:bg-amber-50 hover:text-amber-900 transition-all rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" /> Bookings History ({guestBookings.length})
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right visitor detail card sidebars */}
        <div className="w-full">
          {selectedGuestForHistory ? (
            <div className="bg-white rounded-xl border border-stone-200 shadow-md p-5 text-stone-850">
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-[10px] font-mono uppercase font-bold text-stone-400">Visitor ledger tracking</span>
                <button
                  onClick={() => setSelectedGuestForHistory(null)}
                  className="text-xs font-mono font-bold text-red-500 hover:underline cursor-pointer"
                >
                  ✕ Close Ledger
                </button>
              </div>

              <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-xs">
                  {selectedGuestForHistory.name.split(" ").map(w => w[0]).join("")}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">{selectedGuestForHistory.name}</h3>
                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">{selectedGuestForHistory.email}</p>
                </div>
              </div>

              <h4 className="text-xs font-mono font-bold text-stone-400 uppercase mb-3">Reservations Log ({bookings.filter(b => b.guestId === selectedGuestForHistory.id).length}):</h4>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-80 pr-1">
                {bookings
                  .filter(b => b.guestId === selectedGuestForHistory.id)
                  .map((b) => (
                    <div key={b.id} className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 leading-relaxed text-xs flex justify-between items-center font-mono">
                      <div>
                        <strong className="text-stone-850 font-bold block">{b.id}</strong>
                        <span className="text-[10px] text-stone-400 block mt-0.5">{b.checkInDate} to {b.checkOutDate}</span>
                        <span className="text-[10px] text-amber-700 block mt-0.5 font-sans font-medium">₹{b.totalPrice.toLocaleString()} paid</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                        b.status === "Checked Out" ? "bg-stone-500/10 text-stone-500" :
                        b.status === "Checked In" ? "bg-blue-100 text-blue-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="bg-stone-100 rounded-xl border border-dashed border-stone-300 p-8 text-center text-xs text-stone-400">
              Select any guest's <strong>Bookings History</strong> button to retrieve audit log cards.
            </div>
          )}
        </div>

      </div>

      {/* DYNAMIC SCANNED GOVERNMENT IDENTITY PREVIEW MODAL */}
      {viewingDocument && (
        <div id="id-document-viewer-modal" className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-stone-100">
            {/* Header */}
            <div className="p-5 bg-stone-950 border-b border-stone-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-sm">Govt Identity Card Scanner</h3>
                  <p className="font-mono text-[9px] text-stone-400">Verified Web E-CheckIn File package</p>
                </div>
              </div>
              <button
                onClick={() => setViewingDocument(null)}
                className="text-stone-400 hover:text-white text-xs font-mono font-medium bg-stone-900 border border-stone-800 rounded px-2.5 py-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Document graphic card body */}
            <div className="p-6 flex flex-col items-center">
              <div className="w-full max-w-sm aspect-[1.6/1] bg-gradient-to-tr from-amber-950/50 to-stone-950 text-stone-200 border-2 border-amber-600/30 rounded-xl p-5 font-mono relative overflow-hidden shadow-inner uppercase">
                {/* Background seal watermark decors */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border border-amber-600/5 rotate-12 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border border-amber-600/5 border-dashed"></div>
                </div>

                <div className="flex justify-between items-start border-b border-amber-500/10 pb-2 mb-3">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold leading-normal">Republic of India</span>
                    <strong className="text-[11px] text-white tracking-widest">{viewingDocument.type} Authentication</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                </div>

                <div className="flex gap-4 items-center mt-4">
                  {/* Avatar photo block */}
                  <div className="w-20 h-24 bg-stone-900 border border-amber-500/20 rounded flex flex-col items-center justify-center text-stone-600 text-xs flex-shrink-0 relative">
                    <User className="w-10 h-10 text-stone-700" />
                    <span className="text-[7px] text-stone-500 absolute bottom-1">Scan Sec</span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-[10px] text-stone-300">
                    <div>
                      <span className="text-[8px] text-stone-500">Name</span>
                      <p className="font-sans font-bold text-stone-100">{viewingDocument.guest?.name}</p>
                    </div>
                    <div>
                      <span className="text-[8px] text-stone-500">Document Identification serial</span>
                      <p className="text-white tracking-wider font-bold text-[11px]">{viewingDocument.number}</p>
                    </div>
                    <div>
                      <span className="text-[8px] text-stone-500">Registered Phone reference</span>
                      <p className="text-stone-300">{viewingDocument.guest?.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-3 left-4 flex justify-between items-baseline w-[90%] border-t border-amber-500/10 pt-2 text-[8px] text-stone-500">
                  <span>PMS Security Token: {viewingDocument.guest?.id.replace("GUST-", "STK_")}</span>
                  <span>Grand Crest Park Street</span>
                </div>
              </div>

              <div className="w-full max-w-sm mt-4 bg-stone-950/40 p-3 rounded-lg border border-stone-800 text-[10px] font-mono text-stone-400 leading-normal">
                <span>⚠ PMS Security Policy Compliance: Scanned document proofs uploaded during Online E-Check-In bypass are stored in dynamic memory. In development workspaces, storage clears on state restoration reset commands.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
