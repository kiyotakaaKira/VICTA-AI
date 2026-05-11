/**
 * frontend/src/utils/aiUtils.ts
 */

/**
 * Safely parse AI or Network errors into a human-readable format.
 * Prevents [object Object] from leaking into the UI.
 */
export const safeAIError = (error: any): string => {
  if (!error) return 'Unknown investigative error.';
  
  // If it's already a string
  if (typeof error === 'string') return error;

  // If it's a known error object from our backend
  if (error.error && typeof error.error === 'string') return error.error;
  
  // If it's a standard JS error
  if (error.message) return error.message;

  // Fallback to JSON stringify
  try {
    return JSON.stringify(error);
  } catch {
    return 'CRITICAL: Metadata corruption in error response.';
  }
};

/**
 * Debounce utility for AI prompts
 */
export const debounceAI = (fn: Function, ms = 2000) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};
