"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface SecuritySectionProps {
  userEmail?: string;
  onSignOut: () => Promise<void>;
}

export function SecuritySection({ userEmail, onSignOut }: SecuritySectionProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!newPassword || !confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all password fields." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      toast({ variant: "destructive", title: "Error", description: "Password must be at least 8 characters long." });
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: userEmail || "", password: currentPassword });
      if (signInError) throw new Error("Current password is incorrect");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated", description: "Your password has been successfully changed." });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to change password." });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--input)", border: "1px solid var(--input-b)", borderRadius: 10,
    padding: "10px 14px", color: "var(--text)", fontSize: ".85rem", fontFamily: "inherit",
    outline: "none", width: "100%", transition: "border-color .15s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Change password */}
      <div style={{ padding: "24px", background: "var(--card)", border: "1px solid var(--card-b)", borderRadius: 14 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: ".9rem", color: "var(--text)", fontWeight: 500, marginBottom: 4 }}>Change Password</div>
          <div style={{ fontSize: ".8rem", color: "var(--text3)" }}>Update your password to keep your account secure</div>
        </div>
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { id: "currentPassword", label: "Current Password" },
            { id: "newPassword", label: "New Password" },
            { id: "confirmPassword", label: "Confirm New Password" },
          ].map(field => (
            <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor={field.id} style={{ fontSize: ".8rem", color: "var(--text2)", fontWeight: 500 }}>{field.label}</label>
              <input
                id={field.id}
                name={field.id}
                type="password"
                required
                minLength={field.id !== "currentPassword" ? 8 : undefined}
                disabled={loading}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--input-b)"}
              />
            </div>
          ))}
          <div>
            <button
              type="submit"
              disabled={loading}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 9, fontSize: ".84rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Account security */}
      <div style={{ padding: "24px", background: "var(--card)", border: "1px solid var(--card-b)", borderRadius: 14 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: ".9rem", color: "var(--text)", fontWeight: 500, marginBottom: 4 }}>Account Security</div>
          <div style={{ fontSize: ".8rem", color: "var(--text3)" }}>Manage active sessions and security options</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Two-Factor Authentication", desc: "Add an extra layer of security", action: "Enable", color: "var(--success)" },
            { label: "Login Sessions", desc: "Manage active sessions", action: "View All", color: "var(--text2)" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: ".85rem", color: "var(--text)", fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: ".78rem", color: "var(--text3)", marginTop: 2 }}>{item.desc}</div>
              </div>
              <button style={{ padding: "6px 14px", background: "none", border: `1px solid var(--border2)`, borderRadius: 7, color: item.color, fontSize: ".78rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                {item.action}
              </button>
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 4 }}>
            <button
              onClick={onSignOut}
              style={{ width: "100%", padding: "10px", background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.25)", borderRadius: 9, color: "var(--error)", fontSize: ".84rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              Sign Out of All Devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
