"use client";

import { useEffect, useState } from "react";
import { LayoutTemplate, Plus } from "lucide-react";
import { Page, PageHeader, EmptyState } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TemplateItem {
  id: string;
  title: string;
  category: string;
}

export default function TemplatesPage() {
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const response = await fetch("/api/templates");
    const data = await response.json();
    setItems(data.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, content }),
      });
      setTitle("");
      setContent("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <PageHeader
        title="Templates"
        description="Save reusable prompts and outlines for repeatable work."
      />

      <section className="surface mb-8">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <h2 className="text-[14px] font-semibold text-[var(--ink)]">
            New template
          </h2>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-3)]">
            Give it a title, a category, and the content to reuse.
          </p>
        </div>
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="template-title">Title</Label>
              <Input
                id="template-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="template-category">Category</Label>
              <Input
                id="template-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="template-content">Content</Label>
            <Textarea
              id="template-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={4}
              className="mt-1.5"
            />
          </div>
          <Button
            type="button"
            onClick={add}
            disabled={!title.trim() || !content.trim() || loading}
          >
            <Plus className="h-4 w-4" />
            {loading ? "Adding..." : "Add template"}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[14px] font-semibold text-[var(--ink)]">
          Saved templates
        </h2>
        {items.length === 0 ? (
          <EmptyState
            icon={LayoutTemplate}
            title="No templates yet"
            description="Create your first template above and reuse it any time."
          />
        ) : (
          <ul className="surface divide-y divide-[var(--line)] overflow-hidden">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
              >
                <span className="min-w-0 truncate text-[13px] font-medium text-[var(--ink)]">
                  {item.title}
                </span>
                <span className="app-chip">{item.category}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Page>
  );
}
