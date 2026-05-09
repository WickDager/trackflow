import { PaymentProviderInterface } from './provider';
import { StripeProvider } from './stripe-provider';
import { YooKassaProvider } from './yookassa-provider';
import { CryptomusProvider } from './cryptomus-provider';
import { PaymentProvider } from '@/types';

const providers: Record<PaymentProvider, PaymentProviderInterface> = {
  stripe: new StripeProvider(),
  yookassa: new YooKassaProvider(),
  cryptomus: new CryptomusProvider(),
};

export function getPaymentProvider(name: PaymentProvider): PaymentProviderInterface {
  return providers[name];
}

export function getDefaultProvider(): PaymentProviderInterface {
  return providers.stripe;
}

export function getAllProviders(): Record<PaymentProvider, PaymentProviderInterface> {
  return providers;
}

export { StripeProvider, YooKassaProvider, CryptomusProvider };
