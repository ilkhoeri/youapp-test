'use client';
import { useEffect, useLayoutEffect, useState } from 'react';

export type OS = 'undetermined' | 'old' | 'macos' | 'ios' | 'windows' | 'android' | 'linux' | 'UNIX';

function getOldOS(userAgent: string) {
  let osName;
  if (/Windows NT 6.2/.test(userAgent)) osName = 'windows 8';
  if (/Windows NT 6.1/.test(userAgent)) osName = 'windows 7';
  if (/Windows NT 6.0/.test(userAgent)) osName = 'windows Vista';
  if (/Windows NT 5.1/.test(userAgent)) osName = 'windows XP';
  if (/Windows NT 5.0/.test(userAgent)) osName = 'windows 2000';
  return osName ? 'old' : undefined;
}

export function getOS(): OS {
  if (typeof window === 'undefined') {
    return 'undetermined';
  }

  const { userAgent } = window.navigator;
  const macosPlatforms = /(Macintosh)|(MacIntel)|(MacPPC)|(Mac68K)/i;
  const windowsPlatforms = /(Win32)|(Win64)|(Windows)|(WinCE)/i;
  const iosPlatforms = /(iOS)|(iPhone)|(iPad)|(iPod)/i;

  if (macosPlatforms.test(userAgent)) return 'macos';
  if (iosPlatforms.test(userAgent)) return 'ios';
  if (windowsPlatforms.test(userAgent)) return 'windows';
  if (/Android/i.test(userAgent)) return 'android';
  if (/Linux/i.test(userAgent)) return 'linux';
  if (/X11/.test(userAgent) && !/Win/.test(userAgent) && !/Mac/.test(userAgent)) return 'UNIX';
  getOldOS(userAgent);

  return 'undetermined';
}

interface UseOsOptions {
  getValueInEffect: boolean;
}

export function useOS(options: UseOsOptions = { getValueInEffect: true }): OS {
  const [os, setOs] = useState<OS>(options.getValueInEffect ? 'undetermined' : getOS());
  const useIsomorphicEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicEffect(() => {
    if (options.getValueInEffect) {
      setOs(getOS);
    }
  }, []);

  return os;
}

export interface DeviceInfo {
  os: OS;
  userAgent: string;
  language: string;
  orientation: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  isTouchDevice: boolean;
  publicIp: string | undefined;
  deviceMemory: number | undefined;
  hardwareConcurrency: number | undefined;
}

export function useDeviceInfo(): DeviceInfo {
  const useIsomorphicEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;
  const [info, setInfo] = useState<DeviceInfo>({
    os: 'undetermined',
    userAgent: '',
    language: '',
    orientation: 'landscape-primary',
    screenWidth: 0,
    screenHeight: 0,
    devicePixelRatio: 1,
    isTouchDevice: false,
    publicIp: undefined,
    deviceMemory: undefined,
    hardwareConcurrency: undefined
  });

  useIsomorphicEffect(() => {
    async function fetchPublicIp() {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setInfo(prev => ({
          ...prev,
          publicIp: data.ip
        }));
      } catch (err) {
        console.error('Error fetching public IP:', err);
      }
    }

    const updates = (event?: Event) => {
      const target = event?.currentTarget as ScreenOrientation;
      setInfo(prev => ({
        ...prev,
        os: getOS(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio,
        orientation: target?.type || 'landscape-primary',
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        deviceMemory: (navigator as any).deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency
      }));
    };

    fetchPublicIp();
    updates();

    window.addEventListener('resize', updates);
    window.screen.orientation?.addEventListener('change', updates);
    return () => {
      window.removeEventListener('resize', updates);
      window.screen.orientation?.removeEventListener('change', updates);
    };
  }, []);

  return info;
}
