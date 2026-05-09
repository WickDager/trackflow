import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendMessage, formatStatusUpdate } from '@/lib/telegram';

const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const INTERNAL_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

const bodySchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  oldStatus: z.enum(['pending', 'in_transit', 'delivered', 'failed'] as const),
  newStatus: z.enum(['pending', 'in_transit', 'delivered', 'failed'] as const),
  updatedBy: z.string().min(1, 'Updated by is required'),
});

export async function POST(req: Request) {
  try {
    const headerSecret = req.headers.get('X-Internal-Secret');
    if (!headerSecret || headerSecret !== INTERNAL_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = bodySchema.safeParse(body);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: 'Validation failed', details: fieldErrors },
        { status: 400 }
      );
    }

    const data = validation.data;

    const messageText = formatStatusUpdate({
      trackingNumber: data.trackingNumber,
      origin: data.origin,
      destination: data.destination,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
      updatedBy: data.updatedBy,
    });

    if (!TELEGRAM_CHAT_ID) {
      return NextResponse.json(
        { error: 'Telegram chat ID not configured' },
        { status: 500 }
      );
    }

    const result = await sendMessage({
      chatId: TELEGRAM_CHAT_ID,
      text: messageText,
      parseMode: 'HTML',
    });

    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to send message', details: result.error },
        { status: 502 }
      );
    }

    return NextResponse.json({
      sent: true,
      messageText,
      channel: TELEGRAM_CHAT_ID,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
