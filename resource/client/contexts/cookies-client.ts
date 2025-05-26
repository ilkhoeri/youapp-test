'use cilent';
import * as React from 'react';
import { CookiesName } from './app-provider';

export function setCookies(name: CookiesName, value: string, days: number = 30) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/`;
}

export function useCookies<T extends string>(name: CookiesName, initial: T) {
  const getCookie = React.useCallback(() => {
    const cookies = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1];
    return cookies ? decodeURIComponent(cookies) : initial;
  }, [name, initial]);

  const [cookieValue, setCookieValue] = React.useState(getCookie);

  React.useEffect(() => {
    setCookieValue(getCookie());
  }, [getCookie]);

  const setCookie = React.useCallback(
    (value: string, days = 365) => {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`;
      setCookieValue(value);
    },
    [name]
  );

  return [cookieValue, setCookie] as const;
}

export function useCookiesValues() {
  const dir = useCookies('__dir', 'ltr');
  const theme = useCookies('__theme', 'system');
  const isOpenAside = useCookies('__is_open_aside', 'true');

  return { dir, theme, isOpenAside };
}
