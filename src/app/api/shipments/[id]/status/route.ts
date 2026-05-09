import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

const bodySchema = z.object({
  newStatus: z.enum(['pending', 'in_transit', 'delivered', 'failed'] as const),
  updatedBy: z.string().min(1, 'Updated by is required'),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validation = bodySchema.safeParse(body);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
        { data: null, error: 'Validation failed', details: fieldErrors },
        { status: 400 }
      );
    }

    const { newStatus } = validation.data;

    const { data: shipment, error: fetchError } = await (getServerClient() as any)
      .from('shipments')
      .select('tracking_number, origin, destination, status')
      .eq('id', id)
      .single();

    if (fetchError || !shipment) {
      return NextResponse.json(
        { data: null, error: `Shipment ${id} not found` },
        { status: 404 }
      );
    }

    const current = shipment as { tracking_number: string; origin: string; destination: string; status: string };

    if (current.status === newStatus) {
      return NextResponse.json(
        { data: null, error: `Status is already ${newStatus}` },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await (getServerClient() as any)
      .from('shipments')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ data: null, error: updateError.message }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const telegramSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (telegramSecret) {
      void fetch(`${appUrl}/api/integrations/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': telegramSecret,
        },
        body: JSON.stringify({
          trackingNumber: current.tracking_number,
          origin: current.origin,
          destination: current.destination,
          oldStatus: current.status,
          newStatus,
          updatedBy: validation.data.updatedBy,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      data: {
        shipment: updated,
        notification: { sent: !!telegramSecret, channel: 'telegram' },
      },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
