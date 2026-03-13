import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

export function validateTextLength(text: string, maxLength: number = 50000): boolean {
  return text.length > 0 && text.length <= maxLength;
}

export function sanitizeAndValidate(input: string, maxLength: number = 50000): { 
  valid: boolean; 
  sanitized: string; 
  error?: string 
} {
  if (!input || typeof input !== 'string') {
    return { valid: false, sanitized: '', error: 'Invalid input' };
  }

  const sanitized = sanitizeInput(input.trim());
  
  if (!validateTextLength(sanitized, maxLength)) {
    return { 
      valid: false, 
      sanitized, 
      error: `Text must be between 1 and ${maxLength} characters` 
    };
  }

  return { valid: true, sanitized };
}
