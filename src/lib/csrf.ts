import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_TOKEN_COOKIE = 'csrf-token';

/** Generates a cryptographically random 32-byte hex token. */
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Validates the CSRF token by comparing the request header against the cookie value. */
export function validateCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get(CSRF_TOKEN_HEADER);
  const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;
  
  if (!token || !cookieToken || token !== cookieToken) {
    return false;
  }
  
  return true;
}

export function csrfProtection(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      if (!validateCSRFToken(req)) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        );
      }
    }
    
    return handler(req);
  };
}
