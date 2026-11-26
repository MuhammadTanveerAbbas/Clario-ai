'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-ink)', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <CheckCircle style={{ width: 48, height: 48, color: 'var(--color-success)', margin: '0 auto 16px' }} />
          <h1 style={{ color: 'var(--color-code-surface)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Password Updated</h1>
          <p style={{ color: 'var(--color-muted)', marginBottom: 24 }}>Your password has been reset successfully. Redirecting to dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-ink)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock style={{ width: 24, height: 24, color: 'var(--color-paper)' }} />
          </div>
          <h1 style={{ color: 'var(--color-code-surface)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Set New Password</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--color-danger-wash)', border: '1px solid var(--color-danger-rule)', borderRadius: 8, color: 'var(--color-danger-ink)', fontSize: 14 }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ color: 'var(--color-rule)', fontSize: 14, fontWeight: 500, marginBottom: 6, display: 'block' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="focus:outline-none focus-visible:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
                style={{ width: '100%', padding: '12px 40px 12px 16px', background: 'var(--color-code-ink)', border: '1px solid var(--form-line)', borderRadius: 8, color: 'var(--color-code-surface)', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', padding: 4 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ color: 'var(--color-rule)', fontSize: 14, fontWeight: 500, marginBottom: 6, display: 'block' }}>Confirm Password</label>
            <input
              type="password"
              className="focus:outline-none focus-visible:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              style={{ width: '100%', padding: '12px 16px', background: 'var(--color-code-ink)', border: '1px solid var(--form-line)', borderRadius: 8, color: 'var(--color-code-surface)', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '12px 24px', background: 'var(--color-accent)', border: 'none', borderRadius: 8, color: 'var(--color-accent-ink)', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}
          >
            {loading ? 'Updating…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
