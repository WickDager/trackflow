import Stripe from 'stripe';

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export function validateStripeWebhook(
  payload: string,
  sig: string
): Stripe.Event | null {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey || !stripeWebhookSecret) {
      return null;
    }

    const stripe = new Stripe(stripeSecretKey);

    return stripe.webhooks.constructEvent(payload, sig, stripeWebhookSecret);
  } catch {
    return null;
  }
}

export function validateTelegramWebhook(req: Request): boolean {
  const secret = req.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? '';
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET ?? '';

  if (!expected) {
    return false;
  }

  return secret === expected;
}

export function validateCryptomusWebhook(
  payload: string,
  sign: string
): boolean {
  try {
    const secretKey = process.env.CRYPTOMUS_SECRET_KEY;
    if (!secretKey || !sign) {
      return false;
    }

    const crypto = require('crypto');
    const json = Buffer.from(payload).toString('base64');
    const expected = crypto.createHash('md5').update(json + secretKey).digest('hex');

    return sign === expected;
  } catch {
    return false;
  }
}

export function validateYooKassaWebhook(
  payload: string,
  headers: Record<string, string>
): boolean {
  const signature = headers['x-request-signature'] ?? '';
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!signature) {
    return false;
  }

  if (!secretKey) {
    return false;
  }

  try {
    const crypto = require('crypto');
    const expected = crypto
      .createHash('sha256')
      .update(payload + secretKey)
      .digest('hex');

    return signature === expected;
  } catch {
    return false;
  }
}
