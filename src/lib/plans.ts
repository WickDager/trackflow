import type { Plan, PlanConfig } from '@/types';

const plans: Record<Plan, Omit<PlanConfig, 'isCurrentPlan'>> = {
  starter: {
    name: 'Starter',
    price: '$29/mo',
    maxUsers: 3,
    features: [
      'Up to 3 team members',
      '100 shipments/month',
      'Email notifications',
      'Basic analytics',
      '7-day support',
    ],
    priceIds: {
      stripe: 'price_starter',
      yookassa: 'price_starter',
      cryptomus: 'price_starter',
    },
  },
  pro: {
    name: 'Pro',
    price: '$79/mo',
    maxUsers: 10,
    features: [
      'Up to 10 team members',
      '1,000 shipments/month',
      'Email + Telegram notifications',
      'Advanced analytics',
      'Priority support',
      'API access',
    ],
    priceIds: {
      stripe: 'price_pro',
      yookassa: 'price_pro',
      cryptomus: 'price_pro',
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: '$199/mo',
    maxUsers: 999,
    features: [
      'Unlimited team members',
      'Unlimited shipments',
      'All notification channels',
      'Custom analytics & reports',
      'Dedicated support',
      'API access',
      'SSO',
      'Custom integrations',
    ],
    priceIds: {
      stripe: 'price_enterprise',
      yookassa: 'price_enterprise',
      cryptomus: 'price_enterprise',
    },
  },
};

export function getPlanConfig(plan: Plan): PlanConfig {
  return {
    ...plans[plan],
    isCurrentPlan: false,
  };
}

export function getAllPlans(): PlanConfig[] {
  return Object.entries(plans).map(([_key, config]) => ({
    ...config,
    isCurrentPlan: false,
  }));
}

export function getPlanMaxUsers(plan: Plan): number {
  return plans[plan]?.maxUsers ?? 3;
}
