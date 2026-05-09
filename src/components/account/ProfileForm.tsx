"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import type { Profile } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ProfileFormProps {
  profile: Profile | null;
  onSubmit: (data: ProfileInput) => Promise<boolean>;
}

export function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      company: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? "",
        company: profile.company ?? "",
      });
    }
  }, [profile, reset]);

  async function handleFormSubmit(data: ProfileInput) {
    setSuccess(null);
    setError(null);
    const ok = await onSubmit(data);
    if (ok) {
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError("Failed to update profile");
    }
    return ok;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-4">
          {success && (
            <div className="rounded-lg bg-accent-subtle p-3 text-sm text-accent border border-accent/10">
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-status-red-bg p-3 text-sm text-status-red border border-status-red/10">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && (
              <p className="text-sm text-status-red">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" {...register("company")} />
            {errors.company && (
              <p className="text-sm text-status-red">
                {errors.company.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              disabled
              value={profile?.id ? "(email from auth)" : ""}
              className="opacity-60"
            />
            <p className="text-xs text-ink-muted">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Badge
              variant={profile?.role === "admin" ? "default" : "secondary"}
              className="mt-1"
            >
              {profile?.role ?? "user"}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t border-bg-border/60">
          {isDirty && (
            <p className="text-xs text-status-amber">You have unsaved changes</p>
          )}
          <div className="flex justify-end ml-auto">
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
