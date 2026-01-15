'use client'

import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null

  const renderContent = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let lineCounter = 0

    lines.forEach((line) => {
      const key = `line-${lineCounter++}`
      
      if (line.startsWith('### ')) {
        const text = line.slice(4).trim()
        elements.push(
          <h3 key={key} className="text-lg font-semibold text-white mt-4 mb-2">
            {text}
          </h3>
        )
      } else if (line.startsWith('## ')) {
        const text = line.slice(3).trim()
        elements.push(
          <h2 key={key} className="text-xl font-semibold text-white mt-4 mb-2">
            {text}
          </h2>
        )
      } else if (line.startsWith('# ')) {
        const text = line.slice(2).trim()
        elements.push(
          <h1 key={key} className="text-2xl font-bold text-white mt-4 mb-2">
            {text}
          </h1>
        )
      } else if (line.startsWith('```')) {
        return
      } else if (line.includes('**')) {
        const parts = line.split('**')
        const formatted = parts.map((part, i) =>
          i % 2 === 1 ? <strong key={`${key}-${i}`}>{part}</strong> : <span key={`${key}-${i}`}>{part}</span>
        )
        elements.push(
          <p key={key} className="text-white mb-2">
            {formatted}
          </p>
        )
      } else if (line.trim()) {
        elements.push(
          <p key={key} className="text-white mb-2">
            {line}
          </p>
        )
      } else {
        elements.push(<br key={key} />)
      }
    })

    return elements
  }

  return <div className={className}>{renderContent(content)}</div>
}
