import React from "react";
import { Trash2 } from "lucide-react";
import type { MultiRoomSelection } from "../../utils/booking";
import type { RoomType } from "../../types";



type Props = {
  selection: MultiRoomSelection;
  roomType?: RoomType;
  onChangeAdults?: (adults: number) => void;
  onChangeChildren?: (children: number) => void;
  onChangeRoomTypeId?: (roomTypeId: string) => void;
  onRemove: () => void;
  disableRemove?: boolean;
  roomTypes?: RoomType[];
  cardIndex?: number;
};

export default function RoomCard({
  selection,
  roomType,
  onChangeAdults,
  onChangeChildren,
  onChangeRoomTypeId,
  onRemove,
  disableRemove,
  roomTypes,
  cardIndex,
}: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700/90 dark:text-amber-400">
            {`Room ${cardIndex ? cardIndex + 1 : 1}`}
          </div>

          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500/80 mt-1">
            {"Room Assignment: During Check-in"}
          </div>

          <div className="text-base font-bold text-slate-900 dark:text-white mt-1 truncate">
            {roomType?.name || "Selected Room"}
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Rate: <span className="font-bold text-slate-800 dark:text-slate-200">₹{selection.rate.toLocaleString()}/Night</span>
          </div>
        </div>

        {/* Remove Room */}
        <button
          type="button"
          onClick={disableRemove ? undefined : onRemove}
          disabled={disableRemove}
          className={`p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 cursor-pointer ${
            disableRemove ? "opacity-40 cursor-not-allowed hover:bg-rose-50 hover:text-rose-600" : ""
          }`}
          title="Remove room"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Room Type */}
        <div>
          <label className="block text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
            Room Type
          </label>
          <select
            value={selection.roomTypeId}
            onChange={(e) => onChangeRoomTypeId?.(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
          >
            {(roomTypes || []).map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Adults */}
        <div>
          <label className="block text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Adults</label>
          <select
            value={selection.adults}
            onChange={(e) => onChangeAdults?.(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Children */}
        <div>
          <label className="block text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Children</label>
          <select
            value={selection.children}
            onChange={(e) => onChangeChildren?.(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium"
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

