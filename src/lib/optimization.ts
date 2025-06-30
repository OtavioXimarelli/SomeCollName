import React, { memo, useMemo, useCallback } from 'react';

/**
 * Higher-order component for memoizing components with custom comparison
 * @param Component - The component to memoize
 * @param areEqual - Optional custom comparison function
 */
export function withMemo<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return memo(Component, areEqual);
}

/**
 * Hook for memoizing expensive calculations
 * @param factory - Function that returns the calculated value
 * @param deps - Dependencies array
 */
export function useExpensiveMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(() => {
    const start = performance.now();
    const result = factory();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development' && end - start > 100) {
      console.warn(
        `Expensive computation detected (${(end - start).toFixed(2)}ms).`,
        'Consider optimizing or moving to a Web Worker.'
      );
    }
    
    return result;
  }, deps);
}

/**
 * Hook for creating stable callback references with performance monitoring
 * @param callback - The callback function
 * @param deps - Dependencies array
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback((...args: Parameters<T>) => {
    const start = performance.now();
    const result = callback(...args);
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development' && end - start > 50) {
      console.warn(
        `Slow callback execution detected (${(end - start).toFixed(2)}ms).`,
        'Consider optimizing the callback.'
      );
    }
    
    return result;
  }, deps) as T;
}

/**
 * Utility for lazy loading components with loading fallback
 * Note: This should be used in .tsx files where JSX is supported
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return React.lazy(importFn);
}

/**
 * Hook for debouncing values with performance optimization
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 */
export function useOptimizedDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Hook for throttling function calls
 * @param callback - Function to throttle
 * @param delay - Delay in milliseconds
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = React.useRef(Date.now());
  
  return useCallback((...args: Parameters<T>) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]) as T;
}

export default {
  withMemo,
  useExpensiveMemo,
  useStableCallback,
  createLazyComponent,
  useOptimizedDebounce,
  useThrottle,
};
