import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerClient } from '@/lib/supabase';
import { profileSchema } from '@/lib/validations';
import { auth } from '@/auth';
import type { Profile } from '@/types';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await getServerClient()
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Profile, error: null }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { data: null, error: validation.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (getServerClient() as any)
      .from('profiles')
      .update(validation.data)
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Profile, error: null }, { status: 200 });
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

    const userId = session.user.id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = getServerClient() as any;

    // If admin owns the org, delete the org first (cascades to invites, sets profiles.org_id to null)
    const { data: org } = await db
      .from('organizations')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();

    if (org) {
      await db.from('organizations').delete().eq('id', org.id);
    }

    // Clear this user's org affiliation before deleting
    await db
      .from('profiles')
      .update({ organization_id: null })
      .eq('id', userId);

    // Delete the auth user via Supabase Admin API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ data: null, error: 'Server configuration error' }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      return NextResponse.json({ data: null, error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true }, error: null }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
