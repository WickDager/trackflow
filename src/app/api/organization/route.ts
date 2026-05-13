import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { auth } from '@/auth';
import type { Organization } from '@/types';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = session.user.organization_id;
    if (!orgId) {
      return NextResponse.json({ data: null, error: 'No organization found' }, { status: 404 });
    }

    const { data, error } = await getServerClient()
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Organization, error: null }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function DELETE() {
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
      return NextResponse.json({ data: null, error: 'No organization found' }, { status: 404 });
    }

    // Verify user owns this organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = getServerClient() as any;
    const { data: org } = await db
      .from('organizations')
      .select('owner_id')
      .eq('id', orgId)
      .single();

    if (!org || org.owner_id !== session.user.id) {
      return NextResponse.json(
        { data: null, error: 'Only the organization owner can delete the team' },
        { status: 403 }
      );
    }

    // Delete the organization — cascades: invites deleted (CASCADE),
    // profiles.org_id set to NULL (SET NULL), shipments.org_id set to NULL (SET NULL)
    const { error } = await db.from('organizations').delete().eq('id', orgId);

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true }, error: null }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
