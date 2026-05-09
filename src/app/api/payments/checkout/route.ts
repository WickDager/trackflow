import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDefaultProvider, getPaymentProvider } from '@/lib/payments';
import { auth } from '@/auth';
import { withRateLimit } from '@/lib/with-rate-limit';
import { PaymentProvider } from '@/types';

const bodySchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  customerEmail: z.string().email().optional(),
  provider: z.enum(['stripe', 'yookassa', 'cryptomus'] as const).optional(),
});

export async function POST(req: Request) {
  try {
    const rateLimitResponse = withRateLimit(req, { maxRequests: 10 });
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = bodySchema.safeParse(body);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: 'Validation failed', details: fieldErrors },
        { status: 400 }
      );
    }

    const { priceId, customerEmail, provider: providerName } = validation.data;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const provider = providerName
      ? getPaymentProvider(providerName)
      : getDefaultProvider();

    const result = await provider.createCheckoutSession({
      priceId,
      successUrl: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/billing/cancel`,
      customerEmail: customerEmail ?? session.user.email,
      description: `Trackflow ${provider.getPlanFromPriceId(priceId)} subscription`,
    });

    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      sessionId: result.data?.sessionId,
      url: result.data?.url,
      provider: provider.name,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
