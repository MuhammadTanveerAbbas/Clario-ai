"use client";

import { useEffect, useState } from "react";
import { History, MessageSquareText, Wand2 } from "lucide-react";
import { Page, PageHeader, SectionHeading, EmptyState } from "@/components/layout/page";

interface HistoryData {
  comments?: { id: string; generated_comments: unknown }[];
  repurpose?: { id: string; source_text: string }[];
}

export default function HistoryPage() {
  const [data, setData] = useState<HistoryData | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((response) => response.json())
      .then(setData)
      .catch(() => setData({}));
  }, []);

  const comments = data?.comments ?? [];
  const repurpose = data?.repurpose ?? [];
  const isEmpty = data !== null && comments.length === 0 && repurpose.length === 0;

  return (
    <Page>
      <PageHeader
        title="History"
        description="Everything you have generated, in one place."
      />

      {data === null ? (
        <div className="space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-[var(--surface-3)]" />
          <div className="surface h-40 animate-pulse" />
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={History}
          title="No history yet"
          description="Generate comments or repurpose content and it will appear here."
        />
      ) : (
        <div className="space-y-8">
          {comments.length > 0 ? (
            <section>
              <SectionHeading
                title="Comments"
                description={`${comments.length} generated ${comments.length === 1 ? "set" : "sets"}.`}
              />
              <ul className="surface divide-y divide-[var(--line)] overflow-hidden">
                {comments.map((comment) => (
                  <li key={comment.id} className="flex gap-3 px-5 py-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)]">
                      <MessageSquareText className="h-4 w-4" strokeWidth={1.7} />
                    </span>
                    <p className="min-w-0 break-words text-[13px] leading-relaxed text-[var(--ink-2)]">
                      {JSON.stringify(comment.generated_comments).slice(0, 220)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {repurpose.length > 0 ? (
            <section>
              <SectionHeading
                title="Repurpose"
                description={`${repurpose.length} ${repurpose.length === 1 ? "run" : "runs"}.`}
              />
              <ul className="surface divide-y divide-[var(--line)] overflow-hidden">
                {repurpose.map((item) => (
                  <li key={item.id} className="flex gap-3 px-5 py-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)]">
                      <Wand2 className="h-4 w-4" strokeWidth={1.7} />
                    </span>
                    <p className="min-w-0 break-words text-[13px] leading-relaxed text-[var(--ink-2)]">
                      {String(item.source_text).slice(0, 220)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </Page>
  );
}
