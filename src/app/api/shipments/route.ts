import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { shipmentSchema } from '@/lib/validations';
import { auth } from '@/auth';
import type { Shipment, PaginatedResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);

    let query = getServerClient().from('shipments').select('*', { count: 'exact' });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(
        `tracking_number.ilike.%${search}%,origin.ilike.%${search}%,destination.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    const response: PaginatedResponse<Shipment> = {
      data: data as Shipment[] | null,
      count: count ?? 0,
      error: null,
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = shipmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { data: null, error: validation.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (getServerClient() as any)
      .from('shipments')
      .insert(validation.data)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { data: null, error: 'Tracking number already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Shipment, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
