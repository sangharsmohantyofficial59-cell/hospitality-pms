// Production-safe staff auth.
// Required credentials must be provided via environment variables.
// UI/placeholder credentials (e.g. 123456) are intentionally removed.
const RECEPTION_USERNAME = process.env.PMS_STAFF_RECEPTION_USERNAME || "";
const RECEPTION_PASSWORD = process.env.PMS_STAFF_RECEPTION_PASSWORD || "";
const OWNER_USERNAME = process.env.PMS_STAFF_OWNER_USERNAME || "";
const OWNER_PASSWORD = process.env.PMS_STAFF_OWNER_PASSWORD || "";

export const AUTH_CONFIG = {
  reception: {
    username: RECEPTION_USERNAME,
    password: RECEPTION_PASSWORD,
    role: "reception" as const,
  },
  owner: {
    username: OWNER_USERNAME,
    password: OWNER_PASSWORD,
    role: "owner" as const,
  },
} as const;

export type AuthRole = (typeof AUTH_CONFIG)[keyof typeof AUTH_CONFIG]["role"];

