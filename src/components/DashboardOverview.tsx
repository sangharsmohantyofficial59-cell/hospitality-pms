/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Room, Booking, Payment, Notification, RoomStatus, BookingStatus, Guest } from "../types";
import { DollarSign, ShieldCheck, CheckCircle2, AlertTriangle, Eye, Loader, Check, CircleDot, User, PlusCircle, ArrowUpRight, Calendar, ArrowRight } from "lucide-react";

interface DashboardOverviewProps {
  rooms: Room[];
  bookings: Booking[];
  guests: Guest[];
  payments: Payment[];
  notifications: Notification[];
  onMarkNotificationsRead: () => void;
  setAdminSubTab: (tab: string) => void;
  staffRole?: string;
}

export default function DashboardOverview({
  rooms,
  bookings,
  guests,
  payments,
  notifications,
  onMarkNotificationsRead,
  setAdminSubTab,
  staffRole
}: DashboardOverviewProps) {
  
  // 1. KPI Metrics Calculations
  const totalRooms = rooms.length; // 30
  const occupiedCount = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
  const availableCount = rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
  const reservedCount = rooms.filter(r => r.status === RoomStatus.RESERVED).length;
  const cleaningCount = rooms.filter(r => r.status === RoomStatus.CLEANING).length;
  const maintenanceCount = rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length;

  const todayStr = payments.length > 0
    ? payments.map(p => p.createdAt?.slice(0, 10)).sort().filter(Boolean).pop() || "2026-06-22"
    : "2026-06-22";

  const checkinsToday = bookings.filter(b => b.checkInDate === todayStr && b.status !== BookingStatus.CANCELLED).length;
  const checkoutsToday = bookings.filter(b => b.checkOutDate === todayStr && b.status !== BookingStatus.CANCELLED).length;

  const totalRevenue = payments
    .filter(p => p.status === "Paid")
    .reduce((avg, p) => avg + p.amount, 0);

  const formatDay = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Jun 22";
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Jun 22";
    }
  };

  // 2. Data Formatting for Recharts
  // Revenue stream (Mock 7 days historical aggregate)
  const revenueHistory = [
    { day: "Jun 18", revenue: 12000, bookings: 2 },
    { day: "Jun 19", revenue: 20400, bookings: 3 },
    { day: "Jun 20", revenue: 15000, bookings: 2 },
    { day: "Jun 21", revenue: 22500, bookings: 4 },
    { day: "Jun 22", revenue: 29400, bookings: 5 },
    { day: "Jun 23", revenue: 32600, bookings: 6 },
    { day: formatDay(todayStr), revenue: totalRevenue, bookings: bookings.length }
  ];

  // Room Status Distribution
  const roomStatusData = [
    { name: "Available", value: availableCount, color: "#10b981" }, // emerald
    { name: "Reserved", value: reservedCount, color: "#f59e0b" },  // amber
    { name: "Occupied", value: occupiedCount, color: "#4f46e5" },  // indigo
    { name: "Cleaning", value: cleaningCount, color: "#a855f7" },  // purple
    { name: "Maintenance", value: maintenanceCount, color: "#f43f5e" } // rose
  ].filter(c => c.value > 0);

  // Booking Source Breakdown
  const sourcesGrouped = bookings.reduce((acc: any, b) => {
    acc[b.source] = (acc[b.source] || 0) + 1;
    return acc;
  }, {});

  const bookingSourceData = Object.keys(sourcesGrouped).map(source => ({
    source,
    count: sourcesGrouped[source]
  }));

  const isReceptionist = staffRole === "receptionist";

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* HEADER CONTROLS */}
      <div id="admin-kpi-row" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isReceptionist ? "Front Desk Operations Dashboard" : "Property Executive Summary"}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Real-time status indicators for {hotelConfig.info.name} ({rooms.length || 30}-Room system state)</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="bg-emerald-50 text-emerald-700 py-1 px-3 border border-emerald-200 rounded-full font-semibold flex items-center gap-1.5 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Live System Status
          </span>
          <span className="bg-slate-100 py-1 px-3 border border-slate-200 rounded-full font-medium text-slate-600">
            System Local Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* KPI CARDS GRID - Professional Polish Theme: white cards, slate border and clean typography */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-5">
        {[
          { title: "Total Rooms", val: totalRooms, tag: "30-chamber capacity", tagColor: "text-slate-500" },
          { title: "Available Rooms", val: availableCount, tag: `${Math.round((availableCount/totalRooms)*100)}% vacant and clean`, tagColor: "text-emerald-600" },
          { title: "Occupied Rooms", val: occupiedCount, tag: `${Math.round((occupiedCount/totalRooms)*100)}% live occupancy`, tagColor: "text-indigo-600" },
          { title: "Today's Check-ins", val: checkinsToday, tag: "Expected today", tagColor: "text-amber-600" },
          { title: "Today's Check-outs", val: checkoutsToday, tag: "Departing today", tagColor: "text-rose-600" },
          { 
            title: "Revenue Summary", 
            val: isReceptionist ? "₹ ••••••" : `₹${totalRevenue.toLocaleString()}`, 
            tag: isReceptionist ? "Owner Level Secured" : "Total settled ledger", 
            tagColor: isReceptionist ? "text-amber-700 font-bold" : "text-emerald-700 font-bold" 
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">{item.title}</span>
            <div className="my-2.5 text-2xl font-black font-sans leading-none text-slate-900">{item.val}</div>
            <span className={`text-[10px] font-mono leading-tight font-medium ${item.tagColor}`}>{item.tag}</span>
          </div>
        ))}
      </div>

      {/* CHARTS LAYOUT (SIDE BY SIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE GRAPH RECHARTS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 lg:col-span-2 flex flex-col h-96 relative overflow-hidden">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">Weekly Revenue Streams (₹)</span>
          <h3 className="font-sans font-bold text-base text-slate-800 mb-4">Invoiced Ledger Performance</h3>
          
          {isReceptionist ? (
            <div className="absolute inset-0 bg-slate-50/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
              <span className="text-3xl mb-2">🔒</span>
              <h4 className="font-bold text-slate-850 text-sm">Financial Data Locked</h4>
              <p className="text-slate-500 text-xs mt-1 max-w-xs leading-normal">
                Weekly revenue and transaction stream analysis is restricted to Owner/Executive roles. Switch role to Owner in the logout panel above to view.
              </p>
            </div>
          ) : (
            <div className="flex-grow w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueHistory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* PIE CHART / STATUS DISTRIBUTION */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-96">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">Room Status Distribution</span>
          <h3 className="font-sans font-bold text-base text-slate-800 mb-4">Operations Status Allocation</h3>

          <div className="flex-grow flex items-center justify-center h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {roomStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} room(s)`} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Absolute center occupancy rate */}
            <div className="absolute flex flex-col items-center">
              <span className="text-slate-400 text-[10px] font-mono uppercase tracking-tight">Occupancy</span>
              <span className="text-slate-900 font-sans font-black text-xl leading-none">
                {Math.round((occupiedCount / totalRooms) * 100)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono font-medium text-slate-600 mt-2">
            {roomStatusData.map((lbl, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: lbl.color }}></span>
                <span>{lbl.name}: <strong className="text-slate-950 font-bold">{lbl.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* THREE EXTRA PANELS: BOOKINGS SOURCES, NOTIFICATIONS TRAY & FLOOR STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FLOOR BY FLOOR BREAKDOWN */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-80 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">Inventory Status Overview</span>
            <h3 className="font-sans font-bold text-base text-slate-800 mb-4">30-Room PMS Floor Clusters</h3>
          </div>

          <div className="flex flex-col gap-4 flex-grow justify-center">
            {[
              { name: "Floor 1 (Classic Standard)", range: "Rooms 101 - 110", pattern: index => rooms.filter(r => r.id.startsWith("1")).length, occ: rooms.filter(r => r.id.startsWith("1") && r.status === RoomStatus.OCCUPIED).length },
              { name: "Floor 2 (Royal Deluxe Double)", range: "Rooms 201 - 210", pattern: index => rooms.filter(r => r.id.startsWith("2")).length, occ: rooms.filter(r => r.id.startsWith("2") && r.status === RoomStatus.OCCUPIED).length },
              { name: "Floor 3 (Executive Suite & Premium)", range: "Rooms 301 - 310", pattern: index => rooms.filter(r => r.id.startsWith("3")).length, occ: rooms.filter(r => r.id.startsWith("3") && r.status === RoomStatus.OCCUPIED).length }
            ].map((fl, idx) => {
              const max = 10;
              const rate = Math.round((fl.occ / max) * 100);
              return (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-slate-800">{fl.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">{fl.occ} of {max} occupied</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/40">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${rate}%` }}></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono italic mt-0.5 block">{fl.range}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOOKING SOURCE CHIPS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-80 flex flex-col">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">Distribution Analysis</span>
          <h3 className="font-sans font-bold text-base text-slate-800 mb-3">Reservations Source Traffic</h3>

          <div className="flex-grow w-full">
            <ResponsiveContainer width="100%" height={90} className="min-h-50">
              <BarChart data={bookingSourceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="source" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PMS NOTIFICATION NOTIFY PANEL */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-80 flex flex-col">
          <div className="flex justify-between items-baseline mb-3">
            <div>
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">Logs Feed</span>
              <h3 className="font-sans font-bold text-base text-slate-800">PMS System Notifications</h3>
            </div>
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={onMarkNotificationsRead}
                className="text-[10px] font-mono font-bold text-indigo-700 hover:underline bg-indigo-50 cursor-pointer border border-indigo-200 rounded px-1.5 py-0.5"
              >
                Clear Unread
              </button>
            )}
          </div>

          <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-2.5 max-h-52">
            {notifications.length === 0 ? (
              <div className="text-center font-mono text-[10px] text-slate-400 py-10">
                Lobby desk notifications tray is clear.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-2.5 rounded-lg border text-xs leading-normal flex items-start gap-2 ${
                    !n.isRead ? "bg-indigo-50/50 border-indigo-200/80" : "bg-slate-100 border-slate-200/50 opacity-70"
                  }`}
                >
                  <span className="text-base select-none mt-0.5 flex-shrink-0">
                    {n.type === "new_booking" ? "📬" :
                     n.type === "payment_confirmation" ? "💰" :
                     n.type === "room_assignment" ? "🔑" : "🛎️"}
                  </span>
                  <div>
                    <h5 className="font-sans font-bold text-slate-800 text-[11px]">{n.title}</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">{n.message}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-1">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RECENT BOOKINGS MODULE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div>
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">Transaction Logs</span>
            <h3 className="font-sans font-bold text-base text-slate-800">Recent Desk Bookings</h3>
          </div>
          <button
            onClick={() => setAdminSubTab("bookings")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold font-mono text-[11px] rounded border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            Manage Bookings <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 font-mono text-[10px] uppercase font-bold text-stone-500 border-b border-stone-200">
                <th className="px-4 py-3">Reservation ID</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3 text-center">Source</th>
                <th className="px-4 py-3 font-mono">Stay Dates</th>
                <th className="px-4 py-3">Assigned Room</th>
                <th className="px-4 py-3">Paid Ledger</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 leading-normal">
              {bookings.slice(0, 5).map((b) => {
                const guest = guests.find((g) => g.id === b.guestId);
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{b.id}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-800 block">{guest?.name || "Guest Details Loading"}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{guest?.email}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded uppercase">
                        {b.source}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      <span>{b.checkInDate}</span>
                      <span className="mx-1.5 text-slate-300">→</span>
                      <span>{b.checkOutDate}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      {b.roomId ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] rounded font-semibold">
                          Room {b.roomId}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] rounded italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-800">
                      ₹{b.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider font-bold rounded-full border ${
                        b.status === "Checked In" ? "bg-blue-50 text-blue-800 border-blue-200" :
                        b.status === "Checked Out" ? "bg-stone-100 text-stone-500 border-stone-200" :
                        b.status === "Cancelled" ? "bg-red-50 text-red-800 border-red-200" :
                        "bg-amber-50 text-amber-850 border-amber-200"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 font-mono text-slate-400">
                    No bookings found in PMS. Create one in the reservation tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
