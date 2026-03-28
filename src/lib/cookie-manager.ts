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
   * Builds a Set-Cookie header string with the appropriate security prefix.
   * Uses `__Host-` when no domain is set (stricter), `__Secure-` otherwise.
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

  /** Parses a raw Cookie header string into a key-value map. */
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

  /** Expires a cookie immediately by setting Max-Age=0. */
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

  /** Rejects values containing XSS vectors before they're stored in a cookie. */
  static validateCookieValue(value: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /eval\(/i,
    ]

    return !suspiciousPatterns.some(pattern => pattern.test(value))
  }

  static sanitizeCookieValue(value: string): string {
    return value
      .replace(/[<>'"]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  }
}
