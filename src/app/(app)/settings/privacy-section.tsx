"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function PrivacySection() {
  const supabase = createClient();
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleRequestExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const [summaries, chatMessages, chatSessions, voices] = await Promise.all([
        supabase.from("ai_summaries").select("id, title, content, created_at").eq("user_id", user.id),
        supabase.from("chat_messages").select("id, role, content, created_at").eq("user_id", user.id),
        supabase.from("chat_sessions").select("id, title, created_at").eq("user_id", user.id),
        supabase.from("brand_voices").select("id, name, tone, vocabulary, personality, description, created_at").eq("user_id", user.id),
      ]);
      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        summaries: summaries.data || [],
        chat_messages: chatMessages.data || [],
        chat_sessions: chatSessions.data || [],
        brand_voices: voices.data || [],
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clario-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.")) return;
    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== "DELETE") { alert("Account deletion cancelled."); return; }
    if (!user) return;
    setDeleting(true);
    try {
      await Promise.all([
        supabase.from("ai_summaries").delete().eq("user_id", user.id),
        supabase.from("chat_messages").delete().eq("user_id", user.id),
        supabase.from("chat_sessions").delete().eq("user_id", user.id),
        supabase.from("brand_voices").delete().eq("user_id", user.id),
        supabase.from("usage_tracking").delete().eq("user_id", user.id),
        supabase.from("calendar_events").delete().eq("user_id", user.id),
      ]);
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      alert("Failed to delete account. Please contact support at support@clario.ai.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ padding: "24px", background: "var(--card)", border: "1px solid var(--card-b)", borderRadius: 14 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: ".9rem", color: "var(--text)", fontWeight: 500, marginBottom: 4 }}>Data & Privacy</div>
          <div style={{ fontSize: ".8rem", color: "var(--text3)" }}>Control your data and privacy settings</div>
        </div>
        <div style={{ padding: "16px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: ".85rem", color: "var(--text)", fontWeight: 500, marginBottom: 3 }}>Export Your Data</div>
            <div style={{ fontSize: ".78rem", color: "var(--text3)" }}>Download all your summaries, chats, and documents as JSON</div>
          </div>
          <button
            onClick={handleRequestExport}
            disabled={exporting}
            style={{ padding: "8px 16px", background: "none", border: "1px solid var(--border2)", borderRadius: 8, color: "var(--text2)", fontSize: ".8rem", cursor: exporting ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap", opacity: exporting ? 0.6 : 1 }}
          >
            {exporting ? "Exporting..." : "Export Data"}
          </button>
        </div>
      </div>

      <div style={{ padding: "24px", background: "var(--card)", border: "1px solid rgba(248,113,113,.2)", borderRadius: 14 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: ".9rem", color: "var(--error)", fontWeight: 500, marginBottom: 4 }}>Danger Zone</div>
          <div style={{ fontSize: ".8rem", color: "var(--text3)" }}>Irreversible actions  proceed with caution</div>
        </div>
        <div style={{ padding: "16px", background: "rgba(248,113,113,.06)", border: "1px solid rgba(248,113,113,.15)", borderRadius: 10 }}>
          <div style={{ fontSize: ".85rem", color: "var(--text)", fontWeight: 500, marginBottom: 4 }}>Delete Account</div>
          <div style={{ fontSize: ".78rem", color: "var(--text3)", marginBottom: 14 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            style={{ padding: "9px 18px", background: "rgba(248,113,113,.15)", border: "1px solid rgba(248,113,113,.3)", borderRadius: 8, color: "var(--error)", fontSize: ".83rem", fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deleting ? 0.6 : 1 }}
          >
            {deleting ? "Deleting..." : "Delete My Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
