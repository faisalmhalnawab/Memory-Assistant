export type TelegramMessage = {
  message_id: number;
  text?: string;
  caption?: string;
  from?: {
    id: number;
    is_bot?: boolean;
    first_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

function token(): string {
  const value = process.env.TELEGRAM_BOT_TOKEN;
  if (!value) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return value;
}

export async function sendTelegramMessage(
  chatId: number,
  text: string,
  replyToMessageId?: number
): Promise<void> {
  const chunks = splitTelegramText(text, 3900);

  for (let index = 0; index < chunks.length; index += 1) {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text: chunks[index],
      disable_web_page_preview: true
    };

    if (index === 0 && replyToMessageId) {
      body.reply_parameters = { message_id: replyToMessageId };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token()}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Telegram sendMessage failed: ${response.status} ${detail}`);
    }
  }
}

function splitTelegramText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    let cut = remaining.lastIndexOf("\n", maxLength);
    if (cut < Math.floor(maxLength * 0.6)) {
      cut = remaining.lastIndexOf(" ", maxLength);
    }
    if (cut < Math.floor(maxLength * 0.6)) cut = maxLength;

    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}
