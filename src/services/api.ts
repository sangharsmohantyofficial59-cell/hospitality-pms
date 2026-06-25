/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ApiResponse<T> = { success?: boolean; data?: T; error?: string } & Record<string, unknown>;

async function handleJson<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => ({}))) as any;
  return json as T;
}

async function postJson<T>(url: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...init,
  });
  return handleJson<T>(res);
}

async function putJson<T>(url: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...init,
  });
  return handleJson<T>(res);
}

export const api = {
  system: {
    getState: async () => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/state`;
      const res = await fetch(url);
      return handleJson<any>(res);
    },
    refreshState: async () => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/state`;
      const res = await fetch(url);
      return handleJson<any>(res);
    },
    resetPMS: async () => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/reset`;
      return postJson<any>(url, {}, { method: "POST" });
    },
    markNotificationsRead: async () => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/notifications/read`;
      const res = await fetch(url, { method: "POST" });
      return handleJson<any>(res);
    },
  },

  booking: {
    createBooking: async (formData: any) => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/bookings`;
      return postJson<any>(url, formData);
    },
    updateBooking: async (id: string, payload: any) => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/bookings/${id}`;
      return putJson<any>(url, payload);
    },
  },

  room: {
    updateRoomStatus: async (id: string, status: any) => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/rooms/${id}`;
      return putJson<any>(url, { status });
    },
  },

  checkin: {
    uploadCheckin: async (bookingId: string, payload: any) => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/checkin/${bookingId}`;
      return postJson<any>(url, payload);
    },
    upgradeRoom: async (bookingId: string, payload: any) => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/upgrade/${bookingId}`;
      return postJson<any>(url, payload);
    },
  },

  guest: {
    addServiceRequest: async (payload: any) => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/service-requests`;
      return postJson<any>(url, payload);
    },
    updateServiceRequest: async (id: string, payload: any) => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/service-requests/${id}`;
      return putJson<any>(url, payload);
    },
    addTourismInquiry: async (payload: any) => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/tourism-inquiries`;
      return postJson<any>(url, payload);
    },
    addFeedback: async (payload: any) => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/feedbacks`;
      return postJson<any>(url, payload);
    },
    updateFeedbackStatus: async (id: string, status: string) => {
      const url = `${(import.meta as any).env?.VITE_API_BASE_URL ?? ""}/api/pms/feedbacks/${id}`;
      return putJson<any>(url, { serviceRecoveryStatus: status });
    },
  },
};

