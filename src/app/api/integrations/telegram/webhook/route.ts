import { NextResponse } from 'next/server';
import { validateTelegramWebhook } from '@/lib/webhook-validator';
import { TelegramUpdate } from '@/types';

export async function POST(req: Request) {
  try {
    if (!validateTelegramWebhook(req)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = (await req.json()) as TelegramUpdate;

    if (body.message?.text === '/status' || body.message?.text === '/test') {
      // Commands handled — extend with bot responses as needed
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Telegram webhook active',
    timestamp: new Date().toISOString(),
  });
}
