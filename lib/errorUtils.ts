/**
 * Utility functions for safely handling and serializing errors
 * Prevents "frame.join is not a function" errors in Next.js Server Components
 */

export function sanitizeError(error: unknown): Error {
  if (error instanceof Error) {
    // Ensure the stack is either a string or undefined (never an object/array)
    const sanitized = new Error(error.message)
    
    if (typeof error.stack === 'string') {
      sanitized.stack = error.stack
    } else if (error.stack) {
      // If stack is not a string, convert it to a string
      sanitized.stack = String(error.stack)
    }
    
    return sanitized
  }
  
  // If it's not an Error, wrap it
  return new Error(String(error))
}

export function tryCatch<T>(
  fn: () => T,
  fallback: T,
  errorPrefix: string = ''
): T {
  try {
    return fn()
  } catch (error) {
    const safeError = sanitizeError(error)
    console.error(`${errorPrefix}:`, safeError.message)
    return fallback
  }
}

export async function tryCatchAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  errorPrefix: string = ''
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    const safeError = sanitizeError(error)
    console.error(`${errorPrefix}:`, safeError.message)
    return fallback
  }
}
