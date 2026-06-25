/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Booking, Guest, Payment } from "../types";
import { 
  Clock, 
  UserCheck, 
  Activity, 
  Calendar, 
  Briefcase, 
  CheckSquare, 
  ArrowRight, 
  FileCheck, 
  Coins, 
  Send, 
  ChevronRight, 
  ArrowUpRight 
} from "lucide-react";

interface ShiftManagementProps {
  bookings: Booking[];
  guests: Guest[];
  payments: Payment[];
  staffUser: any;
}

interface ShiftActivityLog {
  id: string;
  timestamp: string;
  receptionist: string;
  shift: string;
  activity: string;
  type: "login" | "checkout" | "checkin" | "finance" | "transport" | "system";
}

export default function ShiftManagement({
  bookings,
  guests,
  payments,
  staffUser
}: ShiftManagementProps) {
  // Current active shift state
  const [activeShift, setActiveShift] = useState<"Morning Shift" | "Evening Shift" | "Night Shift">("Morning Shift");
  
  // Custom checklist states
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Count & reconcile cash drawer balance (INR 15,000 baseline)", completed: true },
    { id: 2, text: "Verify that all checked-out room keys are collected", completed: true },
    { id: 3, text: "Audit Aadhaar/Passport ID Document uploads for Web Check-In guests", completed: false },
    { id: 4, text: "Ensure transport drivers of auto/SUV are coordinated for evening drops", completed: false },
    { id: 5, text: "Draft handover notes for incoming staff member", completed: false }
  ]);

  // Handover notes inputs
  const [handoverNoteInput, setHandoverNoteInput] = useState("");
  const [handoverLogs, setHandoverLogs] = useState([
    {
      id: "HND-01",
      timestamp: "Today, 06:15 AM",
      from: "Saurav Sen",
      shift: "Night Shift",
      text: "SUV pickup coordinates sent for Room 307. Breakfast service starts at 7:30 AM."
    },
    {
      id: "HND-02",
      timestamp: "Yesterday, 10:10 PM",
      from: "Ramesh Sharma",
      shift: "Evening Shift",
      text: "Lobby water filters replaced. Late checked-out guests in Room 104 settled full bills in cash."
    }
  ]);

  // Shift logs/activity stream
  const [activityLogs, setActivityLogs] = useState<ShiftActivityLog[]>([
    {
      id: "SL-005",
      timestamp: "Today, 10:45 AM",
      receptionist: staffUser?.name || "Saurav Sen",
      shift: "Morning Shift",
      activity: "Processed checkout, stay adjustment, and discount for BK-1002.",
      type: "checkout"
    },
    {
      id: "SL-004",
      timestamp: "Today, 08:30 AM",
      receptionist: staffUser?.name || "Saurav Sen",
      shift: "Morning Shift",
      activity: "Assigned Innova SUV transport ride for guest on BK-1005.",
      type: "transport"
    },
    {
      id: "SL-003",
      timestamp: "Today, 07:15 AM",
      receptionist: staffUser?.name || "Saurav Sen",
      shift: "Morning Shift",
      activity: "Approved Web Check-In Passport uploads of guest GUST-3810 for Room 205.",
      type: "checkin"
    },
    {
      id: "SL-002",
      timestamp: "Today, 06:05 AM",
      receptionist: staffUser?.name || "Saurav Sen",
      shift: "Morning Shift",
      activity: "Shift initialized - Morning Shift. Reconciled cash ledger.",
      type: "login"
    },
    {
      id: "SL-001",
      timestamp: "Yesterday, 09:40 PM",
      receptionist: "Pranab Pati",
      shift: "Evening Shift",
      activity: "Dispatched Sedan airport shuttle drop-off for BK-1003.",
      type: "transport"
    }
  ]);

  const handleToggleChecklist = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleShiftChange = (shiftName: "Morning Shift" | "Evening Shift" | "Night Shift") => {
    setActiveShift(shiftName);
    
    // Add activity log
    const newLog: ShiftActivityLog = {
      id: `SL-${Date.now().toString().slice(-3)}`,
      timestamp: "Just Now",
      receptionist: staffUser?.name || "Saurav Sen",
      shift: shiftName,
      activity: `Manually synced shift context to ${shiftName}. Active logs tracked.`,
      type: "system"
    };

    setActivityLogs(prev => [newLog, ...prev]);
  };

  const handleAddHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverNoteInput.trim()) return;

    const newHandover = {
      id: `HND-${Date.now().toString().slice(-3)}`,
      timestamp: "Just Now",
      from: staffUser?.name || "Saurav Sen",
      shift: activeShift,
      text: handoverNoteInput.trim()
    };

    setHandoverLogs(prev => [newHandover, ...prev]);
    setHandoverNoteInput("");

    // Log the Handover dispatch
    const newLog: ShiftActivityLog = {
      id: `SL-${Date.now().toString().slice(-3)}`,
      timestamp: "Just Now",
      receptionist: staffUser?.name || "Saurav Sen",
      shift: activeShift,
      activity: "Submitted new shift handover note for the next team member.",
      type: "system"
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Dynamically calculate statistics for the current shift
  const shiftCheckins = bookings.filter(b => b.status === "Checked In").length;
  const shiftCheckouts = bookings.filter(b => b.status === "Checked Out").length;
  const shiftCancellations = bookings.filter(b => b.status === "Cancelled").length;
  const shiftRevenue = payments
    .filter(p => {
      // In a real database we'd check timestamps. For demo we show subset values or direct settled sums
      return p.status === "Paid";
    })
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col gap-8 font-sans text-slate-800">
      {/* Top Banner with Active Shift Meta */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900 border border-slate-800 rounded-2xl gap-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-500 rounded-xl border border-amber-500/30">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Shift Control Center</h1>
            <p className="text-xs text-slate-400">Receptionist session tracking & seamless handovers</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { name: "Morning Shift", hours: "06:00 AM - 02:00 PM" },
            { name: "Evening Shift", hours: "02:00 PM - 10:00 PM" },
            { name: "Night Shift", hours: "10:00 PM - 06:00 AM" }
          ].map((sh) => (
            <button
              key={sh.name}
              onClick={() => handleShiftChange(sh.name as any)}
              className={`px-4 py-2 text-xs rounded-xl font-bold border transition-all flex flex-col text-left cursor-pointer ${
                activeShift === sh.name
                  ? "bg-amber-600 text-stone-950 border-amber-500 shadow-md shadow-amber-600/10"
                  : "bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700"
              }`}
            >
              <span className="font-bold">{sh.name}</span>
              <span className="text-[10px] opacity-75 font-mono mt-0.5">{sh.hours}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: LIVE STATS & ACTIVE RECEPTIONIST */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Active Receptionist Logged-In Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-mono text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> Clocked-In Personnel
            </h3>
            <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 border border-slate-200/60 rounded-xl">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold font-sans">
                {staffUser?.name ? staffUser.name[0] : "S"}
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-bold text-slate-900 leading-none">{staffUser?.name || "Saurav Sen"}</h4>
                <p className="font-mono text-[10px] text-indigo-600 capitalize font-bold mt-1.5">{staffUser?.role || "Front Desk Supervisor"}</p>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            </div>

            <div className="mt-4 flex flex-col gap-2.5 text-xs text-slate-600 font-mono">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Session Login time:</span>
                <span className="text-slate-900 font-bold">Today, 06:01 AM</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Assigned Terminal:</span>
                <span className="text-slate-900 font-bold">FRONT-DESK-02</span>
              </div>
              <div className="flex justify-between">
                <span>Active Shift Hours:</span>
                <span className="text-slate-900 font-bold">8h 00m standard</span>
              </div>
            </div>
          </div>

          {/* Shift Activity Summary metrics */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-mono text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Shift Activity Summary (Live)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/50">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block mb-1">Check-ins</span>
                <strong className="text-lg text-slate-900 font-sans">{shiftCheckins} Processed</strong>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/50">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block mb-1">Checkouts</span>
                <strong className="text-lg text-slate-900 font-sans">{shiftCheckouts} Settled</strong>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/50">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block mb-1">Cancellations</span>
                <strong className="text-lg text-red-700 font-sans">{shiftCancellations} Trailed</strong>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/50">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block mb-1">Shift Cash Rec</span>
                <strong className="text-base text-emerald-700 font-sans font-bold">₹{(shiftRevenue * 0.4).toLocaleString()}</strong>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-amber-50/50 border border-amber-200/45 rounded-xl text-[11px] leading-normal flex items-start gap-2">
              <span className="text-sm">🛎️</span>
              <p className="text-amber-950 font-medium">To prepare for standard audit reports, keep the cash baseline baseline verified, and complete all checkouts before 11:00 AM.</p>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: CHECKLIST & SHIFT HANDOVERS */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Handover & Checklist tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col gap-6">
            <div>
              <h3 className="font-mono text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4" /> Front Desk Daily Tasks
              </h3>
              <p className="text-xs text-slate-500">Opening, middle and closure routine checks for active receptionist</p>
            </div>

            <div className="flex flex-col gap-3">
              {checklist.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleToggleChecklist(item.id)}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50/70 rounded-xl border border-slate-100 transition-colors cursor-pointer select-none"
                >
                  <input 
                    type="checkbox" 
                    checked={item.completed} 
                    readOnly 
                    className="w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                  <span className={`text-xs font-sans leading-normal ${item.completed ? "line-through text-slate-400" : "text-slate-800 font-medium"}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shift Handover Dispatch */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col gap-5">
            <div>
              <h3 className="font-mono text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" /> Shift Transfer Handover Logs
              </h3>
              <p className="text-xs text-slate-500">Leaving remarks and coordination warnings for high-fidelity shifts overlap</p>
            </div>

            {/* Note submission */}
            <form onSubmit={handleAddHandover} className="flex gap-2">
              <input 
                type="text" 
                value={handoverNoteInput}
                onChange={e => setHandoverNoteInput(e.target.value)}
                placeholder="Log a note for the next receptionist (e.g. key checkout, taxi updates)..."
                className="flex-grow px-3 py-2 text-xs border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-stone-950 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm shadow-amber-600/10"
              >
                <Send className="w-3 h-3" /> Post Note
              </button>
            </form>

            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1 flex flex-col gap-3 pt-1">
              {handoverLogs.map((log) => (
                <div key={log.id} className="pt-3 first:pt-0 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 leading-none">
                    <span className="font-bold text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 rounded">{log.shift}</span>
                    <span>{log.timestamp} • By <strong>{log.from}</strong></span>
                  </div>
                  <p className="text-xs text-slate-705 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 font-medium">
                    {log.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: SHIFT LOGS STREAM */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4">
        <div>
          <h3 className="font-sans font-bold text-slate-900 text-base flex items-center gap-1.5">
            <Activity className="w-5 h-5 text-indigo-600" /> Receptionist Activity Logs Stream
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Real-time actions audited and recorded under current operational session</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50 font-mono text-[9px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <th className="px-4 py-2.5">Time</th>
                <th className="px-4 py-2.5">Shift</th>
                <th className="px-4 py-2.5">Receptionist</th>
                <th className="px-4 py-2.5">Activity Description</th>
                <th className="px-4 py-2.5 text-center">Audited Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {activityLogs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-500 text-[10px]">{item.timestamp}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold text-slate-600">{item.shift}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.receptionist}</td>
                  <td className="px-4 py-3 text-slate-655">{item.activity}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-mono text-[10px] tracking-wider text-slate-400">{item.id}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
