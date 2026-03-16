'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Bot, User, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
  onCopy: (content: string) => void
}

export function ChatMessage({ message, onCopy }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = () => {
    onCopy(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-[#4169E1] to-[#6B8EFF]">
            <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
        <Card className={`${
          isUser
            ? 'bg-gradient-to-br from-[#4169E1] to-[#6B8EFF] border-[#4169E1]/30'
            : 'bg-white/5 border-white/10'
        } rounded-2xl ${isUser ? 'rounded-tr-md' : 'rounded-tl-md'}`}>
          <CardContent className="p-3 md:p-4">
            {isUser ? (
              <p className="text-white text-sm md:text-base whitespace-pre-wrap break-words">
                {message.content}
              </p>
            ) : (
              <div className="prose prose-invert prose-sm md:prose-base max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code: ({ node, inline, className, children, ...props }: any) => {
                      if (inline) {
                        return (
                          <code
                            className="bg-white/10 text-blue-300 px-1.5 py-0.5 rounded text-sm font-semibold"
                            {...props}
                          >
                            {children}
                          </code>
                        )
                      }
                      return (
                        <pre className="bg-gray-900 rounded-lg p-3 md:p-4 overflow-x-auto my-2">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      )
                    },
                    strong: ({ node, ...props }: any) => (
                      <strong className="font-bold text-white" {...props} />
                    ),
                    em: ({ node, ...props }: any) => (
                      <em className="italic text-gray-200" {...props} />
                    ),
                    a: ({ node, ...props }: any) => (
                      <a
                        className="text-blue-400 hover:text-blue-300 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }: any) => (
                      <p className="text-white mb-3 last:mb-0 leading-relaxed" {...props} />
                    ),
                    ul: ({ node, ...props }: any) => (
                      <ul className="list-disc list-inside text-white space-y-2 my-2 ml-2" {...props} />
                    ),
                    ol: ({ node, ...props }: any) => (
                      <ol className="list-decimal list-inside text-white space-y-2 my-2 ml-2" {...props} />
                    ),
                    li: ({ node, ...props }: any) => (
                      <li className="text-white leading-relaxed" {...props} />
                    ),
                    h1: ({ node, ...props }: any) => (
                      <h1 className="text-xl md:text-2xl font-bold text-white mt-4 mb-3" {...props} />
                    ),
                    h2: ({ node, ...props }: any) => (
                      <h2 className="text-lg md:text-xl font-bold text-white mt-4 mb-2" {...props} />
                    ),
                    h3: ({ node, ...props }: any) => (
                      <h3 className="text-base md:text-lg font-bold text-white mt-3 mb-2" {...props} />
                    ),
                    blockquote: ({ node, ...props }: any) => (
                      <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-300 my-3 bg-white/5 py-2 rounded" {...props} />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0 text-gray-500 hover:text-white hover:bg-white/10"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700">
            <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
