import crypto from 'crypto';
import { PaymentProviderInterface } from './provider';
import { CheckoutParams, CheckoutResult, WebhookEvent, ApiResponse } from '@/types';

const merchantId = process.env.CRYPTOMUS_MERCHANT_ID;
const apiKey = process.env.CRYPTOMUS_API_KEY;
const secretKey = process.env.CRYPTOMUS_SECRET_KEY;

if (!merchantId || !apiKey || !secretKey) {
  console.error('[Cryptomus] CRYPTOMUS_* env vars are not set');
}

const CRYPTOMUS_API_URL = 'https://api.cryptomus.com/v1/payment';

interface CryptomusPaymentResponse {
  result: {
    uuid: string;
    url: string;
  };
}

export class CryptomusProvider implements PaymentProviderInterface {
  readonly name = 'cryptomus';

  async createCheckoutSession(
    params: CheckoutParams
  ): Promise<ApiResponse<CheckoutResult>> {
    try {
      if (!merchantId || !apiKey) {
        return { data: null, error: 'Cryptomus is not configured' };
      }

      const order_id = crypto.randomUUID();

      const amount = this.getPriceFromId(params.priceId);

      const body = {
        amount,
        currency: 'USD',
        order_id,
        url_return: params.successUrl,
        url_callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
        lifetime: 3600,
      };

      const sign = this.generateSign(body);

      const response = await fetch(CRYPTOMUS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          merchant: merchantId,
          sign,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[Cryptomus] API error:', error);
        return { data: null, error: 'Failed to create payment' };
      }

      const data = (await response.json()) as CryptomusPaymentResponse;

      return {
        data: {
          sessionId: data.result.uuid,
          url: data.result.url,
        },
        error: null,
      };
    } catch (error) {
      console.error('[Cryptomus] Error creating checkout session:', error);
      return {
        data: null,
        error: 'Failed to create checkout session',
      };
    }
  }

  handleWebhook(
    payload: string,
    headers: Record<string, string>
  ): WebhookEvent | null {
    try {
      const data = JSON.parse(payload);

      const sign = headers['sign'] ?? headers['x-cryptomus-signature'] ?? '';
      if (!this.verifySign(data, sign)) {
        console.warn('[Cryptomus] Invalid webhook signature');
        return null;
      }

      const eventType = this.mapStatusToEvent(data.status ?? 'unknown');

      return {
        type: eventType,
        id: data.order_id ?? crypto.randomUUID(),
        data: data as Record<string, unknown>,
        raw: data,
      };
    } catch (error) {
      console.warn('[Cryptomus] Invalid webhook payload:', error);
      return null;
    }
  }

  getPlanFromPriceId(priceId: string): 'starter' | 'pro' | 'enterprise' {
    const priceIdLower = priceId.toLowerCase();
    if (priceIdLower.includes('starter')) return 'starter';
    if (priceIdLower.includes('enterprise')) return 'enterprise';
    if (priceIdLower.includes('pro')) return 'pro';
    return 'starter';
  }

  private generateSign(body: Record<string, unknown>): string {
    const json = Buffer.from(JSON.stringify(body)).toString('base64');
    return crypto
      .createHash('md5')
      .update(json + secretKey)
      .digest('hex');
  }

  private verifySign(data: Record<string, unknown>, sign: string): boolean {
    if (!sign || !secretKey) return false;
    const json = Buffer.from(JSON.stringify(data)).toString('base64');
    const expected = crypto
      .createHash('md5')
      .update(json + secretKey)
      .digest('hex');
    return sign === expected;
  }

  private mapStatusToEvent(status: string): string {
    switch (status) {
      case 'paid':
      case 'paid_over':
        return 'payment.completed';
      case 'cancel':
        return 'payment.canceled';
      case 'expire':
        return 'payment.expired';
      default:
        return `payment.${status}`;
    }
  }

  private getPriceFromId(priceId: string): string {
    const priceIdLower = priceId.toLowerCase();
    if (priceIdLower.includes('starter')) return '29';
    if (priceIdLower.includes('enterprise')) return '299';
    return '79';
  }
}
