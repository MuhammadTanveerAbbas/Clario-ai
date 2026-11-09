"use client";

import type { Components } from "react-markdown";

/**
 * ReactMarkdown component map for generated content surfaces.
 * Kept under the original export name so existing callers keep working.
 */
export function getMarkdownDarkComponents(): Partial<Components> {
  return {
    script: () => null,
    p: ({ children, ...props }) => (
      <p
        className="mb-2.5 text-[14px] leading-[1.7] text-[var(--ink-2)] last:mb-0"
        {...props}
      >
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul
        className="mb-2.5 list-disc space-y-1 pl-5 text-[var(--ink-2)]"
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol
        className="mb-2.5 list-decimal space-y-1 pl-5 text-[var(--ink-2)]"
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="leading-[1.65]" {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-[var(--ink)]" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic text-[var(--ink-2)]" {...props}>
        {children}
      </em>
    ),
    h1: ({ children, ...props }) => (
      <h1
        className="mb-2 mt-4 font-serif text-[20px] font-semibold leading-tight text-[var(--ink)] first:mt-0"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        className="mb-1.5 mt-4 font-serif text-[17px] font-semibold leading-tight text-[var(--ink)] first:mt-0"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className="mb-1 mt-3 text-[14.5px] font-semibold leading-tight text-[var(--ink)] first:mt-0"
        {...props}
      >
        {children}
      </h3>
    ),
    code: ({ className, children, ...props }) => {
      const inline = !className;
      if (inline) {
        return (
          <code
            className="rounded bg-[var(--surface-3)] px-1.5 py-0.5 font-mono text-[12.5px] text-[var(--brand)]"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code className={`${className} font-mono text-sm`} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <pre
        className="my-3 overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3.5 text-[13px]"
        {...props}
      >
        {children}
      </pre>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="my-3 rounded-r-lg border-l-[3px] border-[var(--brand-line)] bg-[var(--surface-2)] py-2 pl-4 pr-3 text-[var(--ink-2)]"
        {...props}
      >
        {children}
      </blockquote>
    ),
    a: ({ children, ...props }) => (
      <a
        className="text-[var(--brand)] underline underline-offset-2"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
    hr: (props) => (
      <hr className="my-4 border-[var(--line)]" {...props} />
    ),
    table: ({ children, ...props }) => (
      <div className="my-3 overflow-x-auto">
        <table className="w-full border-collapse text-[13px]" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th
        className="border border-[var(--line)] bg-[var(--surface-2)] px-3 py-1.5 text-left font-semibold text-[var(--ink)]"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td
        className="border border-[var(--line)] px-3 py-1.5 text-[var(--ink-2)]"
        {...props}
      >
        {children}
      </td>
    ),
  };
}
