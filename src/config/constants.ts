export const ROUTES = {
  guest: "guest" as const,
  home: "home" as const,
  ops: "ops" as const,
  owner: "owner" as const,
} as const;

export const STAFF_SESSION_KEYS = {
  storageKey: "pms_staff_session" as const,
} as const;

export const USER_ROLES = {
  reception: "reception" as const,
  owner: "owner" as const,
} as const;

// Dashboard/tab identifiers (kept as app constants)
export const STAFF_TAB_IDS = {
  opsServiceCenter: "serviceCenter" as const,
  opsRooms: "rooms" as const,
  opsBookings: "bookings" as const,
  opsHousekeeping: "housekeeping" as const,
  opsBilling: "billing" as const,
  opsTransport: "transport" as const,
  opsGuests: "guests" as const,

  ownerDashboard: "ownerDashboard" as const,
  ownerAnalytics: "dashboard" as const,
  ownerDiscountAuditor: "discountAuditor" as const,
  ownerShifts: "shifts" as const,
  ownerAuditLogs: "auditLogs" as const,
} as const;

