"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingPage } from "@/components/ui/loading-page";
import { Page, PageHeader, EmptyState } from "@/components/layout/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Pencil, Plus, Trash2, X } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface BrandVoice {
  id: string;
  name: string;
  tone?: string;
  vocabulary?: string;
  personality?: string;
  description?: string;
  examples?: string;
  is_active: boolean;
  created_at: string;
}

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  const borderColor = (type: Toast["type"]) =>
    type === "success" ? "#0f766e" : type === "error" ? "#b91c1c" : "var(--brand)";

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex max-w-[320px] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="flex items-center gap-3 rounded-lg border bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-medium)]"
          style={{ borderLeft: `3px solid ${borderColor(toast.type)}` }}
        >
          <span className="flex-1 text-[12.5px] font-medium text-[var(--ink-2)]">
            {toast.message}
          </span>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="flex h-5 w-5 items-center justify-center rounded text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

function VoiceSkeleton() {
  return (
    <div className="surface animate-pulse p-5">
      <div className="h-5 w-1/2 rounded bg-[var(--surface-3)]" />
      <div className="mt-4 h-3 w-full rounded bg-[var(--surface-3)]" />
      <div className="mt-2 h-3 w-4/5 rounded bg-[var(--surface-3)]" />
    </div>
  );
}

const FORM_FIELDS: {
  key: "name" | "tone" | "vocabulary" | "personality" | "description";
  label: string;
  placeholder: string;
  textarea?: boolean;
}[] = [
  { key: "name", label: "Voice name", placeholder: "e.g. My creator voice" },
  {
    key: "tone",
    label: "Tone",
    placeholder: "e.g. Conversational, professional, casual",
  },
  {
    key: "vocabulary",
    label: "Vocabulary",
    placeholder: "e.g. Simple and clear, technical, storytelling",
  },
  {
    key: "personality",
    label: "Personality",
    placeholder: "e.g. Witty and direct, warm, data-driven",
  },
  {
    key: "description",
    label: "Description",
    placeholder: "Any extra notes about this voice",
    textarea: true,
  },
];

export default function BrandVoicePage() {
  const supabase = useMemo(() => createClient(), []);
  const { user: authUser, loading: authLoading } = useAuth();

  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVoice, setEditingVoice] = useState<BrandVoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [form, setForm] = useState({
    name: "",
    tone: "",
    vocabulary: "",
    personality: "",
    description: "",
  });

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        4000
      );
    },
    []
  );
  const dismissToast = useCallback(
    (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  const loadVoices = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    const { data } = await supabase
      .from("brand_voices")
      .select(
        "id, name, tone, vocabulary, personality, description, examples, is_active, created_at"
      )
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false });
    setVoices(data || []);
    setLoading(false);
  }, [authUser, supabase]);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      setLoading(false);
      return;
    }
    loadVoices();
  }, [authUser, authLoading, loadVoices]);

  const openCreate = () => {
    setEditingVoice(null);
    setForm({
      name: "",
      tone: "",
      vocabulary: "",
      personality: "",
      description: "",
    });
    setModalOpen(true);
  };

  const openEdit = (voice: BrandVoice) => {
    setEditingVoice(voice);
    setForm({
      name: voice.name,
      tone: voice.tone || "",
      vocabulary: voice.vocabulary || "",
      personality: voice.personality || "",
      description: voice.description || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      addToast("Voice name is required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingVoice) {
        const { error } = await supabase
          .from("brand_voices")
          .update({
            name: form.name,
            tone: form.tone,
            vocabulary: form.vocabulary,
            personality: form.personality,
            description: form.description,
          })
          .eq("id", editingVoice.id);
        if (error) throw error;
        addToast("Voice updated", "success");
      } else {
        const { error } = await supabase.from("brand_voices").insert({
          user_id: authUser?.id,
          name: form.name,
          tone: form.tone,
          vocabulary: form.vocabulary,
          personality: form.personality,
          description: form.description,
          examples: form.description,
          is_active: false,
        });
        if (error) throw error;
        addToast("Voice saved", "success");
      }
      setModalOpen(false);
      loadVoices();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("brand_voices").delete().eq("id", id);
    if (error) {
      addToast("Failed to delete", "error");
      return;
    }
    addToast("Voice deleted", "info");
    setDeleteConfirm(null);
    loadVoices();
  };

  const handleToggleActive = async (voice: BrandVoice) => {
    const newActive = !voice.is_active;
    if (newActive) {
      await supabase
        .from("brand_voices")
        .update({ is_active: false })
        .eq("user_id", authUser?.id);
    }
    await supabase
      .from("brand_voices")
      .update({ is_active: newActive })
      .eq("id", voice.id);
    addToast(
      newActive
        ? `${voice.name} is now active on all outputs`
        : `${voice.name} deactivated`,
      "success"
    );
    loadVoices();
  };

  if (authLoading || !authUser) return <LoadingPage />;

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismissToast} />

      <Page>
        <PageHeader
          title="Brand voice"
          description="Teach Clario to write exactly like you. Every AI output will match your style."
          actions={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create voice
            </Button>
          }
        />

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <VoiceSkeleton />
            <VoiceSkeleton />
          </div>
        ) : voices.length === 0 ? (
          <div className="space-y-8">
            <EmptyState
              icon={Heart}
              title="Your voice, everywhere"
              description="Create a brand voice and Clario will automatically write in your style across summaries, remixes, and chats."
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Create your first voice
                </Button>
              }
            />

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [
                  "Sounds like you",
                  "Clario learns your tone, vocabulary, and personality.",
                ],
                [
                  "Always on",
                  "Activate a voice and it applies to every AI output.",
                ],
                [
                  "Multiple voices",
                  "Create different voices for different brands or projects.",
                ],
              ].map(([title, description]) => (
                <div key={title} className="surface-soft p-4">
                  <h2 className="text-[13px] font-semibold text-[var(--ink)]">
                    {title}
                  </h2>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {voices.map((voice) => (
              <article key={voice.id} className="surface p-5">
                <div className="flex items-start gap-2">
                  <h2 className="min-w-0 flex-1 font-serif text-[19px] font-medium leading-snug text-[var(--ink)]">
                    {voice.name}
                  </h2>
                  {voice.is_active ? (
                    <Badge variant="accent">Active</Badge>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(voice)}
                    aria-label={`Edit ${voice.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteConfirm(voice.id)}
                    aria-label={`Delete ${voice.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <dl className="mt-4 space-y-2.5">
                  {(
                    [
                      ["Tone", voice.tone],
                      ["Vocabulary", voice.vocabulary],
                      ["Personality", voice.personality],
                    ] as const
                  ).map(([label, value]) =>
                    value ? (
                      <div key={label}>
                        <dt className="text-[11px] font-medium text-[var(--ink-3)]">
                          {label}
                        </dt>
                        <dd className="mt-0.5 text-[13px] leading-relaxed text-[var(--ink-2)]">
                          {value}
                        </dd>
                      </div>
                    ) : null
                  )}
                </dl>

                {voice.description ? (
                  <p className="mt-3 border-t border-[var(--line)] pt-3 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
                    {voice.description}
                  </p>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
                  <span className="text-[13px] text-[var(--ink-2)]">
                    Apply to all outputs
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={voice.is_active}
                    aria-label={`Apply ${voice.name} to all outputs`}
                    onClick={() => handleToggleActive(voice)}
                    className="relative h-[24px] w-[42px] shrink-0 rounded-full border transition-colors"
                    style={{
                      background: voice.is_active
                        ? "var(--brand)"
                        : "var(--surface-3)",
                      borderColor: voice.is_active
                        ? "var(--brand)"
                        : "var(--line-strong)",
                    }}
                  >
                    <span
                      className="absolute top-[3px] h-[16px] w-[16px] rounded-full bg-paper transition-transform"
                      style={{ left: voice.is_active ? 22 : 3 }}
                    />
                  </button>
                </div>

                {deleteConfirm === voice.id ? (
                  <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3">
                    <p className="text-[12.5px] text-[var(--ink-2)]">
                      Delete &quot;{voice.name}&quot;? This cannot be undone.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(voice.id)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </Page>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center overflow-y-auto bg-overlay p-5"
          onClick={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="voice-dialog-title"
            className="w-full max-w-[540px] rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-medium)]"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="voice-dialog-title"
                  className="font-serif text-[22px] font-medium text-[var(--ink)]"
                >
                  {editingVoice ? "Edit voice" : "Create voice"}
                </h2>
                <p className="mt-1 text-[12.5px] text-[var(--ink-3)]">
                  Describe how this voice should sound.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModalOpen(false)}
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {FORM_FIELDS.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={`voice-${field.key}`}>
                    {field.label}
                    {field.key === "name" ? (
                      <span className="text-[var(--brand)]"> *</span>
                    ) : null}
                  </Label>
                  {field.textarea ? (
                    <Textarea
                      id={`voice-${field.key}`}
                      value={form[field.key]}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          [field.key]: event.target.value,
                        }))
                      }
                      placeholder={field.placeholder}
                      rows={3}
                      className="mt-1.5"
                    />
                  ) : (
                    <Input
                      id={`voice-${field.key}`}
                      value={form[field.key]}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          [field.key]: event.target.value,
                        }))
                      }
                      placeholder={field.placeholder}
                      className="mt-1.5"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save voice"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
