import { askChiefOfStaff } from "../src/agents.js";
import {
  sendTelegramMessage,
  type TelegramUpdate
} from "../src/telegram.js";

export const config = {
  maxDuration: 60
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (configuredSecret) {
    const suppliedSecret = req.headers["x-telegram-bot-api-secret-token"];
    if (suppliedSecret !== configuredSecret) {
      return res.status(401).json({ ok: false, error: "invalid_webhook_secret" });
    }
  }

  const update = req.body as TelegramUpdate;
  const message = update?.message;

  if (!message?.from?.id || !message.chat?.id) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  const userId = String(message.from.id);
  const allowedUserId = process.env.TELEGRAM_ALLOWED_USER_ID?.trim();

  if (!allowedUserId) {
    await sendTelegramMessage(
      message.chat.id,
      `Setup mode. Your Telegram user ID is ${userId}. Add this value to TELEGRAM_ALLOWED_USER_ID in Vercel, then redeploy. Until then I will not run any AI or external actions.`,
      message.message_id
    );
    return res.status(200).json({ ok: true, setupMode: true });
  }

  if (userId !== allowedUserId) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  const text = (message.text || message.caption || "").trim();
  if (!text) {
    await sendTelegramMessage(
      message.chat.id,
      "I can handle text messages in this first build. Voice notes, images, files and interactive approval buttons are next.",
      message.message_id
    );
    return res.status(200).json({ ok: true, unsupported: true });
  }

  try {
    const answer = await askChiefOfStaff(text);
    await sendTelegramMessage(message.chat.id, answer, message.message_id);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Chief of Staff run failed", error);
    await sendTelegramMessage(
      message.chat.id,
      "I hit an internal error while handling that. Nothing external was changed.",
      message.message_id
    );
    return res.status(200).json({ ok: false });
  }
}
