"use client";

import { useEffect, useState } from "react";
import { ListChecks, Plus } from "lucide-react";
import { Page, PageHeader, EmptyState } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QueueItem {
  id: string;
  comment_text: string;
  platform: string;
}

export default function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState("general");
  const [loading, setLoading] = useState(false);

  async function load() {
    const response = await fetch("/api/queue");
    const data = await response.json();
    setItems(data.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_text: text, platform }),
      });
      setText("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <PageHeader
        title="Queue"
        description="Stage comments and posts before you publish them."
      />

      <section className="surface mb-8">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <h2 className="text-[14px] font-semibold text-[var(--ink)]">
            Add to queue
          </h2>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
            Write the comment and set the platform.
          </p>
        </div>
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div>
            <Label htmlFor="queue-comment">Comment</Label>
            <Input
              id="queue-comment"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Write a comment..."
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="queue-platform">Platform</Label>
            <Input
              id="queue-platform"
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              className="mt-1.5 sm:max-w-xs"
            />
          </div>
          <Button type="button" onClick={add} disabled={!text.trim() || loading}>
            <Plus className="h-4 w-4" />
            {loading ? "Adding..." : "Add to queue"}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[14px] font-semibold text-[var(--ink)]">
          Queued items
        </h2>
        {items.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="Nothing queued"
            description="Add a comment above and it will wait here until you post it."
          />
        ) : (
          <ul className="surface divide-y divide-[var(--line)] overflow-hidden">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
              >
                <p className="min-w-0 flex-1 break-words text-[13px] text-[var(--ink-2)]">
                  {item.comment_text}
                </p>
                <span className="app-chip">{item.platform}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Page>
  );
}
