import Stripe from 'stripe';
import { PaymentProviderInterface } from './provider';
import { CheckoutParams, CheckoutResult, WebhookEvent, ApiResponse } from '@/types';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  console.error('[Stripe] STRIPE_SECRET_KEY is not set');
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : null;

export class StripeProvider implements PaymentProviderInterface {
  readonly name = 'stripe';

  async createCheckoutSession(
    params: CheckoutParams
  ): Promise<ApiResponse<CheckoutResult>> {
    try {
      if (!stripe) {
        return { data: null, error: 'Stripe is not configured' };
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: params.priceId, quantity: 1 }],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.customerEmail,
      });

      return {
        data: {
          sessionId: session.id,
          url: session.url ?? '',
        },
        error: null,
      };
    } catch (error) {
      console.error('[Stripe] Error creating checkout session:', error);
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
      if (!stripe || !stripeWebhookSecret) {
        console.error('[Stripe] Stripe is not configured');
        return null;
      }

      const sig = headers['stripe-signature'] ?? '';

      const event = stripe.webhooks.constructEvent(
        payload,
        sig,
        stripeWebhookSecret
      );

      return {
        type: event.type,
        id: event.id,
        data: event.data.object as unknown as Record<string, unknown>,
        raw: event,
      };
    } catch (error) {
      console.warn('[Stripe] Invalid webhook signature:', error);
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
}

export { stripe };
