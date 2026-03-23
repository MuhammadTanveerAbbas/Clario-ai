'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Bot } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start mb-4">
      <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
        <AvatarFallback style={{ background: "linear-gradient(to bottom right, var(--accent), var(--accent-m))" }}>
          <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
        </AvatarFallback>
      </Avatar>
      
      <Card className="bg-white/5 border-white/10 rounded-2xl rounded-tl-md">
        <CardContent className="p-4">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
