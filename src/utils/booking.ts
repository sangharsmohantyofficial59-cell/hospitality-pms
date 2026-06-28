export type MultiRoomSelection = {
  id: string;
  roomTypeId: string;
  roomId?: string; // optional when unassigned
  adults: number;
  children: number;
  rate: number; // per-night rate for this room (UI-calculated)
};

export function calcNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return isNaN(diffDays) ? 1 : diffDays || 1;
}

export function calcMultiRoomTotals(args: {
  selections: MultiRoomSelection[];
  nights: number;
  // tax is kept consistent with existing code (12%)
  taxRatePercent?: number;
}): {
  subtotal: number;
  taxes: number;
  total: number;
  accommodationTotal: number;
} {
  const { selections, nights, taxRatePercent = 12 } = args;

  const accommodationTotal = selections.reduce((sum, r) => {
    return sum + (Number(r.rate) || 0) * nights;
  }, 0);

  const taxes = Math.round(accommodationTotal * (taxRatePercent / 100));
  const subtotal = accommodationTotal;
  const total = subtotal + taxes;

  return { subtotal, taxes, total, accommodationTotal };
}

export function calcWizardTotalsForRoomSelections(args: {
  selections: MultiRoomSelection[];
  nights: number;
}): {
  subtotal: number;
  taxes: number;
  total: number;
  accommodationTotal: number;
} {
  return calcMultiRoomTotals({
    selections: args.selections,
    nights: args.nights,
    taxRatePercent: 12
  });
}

export function getLegacySingleRoomMappingFromMulti(args: {
  selections: MultiRoomSelection[];
}): { roomTypeId?: string; roomId?: string | null } {
  const first = args.selections[0];
  return {
    roomTypeId: first?.roomTypeId,
    roomId: first?.roomId ?? undefined
  };
}



