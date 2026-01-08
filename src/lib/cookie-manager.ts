/**
 * Secure Cookie Manager
 * Handles cookie operations with enhanced security
 */

import { COOKIE_CONFIG } from './security-config'

export interface CookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  maxAge?: number
  path?: string
  domain?: string
}

export class CookieManager {
  private static readonly SECURE_PREFIX = '__Secure-'
  private static readonly HOST_PREFIX = '__Host-'

  /**
   * Set a secure cookie with proper prefixes
   */
  static setSecureCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
  ): string {
    const mergedOptions = { ...COOKIE_CONFIG, ...options }
    const prefix = mergedOptions.domain ? this.SECURE_PREFIX : this.HOST_PREFIX
    const cookieName = `${prefix}${name}`

    const parts = [
      `${cookieName}=${encodeURIComponent(value)}`,
      `Path=${mergedOptions.path}`,
      `Max-Age=${mergedOptions.maxAge}`,
      `SameSite=${mergedOptions.sameSite}`,
    ]

    if (mergedOptions.httpOnly) parts.push('HttpOnly')
    if (mergedOptions.secure) parts.push('Secure')
    if (mergedOptions.domain) parts.push(`Domain=${mergedOptions.domain}`)

    return parts.join('; ')
  }

  /**
   * Parse cookies from request headers
   */
  static parseCookies(cookieHeader: string | null): Record<string, string> {
    if (!cookieHeader) return {}

    return cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) {
        acc[key] = decodeURIComponent(value)
      }
      return acc
    }, {} as Record<string, string>)
  }

  /**
   * Delete a cookie by setting expired date
   */
  static deleteCookie(name: string, options: CookieOptions = {}): string {
    const mergedOptions = { ...COOKIE_CONFIG, ...options, maxAge: 0 }
    const prefix = mergedOptions.domain ? this.SECURE_PREFIX : this.HOST_PREFIX
    const cookieName = `${prefix}${name}`

    const parts = [
      `${cookieName}=`,
      `Path=${mergedOptions.path}`,
      'Max-Age=0',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    ]

    if (mergedOptions.domain) parts.push(`Domain=${mergedOptions.domain}`)

    return parts.join('; ')
  }

  /**
   * Validate cookie value for security
   */
  static validateCookieValue(value: string): boolean {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /eval\(/i,
    ]

    return !suspiciousPatterns.some(pattern => pattern.test(value))
  }

  /**
   * Sanitize cookie value
   */
  static sanitizeCookieValue(value: string): string {
    return value
      .replace(/[<>'"]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  }
}
