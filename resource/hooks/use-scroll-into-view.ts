'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useWindowEvent } from './use-window-event';
import { useReducedMotion } from './use-reduced-motion';

export interface ScrollIntoViewAnimation {
  alignment?: 'start' | 'end' | 'center';
}

type TElement = HTMLElement | null;

export interface InView<TTarget extends TElement = HTMLElement, TParent extends TElement = null> {
  targetRef: React.RefObject<TTarget>;
  scrollableRef: React.RefObject<TParent>;
}

interface InViewReturnType {
  isInView: boolean;
}

interface InViewOptions<TTarget extends TElement = HTMLElement, TParent extends TElement = null> extends InView<TTarget, TParent> {
  axis?: 'x' | 'y';
  threshold?: number;
}

interface ScrollIntoViewOptions extends Pick<InViewOptions, 'axis' | 'threshold'> {
  onScrollFinish?: () => void;
  duration?: number;
  easing?: (t: number) => number;
  offset?: number;
  cancelable?: boolean;
  isList?: boolean;
}

export interface ScrollIntoViewReturnType<TTarget extends HTMLElement = HTMLElement, TParent extends TElement = null> extends InView<TTarget, TParent>, InViewReturnType {
  scrollIntoView: (params?: ScrollIntoViewAnimation) => void;
  cancel: () => void;
}

export const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

export const getRelativePosition = ({ axis, target, parent, alignment, offset, isList }: any): number => {
  if (!target || (!parent && typeof document === 'undefined')) {
    return 0;
  }
  const isCustomParent = !!parent;
  const parentElement = parent || document.body;
  const parentPosition = parentElement.getBoundingClientRect();
  const targetPosition = target.getBoundingClientRect();

  const getDiff = (property: 'top' | 'left'): number => targetPosition[property] - parentPosition[property];

  if (axis === 'y') {
    const diff = getDiff('top');

    if (diff === 0) return 0;

    if (alignment === 'start') {
      const distance = diff - offset;
      const shouldScroll = distance <= targetPosition.height * (isList ? 0 : 1) || !isList;

      return shouldScroll ? distance : 0;
    }

    const parentHeight = isCustomParent ? parentPosition.height : window.innerHeight;

    if (alignment === 'end') {
      const distance = diff + offset - parentHeight + targetPosition.height;
      const shouldScroll = distance >= -targetPosition.height * (isList ? 0 : 1) || !isList;

      return shouldScroll ? distance : 0;
    }

    if (alignment === 'center') {
      return diff - parentHeight / 2 + targetPosition.height / 2;
    }

    return 0;
  }

  if (axis === 'x') {
    const diff = getDiff('left');

    if (diff === 0) return 0;

    if (alignment === 'start') {
      const distance = diff - offset;
      const shouldScroll = distance <= targetPosition.width || !isList;

      return shouldScroll ? distance : 0;
    }

    const parentWidth = isCustomParent ? parentPosition.width : window.innerWidth;

    if (alignment === 'end') {
      const distance = diff + offset - parentWidth + targetPosition.width;
      const shouldScroll = distance >= -targetPosition.width || !isList;

      return shouldScroll ? distance : 0;
    }

    if (alignment === 'center') {
      return diff - parentWidth / 2 + targetPosition.width / 2;
    }

    return 0;
  }

  return 0;
};

export const getScrollStart = ({ axis, parent }: any) => {
  if (!parent && typeof document === 'undefined') {
    return 0;
  }

  const method = axis === 'y' ? 'scrollTop' : 'scrollLeft';

  if (parent) {
    return parent[method];
  }

  const { body, documentElement } = document;

  // while one of it has a value the second is equal 0
  return body[method] + documentElement[method];
};

export const setScrollParam = ({ axis, parent, distance }: any) => {
  if (!parent && typeof document === 'undefined') {
    return;
  }

  const method = axis === 'y' ? 'scrollTop' : 'scrollLeft';

  if (parent) {
    parent[method] = distance;
  } else {
    const { body, documentElement } = document;
    body[method] = distance;
    documentElement[method] = distance;
  }
};

export function useInView<TTarget extends TElement = HTMLElement, TParent extends TElement = null>({
  targetRef,
  scrollableRef,
  axis = 'y',
  threshold
}: InViewOptions<TTarget, TParent>): InViewReturnType {
  const [isInView, setIsInView] = useState(false);
  const [resolvedThreshold, setResolvedThreshold] = useState(threshold ?? 0.1); // fallback awal

  useEffect(() => {
    const target = targetRef.current;

    if (!target || threshold !== undefined) return;

    const computeThreshold = () => {
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const size = axis === 'y' ? rect.height : rect.width;
      if (size > 0) {
        setResolvedThreshold(size === 0 ? 0.1 : Math.min(1, 0.5 * (target ? 1 : 0))); // fallback defensif
        setResolvedThreshold(0.5); // setengah tinggi/lebar terlihat
      }
    };

    computeThreshold();

    // Optional: handle resize
    const resizeObserver = new ResizeObserver(computeThreshold);
    resizeObserver.observe(target);

    return () => {
      resizeObserver.disconnect();
    };
  }, [targetRef.current, axis, threshold]);

  useEffect(() => {
    const target = targetRef.current;
    const scrollable = scrollableRef.current ?? document.documentElement;

    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        root: scrollable,
        threshold: threshold ?? resolvedThreshold
      }
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [resolvedThreshold, threshold, targetRef.current, scrollableRef.current]);

  return { isInView };
}

export function useScrollIntoView<TTarget extends HTMLElement = HTMLElement, TParent extends TElement = null>(opts: ScrollIntoViewOptions = {}) {
  const { duration = 1250, axis = 'y', onScrollFinish, easing = easeInOutQuad, offset = 0, cancelable = true, isList = false, threshold } = opts;

  const frameID = useRef(0);
  const startTime = useRef(0);
  const shouldStop = useRef(false);

  const targetRef = useRef<TTarget>(null);
  const scrollableRef = useRef<TParent>(null);

  const { isInView } = useInView({ targetRef, scrollableRef, axis, threshold });

  const reducedMotion = useReducedMotion();

  const cancel = (): void => {
    if (frameID.current) cancelAnimationFrame(frameID.current);
  };

  const scrollIntoView = useCallback(
    ({ alignment = 'start' }: ScrollIntoViewAnimation = {}) => {
      shouldStop.current = false;

      if (frameID.current) cancel();

      const start = getScrollStart({ parent: scrollableRef.current, axis }) ?? 0;

      const change =
        getRelativePosition({
          parent: scrollableRef.current,
          target: targetRef.current,
          axis,
          alignment,
          offset,
          isList
        }) - (scrollableRef.current ? 0 : start);

      function animateScroll() {
        if (startTime.current === 0) {
          startTime.current = performance.now();
        }

        const now = performance.now();
        const elapsed = now - startTime.current;

        // easing timing progress
        const t = reducedMotion || duration === 0 ? 1 : elapsed / duration;

        const distance = start + change * easing(t);

        setScrollParam({
          parent: scrollableRef.current,
          axis,
          distance
        });

        if (!shouldStop.current && t < 1) {
          frameID.current = requestAnimationFrame(animateScroll);
        } else {
          if (typeof onScrollFinish === 'function') onScrollFinish();
          startTime.current = 0;
          frameID.current = 0;
          cancel();
        }
      }
      animateScroll();
    },
    [axis, duration, easing, isList, offset, onScrollFinish, reducedMotion]
  );

  const handleStop = () => {
    if (cancelable) {
      shouldStop.current = true;
    }
  };

  /**
   * detection of one of these events stops scroll animation
   * wheel - mouse wheel / touch pad
   * touchmove - any touchable device
   */

  useWindowEvent('wheel', handleStop, { passive: true });

  useWindowEvent('touchmove', handleStop, { passive: true });

  // cleanup requestAnimationFrame
  useEffect(() => cancel, []);

  return {
    scrollableRef,
    targetRef,
    scrollIntoView,
    cancel,
    isInView
  } as ScrollIntoViewReturnType<TTarget, TParent>;
}
