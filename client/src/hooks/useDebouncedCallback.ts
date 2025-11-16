import { useRef, useCallback } from "react";

/**
 * Custom hook for debouncing expensive operations
 * Prevents duplicate API calls from rapid user interactions
 * 
 * @param fn - The function to debounce
 * @param delay - Delay in milliseconds (default: 400ms)
 * @returns Debounced version of the function
 * 
 * @example
 * const handleGeneratePersonas = useDebouncedCallback(() => {
 *   // Expensive OpenAI call
 *   generatePersonas();
 * }, 500);
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  delay = 400
): T {
  const timeoutRef = useRef<number | null>(null);

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        fn(...args);
        timeoutRef.current = null;
      }, delay) as unknown as number;
    },
    [fn, delay]
  ) as T;
}
