/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Booking, Guest } from "../types";
import { Car, MapPin, Clock, Plus, Search, CheckCircle, Navigation, XCircle, User, FileText, CheckCircle2, ChevronRight } from "lucide-react";

interface TransportManagementProps {
  bookings: Booking[];
  guests: Guest[];
  onUpdateBooking: (id: string, payload: any) => Promise<any>;
}

export default function TransportManagement({ bookings, guests, onUpdateBooking }: TransportManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [vehicleType, setVehicleType] = useState<"Auto" | "Sedan" | "SUV" | "Innova" | "Tempo Traveller" | "Mini Bus" | "Bus" | "">("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [estimatedCost, setEstimatedCost] = useState<number>(500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter transport bookings
  const transportBookings = bookings.filter(b => b.transport && b.transport.vehicleType);

  const filteredTransport = transportBookings.filter(b => {
    const guest = guests.find(g => g.id === b.guestId);
    const vehicle = b.transport?.vehicleType || "";
    const pickup = b.transport?.pickupAddress || "";
    const drop = b.transport?.dropAddress || "";
    const text = searchQuery.toLowerCase();
    
    return (
      b.id.toLowerCase().includes(text) ||
      (guest?.name || "").toLowerCase().includes(text) ||
      vehicle.toLowerCase().includes(text) ||
      pickup.toLowerCase().includes(text) ||
      drop.toLowerCase().includes(text)
    );
  });

  // Get available/active bookings for linking
  const linkableBookings = bookings.filter(b => b.status !== "Cancelled" && b.status !== "Closed");

  const handleCreateTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) {
      alert("Please select an active Reservation to link this transport booking.");
      return;
    }
    if (!vehicleType) {
      alert("Please select a vehicle type.");
      return;
    }
    if (!pickupAddress || !dropAddress || !scheduleTime) {
      alert("Please enter pickup, drop-off locations and schedule time.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedBooking = bookings.find(b => b.id === selectedBookingId);
      const currentLogs = selectedBooking?.auditLogs || [];
      const updatedLogs = [
        ...currentLogs,
        {
          timestamp: new Date().toISOString(),
          action: "Transport Linked",
          user: "Front Desk Staff",
          notes: `Liaison: ${vehicleType} booked from ${pickupAddress} to ${dropAddress} for ₹${estimatedCost}`
        }
      ];

      // Standard custom charge for transport added automatically to custom service lines
      const serviceLines = selectedBooking?.customServiceLines || [];
      const updatedLines = [
        ...serviceLines,
        {
          id: `SERV-${Date.now()}`,
          description: `Transport Shuttle (${vehicleType}) - ${pickupAddress.split(",")[0]} to ${dropAddress.split(",")[0]}`,
          amount: estimatedCost
        }
      ];

      const res = await onUpdateBooking(selectedBookingId, {
        transport: {
          vehicleType,
          pickupAddress,
          dropAddress,
          scheduleTime,
          status: "Pending",
          cost: estimatedCost
        },
        customServiceLines: updatedLines,
        auditLogs: updatedLogs
      });

      if (res.success) {
        alert(`✓ Transport Linked successfully to Reservation ${selectedBookingId}! Invoiced customized transfer fee of ₹${estimatedCost}.`);
        // Reset Form
        setSelectedBookingId("");
        setVehicleType("");
        setPickupAddress("");
        setDropAddress("");
        setScheduleTime("");
        setEstimatedCost(500);
      } else {
        alert(res.error || "Failed linking transport.");
      }
    } catch (err) {
      alert("Error posting transport logistics booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTransportStatus = async (bookingId: string, status: "Pending" | "Dispatched" | "Completed" | "Cancelled") => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking || !booking.transport) return;

    try {
      const currentLogs = booking.auditLogs || [];
      const updatedLogs = [
        ...currentLogs,
        {
          timestamp: new Date().toISOString(),
          action: `Transport ${status}`,
          user: "Front Desk Staff",
          notes: `Logistics status manually transitioned to ${status}`
        }
      ];

      await onUpdateBooking(bookingId, {
        transport: {
          ...booking.transport,
          status
        },
        auditLogs: updatedLogs
      });
      alert(`✓ Shuttle status updated to: ${status}`);
    } catch (err) {
      alert("Failed updating shuttle dispatch status.");
    }
  };

  const handleRecalculateRate = (veh: string) => {
    let rate = 300;
    switch (veh) {
      case "Auto": rate = 250; break;
      case "Sedan": rate = 700; break;
      case "SUV": rate = 1200; break;
      case "Innova": rate = 1800; break;
      case "Tempo Traveller": rate = 3000; break;
      case "Mini Bus": rate = 4500; break;
      case "Bus": rate = 7500; break;
    }
    setEstimatedCost(rate);
  };

  return (
    <div id="transport-management-panel" className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Car className="w-6 h-6 text-indigo-600" /> Shuttles & Transport Logistics Center
          </h1>
          <p className="text-stone-500 text-xs mt-0.5">Liaison airport/rail pickups, corporate tour transfers, and coastal pilgrimage routes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Create Transport Booking & Link */}
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 shadow-sm h-fit">
          <div className="p-5">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 pb-2">
              <Plus className="w-4 h-4 text-indigo-600" /> Create Shuttle & Link Stay
            </h2>
            <p className="text-stone-400 text-[11px]">Attach transit logistics automatically back to the guest ledger invoice as charges</p>
          </div>
          
          <form onSubmit={handleCreateTransport} className="p-5 flex flex-col gap-4 text-xs">
            {/* Reservation link drop */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> 1. Select Active Stay (Required)
              </label>
              <select
                required
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-medium"
              >
                <option value="">-- Click to search reservations --</option>
                {linkableBookings.map(b => {
                  const guest = guests.find(g => g.id === b.guestId);
                  return (
                    <option key={b.id} value={b.id}>
                      {b.id} - {guest?.name} (Room {b.roomId || "Unassigned"} • {b.bookingType || "Room Stay"})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Vehicle selection class */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-stone-500 uppercase mb-1 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-indigo-600" /> 2. Vehicle Class
              </label>
              <select
                required
                value={vehicleType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setVehicleType(val);
                  handleRecalculateRate(val);
                }}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white text-stone-800 font-semibold"
              >
                <option value="">-- Select fleet vehicle style --</option>
                <option value="Auto">Auto Rickshaw (Traditional Local Tour)</option>
                <option value="Sedan">Sedan (Dzire Class standard transit)</option>
                <option value="SUV">SUV (Ertiga / Spacious comfort)</option>
                <option value="Innova">Premium Innova Crysta VIP Executive</option>
                <option value="Tempo Traveller">Tempo Traveller (Group blocks - 14-seater)</option>
                <option value="Mini Bus">Mini Bus (ConferenceHall delegates - 26-seater)</option>
                <option value="Bus">Luxury AC Bus coach (Corporate / Large groups)</option>
              </select>
            </div>

            {/* Pickup & Drop inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-400 mb-1">PICKUP ADDRESS</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BBI Airport Terminal"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-400 mb-1">DROP DESTINATION</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Resort Ocean Lounge"
                  value={dropAddress}
                  onChange={(e) => setDropAddress(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-800"
                />
              </div>
            </div>

            {/* Time scheduling & estimated cost */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-500" /> LIASION TIME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jun 20 at 2:00 PM"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-400 mb-1">ESTIMATED COST (₹)</label>
                <input
                  type="number"
                  required
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-stone-200 bg-amber-50 rounded-lg text-xs font-bold text-amber-900 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm tracking-wider uppercase font-mono mt-2"
            >
              {isSubmitting ? "Linking..." : "⚡ Schedule Shuttle & Link"}
            </button>
          </form>

          {/* Quick reference block */}
          <div className="p-5 font-mono text-[10.5px] text-stone-500 bg-stone-50/60 rounded-b-xl leading-relaxed">
            <span className="font-bold text-stone-800 uppercase block mb-1">Fleet rate benchmarks:</span>
            <ul className="space-y-0.5 list-disc pl-4">
              <li>Auto (Traditional: ₹250 flat)</li>
              <li>Sedan (Puri local rides: ₹700 flat)</li>
              <li>SUV / Innova Crysta (BBI Transit: ₹1200 - ₹1800)</li>
              <li>Group Tempo / Coach busses (Quotations: ₹3000 - ₹7500)</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Active Transport Board */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Filtering bar */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search shuttle bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-stone-200 rounded-lg text-stone-850 focus:outline-none"
              />
            </div>
            
            <div className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200/50 px-3 py-1 rounded-lg">
              📊 Total Scheduled Transports: {transportBookings.length}
            </div>
          </div>

          {/* Main List Grid */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 uppercase font-mono text-[9px] text-stone-500 font-bold">
                  <tr>
                    <th className="px-5 py-3">Linked ID</th>
                    <th className="px-5 py-3">Guest Contact</th>
                    <th className="px-5 py-3">Vehicle Details</th>
                    <th className="px-5 py-3">Liaison Route</th>
                    <th className="px-5 py-3 text-center">Dispatch State</th>
                    <th className="px-5 py-3 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTransport.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-stone-400 font-mono">
                        No transport bookings saved to reservation profiles yet. Create a schedule on the left panel!
                      </td>
                    </tr>
                  ) : (
                    filteredTransport.map((b) => {
                      const guest = guests.find(g => g.id === b.guestId);
                      const tr = b.transport!;
                      return (
                        <tr key={b.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-stone-900">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-stone-800">{b.id}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-stone-850">{guest?.name || "Unverified stay guest"}</div>
                            <div className="text-stone-400 text-[10px]">{guest?.phone || "N/A"}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 font-semibold text-indigo-700">
                              <Car className="w-3.5 h-3.5" /> {tr.vehicleType}
                            </div>
                            <div className="text-stone-400 text-[10px] font-mono font-bold">Est Cost: ₹{tr.cost?.toLocaleString() || "500"}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 text-stone-800 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-rose-500" />
                              <span>{tr.pickupAddress}</span>
                              <ChevronRight className="w-3 h-3 text-stone-400" />
                              <span>{tr.dropAddress}</span>
                            </div>
                            <div className="text-stone-400 text-[10px] font-mono mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> Time: {tr.scheduleTime}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border ${
                              tr.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              tr.status === "Dispatched" ? "bg-indigo-50 text-indigo-700 border-indigo-250" :
                              tr.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-250" :
                              "bg-rose-50 text-rose-600 border-rose-200"
                            }`}>
                              {tr.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              {tr.status === "Pending" && (
                                <button
                                  onClick={() => handleUpdateTransportStatus(b.id, "Dispatched")}
                                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[10px] transition-all cursor-pointer"
                                >
                                  🚀 Dispatch
                                </button>
                              )}
                              {(tr.status === "Pending" || tr.status === "Dispatched") && (
                                <button
                                  onClick={() => handleUpdateTransportStatus(b.id, "Completed")}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] transition-all cursor-pointer"
                                >
                                  ✓ Complete
                                </button>
                              )}
                              {tr.status !== "Completed" && tr.status !== "Cancelled" && (
                                <button
                                  onClick={() => handleUpdateTransportStatus(b.id, "Cancelled")}
                                  className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                                  title="Cancel shuttle booking"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {(tr.status === "Completed" || tr.status === "Cancelled") && (
                                <span className="text-[10px] text-stone-400 italic">No actions</span>
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

        </div>
      </div>
    </div>
  );
}
