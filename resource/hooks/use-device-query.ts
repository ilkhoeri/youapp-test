'use client';

import * as React from 'react';
import { useMediaQuery } from './use-media-query';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
const deviceQuery = {
  sm: '(min-width: 640px)',
  'max-sm': '(max-width: 639px)',
  md: '(min-width: 768px)',
  'max-md': '(max-width: 767px)',
  lg: '(min-width: 1024px)',
  'max-lg': '(max-width: 1023px)',
  xl: '(min-width: 1280px)',
  'max-xl': '(max-width: 1279px)',
  '2xl': '(min-width: 1536px)',
  'max-2xl': '(max-width: 1535px)'
};

type DeviceQuery = keyof typeof deviceQuery;

export function useDeviceQuery(query: DeviceQuery) {
  return useMediaQuery(deviceQuery[query]);
}
