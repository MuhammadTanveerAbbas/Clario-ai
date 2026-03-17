/**
 * Safe fetch wrapper that handles JSON parsing errors
 */
export async function safeFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    // Try to parse JSON
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, return text
        const text = await response.text();
        throw new Error(text || 'Invalid JSON response');
      }
    } else {
      // Non-JSON response
      const text = await response.text();
      data = { error: text || 'Invalid response format' };
    }
    
    return { response, data };
  } catch (error: any) {
    throw new Error(error.message || 'Network request failed');
  }
}
