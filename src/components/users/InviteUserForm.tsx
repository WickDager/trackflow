"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";

interface InviteUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteUserForm({ open, onOpenChange }: InviteUserFormProps) {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [maxUses, setMaxUses] = useState(1);

  async function handleCreateInvite() {
    setLoading(true);
    setError(null);
    setInviteLink(null);

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max_uses: maxUses }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error ?? "Failed to create invite");
        return;
      }

      const token = result.data.token;
      setInviteToken(token);
      const link = `${window.location.origin}/auth/register?invite=${token}`;
      setInviteLink(link);
    } catch {
      setError("Failed to create invite. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  }

  function handleClose() {
    setInviteLink(null);
    setInviteToken(null);
    setError(null);
    setMaxUses(1);
    setCopied(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {inviteLink ? "Invite Link Created" : "Create Invite Link"}
          </DialogTitle>
          <DialogDescription>
            {inviteLink
              ? "Share this link with users you want to add to your organization."
              : "Generate a signup link that adds users directly to your organization."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <div className="rounded-lg bg-status-red-bg p-3 text-sm text-status-red border border-status-red/10">
              {error}
            </div>
          )}

          {inviteLink ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Invite link</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-status-green" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {inviteToken && (
                <p className="text-xs text-ink-muted">
                  Token: {inviteToken.slice(0, 12)}...
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="maxUses">Number of uses</Label>
              <Input
                id="maxUses"
                type="number"
                min={1}
                max={999}
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value) || 1)}
              />
              <p className="text-xs text-ink-muted">
                How many people can use this link to sign up. Change based on your plan limits.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {inviteLink ? (
            <Button onClick={handleClose} variant="outline">
              Done
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateInvite} disabled={loading}>
                {loading ? "Creating..." : "Generate Link"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
