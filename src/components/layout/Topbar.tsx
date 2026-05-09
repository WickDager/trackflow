"use client";

import { Menu, Bell, User, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import type { Role } from "@/types";

interface TopbarProps {
  title: string;
  role: Role;
  user: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  onMenuClick: () => void;
  onSignOut: () => void;
}

export function Topbar({
  title,
  role,
  user,
  onMenuClick,
  onSignOut,
}: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-bg-border/60 bg-bg-surface/80 backdrop-blur-xl px-4 lg:bg-transparent lg:backdrop-blur-none lg:border-b-0">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-8 w-8 text-ink-secondary hover:text-ink-primary lg:hidden bg-bg-surface/90 backdrop-blur-md border border-bg-border/60 rounded-xl"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight text-ink-primary">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-ink-secondary hover:text-ink-primary"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-bg-elevated text-xs text-ink-primary">
                  {getInitials(user.name ?? user.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium text-ink-primary">
                {user.name ?? user.email}
              </p>
              <p className="text-xs text-ink-muted">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
