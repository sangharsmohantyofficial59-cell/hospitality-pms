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
      const res = await fetch("/api/pms/state");
      return handleJson<any>(res);
    },
    refreshState: async () => {
      const res = await fetch("/api/pms/state");
      return handleJson<any>(res);
    },
    resetPMS: async () => {
      return postJson<any>("/api/pms/reset", {}, { method: "POST" });
    },
    markNotificationsRead: async () => {
      const res = await fetch("/api/pms/notifications/read", { method: "POST" });
      return handleJson<any>(res);
    },
  },

  booking: {
    createBooking: async (formData: any) => {
      return postJson<any>("/api/pms/bookings", formData);
    },
    updateBooking: async (id: string, payload: any) => {
      return putJson<any>(`/api/pms/bookings/${id}`, payload);
    },
  },

  room: {
    updateRoomStatus: async (id: string, status: any) => {
      return putJson<any>(`/api/pms/rooms/${id}`, { status });
    },
  },

  checkin: {
    uploadCheckin: async (bookingId: string, payload: any) => {
      return postJson<any>(`/api/pms/checkin/${bookingId}`, payload);
    },
    upgradeRoom: async (bookingId: string, payload: any) => {
      return postJson<any>(`/api/pms/upgrade/${bookingId}`, payload);
    },
  },

  guest: {
    addServiceRequest: async (payload: any) => {
      return postJson<any>("/api/pms/service-requests", payload);
    },
    updateServiceRequest: async (id: string, payload: any) => {
      return putJson<any>(`/api/pms/service-requests/${id}`, payload);
    },
    addTourismInquiry: async (payload: any) => {
      return postJson<any>("/api/pms/tourism-inquiries", payload);
    },
    addFeedback: async (payload: any) => {
      return postJson<any>("/api/pms/feedbacks", payload);
    },
    updateFeedbackStatus: async (id: string, status: string) => {
      return putJson<any>(`/api/pms/feedbacks/${id}`, { serviceRecoveryStatus: status });
    },
  },
};

