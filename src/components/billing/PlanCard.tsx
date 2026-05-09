'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PaymentProvider, PlanConfig } from '@/types';

interface PlanCardProps {
  plan: PlanConfig;
  selectedProvider: PaymentProvider;
}

export default function PlanCard({ plan, selectedProvider }: PlanCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (plan.isCurrentPlan) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceIds[selectedProvider],
          provider: selectedProvider,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('[PlanCard] Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const isEnterprise = plan.name === 'Enterprise';

  return (
    <Card className={plan.isCurrentPlan ? 'border-accent/60' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{plan.name}</CardTitle>
          {plan.isCurrentPlan && (
            <Badge variant="default">Current plan</Badge>
          )}
        </div>
        <CardDescription>
          {plan.price === 'custom' ? 'Custom pricing' : `$${plan.price}/month`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✓</span>
              <span className="text-sm text-ink-primary">{feature}</span>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        {isEnterprise ? (
          <a
            href="mailto:sales@trackflow.com"
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-5 py-2 border border-bg-border-hover text-ink-secondary hover:bg-bg-surface hover:text-ink-primary transition-colors duration-200 w-full"
          >
            Contact sales
          </a>
        ) : (
          <Button
            onClick={handleUpgrade}
            disabled={loading || plan.isCurrentPlan}
            className="w-full"
            variant={plan.name === 'Pro' ? 'default' : 'outline'}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Creating checkout...
              </>
            ) : plan.isCurrentPlan ? (
              'Current plan'
            ) : (
              `Upgrade to ${plan.name}`
            )}
          </Button>
        )}

        {error && (
          <p className="mt-2 text-sm text-status-red text-center">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
