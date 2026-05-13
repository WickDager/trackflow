import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token is required' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invite, error } = await (getServerClient() as any)
      .from('invites')
      .select('*, organizations(subscription_status, subscription_expires_at)')
      .eq('token', token)
      .single();

    if (error || !invite) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired invite link' }, { status: 404 });
    }

    if (!invite.is_active) {
      return NextResponse.json({ valid: false, error: 'This invite link is no longer active' }, { status: 410 });
    }

    if (invite.uses >= invite.max_uses) {
      return NextResponse.json({ valid: false, error: 'This invite link has reached its usage limit' }, { status: 410 });
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This invite link has expired' }, { status: 410 });
    }

    const org = invite.organizations as unknown as {
      subscription_status: string;
      subscription_expires_at: string | null;
    } | null;

    if (!org || org.subscription_status === 'expired') {
      return NextResponse.json({ valid: false, error: 'The organization subscription has expired' }, { status: 402 });
    }

    return NextResponse.json({
      valid: true,
      organization_id: invite.organization_id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ valid: false, error: message }, { status: 500 });
  }
}
