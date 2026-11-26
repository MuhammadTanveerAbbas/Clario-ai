"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Bot, User, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  onCopy: (content: string) => void;
}

export function ChatMessage({ message, onCopy }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-5`}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
          <AvatarFallback className="bg-brand">
            <Bot className="h-4 w-4 text-code-surface" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[88%] md:max-w-[72%]`}
      >
        <Card
          className={`${
            isUser
              ? "bg-form-line border-ink"
              : "bg-code-ink border-form-line"
          } rounded-2xl ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
        >
          <CardContent className="p-3.5 md:p-4">
            {isUser ? (
              <p className="text-code-surface text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            ) : (
              <div className="chat-markdown">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    script: () => null,
                    p: ({ node, ...props }: any) => (
                      <p
                        className="text-code-surface mb-3 last:mb-0 leading-[1.7] text-[14.5px]"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }: any) => (
                      <ul
                        className="list-disc pl-5 text-code-surface space-y-1.5 my-3"
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }: any) => (
                      <ol
                        className="list-decimal pl-5 text-code-surface space-y-1.5 my-3"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }: any) => (
                      <li className="text-code-surface leading-[1.6] text-[14.5px]" {...props} />
                    ),
                    strong: ({ node, ...props }: any) => (
                      <strong className="font-semibold text-code-surface" {...props} />
                    ),
                    em: ({ node, ...props }: any) => (
                      <em className="italic text-code-muted" {...props} />
                    ),
                    h1: ({ node, ...props }: any) => (
                      <h1
                        className="text-lg font-bold text-code-surface mt-4 mb-2"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }: any) => (
                      <h2
                        className="text-base font-bold text-code-surface mt-3 mb-2"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }: any) => (
                      <h3
                        className="text-[15px] font-semibold text-code-surface mt-3 mb-1.5"
                        {...props}
                      />
                    ),
                    code: ({
                      node,
                      inline,
                      className,
                      children,
                      ...props
                    }: any) => {
                      if (inline) {
                        return (
                          <code
                            className="bg-form-line text-brand-2 px-1.5 py-0.5 rounded text-[13px] font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <pre className="bg-ink rounded-lg p-3.5 overflow-x-auto my-3 border border-form-line">
                          <code className="text-sm font-mono text-code-muted" {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    pre: ({ node, ...props }: any) => <>{props.children}</>,
                    blockquote: ({ node, ...props }: any) => (
                      <blockquote
                        className="border-l border-brand pl-4 text-code-muted my-3 bg-form-line py-2.5 pr-3 rounded-r-lg"
                        {...props}
                      />
                    ),
                    a: ({ node, ...props }: any) => (
                      <a
                        className="text-brand-2 hover:text-brand underline underline-offset-2"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                    hr: ({ node, ...props }: any) => (
                      <hr className="border-form-line my-4" {...props} />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 mt-1.5 px-1">
          <span className="text-[11px] text-code-muted">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {!isUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 w-6 p-0 text-code-muted hover:text-code-surface hover:bg-form-line"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
          <AvatarFallback className="bg-form-line">
            <User className="h-4 w-4 text-code-surface" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
