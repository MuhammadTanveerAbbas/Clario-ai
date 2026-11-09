"use client";

import { useState, useEffect } from "react";
import { Brain, Loader2 } from "lucide-react";
import { Page, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MemoryForm {
  full_name: string;
  profession: string;
  industry: string;
  target_audience: string;
  use_case: string;
}

const EMPTY_FORM: MemoryForm = {
  full_name: "",
  profession: "",
  industry: "",
  target_audience: "",
  use_case: "",
};

export default function AiMemoryPage() {
  const [form, setForm] = useState<MemoryForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/ai-memory")
      .then((response) => response.json())
      .then((data) => {
        if (data?.memory) {
          setForm({
            full_name: data.memory.full_name || "",
            profession: data.memory.profession || "",
            industry: data.memory.industry || "",
            target_audience: data.memory.target_audience || "",
            use_case: data.memory.use_case || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/ai-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Save failed");
      setMessage("Saved");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page>
      <PageHeader
        title="AI memory"
        description="Give the AI context about you, your work, and your audience."
      />

      <section className="surface max-w-3xl">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--brand)]">
              <Brain className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-[14px] font-semibold text-[var(--ink)]">
                Context profile
              </h2>
              <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">
                Used to tailor every generation.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="memory-name">Full name</Label>
              <Input
                id="memory-name"
                value={form.full_name}
                onChange={(event) =>
                  setForm({ ...form, full_name: event.target.value })
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="memory-profession">Profession</Label>
              <Input
                id="memory-profession"
                value={form.profession}
                onChange={(event) =>
                  setForm({ ...form, profession: event.target.value })
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="memory-industry">Industry</Label>
              <Input
                id="memory-industry"
                value={form.industry}
                onChange={(event) =>
                  setForm({ ...form, industry: event.target.value })
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="memory-audience">Target audience</Label>
              <Input
                id="memory-audience"
                value={form.target_audience}
                onChange={(event) =>
                  setForm({ ...form, target_audience: event.target.value })
                }
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="memory-use-case">Use case</Label>
            <Textarea
              id="memory-use-case"
              value={form.use_case}
              onChange={(event) =>
                setForm({ ...form, use_case: event.target.value })
              }
              rows={3}
              placeholder="How do you use Clario day to day?"
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Save memory"}
            </Button>
            {message ? (
              <p
                className={
                  message === "Saved"
                    ? "text-[12.5px] font-medium text-[var(--success)]"
                    : "text-[12.5px] font-medium text-[var(--error)]"
                }
                role="status"
              >
                {message}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </Page>
  );
}
