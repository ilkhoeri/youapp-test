'use client';
import { useCallback, useLayoutEffect, useState } from 'react';
import { SizeElement } from './use-element-info';
import { createPortal } from 'react-dom';

enum DataAlign {
  start = 'start',
  center = 'center',
  end = 'end'
}
enum DataSide {
  top = 'top',
  right = 'right',
  bottom = 'bottom',
  left = 'left'
}

export type RectInfo = 'x' | 'y' | 'width' | 'height' | 'top' | 'right' | 'bottom' | 'left' | 'scrollX' | 'scrollY';

export type RectElement = Record<RectInfo, number>;

const BUFFER_OFFSET = 2;

function nextValue<T>(currentValue: T, values: T[]): T {
  const currentIndex = values.indexOf(currentValue);
  const nextIndex = (currentIndex + 1) % values.length;
  if (currentIndex === values.length - 1) return values[currentIndex];
  return values[nextIndex];
}

export function setValues<T>(state: boolean | undefined | string | number, attr: T): T | Record<string, never> {
  return state ? (attr as T) : {};
}

interface GetInsetProps {
  align: 'start' | 'center' | 'end';
  side: 'top' | 'right' | 'bottom' | 'left';
  sideOffset: number;
  alignOffset: number;
  triggerRect: RectElement;
  contentRect: RectElement;
}

export function getInset(_props: GetInsetProps): readonly [number, number] {
  const { align, side, contentRect, sideOffset, alignOffset, triggerRect } = _props;
  let top: number = 0;
  let left: number = 0;

  const calcAlign = (triggerStart: number, triggerSize: number, contentSize: number): number => {
    switch (align) {
      case 'start':
        return triggerStart;
      case 'center':
        return triggerStart + (triggerSize - contentSize) / 2;
      case 'end':
        return triggerStart + triggerSize - contentSize;
      default:
        return triggerStart;
    }
  };

  switch (side) {
    case 'top':
      top = triggerRect.top - contentRect.height - sideOffset;
      left = calcAlign(triggerRect.left + alignOffset, triggerRect.width, contentRect.width);
      break;
    case 'right':
      top = calcAlign(triggerRect.top + alignOffset, triggerRect.height, contentRect.height);
      left = triggerRect.right + sideOffset;
      break;
    case 'bottom':
      top = triggerRect.bottom + sideOffset;
      left = calcAlign(triggerRect.left + alignOffset, triggerRect.width, contentRect.width);
      break;
    case 'left':
      top = calcAlign(triggerRect.top, triggerRect.height, contentRect.height);
      left = triggerRect.left + alignOffset - contentRect.width - sideOffset;
      break;
  }

  if (typeof window !== 'undefined') {
    const viewportWidth = window.innerWidth;
    if (left < BUFFER_OFFSET) {
      if (side === 'left') {
        left = triggerRect.right + sideOffset; // ltr
      } else {
        left = BUFFER_OFFSET;
      }
    } else if (left + contentRect.width > viewportWidth - BUFFER_OFFSET) {
      if (side === 'right') {
        left = triggerRect.left - contentRect.width - sideOffset; // rtl
      } else {
        left = viewportWidth - contentRect.width - BUFFER_OFFSET;
      }
    }
  }

  return [top, left] as const;
}

export interface UseVarsPositions extends GetInsetProps {
  contentSize: SizeElement | undefined;
}
export function getVarsPositions(required: UseVarsPositions) {
  const { triggerRect, contentRect, contentSize, ...others } = required;
  const [top, left] = getInset({ triggerRect, contentRect, ...others });

  const vars = {
    triggerInset: {
      '--top': `${top + triggerRect.scrollY}px`,
      '--left': `${left + triggerRect.scrollX}px`
    },
    triggerSize: {
      '--measure-trigger-h': `${triggerRect.height}px`,
      '--measure-trigger-w': `${triggerRect.width}px`
    },
    contentSize: {
      '--measure-available-h': `${contentSize?.h}px`,
      '--measure-available-w': `${contentSize?.w}px`
    }
  };
  return { vars, top, left };
}

export interface UseUpdatedPositions {
  triggerRect: RectElement;
  contentRect: RectElement;
  align: `${DataAlign}`;
  side: `${DataSide}`;
  sideOffset: number;
  alignOffset: number;
}
export function useUpdatedPositions(required: UseUpdatedPositions) {
  const { triggerRect, contentRect, align, side, sideOffset, alignOffset } = required;

  const [newSide, setNewSide] = useState(side);
  const [newAlign, setNewAlign] = useState(align);

  const updatedPosition = useCallback(() => {
    const dataAlign: `${DataAlign}`[] = ['start', 'center', 'end'];
    const [top, left] = getInset({ align, side, sideOffset, alignOffset, triggerRect, contentRect });

    if (triggerRect && contentRect) {
      const rect = { top, left, bottom: top + contentRect.height, right: left + contentRect.width, width: contentRect.width, height: contentRect.height };
      const isOutOfLeftViewport = rect.left < BUFFER_OFFSET;
      const isOutOfRightViewport = rect.right > window.innerWidth - BUFFER_OFFSET;
      const isOutOfTopViewport = rect.top < BUFFER_OFFSET;
      const isOutOfBottomViewport = rect.bottom > window.innerHeight - BUFFER_OFFSET;

      if (isOutOfLeftViewport) {
        if (side === DataSide.left) setNewSide(DataSide.right);
      } else if (isOutOfRightViewport) {
        if (side === DataSide.right) setNewSide(DataSide.left);
      } else if (isOutOfTopViewport) {
        if (side === DataSide.top) setNewSide(DataSide.bottom);
        if (newSide === DataSide.left || newSide === DataSide.right) setNewAlign(nextValue(newAlign, dataAlign.toReversed()));
      } else if (isOutOfBottomViewport) {
        if (side === DataSide.bottom) setNewSide(DataSide.top);
        if (newSide === DataSide.left || newSide === DataSide.right) setNewAlign(nextValue(newAlign, dataAlign));
      } else {
        setNewSide(side);
        setNewAlign(align);
      }
    }
  }, [align, side, sideOffset, alignOffset, triggerRect, contentRect]);

  useLayoutEffect(() => {
    updatedPosition();
    window.addEventListener('scroll', updatedPosition);
    window.addEventListener('resize', updatedPosition);
    return () => {
      window.removeEventListener('scroll', updatedPosition);
      window.removeEventListener('resize', updatedPosition);
    };
  }, [updatedPosition]);

  return { newAlign, newSide, updatedPosition };
}

export interface PortalProps {
  render: boolean;
  portal?: boolean;
  children: React.ReactNode;
  container?: Element | DocumentFragment | null;
  key?: null | string;
}
export function Portal(_props: PortalProps) {
  const { portal = true, render, children, container, key } = _props;
  if (typeof document === 'undefined' || !render) return null;
  return portal ? createPortal(children, container || document.body, key) : children;
}
