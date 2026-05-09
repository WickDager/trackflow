"use client";

import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  fullName: string;
  email: string;
  onAvatarChange: (base64: string) => void;
}

export function AvatarUpload({
  currentAvatarUrl,
  fullName,
  email,
  onAvatarChange,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      onAvatarChange(base64);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="h-24 w-24 border-2 border-bg-border/60">
        <AvatarImage src={previewUrl ?? undefined} />
        <AvatarFallback className="bg-bg-elevated text-xl text-ink-primary">
          {getInitials(fullName || email)}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs"
        >
          <Camera className="mr-1 h-3 w-3" />
          Change photo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload avatar image"
        />
        <p className="text-xs text-ink-muted">JPG, PNG or GIF. Max 5MB.</p>
      </div>
    </div>
  );
}
