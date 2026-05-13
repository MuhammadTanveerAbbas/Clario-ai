"use client";

import type { Components } from "react-markdown";

/** ReactMarkdown component map for dark surfaces (chat bubbles, remix cards). */
export function getMarkdownDarkComponents(): Partial<Components> {
  return {
    script: () => null,
    p: ({ children, ...props }) => (
      <p className="mb-2 last:mb-0 text-[var(--text)]" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul className="list-disc pl-4 mb-2 space-y-1 text-[var(--text)]" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal pl-4 mb-2 space-y-1 text-[var(--text)]" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="leading-relaxed" {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-white" {...props}>
        {children}
      </strong>
    ),
    h1: ({ children, ...props }) => (
      <h1 className="text-xl font-semibold mb-2 mt-3 text-white" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-lg font-semibold mb-2 mt-3 text-white" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-base font-semibold mb-2 mt-3 text-white" {...props}>
        {children}
      </h3>
    ),
    code: ({ className, children, ...props }) => {
      const inline = !className;
      if (inline) {
        return (
          <code
            className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono text-[var(--text2)]"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <pre
        className="bg-white/10 rounded-lg p-3 overflow-x-auto my-2 text-sm"
        {...props}
      >
        {children}
      </pre>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-2 border-white/30 pl-3 italic text-white/70 my-2"
        {...props}
      >
        {children}
      </blockquote>
    ),
    a: ({ children, ...props }) => (
      <a
        className="underline text-blue-400 hover:text-blue-300"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
    hr: (props) => <hr className="border-white/20 my-3" {...props} />,
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-2">
        <table className="w-full text-sm border-collapse" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th
        className="border border-white/20 px-3 py-1 bg-white/10 font-semibold text-left text-white"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="border border-white/20 px-3 py-1 text-[var(--text2)]" {...props}>
        {children}
      </td>
    ),
  };
}
