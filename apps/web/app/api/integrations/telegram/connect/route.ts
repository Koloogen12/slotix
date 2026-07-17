import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { createTelegramLinkToken, isTelegramEnabled } from "@calcom/lib/telegram";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || "slotix_calendar_bot";

// Returns a one-tap deep link the user opens to link their Telegram to Slotix.
async function handler() {
  if (!isTelegramEnabled()) {
    return NextResponse.json({ message: "telegram_not_configured" }, { status: 400 });
  }
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }
  const token = createTelegramLinkToken(session.user.id);
  return NextResponse.json({ url: `https://t.me/${BOT_USERNAME}?start=${token}` });
}

export const GET = defaultResponderForAppDir(handler);
