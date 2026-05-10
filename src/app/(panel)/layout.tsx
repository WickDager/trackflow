import { redirect } from 'next/navigation';
import { auth } from '@/auth';
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

  return (
    <PanelShell
      role={session.user.role}
      user={{
        name: session.user.full_name,
        email: session.user.email,
        avatarUrl: session.user.avatar_url,
      }}
    >
      {children}
    </PanelShell>
  );
}
