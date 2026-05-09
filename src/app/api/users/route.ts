import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { auth } from '@/auth';
import type { Profile } from '@/types';

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

    const { data, error } = await getServerClient()
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data as Profile[], error: null }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
