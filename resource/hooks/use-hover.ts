'use client';
import { useState, useLayoutEffect, useRef, useCallback } from 'react';

interface UseHoverOptions {
  touch?: boolean;
  open?: boolean;
  onHoverChange?: (prev: boolean | ((pref: boolean) => boolean)) => void;
}

type Target<T> = (T | React.RefObject<T>) | null;

export function useHover<T extends HTMLElement | null>(targets?: Array<Target<T>>, opts: UseHoverOptions = {}) {
  const { touch = false, open, onHoverChange } = opts;

  const [opened, setOpened] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const hovered = open !== undefined ? open : opened;
  const setHovered = onHoverChange ?? setOpened;

  const ref = useRef<T>(null);

  const onMouseEnter = useCallback(() => {
    if (!isTouchDevice) setHovered(true);
  }, [isTouchDevice, setHovered]);

  const onMouseLeave = useCallback(() => {
    if (!isTouchDevice) setHovered(false);
  }, [isTouchDevice, setHovered]);

  const onMouseMove = useCallback(() => {
    if (isTouchDevice) setIsTouchDevice(false);
  }, [isTouchDevice]);

  const onTouchStart = useCallback(() => {
    if (touch) {
      setIsTouchDevice(true);
      setHovered(true);
    }
  }, [setHovered, touch]);

  const onTouchEnd = useCallback(() => {
    if (touch) setHovered(false);
  }, [setHovered, touch]);

  // Listen global touchstart/mousemove to detect input type
  useLayoutEffect(() => {
    const handleTouchStart = () => setIsTouchDevice(true);
    const handleMouseMove = () => setIsTouchDevice(false);

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useLayoutEffect(() => {
    const timer = requestAnimationFrame(() => {
      const resolvedTargets = (targets ?? []).map(target => (target && typeof target === 'object' && 'current' in target ? target.current : target)).filter((el): el is T => !!el);

      const current = ref.current;
      if (current) resolvedTargets.push(current);

      if (resolvedTargets.length === 0) return;

      const attachListeners = (el: T | null) => {
        if (!el) return;
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mousemove', onMouseMove);
        if (touch) {
          el.addEventListener('touchstart', onTouchStart);
          el.addEventListener('touchend', onTouchEnd);
        }
      };

      const detachListeners = (el: T | null) => {
        if (!el) return;
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.removeEventListener('mousemove', onMouseMove);
        if (touch) {
          el.removeEventListener('touchstart', onTouchStart);
          el.removeEventListener('touchend', onTouchEnd);
        }
      };

      resolvedTargets?.forEach(attachListeners);
      // cleanup
      return () => resolvedTargets.forEach(detachListeners);
    });

    return () => cancelAnimationFrame(timer);
  }, [
    targets?.map(t => (typeof t === 'object' && t !== null && 'current' in t ? t.current : t)), // Depend on the actual DOM nodes
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    onTouchStart,
    onTouchEnd,
    touch
  ]);

  return { ref, hovered, setHovered };
}
