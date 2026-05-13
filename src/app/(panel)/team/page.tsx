"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Copy, Check, Trash2, Users, Link2, AlertTriangle } from "lucide-react";
import type { Invite, Organization, Profile } from "@/types";
import { getInitials, formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamPage() {
  const { data: session } = useSession();
  const [org, setOrg] = useState<Organization | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxUses, setMaxUses] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [orgRes, invitesRes, usersRes] = await Promise.all([
        fetch("/api/organization"),
        fetch("/api/invites"),
        fetch("/api/users"),
      ]);

      const orgResult = await orgRes.json();
      const invitesResult = await invitesRes.json();
      const usersResult = await usersRes.json();

      if (orgResult.data) setOrg(orgResult.data);
      if (invitesResult.data) setInvites(invitesResult.data);
      if (usersResult.data) setUsers(usersResult.data);
    } catch {
      setError("Failed to load team data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  async function handleGenerateInvite() {
    setGenerating(true);
    setError(null);
    setNewInviteLink(null);

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

      const link = `${window.location.origin}/auth/register?invite=${result.data.token}`;
      setNewInviteLink(link);
      await fetchData();
    } catch {
      setError("Failed to create invite");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopyLink() {
    if (!newInviteLink) return;
    try {
      await navigator.clipboard.writeText(newInviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  async function handleRemoveUser(userId: string) {
    setRemovingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch {
      // silently fail
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  const currentCount = users.length;
  const maxAllowed = org?.max_users ?? 0;
  const usagePercent = maxAllowed > 0 ? Math.min((currentCount / maxAllowed) * 100, 100) : 0;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-ink-primary">Team</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Manage your team members and invite new users.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-status-red-bg p-3 text-sm text-status-red border border-status-red/10">
          {error}
        </div>
      )}

      {/* Usage Card */}
      <div className="rounded-xl border border-bg-border/60 bg-bg-surface p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-ink-muted" />
            <span className="text-sm font-medium text-ink-primary">Team members</span>
          </div>
          <span className="text-sm text-ink-secondary">
            {currentCount} of {maxAllowed} used
          </span>
        </div>
        <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              usagePercent >= 100 ? "bg-status-red" : "bg-accent"
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        {usagePercent >= 100 && (
          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-status-amber-bg border border-status-amber/20">
            <AlertTriangle className="h-4 w-4 text-status-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-ink-primary">Limit reached</p>
              <p className="text-xs text-ink-secondary mt-0.5">
                Upgrade your plan to add more team members.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Invite Section */}
      <div className="rounded-xl border border-bg-border/60 bg-bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="h-4 w-4 text-ink-muted" />
          <h2 className="text-sm font-semibold text-ink-primary uppercase tracking-wider">
            Invite Links
          </h2>
        </div>

        {newInviteLink ? (
          <div className="space-y-3 rounded-lg border border-accent/20 bg-accent-subtle/30 p-4">
            <p className="text-sm font-medium text-ink-primary">Link created</p>
            <div className="flex gap-2">
              <Input value={newInviteLink} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopyLink} className="shrink-0">
                {copied ? (
                  <Check className="h-4 w-4 text-status-green" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewInviteLink(null)}
              className="text-xs"
            >
              Create another
            </Button>
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="uses" className="text-xs">Number of uses</Label>
              <Input
                id="uses"
                type="number"
                min={1}
                max={Math.max(maxAllowed - currentCount, 1)}
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value) || 1)}
                className="w-24"
                disabled={currentCount >= maxAllowed}
              />
            </div>
            <Button
              onClick={handleGenerateInvite}
              disabled={generating || currentCount >= maxAllowed}
              size="sm"
            >
              <Plus className="mr-1 h-4 w-4" />
              {generating ? "Generating..." : "Generate invite link"}
            </Button>
          </div>
        )}

        {/* Existing invites */}
        {invites.length > 0 && (
          <div className="mt-5">
            <Separator className="mb-3" />
            <div className="space-y-2">
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-bg-border/40 px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-mono text-xs text-ink-secondary">
                      {inv.token.slice(0, 12)}...
                    </span>
                    <span className="text-ink-muted ml-2">
                      {inv.uses}/{inv.max_uses} used
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={inv.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {inv.is_active ? "active" : "inactive"}
                    </Badge>
                    <span className="text-xs text-ink-muted">
                      {formatDate(inv.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Team Members Table */}
      <div className="rounded-xl border border-bg-border/60 bg-bg-surface overflow-hidden">
        <div className="p-5 sm:p-6 pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-ink-muted" />
            <h2 className="text-sm font-semibold text-ink-primary uppercase tracking-wider">
              Members
            </h2>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="p-5 sm:p-6 pt-0 text-center text-sm text-ink-secondary">
            No team members yet. Generate an invite link to add your first member.
          </div>
        ) : (
          <div className="divide-y divide-bg-border/40">
            {users.map((user) => {
              const isSelf = user.id === session?.user?.id;
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-5 sm:px-6 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-bg-elevated text-xs text-ink-primary">
                        {getInitials(user.full_name ?? user.id)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-ink-primary">
                        {user.full_name ?? "Unnamed User"}
                        {isSelf && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {user.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {user.role}
                    </Badge>
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-ink-muted hover:text-status-red"
                        onClick={async () => {
                          if (confirm(`Remove ${user.full_name ?? "this user"} from the team?`)) {
                            await handleRemoveUser(user.id);
                          }
                        }}
                        disabled={removingId === user.id}
                        aria-label={`Remove ${user.full_name ?? "user"}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
