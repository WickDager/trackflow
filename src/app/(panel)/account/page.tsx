"use client";

import { useEffect, useState } from "react";
import { AvatarUpload } from "@/components/account/AvatarUpload";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PasswordForm } from "@/components/account/PasswordForm";
import type { Profile } from "@/types";
import type { ProfileInput } from "@/lib/validations";

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string>("");

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

  async function handleUpdateProfile(data: ProfileInput): Promise<boolean> {
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error ?? "Failed to update profile");
        return false;
      }

      const result = await res.json();
      setProfile(result.data);
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

  if (error) {
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
            email=""
            onAvatarChange={setAvatarBase64}
          />
        </div>
        <ProfileForm profile={profile} onSubmit={handleUpdateProfile} />
      </div>

      {/* Password Section */}
      <PasswordForm />
    </div>
  );
}
