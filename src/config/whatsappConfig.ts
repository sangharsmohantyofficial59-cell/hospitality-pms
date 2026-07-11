/**
 * WhatsApp Cloud API Configuration
 *
 * All values are read from environment variables.
 * No credentials are hardcoded here.
 *
 * Required environment variables:
 *   WHATSAPP_PHONE_NUMBER_ID  — Your registered WhatsApp sender Phone Number ID from Meta Business Manager
 *   WHATSAPP_ACCESS_TOKEN     — System User access token with whatsapp_business_messaging permission
 *   WHATSAPP_TEMPLATE_NAME    — Approved template name (e.g. "booking_confirmation")
 *   WHATSAPP_API_VERSION      — Meta Graph API version (e.g. "v20.0")
 *
 * Optional environment variables:
 *   WHATSAPP_ENABLED          — Set to "true" to enable live dispatch. Defaults to "false" (simulation mode).
 *
 * Setup Reference:
 *   https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
 */

export interface WhatsAppConfig {
  /** Phone Number ID from Meta Business Manager */
  phoneNumberId: string;
  /** System User access token */
  accessToken: string;
  /** Approved message template name */
  templateName: string;
  /** Meta Graph API version (e.g. "v20.0") */
  apiVersion: string;
  /** Fully composed Meta Cloud API endpoint */
  apiEndpoint: string;
  /** Whether live dispatch is enabled */
  enabled: boolean;
}

/**
 * Returns the current WhatsApp Cloud API configuration.
 * All sensitive values come from process.env — never hardcoded.
 *
 * Returns `enabled: false` if any required credential is missing,
 * causing the service to fall back to simulation mode.
 */
export function getWhatsAppConfig(): WhatsAppConfig {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
  const templateName  = process.env.WHATSAPP_TEMPLATE_NAME ?? "booking_confirmation";
  const apiVersion    = process.env.WHATSAPP_API_VERSION ?? "v20.0";
  const enabledEnv    = process.env.WHATSAPP_ENABLED ?? "false";

  const enabled = enabledEnv === "true" && Boolean(phoneNumberId) && Boolean(accessToken);

  const apiEndpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  if (!enabled) {
    console.log(
      "[WhatsAppConfig] Live dispatch DISABLED. " +
      "Set WHATSAPP_ENABLED=true, WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to enable."
    );
  }

  return {
    phoneNumberId,
    accessToken,
    templateName,
    apiVersion,
    apiEndpoint,
    enabled,
  };
}
