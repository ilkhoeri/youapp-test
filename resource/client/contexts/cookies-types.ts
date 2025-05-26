export interface CookieListItem {
  name: string;
  value: string;
  expires?: number | Date | undefined;
  domain?: string | undefined;
  path?: string | undefined;
  secure?: boolean | undefined;
  sameSite?: true | false | 'lax' | 'strict' | 'none' | undefined;
  partitioned?: boolean | undefined;
}
export type ResponseCookie = CookieListItem & {
  httpOnly?: boolean | undefined;
  maxAge?: number | undefined;
  priority?: 'low' | 'medium' | 'high' | undefined;
};

export type RequestCookie = { name: string; value: string };

// type RequestCookie = { name: string; value: 'true' | 'false' | 'null' | (string & {}) } | undefined;

export interface ResponseCookies {
  set: (...args: [key: string, value: string, cookie?: Partial<ResponseCookie>] | [options: ResponseCookie]) => ResponseCookies;
  delete: (...args: [key: string] | [options: Omit<ResponseCookie, 'value' | 'expires'>]) => ResponseCookies;
}

/**
 * Manual defined from [next](/node_modules/next/dist/compiled/@edge-runtime/cookies):
 * ```ts
 * import type { RequestCookies, ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';
 * type CookiesStore = Omit<RequestCookies, 'set' | 'clear' | 'delete'> & Pick<ResponseCookies, 'set' | 'delete'>;
 * ```
 */
export interface CookiesStore extends ResponseCookies {
  [Symbol.iterator]: () => IterableIterator<[string, RequestCookie]>;
  readonly size: number;
  get: (...args: [name: string] | [RequestCookie]) => RequestCookie | undefined;
  getAll: (...args: [name: string] | [RequestCookie] | []) => RequestCookie[];
  has: (name: string) => boolean;
  toString: () => string;
}

export enum Cookies {
  dir = '__dir',
  theme = '__theme',
  isOpenAside = '__sidebar:state',
  tableTakePerPage = '__table:takeperpage'
}

export const themePreferences: string[] = ['default'];
