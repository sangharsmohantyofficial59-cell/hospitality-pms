export const AUTH_CONFIG = {
  reception: {
    username: "Sanghars",
    password: "123456",
    role: "reception" as const,
  },
  owner: {
    username: "Sanjib",
    password: "123456",
    role: "owner" as const,
  },
} as const;

export type AuthRole = (typeof AUTH_CONFIG)[keyof typeof AUTH_CONFIG]["role"];

