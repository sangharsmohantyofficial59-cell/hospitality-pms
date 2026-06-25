/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Room, RoomStatus, RoomType, Booking, Guest, BookingStatus } from "../types";
import { 
  Sparkles, 
  CheckCircle, 
  Clock, 
  User, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  Bed, 
  ListTodo, 
  AlertTriangle,
  Flame,
  Check
} from "lucide-react";

interface HousekeepingManagementProps {
  rooms: Room[];
  roomTypes: RoomType[];
  bookings: Booking[];
  guests: Guest[];
  onUpdateRoomStatus: (roomId: string, status: RoomStatus) => Promise<any>;
}

// Available housekeepers themed for Puri, Odisha
const HOUSEKEEPERS = [
  { id: "hk-1", name: "Geeta Devi", shift: "Morning (6 AM - 2 PM)", status: "Active" },
  { id: "hk-2", name: "Ramesh Patra", shift: "Morning (6 AM - 2 PM)", status: "Active" },
  { id: "hk-3", name: "Subhash Mohanty", shift: "Evening (2 PM - 10 PM)", status: "Active" },
  { id: "hk-4", name: "Manasi Jena", shift: "Evening (2 PM - 10 PM)", status: "Active" }
];

export default function HousekeepingManagement({
  rooms,
  roomTypes,
  bookings,
  guests,
  onUpdateRoomStatus
}: HousekeepingManagementProps) {
  // Local state for assignments and checklists
  const [assignedHousekeepers, setAssignedHousekeepers] = useState<{ [roomId: string]: string }>(() => {
    const saved = localStorage.getItem("hk-assignments");
    return saved ? JSON.parse(saved) : {};
  });

  const [priorities, setPriorities] = useState<{ [roomId: string]: "Urgent" | "High" | "Standard" }>(() => {
    const saved = localStorage.getItem("hk-priorities");
    return saved ? JSON.parse(saved) : {};
  });

  const [checklists, setChecklists] = useState<{ [roomId: string]: { [key: string]: boolean } }>(() => {
    const saved = localStorage.getItem("hk-checklists");
    return saved ? JSON.parse(saved) : {};
  });

  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [hkFilter, setHkFilter] = useState<string>("All");
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  // Stats for local tracking of cleaned rooms in this session / day
  const [roomsCleanedCount, setRoomsCleanedCount] = useState<number>(() => {
    const saved = localStorage.getItem("hk-cleaned-today-count");
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem("hk-assignments", JSON.stringify(assignedHousekeepers));
  }, [assignedHousekeepers]);

  useEffect(() => {
    localStorage.setItem("hk-priorities", JSON.stringify(priorities));
  }, [priorities]);

  useEffect(() => {
    localStorage.setItem("hk-checklists", JSON.stringify(checklists));
  }, [checklists]);

  // Handle task checklist toggle
  const toggleChecklistItem = (roomId: string, itemKey: string) => {
    setChecklists(prev => {
      const roomChecklist = prev[roomId] || {
        linens: false,
        bathroom: false,
        trash: false,
        amenities: false,
        appliances: false
      };
      const updated = {
        ...prev,
        [roomId]: {
          ...roomChecklist,
          [itemKey]: !roomChecklist[itemKey]
        }
      };
      return updated;
    });
  };

  // Assign housekeeper
  const handleAssignHousekeeper = (roomId: string, hkName: string) => {
    setAssignedHousekeepers(prev => ({
      ...prev,
      [roomId]: hkName
    }));
  };

  // Change priority
  const handleChangePriority = (roomId: string, pLevel: "Urgent" | "High" | "Standard") => {
    setPriorities(prev => ({
      ...prev,
      [roomId]: pLevel
    }));
  };

  // Complete cleaning task
  const handleCompleteCleaning = async (roomId: string) => {
    setIsProcessingId(roomId);
    try {
      await onUpdateRoomStatus(roomId, RoomStatus.AVAILABLE);
      
      // Clean up local checklist and assignment states for this room
      setChecklists(prev => {
        const copy = { ...prev };
        delete copy[roomId];
        return copy;
      });

      setAssignedHousekeepers(prev => {
        const copy = { ...prev };
        delete copy[roomId];
        return copy;
      });

      setPriorities(prev => {
        const copy = { ...prev };
        delete copy[roomId];
        return copy;
      });

      // Increment cleaned rooms counter
      setRoomsCleanedCount(prev => {
        const next = prev + 1;
        localStorage.setItem("hk-cleaned-today-count", next.toString());
        return next;
      });

      if (expandedRoomId === roomId) {
        setExpandedRoomId(null);
      }
    } catch (err) {
      console.error("Failed to complete cleaning:", err);
    } finally {
      setIsProcessingId(null);
    }
  };

  // Reset counters for a fresh shift
  const handleResetCounter = () => {
    setRoomsCleanedCount(0);
    localStorage.setItem("hk-cleaned-today-count", "0");
  };

  // Filter dirty rooms
  const dirtyRooms = rooms.filter(r => r.status === RoomStatus.CLEANING);

  // Match corresponding checkout booking details for each dirty room
  const roomsWithCheckoutDetails = dirtyRooms.map(room => {
    // Find latest checkout or moved to billing booking
    const matchingBookings = bookings
      .filter(b => b.roomId === room.id && 
        (b.status === BookingStatus.CHECKED_OUT || 
         b.status === BookingStatus.MOVED_TO_BILLING || 
         b.status === BookingStatus.CLOSED))
      .sort((a, b) => {
        const dateA = a.checkedOutAt ? new Date(a.checkedOutAt).getTime() : 0;
        const dateB = b.checkedOutAt ? new Date(b.checkedOutAt).getTime() : 0;
        return dateB - dateA;
      });

    const latestBooking = matchingBookings[0] || null;
    const guestObj = latestBooking ? guests.find(g => g.id === latestBooking.guestId) : null;
    const roomTypeObj = roomTypes.find(rt => rt.id === room.roomTypeId);

    return {
      room,
      roomType: roomTypeObj,
      booking: latestBooking,
      guest: guestObj,
      assignedHk: assignedHousekeepers[room.id] || "",
      priority: priorities[room.id] || "Standard",
      checklist: checklists[room.id] || {
        linens: false,
        bathroom: false,
        trash: false,
        amenities: false,
        appliances: false
      }
    };
  });

  // Apply filters
  const filteredRooms = roomsWithCheckoutDetails.filter(item => {
    // Search filter (room number, guest name, or housekeeper)
    const matchesSearch = 
      item.room.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.guest?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedHk.toLowerCase().includes(searchTerm.toLowerCase());

    // Priority filter
    const matchesPriority = priorityFilter === "All" || item.priority === priorityFilter;

    // Housekeeper filter
    const matchesHk = hkFilter === "All" || 
      (hkFilter === "Unassigned" && !item.assignedHk) ||
      (hkFilter !== "Unassigned" && item.assignedHk === hkFilter);

    return matchesSearch && matchesPriority && matchesHk;
  });

  // Calculate stats
  const totalDirtyCount = dirtyRooms.length;
  const assignedCount = Object.keys(assignedHousekeepers).filter(roomId => 
    rooms.some(r => r.id === roomId && r.status === RoomStatus.CLEANING)
  ).length;
  const unassignedCount = totalDirtyCount - assignedCount;
  const urgentCount = roomsWithCheckoutDetails.filter(item => item.priority === "Urgent").length;

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header and Summary Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <span>🧹</span> Housekeeping Service & Dispatch Terminal
          </h1>
          <p className="text-stone-500 dark:text-slate-400 text-xs mt-0.5">
            Manage cleaning checklist states, assign housekeepers, and restore rooms back to Service Available
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-100 dark:bg-slate-800 p-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span>Cleaned Today: <strong>{roomsCleanedCount}</strong></span>
            {roomsCleanedCount > 0 && (
              <button 
                onClick={handleResetCounter}
                className="text-[10px] text-red-500 hover:text-red-700 font-bold ml-1 hover:underline cursor-pointer bg-transparent border-none"
              >
                Reset Shift
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Housekeeping Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Dirty Rooms Pending
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{totalDirtyCount}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">rooms</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-rose-500 h-1.5 rounded-full transition-all" 
              style={{ width: `${totalDirtyCount > 0 ? (totalDirtyCount / rooms.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Cleaning Assigned
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{assignedCount}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">/{totalDirtyCount} assigned</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full transition-all" 
              style={{ width: `${totalDirtyCount > 0 ? (assignedCount / totalDirtyCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Unassigned Rooms
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{unassignedCount}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">pending dispatch</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-1.5 rounded-full transition-all" 
              style={{ width: `${totalDirtyCount > 0 ? (unassignedCount / totalDirtyCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Urgent Turnarounds
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-red-600 dark:text-red-400 flex items-center gap-1">
              {urgentCount > 0 && <Flame className="w-5 h-5 text-red-500 animate-pulse" />}
              {urgentCount}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">high priority</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-red-500 h-1.5 rounded-full transition-all" 
              style={{ width: `${totalDirtyCount > 0 ? (urgentCount / totalDirtyCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search room, guest, or housekeeper..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          {/* Priority filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400 text-[10px] font-mono">PRIORITY:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-300 focus:outline-none font-medium text-xs cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">🔥 Urgent Only</option>
              <option value="High">⚡ High Only</option>
              <option value="Standard">⭐ Standard Only</option>
            </select>
          </div>

          {/* Housekeeper assignment filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400 text-[10px] font-mono">ASSIGNMENT:</span>
            <select
              value={hkFilter}
              onChange={(e) => setHkFilter(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-300 focus:outline-none font-medium text-xs cursor-pointer"
            >
              <option value="All">All Rooms</option>
              <option value="Unassigned">⚠️ Unassigned</option>
              {HOUSEKEEPERS.map(hk => (
                <option key={hk.id} value={hk.name}>👤 {hk.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ROOMS DIRTY DISPATCH LIST */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Rooms Clean & Available!</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
            There are currently no rooms pending cleaning that match the filter. As soon as guests check out of bookings, rooms are flagged for cleaning.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRooms.map((item) => {
            const roomId = item.room.id;
            const isExpanded = expandedRoomId === roomId;
            
            // Calculate checklist progress
            const clKeys = ["linens", "bathroom", "trash", "amenities", "appliances"];
            const completedChecksCount = clKeys.filter(k => item.checklist[k]).length;
            const isFullyChecked = completedChecksCount === clKeys.length;

            return (
              <div 
                key={roomId}
                className={`bg-white dark:bg-slate-900 border rounded-2xl shadow-sm transition-all overflow-hidden flex flex-col justify-between ${
                  item.priority === "Urgent" 
                    ? "border-red-200 dark:border-red-950 bg-red-50/5 dark:bg-red-950/5" 
                    : item.priority === "High"
                    ? "border-amber-200 dark:border-amber-950"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Upper Body: Room Summary */}
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-black text-xl text-slate-900 dark:text-white">
                          Room {roomId}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                          ({item.roomType?.name || "Suite"})
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {/* Priority Pill */}
                        <select
                          value={item.priority}
                          onChange={(e) => handleChangePriority(roomId, e.target.value as any)}
                          className={`text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${
                            item.priority === "Urgent"
                              ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800"
                              : item.priority === "High"
                              ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800"
                              : "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          } focus:outline-none cursor-pointer`}
                        >
                          <option value="Standard">⭐ Standard Priority</option>
                          <option value="High">⚡ High Priority</option>
                          <option value="Urgent">🔥 Urgent Turn</option>
                        </select>

                        {/* Checklist progress badge */}
                        <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900 flex items-center gap-1 font-semibold">
                          <ListTodo className="w-3 h-3" /> {completedChecksCount}/5 checks
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-1 rounded-lg font-bold border border-rose-200 dark:border-rose-900">
                      Dirty / Cleaning
                    </span>
                  </div>

                  {/* Checkout info box */}
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-150 dark:border-slate-850 text-xs text-slate-600 dark:text-slate-300 mb-4 flex flex-col gap-1 shadow-inner">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                      <span>Checkout History Context</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        {item.booking?.checkedOutAt 
                          ? new Date(item.booking.checkedOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
                          : "Unknown"}
                      </span>
                    </div>
                    {item.guest ? (
                      <div className="mt-1">
                        <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-indigo-500" />
                          {item.guest.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Checked out of Booking {item.booking?.id} after {
                            item.booking 
                              ? Math.ceil((new Date(item.booking.checkOutDate).getTime() - new Date(item.booking.checkInDate).getTime()) / (3600000 * 24))
                              : 0
                          } nights stay
                        </p>
                      </div>
                    ) : (
                      <p className="italic text-slate-400 dark:text-slate-500 mt-1">
                        No recent checkout guest recorded (Manual status switch)
                      </p>
                    )}
                  </div>

                  {/* Housekeeper selector dispatch */}
                  <div className="flex flex-col gap-1.5 mb-4">
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Dispatch Housekeeper
                    </span>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <select
                        value={item.assignedHk}
                        onChange={(e) => handleAssignHousekeeper(roomId, e.target.value)}
                        className="pl-9 pr-4 py-2 w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        <option value="">-- Click to Assign Housekeeper --</option>
                        {HOUSEKEEPERS.map(hk => (
                          <option key={hk.id} value={hk.name}>{hk.name} ({hk.shift})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Expandable checklist controls */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => setExpandedRoomId(isExpanded ? null : roomId)}
                      className="w-full flex justify-between items-center text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold font-mono transition-colors bg-transparent border-none cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <ListTodo className="w-4 h-4" />
                        {isExpanded ? "Hide Housekeeping Checklist" : "Show Housekeeping Checklist"}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl p-3 flex flex-col gap-2.5 animate-fadeIn">
                        <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                          Cleaning Standard Checklist (Required for release)
                        </span>

                        {[
                          { key: "linens", label: "Replace with fresh crisp white linens & bedspreads" },
                          { key: "bathroom", label: "Disinfect toilet, shower area & arrange clean towels" },
                          { key: "trash", label: "Empty wastebins, disinfect knobs, sweep and mop floors" },
                          { key: "amenities", label: "Replenish complementary water, tea, and toiletries" },
                          { key: "appliances", label: "Test AC blowing cold, TV remote batteries & lighting" }
                        ].map((chk) => {
                          const isDone = item.checklist[chk.key] || false;
                          return (
                            <button
                              key={chk.key}
                              type="button"
                              onClick={() => toggleChecklistItem(roomId, chk.key)}
                              className="flex items-start gap-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                            >
                              {isDone ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-350 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                              )}
                              <span className={isDone ? "line-through text-slate-400 dark:text-slate-500 font-normal" : "font-medium"}>
                                {chk.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lower Footer: Release action */}
                <div className="bg-slate-50 dark:bg-slate-950 px-5 py-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between gap-4">
                  <div className="text-xs">
                    {item.assignedHk ? (
                      <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                        Assigned to: <strong className="text-slate-700 dark:text-slate-200">{item.assignedHk}</strong>
                      </p>
                    ) : (
                      <p className="text-rose-500 dark:text-rose-400 font-mono text-[10px] font-bold animate-pulse flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Housekeeper Unassigned
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleCompleteCleaning(roomId)}
                    disabled={isProcessingId === roomId}
                    className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border ${
                      isFullyChecked 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500"
                    }`}
                  >
                    {isProcessingId === roomId ? (
                      <span>Updating...</span>
                    ) : (
                      <>
                        {isFullyChecked ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        <span>{isFullyChecked ? "Release (Cleaned)" : "Force Release"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
