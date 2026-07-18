import process from "node:process";
export const GOOGLE_API_CREDENTIALS = process.env.GOOGLE_API_CREDENTIALS || "{}";
export const { client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET } =
  JSON.parse(GOOGLE_API_CREDENTIALS)?.web || {};
export const GOOGLE_LOGIN_ENABLED = process.env.GOOGLE_LOGIN_ENABLED === "true";
export const IS_GOOGLE_LOGIN_ENABLED = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_LOGIN_ENABLED);

// Mirrors the gating in packages/features/auth/lib/next-auth-options.ts so the login
// page only renders a Yandex button when the provider is actually registered.
export const YANDEX_LOGIN_ENABLED = process.env.YANDEX_LOGIN_ENABLED === "true";
export const IS_YANDEX_LOGIN_ENABLED = !!(
  process.env.YANDEX_CLIENT_ID &&
  process.env.YANDEX_CLIENT_SECRET &&
  YANDEX_LOGIN_ENABLED
);
