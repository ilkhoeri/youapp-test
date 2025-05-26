'use server';
import { cookies } from 'next/headers';
import { Cookies } from './cookies-types';
import { Theme } from './app-provider';

export async function setCookies(name: string, value: string) {
  (await cookies()).set({
    name,
    value,
    secure: true,
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 365 // Cookie values ​​are valid for one year
  });
}

export async function cookiesValues() {
  const cookieStore = await cookies();
  const dir = (cookieStore.get(Cookies.dir)?.value || 'ltr') as Direction;
  const theme = (cookieStore.get(Cookies.theme)?.value || 'system') as Theme;
  const isOpenAside = (cookieStore.get(Cookies.isOpenAside)?.value === 'true') as boolean;
  const tableTakePerPage = cookieStore.get(Cookies.tableTakePerPage)?.value || '10';

  return {
    dir,
    theme,
    isOpenAside,
    tableTakePerPage: Number(tableTakePerPage)
  };
}
