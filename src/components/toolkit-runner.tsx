"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Page, PageHeader, EmptyState } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ToolkitRunner({
  task,
  title,
  description,
}: {
  task: string;
  title: string;
  description: string;
}) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const response = await fetch("/api/ai/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, input }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed");
      setResult(data.result || "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <PageHeader title={title} description={description} />

      <section className="surface mb-8">
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div>
            <Label htmlFor={`toolkit-${task}`}>Input</Label>
            <Textarea
              id={`toolkit-${task}`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={5}
              placeholder="Paste your topic, draft, or source material..."
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
            onClick={run}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Working..." : "Generate"}
          </Button>
        </div>
      </section>

      {result ? (
        <section className="surface p-5 sm:p-6">
          <h2 className="mb-3 text-[14px] font-semibold text-[var(--ink)]">
            Result
          </h2>
          <p className="app-prose whitespace-pre-wrap">{result}</p>
        </section>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No result yet"
          description="Add your input above and run the tool to see the output."
        />
      )}
    </Page>
  );
}
