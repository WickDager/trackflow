import PlanCard from '@/components/billing/PlanCard';
import { Badge } from '@/components/ui/badge';
import { PlanConfig } from '@/types';

const PLANS: PlanConfig[] = [
  {
    name: 'Starter',
    price: '29',
    features: [
      'Up to 100 shipments/month',
      'Telegram notifications',
      'Email support',
      'Basic analytics',
    ],
    priceIds: {
      stripe: 'price_starter_stripe',
      yookassa: 'price_starter_yookassa',
      cryptomus: 'price_starter_cryptomus',
    },
  },
  {
    name: 'Pro',
    price: '79',
    features: [
      'Up to 1,000 shipments/month',
      'Telegram + SMS notifications',
      'Priority support',
      'Advanced analytics',
      'Custom webhooks',
      'Multi-user access',
    ],
    priceIds: {
      stripe: 'price_pro_stripe',
      yookassa: 'price_pro_yookassa',
      cryptomus: 'price_pro_cryptomus',
    },
  },
  {
    name: 'Enterprise',
    price: 'custom',
    features: [
      'Unlimited shipments',
      'All notification channels',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'SSO & advanced security',
    ],
    priceIds: {
      stripe: 'price_enterprise_stripe',
      yookassa: 'price_enterprise_yookassa',
      cryptomus: 'price_enterprise_cryptomus',
    },
  },
];

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-bg-base text-ink-primary">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Billing &amp; Plan</h1>
          <p className="text-ink-secondary">
            Choose a plan and payment method that works for you
          </p>
        </div>

        <div className="mb-8 p-4 rounded-xl bg-bg-surface border border-bg-border/60">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold">Payment Method</h2>
          </div>
          <p className="text-sm text-ink-secondary mb-4">
            Select your preferred payment provider. Stripe is available globally, YooKassa for Russia/CIS, Crypto for unrestricted access.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">Stripe (Cards)</Badge>
            <Badge variant="outline">YooKassa (RU/CIS)</Badge>
            <Badge variant="outline">Crypto (Global)</Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.name}
              plan={{
                ...plan,
                isCurrentPlan: plan.name === 'Pro',
              }}
              selectedProvider="stripe"
            />
          ))}
        </div>

        <p className="mt-8 text-sm text-ink-muted text-center">
          Payments processed securely by Stripe, YooKassa, or Cryptomus
        </p>
      </div>
    </div>
  );
}
