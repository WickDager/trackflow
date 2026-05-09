import { PaymentProviderInterface } from './provider';
import { CheckoutParams, CheckoutResult, WebhookEvent, ApiResponse } from '@/types';

const shopId = process.env.YOOKASSA_SHOP_ID;
const secretKey = process.env.YOOKASSA_SECRET_KEY;
const returnUrl = process.env.YOOKASSA_RETURN_URL;

if (!shopId || !secretKey) {
  console.error('[YooKassa] YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY is not set');
}

const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3';

interface YooKassaPaymentResponse {
  id: string;
  status: string;
  confirmation?: {
    type: string;
    confirmation_url?: string;
  };
  amount?: {
    value: string;
    currency: string;
  };
}

export class YooKassaProvider implements PaymentProviderInterface {
  readonly name = 'yookassa';

  async createCheckoutSession(
    params: CheckoutParams
  ): Promise<ApiResponse<CheckoutResult>> {
    try {
      if (!shopId || !secretKey) {
        return { data: null, error: 'YooKassa is not configured' };
      }

      const response = await fetch(`${YOOKASSA_API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': crypto.randomUUID(),
          Authorization: `Basic ${btoa(`${shopId}:${secretKey}`)}`,
        },
        body: JSON.stringify({
          amount: {
            value: this.getPriceFromId(params.priceId),
            currency: 'RUB',
          },
          confirmation: {
            type: 'redirect',
            return_url: returnUrl ?? params.successUrl,
          },
          description: params.description ?? `Subscription: ${params.priceId}`,
          capture: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[YooKassa] API error:', error);
        return { data: null, error: 'Failed to create payment' };
      }

      const data = (await response.json()) as YooKassaPaymentResponse;

      return {
        data: {
          sessionId: data.id,
          url: data.confirmation?.confirmation_url ?? '',
        },
        error: null,
      };
    } catch (error) {
      console.error('[YooKassa] Error creating checkout session:', error);
      return {
        data: null,
        error: 'Failed to create checkout session',
      };
    }
  }

  handleWebhook(
    payload: string,
    _headers: Record<string, string>
  ): WebhookEvent | null {
    try {
      const event = JSON.parse(payload) as {
        event: string;
        object: Record<string, unknown>;
        id: string;
      };

      return {
        type: event.event,
        id: event.id,
        data: event.object,
        raw: event,
      };
    } catch (error) {
      console.warn('[YooKassa] Invalid webhook payload:', error);
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

  private getPriceFromId(priceId: string): string {
    const priceIdLower = priceId.toLowerCase();
    if (priceIdLower.includes('starter')) return '1990.00';
    if (priceIdLower.includes('enterprise')) return '19990.00';
    return '5990.00';
  }
}
