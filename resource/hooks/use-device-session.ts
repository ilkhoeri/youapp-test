'use client';
import * as Icon from '@/resource/client/components/icons-brands';
import { useEffect, useState } from 'react';
import { useDeviceInfo } from './use-device-info';
import { x } from 'xuxi';

export function getBrowserName(userAgent: string): string | undefined {
  if (/chrome|chromium|crios/i.test(userAgent)) return 'Chrome';
  if (/firefox|fxios/i.test(userAgent)) return 'Firefox';
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
  if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) return 'Opera';
  if (/edg/i.test(userAgent)) return 'Edge';
  if (/msie|trident/i.test(userAgent)) return 'Internet Explorer';
  return undefined;
}

function getCurrentLocation() {
  return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        error => {
          reject(error);
        }
      );
    } else {
      reject(new Error('Geolocation not supported'));
    }
  });
}

function getDeviceDetailsFromUA(userAgent: string) {
  // Cek iPhone
  if (/iPhone/.test(userAgent)) {
    const model = userAgent.match(/iPhone\s([\d,]+)/)?.[1]?.replace(',', '.');
    return { name: model ? `iPhone ${model}` : 'iPhone', icon: Icon.BrandAppleIcon };
  }

  // Cek iPad
  if (/iPad/.test(userAgent)) {
    return { name: 'iPad', icon: Icon.BrandAppleIcon };
  }

  // Cek Samsung
  if (/SM-|Samsung/i.test(userAgent)) {
    const model = userAgent.match(/SM-[A-Z0-9]+/)?.[0];
    return { name: model ? `Samsung ${model}` : 'Samsung Device', icon: Icon.BrandSamsungIcon };
  }

  // Cek merek lain (Huawei, Xiaomi, dll.)
  if (/HUAWEI|Xiaomi|Redmi|OnePlus|OPPO|Vivo/i.test(userAgent)) {
    return { name: userAgent.match(/(HUAWEI|Xiaomi|Redmi|OnePlus|OPPO|Vivo)[^;]*/i)?.[0] || 'Android Device', icon: Icon.BrandAndroidIcon };
  }

  // Cek Laptop / PC
  if (/Windows/i.test(userAgent)) {
    return { name: 'Windows PC', icon: Icon.BrandWindowsIcon };
  }
  if (/Macintosh|Mac OS/i.test(userAgent)) {
    return { name: 'MacBook', icon: Icon.BrandMacOsIcon };
  }

  return { name: undefined, icon: Icon.AISearchIcon };
}

async function getDeviceDetails(userAgent: string): Promise<{ name: string | undefined; icon: any }> {
  // @ts-ignore
  if (navigator?.userAgentData) {
    // @ts-ignore
    const brands = await navigator.userAgentData.getHighEntropyValues(['platform', 'model']);
    // return { name: brands.model || brands.platform, icon: IconWorld };
    const models = getDeviceDetailsFromUA(brands.model || brands.platform);
    return { name: models.name, icon: models.icon };
  }
  return getDeviceDetailsFromUA(userAgent);
}

export async function getLocation(ip: string) {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return `${data.city}, ${data.country_code}`;
  } catch (error) {
    console.error('Error fetching location:', error);
    return undefined;
  }
}

async function getCityFromCoordinates(lat: number, lon: number) {
  try {
    const openstreetmap = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const response = await fetch(openstreetmap);
    const data = await response.json();
    return data.address.city || data.address.town || data.address.village;
  } catch (error) {
    console.error('Error fetching city:', error);
    return undefined;
  }
}

export function useDeviceSession() {
  const deviceInfo = useDeviceInfo();
  const [sessionActive, setSessionActive] = useState<{ id: string; address: string; device: string; lastSeen: string; icon: any } | null>(null);

  useEffect(() => {
    async function updateSession() {
      const device = await getDeviceDetails(deviceInfo.userAgent);
      let location: string | undefined = undefined;

      try {
        const { latitude, longitude } = await getCurrentLocation();
        location = await getCityFromCoordinates(latitude, longitude);
      } catch (error) {
        console.warn('Could not get accurate location, using IP instead.');
        location = deviceInfo.publicIp ? await getLocation(deviceInfo.publicIp) : undefined;
      }

      const browser = getBrowserName(deviceInfo.userAgent);
      const timestamp = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(new Date());

      setSessionActive({
        id: crypto.randomUUID(),
        address: x.cnx(location, deviceInfo.publicIp && `[${deviceInfo.publicIp}]`),
        device: x.cnx(
          browser,
          { on: browser && deviceInfo.os !== 'undetermined' },
          deviceInfo.os !== 'undetermined' && deviceInfo.os,
          { '|': browser && deviceInfo.os !== 'undetermined' && device.name },
          device.name
        ),
        lastSeen: timestamp,
        icon: device.icon
      });
    }

    updateSession();
  }, [deviceInfo]);

  return sessionActive;
}
