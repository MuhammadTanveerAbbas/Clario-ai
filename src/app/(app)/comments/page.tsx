"use client";

import { useState } from "react";
import { Loader2, MessageSquareText, Sparkles } from "lucide-react";
import { Page, PageHeader, EmptyState } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CommentsPage() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("general");
  const [tone, setTone] = useState("friendly");
  const [count, setCount] = useState(3);
  const [comments, setComments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setComments([]);
    try {
      const response = await fetch("/api/comments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platform, tone, count }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed");
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <PageHeader
        title="Comment generator"
        description="Generate platform-ready comments with AI."
      />

      <section className="surface mb-8">
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div>
            <Label htmlFor="comments-content">Content</Label>
            <Textarea
              id="comments-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Paste a post or topic..."
              rows={5}
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="comments-platform">Platform</Label>
              <Input
                id="comments-platform"
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="comments-tone">Tone</Label>
              <Input
                id="comments-tone"
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="comments-count">Count</Label>
              <Input
                id="comments-count"
                type="number"
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
                min={1}
                max={10}
                className="mt-1.5"
              />
            </div>
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
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Generating..." : "Generate comments"}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[14px] font-semibold text-[var(--ink)]">
          Results
        </h2>
        {comments.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="No comments yet"
            description="Generate a set and each comment will appear here, ready to copy."
          />
        ) : (
          <ul className="surface divide-y divide-[var(--line)] overflow-hidden">
            {comments.map((comment, index) => (
              <li key={index} className="flex gap-3 px-5 py-4">
                <span className="font-serif text-[15px] font-medium text-[var(--brand)]">
                  {index + 1}
                </span>
                <p className="min-w-0 break-words text-[13.5px] leading-relaxed text-[var(--ink-2)]">
                  {comment}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Page>
  );
}
