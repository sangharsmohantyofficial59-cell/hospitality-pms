/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Room, RoomStatus, RoomType, Booking, Guest, BookingStatus } from "../types";
import { PencilLine, ShieldAlert, Sparkles, Hammer, Info, LayoutGrid, CheckCircle, X, FileText, User, Calendar, DollarSign, Bed } from "lucide-react";

interface RoomManagementProps {
  rooms: Room[];
  roomTypes: RoomType[];
  bookings: Booking[];
  guests: Guest[];
  onUpdateRoomStatus: (roomId: string, status: RoomStatus) => Promise<any>;
}

export default function RoomManagement({
  rooms,
  roomTypes,
  bookings,
  guests,
  onUpdateRoomStatus
}: RoomManagementProps) {
  const [selectedFloor, setSelectedFloor] = useState<string>("All");
  const [activeRoomToEdit, setActiveRoomToEdit] = useState<Room | null>(null);
  const [updatingStatusMap, setUpdatingStatusMap] = useState<{ [key: string]: boolean }>({});

  const [drawerStatus, setDrawerStatus] = useState<RoomStatus | "">("");
  const [isSavingDrawer, setIsSavingDrawer] = useState(false);

  React.useEffect(() => {
    if (activeRoomToEdit) {
      setDrawerStatus(activeRoomToEdit.status);
    } else {
      setDrawerStatus("");
    }
  }, [activeRoomToEdit]);

  const handleDrawerStatusSave = async () => {
    if (!activeRoomToEdit || !drawerStatus) return;
    setIsSavingDrawer(true);
    try {
      await onUpdateRoomStatus(activeRoomToEdit.id, drawerStatus as RoomStatus);
      setActiveRoomToEdit(null);
    } catch (err) {
      console.error("Failed to update status from drawer:", err);
    } finally {
      setIsSavingDrawer(false);
    }
  };

  const handleQuickStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    setUpdatingStatusMap(prev => ({ ...prev, [roomId]: true }));
    try {
      await onUpdateRoomStatus(roomId, newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatusMap(prev => ({ ...prev, [roomId]: false }));
    }
  };

  const getStatusStyle = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return "bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300";
      case RoomStatus.RESERVED:
        return "bg-amber-50/70 border-amber-200 hover:bg-amber-50 hover:border-amber-300";
      case RoomStatus.OCCUPIED:
        return "bg-indigo-50/70 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300";
      case RoomStatus.CLEANING:
        return "bg-purple-50/70 border-purple-200 hover:bg-purple-50 hover:border-purple-300";
      case RoomStatus.MAINTENANCE:
        return "bg-rose-50/70 border-rose-200 hover:bg-rose-50 hover:border-rose-300";
      default:
        return "bg-stone-50 border-stone-200";
    }
  };

  const getBadgeStyle = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case RoomStatus.RESERVED:
        return "bg-amber-100 text-amber-800 border-amber-300";
      case RoomStatus.OCCUPIED:
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case RoomStatus.CLEANING:
        return "bg-purple-100 text-purple-800 border-purple-300";
      case RoomStatus.MAINTENANCE:
        return "bg-rose-100 text-rose-800 border-rose-300";
    }
  };

  const filteredRooms = rooms.filter(r => {
    if (selectedFloor === "Floor 1") return r.id.startsWith("1");
    if (selectedFloor === "Floor 2") return r.id.startsWith("2");
    if (selectedFloor === "Floor 3") return r.id.startsWith("3");
    return true; // All
  });

  // Calculate drawer booking context
  const activeBooking = activeRoomToEdit
    ? bookings.find(
        (b) =>
          b.roomId === activeRoomToEdit.id &&
          (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.CHECKED_IN)
      )
    : null;

  const activeGuest = activeBooking
    ? guests.find((g) => g.id === activeBooking.guestId)
    : null;

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Tab Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Room Portfolio Management</h1>
          <p className="text-stone-500 text-xs mt-0.5">Live status boards for all 30 room assets</p>
        </div>

        {/* Floor selector Filter pills */}
        <div className="flex border border-stone-200 rounded-lg p-1.5 bg-stone-100 gap-1 text-xs">
          {["All", "Floor 1", "Floor 2", "Floor 3"].map((fl) => (
            <button
              key={fl}
              onClick={() => setSelectedFloor(fl)}
              className={`px-3.5 py-1.5 rounded-md font-medium transition-all ${
                selectedFloor === fl
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              {fl}
            </button>
          ))}
        </div>
      </div>

      {/* Housekeeping Tips Alert info box */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-950">Housekeeper Room Dispatch Guide</h4>
          <p className="text-stone-600 text-xs mt-1 leading-relaxed">
            Whenever an active guest is Checked Out from our bookings tab, the PMS automation automatically flags their assigned room status to <strong>Cleaning</strong>. Use the quick actions inside individual room chips or open the details drawer to adjust status easily!
          </p>
        </div>
      </div>

      {/* ROOMS GRIDS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const matchedType = roomTypes.find(rt => rt.id === room.roomTypeId);
          const isProcessing = updatingStatusMap[room.id] || false;

          return (
            <div
              key={room.id}
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest('.quick-actions-bar')) {
                  setActiveRoomToEdit(room);
                }
              }}
              className={`border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between min-h-48 relative cursor-pointer hover:shadow-md ${getStatusStyle(
                room.status
              )}`}
            >
              {/* Room Header Info */}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-sans font-black text-xl text-stone-900">Room {room.id}</span>
                    <p className="text-[10px] font-mono tracking-wider font-semibold text-stone-500 uppercase mt-0.5">
                      {matchedType?.name.split(" ")[0]} Room
                    </p>
                  </div>
                  <span className={`font-mono text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded border ${getBadgeStyle(room.status)}`}>
                    {room.status}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-light italic leading-relaxed line-clamp-2">
                  {matchedType?.description}
                </p>
              </div>

              {/* Status Action Buttons footer */}
              <div className="mt-5 pt-3 border-t border-dashed border-stone-200 flex justify-between items-center gap-2 quick-actions-bar">
                <span className="text-[10px] font-mono text-stone-400">QUICK ACTIONS:</span>
                
                <div className="flex gap-1.5">
                  {room.status === RoomStatus.CLEANING && (
                    <button
                      onClick={() => handleQuickStatusChange(room.id, RoomStatus.AVAILABLE)}
                      disabled={isProcessing}
                      title="Mark room as Cleaned and Available"
                      className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Ready
                    </button>
                  )}

                  {room.status === RoomStatus.AVAILABLE && (
                    <button
                      onClick={() => handleQuickStatusChange(room.id, RoomStatus.MAINTENANCE)}
                      disabled={isProcessing}
                      title="Take room out of order"
                      className="p-1 px-2.5 bg-red-800 hover:bg-red-950 text-white rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Hammer className="w-3 h-3" /> Maint
                    </button>
                  )}

                  {room.status === RoomStatus.MAINTENANCE && (
                    <button
                      onClick={() => handleQuickStatusChange(room.id, RoomStatus.AVAILABLE)}
                      disabled={isProcessing}
                      title="Restore Room to Service Available"
                      className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <CheckCircle className="w-3 h-3" /> Clear
                    </button>
                  )}

                  {(room.status === RoomStatus.OCCUPIED || room.status === RoomStatus.RESERVED) && (
                    <span className="text-[9px] font-mono p-1 bg-stone-900/10 text-stone-500 rounded font-semibold italic">
                      In-Use (Lock)
                    </span>
                  )}
                </div>
              </div>

              {/* Full view overlay spinner */}
              {isProcessing && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center rounded-xl z-10 text-amber-700">
                  <span>Loading...</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. ROOM DETAILS DRAWER (OVERLAY SLIDE-IN DIALOG) */}
      {activeRoomToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-200">
            {/* Header */}
            <div>
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h2 className="font-bold text-base text-white">Room {activeRoomToEdit.id}</h2>
                    <p className="text-[10px] text-slate-400 uppercase font-mono">
                      {roomTypes.find((rt) => rt.id === activeRoomToEdit.roomTypeId)?.name || "Chamber Specs"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveRoomToEdit(null)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5 text-xs text-slate-700">
                {/* Section: Status Details */}
                <div>
                  <h4 className="font-bold text-slate-900 uppercase font-mono text-[10px] tracking-wider mb-2.5 text-slate-400">
                    Current Status Selection
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(RoomStatus).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setDrawerStatus(st)}
                        className={`p-2.5 rounded-lg border text-left font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          drawerStatus === st
                            ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{st}</span>
                        {drawerStatus === st && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section: Active Guest Assignment if reserved/occupied */}
                {activeBooking && activeGuest ? (
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[9px] uppercase font-bold text-indigo-800 tracking-wider">
                        Active Reservation Matches
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                        {activeBooking.id}
                      </span>
                    </div>

                    <div className="text-xs flex flex-col gap-2">
                      <div className="flex gap-2 items-start">
                        <User className="w-3.5 h-3.5 text-indigo-600 mt-0.5" />
                        <div>
                          <strong className="text-slate-950 font-bold block">{activeGuest.name}</strong>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {activeGuest.email} • {activeGuest.phone}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 items-start border-t border-indigo-100/50 pt-2 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600 mt-0.5" />
                        <div className="font-mono text-[11px] leading-tight text-slate-600">
                          <div>Check-In: <strong className="text-slate-950">{activeBooking.checkInDate}</strong></div>
                          <div>Check-Out: <strong className="text-slate-950">{activeBooking.checkOutDate}</strong></div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{activeBooking.numberOfGuests} registered guests • {activeBooking.source}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-indigo-100/50 pt-2 mt-1">
                        <span className="font-semibold text-indigo-900">Paid Balance:</span>
                        <span className="font-mono font-bold text-indigo-950 text-sm">
                          ₹{activeBooking.totalPrice.toLocaleString()} ({activeBooking.paymentStatus})
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed text-center">
                    <span className="font-mono text-[10px] text-slate-400 block uppercase font-bold">
                      No Active Booking Linked
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      This room has no active reservations or check-in locks for the current timeline.
                    </p>
                  </div>
                )}

                {/* Amenities section */}
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-900 uppercase font-mono text-[10px] tracking-wider mb-2 text-slate-400">
                    Room Specifications
                  </h4>
                  <div className="flex flex-col gap-1.5 font-mono text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Base Rate:</span>
                      <strong className="text-slate-950 font-bold">
                        ₹{roomTypes.find((rt) => rt.id === activeRoomToEdit.roomTypeId)?.basePrice.toLocaleString() || "N/A"}/night
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Guests Capacity:</span>
                      <strong className="text-slate-950 font-bold">
                        {roomTypes.find((rt) => rt.id === activeRoomToEdit.roomTypeId)?.maxGuests || "2"} Adults
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                type="button"
                onClick={() => setActiveRoomToEdit(null)}
                className="w-1/2 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold font-sans cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDrawerStatusSave}
                disabled={isSavingDrawer || drawerStatus === activeRoomToEdit.status}
                className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold font-sans cursor-pointer shadow-indigo-600/10 shadow-sm transition-colors"
              >
                {isSavingDrawer ? "Saving..." : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
