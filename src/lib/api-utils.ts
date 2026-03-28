import { NextResponse } from 'next/server'

/**
 * Safely parses the request body as JSON.
 * Returns a typed result object instead of throwing, so callers can handle
 * malformed payloads without try/catch boilerplate.
 */
export async function parseRequestJSON<T = any>(request: Request): Promise<{
  success: boolean
  data?: T
  error?: NextResponse
}> {
  try {
    const text = await request.text()
    
    if (!text || text.trim() === '') {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Request body is empty' },
          { status: 400 }
        ),
      }
    }

    const data = JSON.parse(text)
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      ),
    }
  }
}

/**
 * Checks that all required fields are present and truthy on a request body.
 * Returns a 400 response listing missing fields if validation fails.
 */
export function validateRequiredFields(
  data: any,
  fields: string[]
): { valid: boolean; error?: NextResponse } {
  const missing = fields.filter(field => !data[field])
  
  if (missing.length > 0) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      ),
    }
  }

  return { valid: true }
}
