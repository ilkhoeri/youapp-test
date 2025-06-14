'use client';
import { useCallback, useEffect, useState } from 'react';
import { useMeasureScrollbar } from './use-measure-scrollbar.ts';

export interface UseModalOptions {
  modal?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  /** @default 300 */
  exitDuration?: number;
  onOpenChange?: (prev: boolean | ((prev: boolean) => boolean)) => void;
}

export function useModal(opts: UseModalOptions = {}) {
  const { defaultOpen = false, open: openProp, onOpenChange: setOpenProp, modal, exitDuration = 300 } = opts;

  const [_open, _setOpen] = useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) setOpenProp(openState);
      else _setOpen(openState);
    },
    [setOpenProp, open]
  );

  const [isRender, setRender] = useState(open);

  useEffect(() => {
    if (open) {
      setRender(true);
    } else {
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => setRender(false), exitDuration); // Match this with your exit animation duration
      return () => clearTimeout(timer);
    }
  }, [open, setOpen]);

  // 🔑 ESC key handler
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  useMeasureScrollbar(isRender, { modal });

  return { open, setOpen, isRender };
}
