"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface ProfileData {
  name: string;
  email: string;
}
interface ProfileSectionProps {
  profile: ProfileData;
  userId?: string;
  onProfileUpdate: (name: string) => Promise<void>;
}

export function ProfileSection({
  profile,
  userId,
  onProfileUpdate,
}: ProfileSectionProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(profile.name);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    setName(profile.name);
  }, [profile.name]);

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!userId) throw new Error("User ID not found");
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: name })
        .eq("id", userId);
      if (error) throw error;
      await supabase.auth.updateUser({ data: { name } });
      await onProfileUpdate(name);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile.";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const initials = (profile.name || profile.email || "U")[0].toUpperCase();

  return (
    <div className="space-y-4">
      <div className="surface flex items-center gap-4 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] font-serif text-[22px] font-medium text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[var(--ink)]">
            {profile.name || "No name set"}
          </p>
          <p className="mt-0.5 truncate text-[12.5px] text-[var(--ink-3)]">
            {profile.email}
          </p>
        </div>
      </div>

      <section className="surface">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">
            Profile information
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
            Update your display name and account details.
          </p>
        </div>

        <form
          onSubmit={handleUpdateProfile}
          className="space-y-4 px-5 py-5 sm:px-6"
        >
          <div>
            <label htmlFor="name" className="field-label">
              Full name
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={loading}
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="email" className="field-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="field-input cursor-not-allowed opacity-60"
            />
            <p className="mt-1.5 text-[11.5px] text-[var(--ink-3)]">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </section>
    </div>
  );
}
