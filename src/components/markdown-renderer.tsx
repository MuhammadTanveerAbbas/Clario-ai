'use client'

import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []

    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl font-semibold text-white mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        )
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-white mt-4 mb-2">
            {line.replace('# ', '')}
          </h1>
        )
      }
      // Code blocks
      else if (line.startsWith('```')) {
        // Skip code block markers for now
        return
      }
      // Bold
      else if (line.includes('**')) {
        const parts = line.split('**')
        const formatted = parts.map((part, i) =>
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        )
        elements.push(
          <p key={index} className="text-white mb-2">
            {formatted}
          </p>
        )
      }
      // Regular paragraphs
      else if (line.trim()) {
        elements.push(
          <p key={index} className="text-white mb-2">
            {line}
          </p>
        )
      } else {
        elements.push(<br key={index} />)
      }
    })

    return elements
  }

  return <div className={className}>{renderContent(content)}</div>
}

