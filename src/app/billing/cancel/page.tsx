import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen bg-bg-base text-ink-primary flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Checkout cancelled</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-ink-secondary">
            No charge was made to your card.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/billing"
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-5 py-2 bg-ink-primary text-bg-base hover:bg-ink-primary/80 transition-colors duration-200"
            >
              Back to billing
            </Link>
            <Link
              href="/billing"
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-5 py-2 border border-bg-border-hover text-ink-secondary hover:bg-bg-surface hover:text-ink-primary transition-colors duration-200"
            >
              View plans
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
