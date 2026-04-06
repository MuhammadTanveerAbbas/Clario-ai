"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface ProfileData { name: string; email: string; }
interface ProfileSectionProps {
  profile: ProfileData;
  userId?: string;
  onProfileUpdate: (name: string) => Promise<void>;
}

export function ProfileSection({ profile, userId, onProfileUpdate }: ProfileSectionProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(profile.name);
  const { toast } = useToast();
  const supabase = createClient();

  // Update name when profile changes
  useEffect(() => {
    setName(profile.name);
  }, [profile.name]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!userId) throw new Error("User ID not found");
      const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", userId);
      if (error) throw error;
      await supabase.auth.updateUser({ data: { name } });
      await onProfileUpdate(name);
      toast({ title: "Profile updated", description: "Your profile has been successfully updated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const initials = (profile.name || profile.email || "U")[0].toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px", background: "var(--card)", border: "1px solid var(--card-b)", borderRadius: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", color: "#fff", fontWeight: 600, flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: ".95rem", color: "var(--text)", fontWeight: 500 }}>{profile.name || "No name set"}</div>
          <div style={{ fontSize: ".8rem", color: "var(--text3)", marginTop: 2 }}>{profile.email}</div>
        </div>
      </div>

      <div style={{ padding: "24px", background: "var(--card)", border: "1px solid var(--card-b)", borderRadius: 14 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: ".9rem", color: "var(--text)", fontWeight: 500, marginBottom: 4 }}>Profile Information</div>
          <div style={{ fontSize: ".8rem", color: "var(--text3)" }}>Update your display name and account details</div>
        </div>
        <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="name" style={{ fontSize: ".8rem", color: "var(--text2)", fontWeight: 500 }}>Full Name</label>
            <input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
              style={{ background: "var(--input)", border: "1px solid var(--input-b)", borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: ".85rem", fontFamily: "inherit", outline: "none", transition: "border-color .15s" }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--input-b)"}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="email" style={{ fontSize: ".8rem", color: "var(--text2)", fontWeight: 500 }}>Email Address</label>
            <input
              id="email"
              type="email"
              value={profile.email}
              disabled
              style={{ background: "var(--input)", border: "1px solid var(--input-b)", borderRadius: 10, padding: "10px 14px", color: "var(--text3)", fontSize: ".85rem", fontFamily: "inherit", opacity: 0.6, cursor: "not-allowed" }}
            />
            <span style={{ fontSize: ".75rem", color: "var(--text3)" }}>Email cannot be changed. Contact support if needed.</span>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 9, fontSize: ".84rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit", transition: "opacity .15s" }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
