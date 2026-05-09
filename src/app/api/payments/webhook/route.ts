import { NextResponse } from 'next/server';
import { validateStripeWebhook, validateYooKassaWebhook, validateCryptomusWebhook } from '@/lib/webhook-validator';

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let providerName: string | null = null;

    if (headers['stripe-signature']) {
      providerName = 'stripe';
    } else if (headers['x-request-signature']) {
      providerName = 'yookassa';
    } else if (headers['sign'] || headers['x-cryptomus-signature']) {
      providerName = 'cryptomus';
    }

    if (!providerName) {
      try {
        const parsed = JSON.parse(payload);
        if (parsed.type?.startsWith('checkout.session') || parsed.type?.startsWith('payment_intent')) {
          providerName = 'stripe';
        } else if (parsed.event) {
          providerName = 'yookassa';
        } else if (parsed.order_id || parsed.status) {
          providerName = 'cryptomus';
        }
      } catch {
        providerName = 'stripe';
      }
    }

    let event: { type: string; id: string; data: Record<string, unknown> } | null = null;

    switch (providerName) {
      case 'stripe': {
        const sig = headers['stripe-signature'] ?? '';
        const stripeEvent = validateStripeWebhook(payload, sig);
        if (!stripeEvent) {
          return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 });
        }
        event = {
          type: stripeEvent.type,
          id: stripeEvent.id,
          data: stripeEvent.data.object as unknown as Record<string, unknown>,
        };
        break;
      }

      case 'yookassa': {
        if (!validateYooKassaWebhook(payload, headers)) {
          return NextResponse.json({ error: 'Invalid YooKassa signature' }, { status: 400 });
        }
        const parsed = JSON.parse(payload);
        event = {
          type: parsed.event,
          id: parsed.object?.id ?? 'unknown',
          data: parsed.object,
        };
        break;
      }

      case 'cryptomus': {
        const sign = headers['sign'] ?? headers['x-cryptomus-signature'] ?? '';
        if (!validateCryptomusWebhook(payload, sign)) {
          return NextResponse.json({ error: 'Invalid Cryptomus signature' }, { status: 400 });
        }
        const parsed = JSON.parse(payload);
        event = {
          type: parsed.status === 'paid' ? 'payment.completed' : `payment.${parsed.status ?? 'unknown'}`,
          id: parsed.order_id ?? 'unknown',
          data: parsed,
        };
        break;
      }

      default:
        return NextResponse.json({ ok: true });
    }

    await handleEvent(event, providerName);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

async function handleEvent(
  event: { type: string; id: string; data: Record<string, unknown> },
  _provider: string
) {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'payment.succeeded':
    case 'payment.completed':
      // TODO: Update user subscription in DB
      break;

    case 'checkout.session.expired':
    case 'payment_intent.payment_failed':
    case 'payment.canceled':
    case 'payment.expired':
      break;
  }
}
