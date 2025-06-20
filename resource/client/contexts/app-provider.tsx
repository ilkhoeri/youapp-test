'use client';
import * as React from 'react';
import { Cookies } from './cookies-types';
import { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import { setCookies } from './cookies-client';
import { Account } from '@/resource/types/user';
import { SessionProvider } from 'next-auth/react';

interface RequiredSession {
  session: Session | null | undefined;
  user: Account;
}

export type CookiesName = `${Cookies}` | (string & {});

export type Direction = 'ltr' | 'rtl';
export type Theme = 'dark' | 'light' | 'system';

// required value
type DirectedAppValue = {
  dir: Direction;
  theme: Theme;
  tableTakePerPage: number;
  isOpenAside: boolean;
  // locale
  // messages: Record<string, MessageFormatElement[]> | Record<string, string>;
  // locale: string;
};

interface AppContext extends DirectedAppValue, RequiredSession {
  setCookies: (name: CookiesName, value: string, days: number) => void;
  toggleDirection: () => void;
  setDirection: (dir: Direction) => void;
  openAside: Booleanish;
  setOpenAside: (o: Booleanish) => void;
  //
  isHome: boolean;
  pathname: string;
}

const ctx = React.createContext<AppContext | undefined>(undefined);

export function useApp() {
  const _ctx = React.useContext(ctx);
  if (!_ctx) throw new Error('main layout must be used within an <AppProvider>');
  return _ctx;
}

interface AppProviderProps extends DirectedAppValue, RequiredSession {
  children: React.ReactNode;
}
export function AppProvider(props: AppProviderProps) {
  const { children, session, user, theme = 'system', dir: initialDirection = 'ltr', tableTakePerPage = 10, isOpenAside = true, ...others } = props;

  const [openAside, setOpenAside] = React.useState<Booleanish>(isOpenAside);

  const { dir, ..._direction } = useDirection({ initialDirection });

  const pathname = usePathname();
  const isHome = pathname === '/';

  const contextValue = React.useMemo<AppContext>(
    () => ({
      theme,
      dir,
      tableTakePerPage,
      openAside,
      setOpenAside,
      setCookies,
      isHome,
      pathname,
      isOpenAside,
      session,
      user,
      ..._direction,
      ...others
    }),
    [theme, dir, tableTakePerPage, openAside, setOpenAside, isHome, pathname, isOpenAside, session, user, _direction, others]
  );

  return (
    <ctx.Provider value={contextValue}>
      <SessionProvider session={session}>{children}</SessionProvider>
    </ctx.Provider>
  );
}

export interface useDirectionProps {
  /** Direction set as a default value, `ltr` by default */
  initialDirection?: Direction;
  /** Determines whether direction should be updated on mount based on `dir` attribute set on root element (usually html element), `true` by default */
  detectDirection?: boolean;
}
export function useDirection(_dir: useDirectionProps) {
  const { initialDirection = 'ltr', detectDirection = true } = _dir;
  const useIsomorphicEffect = typeof document !== 'undefined' ? React.useLayoutEffect : React.useEffect;

  const [dir, setDir] = React.useState<Direction>(initialDirection);

  const setCookie = (name: string, value: string, days = 30) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/`;
  };

  const setDirection = (direction: Direction) => {
    setDir(direction);
    document.documentElement.setAttribute('dir', direction);
    setCookie('__dir', direction);
  };

  useIsomorphicEffect(() => {
    if (detectDirection) {
      const direction = document.documentElement.getAttribute('dir');
      if (direction === 'rtl' || direction === 'ltr') {
        setDirection(direction);
      }
    }
  }, []);

  const toggleDirection = () => setDirection(dir === 'ltr' ? 'rtl' : 'ltr');

  return { toggleDirection, setDirection, dir };
}
