export default function handler(_req: any, res: any) {
  return res.status(200).json({
    ok: true,
    service: "memory-assistant",
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    userLocked: Boolean(process.env.TELEGRAM_ALLOWED_USER_ID)
  });
}
