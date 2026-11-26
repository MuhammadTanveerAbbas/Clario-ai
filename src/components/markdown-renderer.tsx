"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getMarkdownComponents } from "@/lib/markdown-components";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={getMarkdownComponents()}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
