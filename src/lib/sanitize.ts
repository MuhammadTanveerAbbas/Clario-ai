/**
 * HTML sanitization utilities to prevent XSS attacks
 */

const ALLOWED_TAGS = ['h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'blockquote', 'cite', 'span', 'strong', 'em', 'br'];
const ALLOWED_ATTRS = ['class'];

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: simple text-based sanitization
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const sanitize = (node: Element) => {
    const tagName = node.tagName.toLowerCase();
    
    if (!ALLOWED_TAGS.includes(tagName)) {
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }
    
    Array.from(node.attributes).forEach(attr => {
      if (!ALLOWED_ATTRS.includes(attr.name)) {
        node.removeAttribute(attr.name);
      }
    });
    
    Array.from(node.children).forEach(child => sanitize(child as Element));
  };
  
  Array.from(doc.body.children).forEach(child => sanitize(child as Element));
  
  return doc.body.innerHTML;
}
