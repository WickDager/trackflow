"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { Role } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const allNavItems: NavItem[] = [
  { label: "Dashboard", href: "/app", icon: Package },
  { label: "Account", href: "/account", icon: User },
  { label: "Users", href: "/admin/users", icon: Users, adminOnly: true },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    adminOnly: true,
  },
];

interface SidebarProps {
  role: Role;
  user: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  onSignOut: () => void;
  className?: string;
  onItemClick?: () => void;
}

export function Sidebar({
  role,
  user,
  onSignOut,
  className,
  onItemClick,
}: SidebarProps) {
  const pathname = usePathname();
  const navItems = allNavItems.filter(
    (item) => !item.adminOnly || role === "admin"
  );

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-bg-surface",
        // Floating glass on desktop
        "lg:bg-bg-surface/80 lg:backdrop-blur-xl lg:border lg:border-bg-border/60 lg:my-3 lg:ml-3 lg:rounded-2xl lg:h-[calc(100vh-1.5rem)]",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="h-2.5 w-2.5 rounded-full bg-accent" />
        <span className="text-lg font-semibold tracking-tight text-ink-primary">
          Trackflow
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent-subtle text-accent"
                  : "text-ink-secondary hover:bg-bg-elevated hover:text-ink-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-bg-border/60 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-bg-elevated text-xs text-ink-primary">
              {getInitials(user.name ?? user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-ink-primary">
              {user.name ?? user.email}
            </p>
            <Badge
              variant={role === "admin" ? "default" : "secondary"}
              className="mt-0.5 text-xs"
            >
              {role}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSignOut}
            className="h-8 w-8 text-ink-muted hover:text-ink-primary"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
