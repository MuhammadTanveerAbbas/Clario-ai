"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface SecuritySectionProps {
  userEmail?: string;
  onSignOut: () => Promise<void>;
}

export function SecuritySection({ userEmail, onSignOut }: SecuritySectionProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all password fields.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match.",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail || "",
        password: currentPassword,
      });
      if (signInError) throw new Error("Current password is incorrect");
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to change password.";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: "currentPassword", label: "Current password" },
    { id: "newPassword", label: "New password" },
    { id: "confirmPassword", label: "Confirm new password" },
  ];

  return (
    <div className="space-y-4">
      <section className="surface">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">
            Change password
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
            Update your password to keep your account secure.
          </p>
        </div>

        <form
          onSubmit={handleChangePassword}
          className="space-y-4 px-5 py-5 sm:px-6"
        >
          {fields.map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="field-label">
                {field.label}
              </label>
              <input
                id={field.id}
                name={field.id}
                type="password"
                required
                minLength={field.id !== "currentPassword" ? 8 : undefined}
                disabled={loading}
                className="field-input"
              />
            </div>
          ))}
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </section>

      <section className="surface">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">
            Account security
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
            Manage active sessions and security options.
          </p>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="divide-y divide-[var(--line)] rounded-lg border border-[var(--line)]">
            {[
              {
                label: "Two-factor authentication",
                description: "Add an extra layer of security.",
                action: "Enable",
              },
              {
                label: "Login sessions",
                description: "Manage active sessions.",
                action: "View all",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[var(--ink)]">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-[var(--ink-3)]">
                    {item.description}
                  </p>
                </div>
                <Button variant="outline" size="sm" type="button">
                  {item.action}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-[var(--line)] pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={onSignOut}
              className="w-full border-danger-rule text-[var(--error)] hover:border-danger-rule hover:bg-danger-wash-soft hover:text-[var(--error)]"
            >
              Sign out of all devices
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
