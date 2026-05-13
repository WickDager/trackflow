import NextAuth, { CredentialsSignin } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import { getServerClient } from '@/lib/supabase';
import type { SessionUser, Role, SubscriptionStatus } from '@/types';

class EmailNotConfirmed extends CredentialsSignin {
  static type = 'EmailNotConfirmed';
}

declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }
  interface User {
    id: string;
    email: string;
    role: Role;
    full_name: string | null;
    avatar_url: string | null;
    organization_id: string | null;
    subscription_status: SubscriptionStatus | null;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Supabase configuration is missing');
        }

        // Anon client for auth only (has access to auth schema on server)
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (error) {
          if (error.message.toLowerCase().includes('not confirmed')) {
            throw new EmailNotConfirmed();
          }
          return null;
        }

        if (!data.user) {
          return null;
        }

        let role: Role = 'user';
        let full_name: string | null = null;
        let avatar_url: string | null = null;
        let organization_id: string | null = null;
        let subscription_status: SubscriptionStatus | null = null;

        try {
          // Server client (service role) for DB queries — bypasses RLS
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const db = getServerClient() as any;

          const { data: profile } = await db
            .from('profiles')
            .select('full_name, role, avatar_url, company, organization_id')
            .eq('id', data.user.id)
            .single();

          role = (profile?.role ?? 'user') as Role;
          full_name = profile?.full_name ?? null;
          avatar_url = profile?.avatar_url ?? null;
          organization_id = profile?.organization_id ?? null;

          // Auto-claim invite if user has invite_token in metadata and no org yet
          if (!organization_id) {
            const inviteToken = data.user.user_metadata?.invite_token as string | undefined;
            if (inviteToken) {
              const { data: invite } = await db
                .from('invites')
                .select('id, organization_id, uses, max_uses, is_active, expires_at, organizations(subscription_status, subscription_expires_at)')
                .eq('token', inviteToken)
                .eq('is_active', true)
                .single();

              if (invite) {
                const org = invite.organizations as unknown as {
                  subscription_status: string;
                  subscription_expires_at: string | null;
                } | null;

                if (
                  org?.subscription_status !== 'expired' &&
                  invite.uses < invite.max_uses &&
                  new Date(invite.expires_at) > new Date()
                ) {
                  await db
                    .from('profiles')
                    .update({ organization_id: invite.organization_id })
                    .eq('id', data.user.id);

                  const newUses = invite.uses + 1;
                  await db
                    .from('invites')
                    .update({
                      uses: newUses,
                      ...(newUses >= invite.max_uses ? { is_active: false } : {}),
                    })
                    .eq('id', invite.id);

                  organization_id = invite.organization_id;
                }
              }
            }
          }

          if (organization_id) {
            const { data: org } = await db
              .from('organizations')
              .select('subscription_status')
              .eq('id', organization_id)
              .single();

            subscription_status = org?.subscription_status ?? null;
          }
        } catch (dbError) {
          console.error('[auth] DB query failed, falling back to anon client:', dbError);
        }

        return {
          id: data.user.id,
          email: data.user.email!,
          role,
          full_name,
          avatar_url,
          organization_id,
          subscription_status,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.full_name = user.full_name;
        token.avatar_url = user.avatar_url;
        token.organization_id = user.organization_id;
        token.subscription_status = user.subscription_status;
      }
      if (trigger === 'update' && session) {
        token.full_name = session.full_name;
        token.company = session.company;
        token.avatar_url = session.avatar_url;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as Role;
        session.user.full_name = token.full_name as string | null;
        session.user.avatar_url = token.avatar_url as string | null;
        session.user.organization_id = token.organization_id as string | null;
        session.user.subscription_status = token.subscription_status as SubscriptionStatus | null;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
