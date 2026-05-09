import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { PanelShell } from './PanelShell';

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const handleSignOut = async () => {
    'use server';
    await signOut({ redirectTo: '/auth/login' });
  };

  return (
    <PanelShell
      role={session.user.role}
      user={{
        name: session.user.full_name,
        email: session.user.email,
        avatarUrl: session.user.avatar_url,
      }}
      onSignOut={handleSignOut}
    >
      {children}
    </PanelShell>
  );
}
