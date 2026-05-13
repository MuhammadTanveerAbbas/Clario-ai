/** Removes control characters and caps length for safe plain-text DB fields. */
export function sanitizePlainText(text: string, maxLen = 200_000): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, maxLen);
}

/** YouTube watch / short URL for storage — strips control chars and caps length. */
export function sanitizeYoutubeUrl(url: string, maxLen = 2048): string {
  return sanitizePlainText(url.trim(), maxLen);
}

/** Strips script tags, event handlers, and other XSS vectors from HTML strings. */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
}
