import { CheckoutParams, CheckoutResult, WebhookEvent, ApiResponse } from '@/types';

export interface PaymentProviderInterface {
  createCheckoutSession(params: CheckoutParams): Promise<ApiResponse<CheckoutResult>>;
  handleWebhook(payload: string, headers: Record<string, string>): WebhookEvent | null;
  getPlanFromPriceId(priceId: string): 'starter' | 'pro' | 'enterprise';
  readonly name: string;
}
