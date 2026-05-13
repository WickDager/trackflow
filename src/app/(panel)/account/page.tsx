"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AvatarUpload } from "@/components/account/AvatarUpload";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PasswordForm } from "@/components/account/PasswordForm";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types";
import type { ProfileInput } from "@/lib/validations";

export default function AccountPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/account");
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        const result = await res.json();
        if (result.error) {
          setError(result.error);
          return;
        }
        setProfile(result.data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch profile";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void fetchProfile();
  }, []);

  const handleAvatarChange = useCallback(async (base64: string) => {
    // Auto-save avatar immediately when a photo is selected
    try {
      const body = {
        full_name: profile?.full_name ?? "",
        company: profile?.company ?? "",
        avatar_url: base64,
      };

      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const result = await res.json();
        setProfile(result.data);
        setError(null);
        await updateSession({
          full_name: result.data.full_name,
          avatar_url: result.data.avatar_url,
        });
      }
    } catch {
      // Silently ignore avatar update errors
    }
  }, [profile, updateSession]);

  async function handleUpdateProfile(data: ProfileInput): Promise<boolean> {
    try {
      const body: Record<string, string> = { ...data };
      // Include current avatar if one exists
      if (profile?.avatar_url) {
        body.avatar_url = profile.avatar_url;
      }

      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error ?? "Failed to update profile");
        return false;
      }

      const result = await res.json();
      setProfile(result.data);
      setError(null);

      await updateSession({
        full_name: result.data.full_name,
        avatar_url: result.data.avatar_url,
      });

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
      return false;
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const result = await res.json();
        setError(result.error ?? "Failed to delete account");
        setDeleting(false);
        return;
      }
      await signOut({ redirect: false });
      router.push("/auth/login");
    } catch {
      setError("Failed to delete account");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-ink-secondary">Loading...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="rounded-lg bg-status-red-bg p-4 text-status-red border border-status-red/10">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile Section */}
      <div className="grid gap-6 md:grid-cols-[180px_1fr]">
        <div>
          <AvatarUpload
            currentAvatarUrl={profile?.avatar_url ?? null}
            fullName={profile?.full_name ?? ""}
            email={session?.user?.email ?? ""}
            onAvatarChange={handleAvatarChange}
          />
        </div>
        <ProfileForm profile={profile} userEmail={session?.user?.email} onSubmit={handleUpdateProfile} />
      </div>

      {/* Password Section */}
      <PasswordForm userEmail={session?.user?.email} />

      {/* Danger Zone */}
      <div className="rounded-2xl border border-status-red/20 bg-status-red-bg/30 p-6">
        <h3 className="text-sm font-semibold text-status-red">Danger Zone</h3>
        <p className="mt-1 text-sm text-ink-secondary">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="text"
            placeholder='Type "DELETE" to confirm'
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="rounded-lg border border-bg-border/60 bg-bg-base px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted w-64"
          />
          <Button
            variant="destructive"
            disabled={deleteConfirm !== "DELETE" || deleting}
            onClick={handleDeleteAccount}
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </div>
    </div>
  );
}
