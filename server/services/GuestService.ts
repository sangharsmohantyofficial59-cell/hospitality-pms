import { Guest } from "../../src/types";

export type GuestCreateParams = {
  name: string;
  email: string;
  phone: string;
  idType?: string;
  idNumber?: string;
  idProofUrl?: string;
};

export type GuestUpdateParams = {
  name?: string;
  phone?: string;
  idType?: string;
  idNumber?: string;
  idProofUrl?: string;
};

export type GuestValidationResult = {
  valid: boolean;
  missingFields?: string[];
};

export class GuestService {
  static findGuestByEmail(guests: Guest[], email: string | undefined) {
    if (!email) return undefined;
    return guests.find(g => g.email.toLowerCase() === email.toLowerCase());
  }

  static findGuestById(guests: Guest[], id: string) {
    return guests.find(g => g.id === id);
  }

  static createGuest(guests: Guest[], params: GuestCreateParams) {
    const guest: Guest = {
      id: `GUST-${Date.now().toString().slice(-4)}`,
      name: params.name,
      email: params.email,
      phone: params.phone,
      createdAt: new Date().toISOString(),
      idType: params.idType,
      idNumber: params.idNumber,
      idProofUrl: params.idProofUrl
    };
    guests.push(guest);
    return guest;
  }

  static updateGuest(guest: Guest, params: GuestUpdateParams) {
    if (params.name !== undefined) guest.name = params.name;
    if (params.phone !== undefined) guest.phone = params.phone;
    if (params.idType !== undefined) guest.idType = params.idType;
    if (params.idNumber !== undefined) guest.idNumber = params.idNumber;
    if (params.idProofUrl !== undefined) guest.idProofUrl = params.idProofUrl;
    return guest;
  }

  static findOrCreateGuest(guests: Guest[], params: GuestCreateParams) {
    const existing = this.findGuestByEmail(guests, params.email);
    if (existing) {
      // Do not silently overwrite stored guest profile fields.
      // Existing guests are matched by email and returned unchanged.
      return existing;
    }
    return this.createGuest(guests, params);
  }

  static validateGuestPayload(payload: { guestName?: string; guestEmail?: string; guestPhone?: string; }) {
    const missingFields: string[] = [];
    if (!payload.guestName) missingFields.push("guestName");
    if (!payload.guestEmail) missingFields.push("guestEmail");
    if (!payload.guestPhone) missingFields.push("guestPhone");
    return {
      valid: missingFields.length === 0,
      missingFields: missingFields.length ? missingFields : undefined
    };
  }
}
