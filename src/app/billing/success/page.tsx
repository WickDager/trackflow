'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <>
      {sessionId && (
        <p className="text-xs text-ink-muted font-mono break-all">
          Session: {sessionId}
        </p>
      )}
      <Link
        href="/app"
        className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-5 py-2 bg-accent text-accent-foreground hover:bg-accent-dim w-full transition-colors duration-200"
      >
        Go to Dashboard
      </Link>
    </>
  );
}

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-bg-base text-ink-primary flex items-center justify-center px-4">
      <Card className="max-w-md w-full border-accent/40">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-accent-muted flex items-center justify-center text-3xl text-accent">
            ✓
          </div>
          <CardTitle className="text-2xl">Payment successful</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-ink-secondary">
            Welcome to Trackflow Pro! Your subscription is now active.
          </p>
          <Suspense fallback={<p className="text-xs text-ink-muted">Loading...</p>}>
            <SuccessContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
