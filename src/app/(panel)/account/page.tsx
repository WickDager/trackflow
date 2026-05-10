"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { AvatarUpload } from "@/components/account/AvatarUpload";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PasswordForm } from "@/components/account/PasswordForm";
import type { Profile } from "@/types";
import type { ProfileInput } from "@/lib/validations";

export default function AccountPage() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pendingAvatarRef = useRef<string | null>(null);

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

  const handleAvatarChange = useCallback((base64: string) => {
    pendingAvatarRef.current = base64;
  }, []);

  async function handleUpdateProfile(data: ProfileInput): Promise<boolean> {
    try {
      const body: Record<string, string> = { ...data };
      if (pendingAvatarRef.current) {
        body.avatar_url = pendingAvatarRef.current;
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

      // Refresh the session so the sidebar/topbar reflect changes
      await updateSession({
        full_name: result.data.full_name,
        avatar_url: result.data.avatar_url,
      });

      pendingAvatarRef.current = null;
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
      return false;
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
    </div>
  );
}
