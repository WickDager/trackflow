import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getServerClient() as any;

    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*, organizations(subscription_status, subscription_expires_at)')
      .eq('token', token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 });
    }

    if (!invite.is_active) {
      return NextResponse.json({ error: 'This invite link is no longer active' }, { status: 410 });
    }

    if (invite.uses >= invite.max_uses) {
      return NextResponse.json({ error: 'This invite link has reached its usage limit' }, { status: 410 });
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invite link has expired' }, { status: 410 });
    }

    const org = invite.organizations as unknown as {
      subscription_status: string;
      subscription_expires_at: string | null;
    } | null;

    if (!org || org.subscription_status === 'expired') {
      return NextResponse.json({ error: 'The organization subscription has expired' }, { status: 402 });
    }

    const newUses = invite.uses + 1;

    await supabase
      .from('profiles')
      .update({ organization_id: invite.organization_id })
      .eq('id', session.user.id);

    const updatePayload: Record<string, unknown> = { uses: newUses };
    if (newUses >= invite.max_uses) {
      updatePayload.is_active = false;
    }

    await supabase
      .from('invites')
      .update(updatePayload)
      .eq('id', invite.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
