import { sendTelegramMessage, verifyTelegramLinkToken } from "@calcom/lib/telegram";
import prisma from "@calcom/prisma";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Telegram Bot webhook. Set it once after deploy with:
 *   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://slotix.neurin.tech/api/integrations/telegram/webhook&secret_token=<SECRET>"
 * The bot links a user when they open t.me/<bot>?start=<token> (which sends "/start <token>").
 */
async function handler(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = await req.json().catch(() => null);
  const message = update?.message;
  const chatId = message?.chat?.id;
  const text: string | undefined = message?.text;

  if (!chatId || !text) return NextResponse.json({ ok: true });

  if (text.startsWith("/start")) {
    const token = text.split(" ")[1]?.trim();
    const userId = token ? verifyTelegramLinkToken(token) : null;
    if (!userId) {
      await sendTelegramMessage(
        chatId,
        "Чтобы подключить Telegram к Slotix, откройте ссылку привязки в настройках профиля."
      );
      return NextResponse.json({ ok: true });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { metadata: true } });
    const metadata = (user?.metadata as Record<string, unknown> | null) ?? {};
    await prisma.user.update({
      where: { id: userId },
      data: { metadata: { ...metadata, telegramChatId: String(chatId) } },
    });
    await sendTelegramMessage(
      chatId,
      "✅ <b>Telegram подключён к Slotix.</b>\nТеперь уведомления о новых бронированиях будут приходить сюда."
    );
  }

  return NextResponse.json({ ok: true });
}

export const POST = defaultResponderForAppDir(handler);
