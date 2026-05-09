"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteUserSchema, type InviteUserInput } from "@/lib/validations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InviteUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteUserForm({ open, onOpenChange }: InviteUserFormProps) {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      role: "user",
    },
  });

  async function handleFormSubmit(data: InviteUserInput) {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setError("Server configuration error. Please try again later.");
        setLoading(false);
        return;
      }

      const supabase = (await import("@supabase/supabase-js")).createClient(supabaseUrl, supabaseKey);

      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(data.email, {
        data: { role: data.role },
      });

      if (inviteError) {
        setError(inviteError.message);
        setLoading(false);
        return;
      }

      setSuccess(`Invitation sent to ${data.email}`);
      setTimeout(() => {
        setSuccess(null);
        reset();
        onOpenChange(false);
      }, 2000);
    } catch {
      setError("Failed to send invitation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to join the Trackflow panel.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
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
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-status-red">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                defaultValue="user"
                onValueChange={(value) =>
                  setValue("role", value as "admin" | "user")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-status-red">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
