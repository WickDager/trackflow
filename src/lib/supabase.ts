import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  return url;
}

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return key;
}

let _serverClient: SupabaseClient<Database> | null = null;

export function getServerClient(): SupabaseClient<Database> {
  if (!_serverClient) {
    _serverClient = createClient<Database>(getSupabaseUrl(), getServiceRoleKey());
  }
  return _serverClient;
}
