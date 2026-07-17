import crypto from "node:crypto";

import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";

const log = logger.getSubLogger({ prefix: ["telegram"] });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// Sign the link token with an app secret so the webhook can trust /start payloads.
const LINK_SECRET =
  process.env.TELEGRAM_LINK_SECRET || process.env.CALENDSO_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || "";

export const isTelegramEnabled = () => !!BOT_TOKEN;

/** Sign a userId into a short-lived token used in the bot deep link (t.me/<bot>?start=<token>). */
export function createTelegramLinkToken(userId: number): string {
  const payload = `${userId}.${Date.now()}`;
  const sig = crypto.createHmac("sha256", LINK_SECRET).update(payload).digest("base64url");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

/** Verify a deep-link token from the bot's /start command; returns the userId or null. */
export function verifyTelegramLinkToken(token: string, maxAgeMs = 1000 * 60 * 30): number | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [userIdStr, tsStr, sig] = decoded.split(".");
    if (!userIdStr || !tsStr || !sig) return null;
    const expected = crypto
      .createHmac("sha256", LINK_SECRET)
      .update(`${userIdStr}.${tsStr}`)
      .digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    if (Date.now() - Number(tsStr) > maxAgeMs) return null;
    return Number(userIdStr);
  } catch {
    return null;
  }
}

/** Send a Markdown message to a Telegram chat via the Bot API. Silently no-ops if not configured. */
export async function sendTelegramMessage(chatId: string | number, text: string): Promise<boolean> {
  if (!BOT_TOKEN) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      log.warn("Telegram sendMessage failed", safeStringify({ status: res.status }));
      return false;
    }
    return true;
  } catch (e) {
    log.error("Telegram sendMessage error", safeStringify(e));
    return false;
  }
}
