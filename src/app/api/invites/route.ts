import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { auth } from '@/auth';
import type { Invite } from '@/types';

const PLAN_MAX_USERS: Record<string, number> = {
  starter: 3,
  pro: 10,
  enterprise: 999,
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { data: null, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const orgId = session.user.organization_id;
    if (!orgId) {
      return NextResponse.json({ data: [] as Invite[], error: null }, { status: 200 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (getServerClient() as any)
      .from('invites')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Invite[], error: null }, { status: 200 });
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

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { data: null, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const orgId = session.user.organization_id;
    if (!orgId) {
      return NextResponse.json(
        { data: null, error: 'No organization found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { max_uses } = body;

    const plan = (session.user.subscription_status ?? 'starter') as string;
    const maxUsers = PLAN_MAX_USERS[plan] ?? 3;

    const inviteMaxUses = max_uses ? Math.min(Number(max_uses), maxUsers) : 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (getServerClient() as any)
      .from('invites')
      .insert({
        organization_id: orgId,
        created_by: session.user.id,
        max_uses: inviteMaxUses,
        uses: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Invite, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
