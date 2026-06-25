export const env = {
  API_BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL as string | undefined,
  APP_NAME: ((import.meta as any).env?.VITE_APP_NAME as string | undefined) ?? "PMS Portal",
  APP_VERSION: ((import.meta as any).env?.VITE_APP_VERSION as string | undefined) ?? "0.0.0",
  DEV_MODE: (() => {
    const raw = (import.meta as any).env?.VITE_DEV_MODE as string | boolean | undefined;
    if (raw === true) return true;
    if (raw === false) return false;
    if (typeof raw === "string") {
      return raw.toLowerCase() === "true" || raw === "1";
    }
    return false;
  })(),
} as const;

