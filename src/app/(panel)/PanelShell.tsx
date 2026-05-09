"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import type { Role } from "@/types";

const pageTitleMap: Record<string, string> = {
  "/app": "Shipments",
  "/account": "Account",
  "/admin/users": "User Management",
  "/admin/analytics": "Analytics",
};

interface PanelShellProps {
  role: Role;
  user: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  onSignOut: () => void;
  children: React.ReactNode;
}

export function PanelShell({
  role,
  user,
  onSignOut,
  children,
}: PanelShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle = useMemo(() => {
    return pageTitleMap[pathname] ?? "Trackflow";
  }, [pathname]);

  return (
    <div className="flex h-screen bg-bg-base">
      {/* Desktop Sidebar — floating glass panel */}
      <aside className="hidden w-56 flex-shrink-0 lg:block">
        <Sidebar role={role} user={user} onSignOut={onSignOut} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:pt-3 lg:pr-3">
        <Topbar
          title={pageTitle}
          role={role}
          user={user}
          onMenuClick={() => setMobileNavOpen(true)}
          onSignOut={onSignOut}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Nav */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        role={role}
        user={user}
        onSignOut={onSignOut}
      />
    </div>
  );
}
