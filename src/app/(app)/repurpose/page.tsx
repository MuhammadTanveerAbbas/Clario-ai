"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { Page, PageHeader, EmptyState } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function RepurposePage() {
  const [content, setContent] = useState("");
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setOutputs({});
    try {
      const response = await fetch("/api/repurpose/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed");
      setOutputs(data.outputs || {});
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  const entries = Object.entries(outputs);

  return (
    <Page>
      <PageHeader
        title="Repurpose"
        description="Turn one piece of content into many platform versions."
      />

      <section className="surface mb-8">
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div>
            <Label htmlFor="repurpose-source">Source content</Label>
            <Textarea
              id="repurpose-source"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={6}
              placeholder="Paste a post, article, or transcript..."
              className="mt-1.5"
            />
          </div>
          {error ? (
            <p className="text-[12.5px] font-medium text-[var(--error)]">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !content.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {loading ? "Working..." : "Repurpose"}
          </Button>
        </div>
      </section>

      {entries.length > 0 ? (
        <div className="grid gap-4">
          {entries.map(([key, value]) => (
            <article key={key} className="surface p-5">
              <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--brand)]">
                {key}
              </h2>
              <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-[var(--ink-2)]">
                {value}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Wand2}
          title="No output yet"
          description="Paste your source content above and generate platform versions."
        />
      )}
    </Page>
  );
}
