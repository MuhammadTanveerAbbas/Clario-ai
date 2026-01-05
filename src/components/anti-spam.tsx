'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Honeypot field - hidden from users but visible to bots
export function HoneypotField() {
  return (
    <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
      <Label htmlFor="website">Website</Label>
      <Input
        type="text"
        id="website"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
    </div>
  )
}

// Rate limiting check for forms
export function useFormRateLimit(maxSubmissions: number = 3, windowMs: number = 60000) {
  const [submissions, setSubmissions] = useState<number[]>([])

  const canSubmit = () => {
    const now = Date.now()
    const recentSubmissions = submissions.filter((time) => now - time < windowMs)

    if (recentSubmissions.length >= maxSubmissions) {
      return false
    }

    setSubmissions([...recentSubmissions, now])
    return true
  }

  return { canSubmit }
}

// Email verification check
export function validateEmailDomain(email: string): boolean {
  // Block common disposable email domains
  const disposableDomains = [
    'tempmail.com',
    'guerrillamail.com',
    'mailinator.com',
    '10minutemail.com',
    'throwaway.email',
  ]

  const domain = email.split('@')[1]?.toLowerCase()
  return !disposableDomains.includes(domain || '')
}

