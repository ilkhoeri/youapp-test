'use client';
import { useCallback, useEffect, useRef } from 'react';

interface Options {
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
}
export function useMobileHistoryState(isMobile: boolean, opt: Options = {}) {
  const { open, onOpenChange } = opt;

  const hasPushedStateRef = useRef(false);

  // Push state ketika dibuka di perangkat mobile
  useEffect(() => {
    if (!isMobile || typeof open === 'undefined') return;

    if (open && !hasPushedStateRef.current && window.history.state?.open !== true) {
      window.history.pushState({ open: true }, '');
      hasPushedStateRef.current = true;
    }

    if (!open && hasPushedStateRef.current) {
      window.history.back();
      hasPushedStateRef.current = false;
    }
  }, [open, isMobile, hasPushedStateRef.current]);

  useEffect(() => {
    if (!isMobile || typeof onOpenChange === 'undefined') return;

    const handlePopState = (e: PopStateEvent) => {
      if (open) {
        onOpenChange(false);
        hasPushedStateRef.current = false;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobile, open, onOpenChange, hasPushedStateRef.current]);

  const handleOpenState = useCallback(
    (state: boolean) => {
      if (!isMobile) return;

      if (state && !hasPushedStateRef.current && window.history.state?.open !== true) {
        window.history.pushState({ open: true }, '');
        hasPushedStateRef.current = true;
      } else if (!state && hasPushedStateRef.current) {
        window.history.back();
        hasPushedStateRef.current = false;
      }
    },
    [isMobile, hasPushedStateRef.current]
  );

  return handleOpenState;
}
