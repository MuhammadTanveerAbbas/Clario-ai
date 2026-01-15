'use client'

import { useEffect, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'

interface AutoExpandTextareaProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  disabled?: boolean
  maxRows?: number
}

export function AutoExpandTextarea({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
  maxRows = 5,
}: AutoExpandTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    const lineHeight = 24
    const maxHeight = lineHeight * maxRows
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`
  }, [value, maxRows])

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className="bg-white/5 border-white/20 text-white resize-none rounded-xl focus:ring-2 focus:ring-[#4169E1]/50 focus:border-[#4169E1]/50 transition-all text-sm md:text-base min-h-[48px] overflow-y-auto"
      rows={1}
    />
  )
}
