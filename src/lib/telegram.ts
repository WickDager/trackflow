import { TelegramMessage, ApiResponse } from '@/types';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

export async function sendMessage(
  message: TelegramMessage
): Promise<ApiResponse<boolean>> {
  if (!BOT_TOKEN) {
    console.error('[Telegram] TELEGRAM_BOT_TOKEN is not set');
    return { data: null, error: 'Telegram bot token is not configured' };
  }

  const url = `${TELEGRAM_API_URL}${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chatId,
        text: message.text,
        parse_mode: message.parseMode ?? 'HTML',
      }),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      console.warn(
        `[Telegram] Rate limited. Retry after ${retryAfter ?? 'unknown'} seconds`
      );
      return {
        data: null,
        error: `Rate limited. Retry after ${retryAfter ?? 'unknown'}s`,
      };
    }

    const data = (await response.json()) as { ok: boolean; description?: string };

    if (!data.ok) {
      console.error(
        '[Telegram] API error:',
        data.description ?? 'Unknown error'
      );
      return {
        data: null,
        error: data.description ?? 'Telegram API returned ok: false',
      };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('[Telegram] Network error:', error);
    return {
      data: null,
      error: 'Failed to send message to Telegram',
    };
  }
}

export function formatStatusUpdate(notification: {
  trackingNumber: string;
  origin: string;
  destination: string;
  oldStatus: string;
  newStatus: string;
  updatedBy: string;
}): string {
  const statusEmojis: Record<string, string> = {
    pending: '⏳',
    in_transit: '🚚',
    delivered: '✅',
    failed: '❌',
  };

  const newEmoji = statusEmojis[notification.newStatus] ?? '📦';

  return `<b>🚚 Shipment Update</b>

Tracking: <code>${notification.trackingNumber}</code>
Route: ${notification.origin} → ${notification.destination}
Status: ${notification.oldStatus} → <b>${notification.newStatus}</b> ${newEmoji}
Updated by: ${notification.updatedBy}`;
}
