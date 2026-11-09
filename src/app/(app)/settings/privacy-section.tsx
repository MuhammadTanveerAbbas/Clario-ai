"use client";

import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

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
        supabase
          .from("ai_summaries")
          .select("id, title, content, created_at")
          .eq("user_id", user.id),
        supabase
          .from("chat_messages")
          .select("id, role, content, created_at")
          .eq("user_id", user.id),
        supabase
          .from("chat_sessions")
          .select("id, title, created_at")
          .eq("user_id", user.id),
        supabase
          .from("brand_voices")
          .select("id, name, tone, vocabulary, personality, description, created_at")
          .eq("user_id", user.id),
      ]);
      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        summaries: summaries.data || [],
        chat_messages: chatMessages.data || [],
        chat_sessions: chatSessions.data || [],
        brand_voices: voices.data || [],
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `clario-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[Privacy] Failed to export data:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted."
      )
    )
      return;
    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== "DELETE") {
      alert("Account deletion cancelled.");
      return;
    }
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
    } catch (error) {
      console.error("[Privacy] Failed to delete account:", error);
      alert("Failed to delete account. Please contact support at support@clario.ai.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="surface">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <h3 className="text-[14px] font-semibold text-[var(--ink)]">
            Data and privacy
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
            Control your data and privacy settings.
          </p>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-4">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[var(--ink)]">
                Export your data
              </p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--ink-3)]">
                Download all your summaries, chats, and documents as JSON.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleRequestExport}
              disabled={exporting}
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exporting..." : "Export data"}
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[rgba(180,35,24,0.25)] bg-[var(--surface)]">
        <div className="border-b border-[rgba(180,35,24,0.18)] px-5 py-4 sm:px-6">
          <h3 className="text-[14px] font-semibold text-[var(--error)]">
            Danger zone
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
            Irreversible actions. Proceed with caution.
          </p>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="rounded-lg border border-[rgba(180,35,24,0.18)] bg-[rgba(180,35,24,0.04)] p-4">
            <p className="text-[13px] font-medium text-[var(--ink)]">
              Delete account
            </p>
            <p className="mt-0.5 max-w-prose text-[11.5px] leading-relaxed text-[var(--ink-3)]">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="mt-4 border-[rgba(180,35,24,0.35)] text-[var(--error)] hover:border-[rgba(180,35,24,0.55)] hover:bg-[rgba(180,35,24,0.08)] hover:text-[var(--error)]"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Delete my account"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
