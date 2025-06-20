'use client';

import { useState, useEffect, useRef } from 'react';

interface UseDebounceSearchOptions<T> {
  delay?: number;
  minLength?: number;
  onSearch: (query: string) => Promise<T> | void;
  immediate?: boolean;
}

interface UseDebounceSearchResult<T> {
  query: string;
  setQuery: (q: string) => void;
  isSearching: boolean;
  results: T | null;
  error: Error | null;
  reset: () => void;
}

/**
 * @example
 * import React from 'react';
 * import { useDebounceSearch } from './useDebounceSearch';
 * const mockApiSearch = async (query: string): Promise<string[]> => {
 *   // Simulasi API
 *   return new Promise((resolve) =>
 *     setTimeout(() => resolve([`Result for "${query}"`]), 1000)
 *   );
 * };
 * const SearchComponent: React.FC = () => {
 *   const { query, setQuery, isSearching, results, error } = useDebounceSearch<string[]>({
 *     delay: 600,
 *     minLength: 2,
 *     onSearch: mockApiSearch,
 *   });
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         value={query}
 *         onChange={(e) => setQuery(e.target.value)}
 *         placeholder="Search..."
 *       />
 *       {isSearching && <p>Loading...</p>}
 *       {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
 *       {results && (
 *         <ul>
 *           {results.map((item, i) => (
 *             <li key={i}>{item}</li>
 *           ))}
 *         </ul>
 *       )}
 *     </div>
 *   );
 * };
 * @param options with generic T
 * @returns T
 */
export function useDebounceSearch<T = any>(options: UseDebounceSearchOptions<T>): UseDebounceSearchResult<T> {
  const { delay = 500, minLength = 1, onSearch, immediate = false } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const abortController = useRef<AbortController | null>(null);

  const reset = () => {
    setQuery('');
    setResults(null);
    setIsSearching(false);
    setError(null);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (abortController.current) abortController.current.abort();
  };

  useEffect(() => {
    if (!immediate && isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (query.length < minLength) {
      setResults(null);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      (async () => {
        try {
          setIsSearching(true);
          setError(null);

          // Cancel previous requests
          if (abortController.current) {
            abortController.current.abort();
          }

          abortController.current = new AbortController();
          const signal = abortController.current.signal;

          const maybePromise = onSearch(query);

          if (maybePromise instanceof Promise) {
            const data = await maybePromise;
            if (!signal.aborted) {
              setResults(data);
            }
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            setError(err);
          }
        } finally {
          if (!abortController.current?.signal.aborted) {
            setIsSearching(false);
          }
        }
      })();
    }, delay);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  return {
    query,
    setQuery,
    isSearching,
    results,
    error,
    reset
  };
}

/**
 * @example
 * import React, { useState } from 'react';
 * import { useSearch } from './useDebounceSearch';
 * function SearchComponent() {
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useSearch(search, 500); // delay 500ms
 *   useEffect(() => {
 *     if (debouncedSearch) {
 *       // Call API or filter data
 *       console.log('Searching for:', debouncedSearch);
 *     }
 *   }, [debouncedSearch]);
 *   return (
 *     <input
 *       type="text"
 *       value={search}
 *       onChange={e => setSearch(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * }
 * @param value Generic T
 * @param delay number (default 300)
 * @returns T
 */
export function useSearch<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout if value changes (before delay finishes)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
