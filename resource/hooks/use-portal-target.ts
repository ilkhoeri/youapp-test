'use client';

import { useEffect, useState } from 'react';

type Target = '#' | '[data-]' | '.' | 'fragment' | (string & {});

export function usePortalTarget(selectors: Target | Target[]) {
  const [target, setTarget] = useState<Element | DocumentFragment | null>(null);

  useEffect(() => {
    const selectorList = Array.isArray(selectors) ? selectors : [selectors];

    if (typeof window === 'undefined') return;

    const resolve = () =>
      selectorList
        .map(s => {
          if (s.startsWith('#')) {
            return document.getElementById(s.slice(1));
          }

          if (s === 'fragment') {
            return document.createDocumentFragment();
          }

          return document.querySelector(s);
        })
        .find(Boolean) ?? null;

    const found = resolve();

    if (found) {
      setTarget(found);
      return;
    }

    // Jika belum ditemukan, observe DOM perubahan
    const observer = new MutationObserver(() => {
      const el = resolve();
      if (el) {
        setTarget(el);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [Array.isArray(selectors) ? selectors.join(',') : selectors]);

  return target;
}
