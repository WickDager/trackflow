"use client";

import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import type { Role } from "@/types";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  user: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  onSignOut: () => void;
}

export function MobileNav({
  isOpen,
  onClose,
  role,
  user,
  onSignOut,
}: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 left-0 z-50 w-64 transition-transform"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="relative flex h-full flex-col border-r border-bg-border/60 bg-bg-surface">
          {/* Close button */}
          <div className="absolute right-2 top-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-ink-secondary hover:text-ink-primary"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Sidebar
            role={role}
            user={user}
            onSignOut={() => {
              onSignOut();
              onClose();
            }}
            className="border-r-0"
            onItemClick={onClose}
          />
        </div>
      </div>
    </>
  );
}
