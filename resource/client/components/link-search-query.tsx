'use client';

import * as React from 'react';
import Link, { LinkProps } from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type LinkQueryHrefType = { pathname: string | undefined; query: string; slug: string | null };
export type SearchQueryType = { path?: string; append?: boolean };
/**
 * @usage
 * ```js
 * const x = useSearchQuery('sort', 'desc');
 * return `<pathname>?sort=desc`
 * ```
 * @see [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams#examples)
 * @param query
 * @param slug
 * @param params
 * @returns
 */
export function useSearchQuery(query: string, slug?: string | null, { path, append }: SearchQueryType = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = useSearchParams();

  const hasQuery = searchQuery.has(query);
  const queryValue = searchQuery.get(query);

  const getAllQuery = searchQuery.getAll(query);

  const activeQuery = getAllQuery.includes(String(slug));
  const isQuery = queryValue === `${slug}`;

  const searchParams = new URLSearchParams(searchQuery.toString());

  if (activeQuery) {
    searchParams.delete(query, String(slug));
  } else {
    searchParams.append(query, String(slug));
  }

  const newHref = append ? `${pathname}?${searchParams.toString()}` : `/${String(path)}?${String(query)}=${String(slug)}`;

  const initialPathName = String(pathname) + '?' + String(query) + '=' + String(queryValue);

  const createQuery = React.useCallback(
    (query: string, slug: string | null) => {
      const params = new URLSearchParams(searchQuery.toString());

      if (slug !== null) {
        params.set(query, slug);
      } else {
        params.delete(query);
      }

      const queryString = params.toString();
      return queryString ? `${pathname}?${queryString}` : pathname;
    },
    [searchQuery, pathname]
  );

  const appendQuery = React.useCallback(
    (query: string, slug: string | null) => {
      const params = new URLSearchParams(searchQuery.toString());
      params.append(query, String(slug));
      const newPath = `${pathname}?${params.toString()}`;
      router.push(newPath);
    },
    [searchQuery, router, query, pathname]
  );

  const callbackQuery = React.useCallback(
    (query: string, slug: string | null) => {
      const params = new URLSearchParams(searchQuery.toString());
      params.set(query, String(slug));
      return params.delete(String(slug));
    },
    [searchQuery]
  );

  return {
    newHref,
    router,
    pathname,
    /**
     * @result `<pathname>?sort=desc` | `<pathname>?tab=following`
     * @returns query = `desc` | `following`
     */
    query,
    /**
     * @default
     * ```ts
     * useSearchParams();
     * ```
     */
    searchQuery,
    /**
     * @default
     * ```ts
     * new URLSearchParams(useSearchParams().toString());
     * ```
     */
    searchParams,
    /**
    ```js
      // Get a new searchParams string by merging the current
      // searchParams with a provided key/value pair
      // <pathname>?sort=desc
      // pathname + '?' + createQuery('sort', 'desc')
      <Link href={createQuery('sort', 'desc')} >
        DESC
      </Link>
    ```
    */
    createQuery,
    callbackQuery,
    appendQuery,
    /**
     * @returns boolean
     * ```js
     * searchParams.has("a");
     * '/dashboard?a=1'	true
     * '/dashboard?b=3'	false
     * ```
     */
    hasQuery,
    /**
   * `queryValue`
   * @returns slug yang sedang aktif
   * ```js
      href={{
        pathname: "/blog",
        query: { sort: "desc" },
      }}
      // `/blog?sort=desc`
      // query : sort=desc
      // slug : desc
   * ```
   */
    /**
     * @deprecated
     * use queryValue
     */
    getQuery: queryValue,
    queryValue,
    getAllQuery,
    activeQuery,
    initialPathName,
    isQuery
  };
}

export function useFullPath() {
  const pathname = usePathname();
  const [fullPath, setFullPath] = React.useState(pathname + window.location.hash.split('?')[0]);

  React.useEffect(() => {
    const updatePath = () => {
      setFullPath(pathname + window.location.hash.split('?')[0]); // Ambil hash tanpa query
    };

    window.addEventListener('hashchange', updatePath);
    window.addEventListener('popstate', updatePath); // Untuk menangkap navigasi browser (back/forward)

    updatePath(); // Jalankan saat pertama kali dipasang

    return () => {
      window.removeEventListener('hashchange', updatePath);
      window.removeEventListener('popstate', updatePath);
    };
  }, [pathname]);

  return fullPath;
}

export function getValidPath(url: string) {
  try {
    const parsedUrl = new URL(url, process.env.NEXT_PUBLIC_SITE_URL); // base url agar bisa diparsing
    return parsedUrl.pathname + parsedUrl.hash.split('?')[0];
  } catch {
    return ''; // Handle error jika URL tidak valid
  }
}
// export function getHash(url: string) {
//   try {
//     const parsedUrl = new URL(url, process.env.NEXT_PUBLIC_SITE_URL);
//     return parsedUrl.hash;
//   } catch {
//     return '';
//   }
// }
export function getHash(url: string) {
  const match = url.match(/#([^?]*)/);
  return match ? `#${match[1]}` : '';
}

export interface LinkQueryProps extends Omit<React.ComponentProps<'a'>, 'href'>, Omit<LinkProps, 'href'>, SearchQueryType {
  href?: string | LinkQueryHrefType;
  replaceHref?: string;
}
export const LinkQuery = React.forwardRef<HTMLAnchorElement, LinkQueryProps>(
  ({ href, append = false, scroll = false, rel = 'noopener noreferrer nofollow', replaceHref, ...props }, ref) => {
    const { pathname, query, slug } = href as LinkQueryHrefType;

    const { activeQuery, newHref } = useSearchQuery(query, slug, {
      path: pathname,
      append
    });

    const HREF = replaceHref && activeQuery ? replaceHref : newHref;

    if (!href) {
      throw new Error(
        "Failed prop type: The prop `href` expects a `string` or `object` in `<Link>`, but got `undefined` instead Open your browser's console to view the Component stack trace."
      );
    }

    const rest = {
      ref,
      // href: newHref,
      href: HREF,
      scroll,
      title: `${slug}`,
      'aria-label': `${slug}`,
      'data-link': query,
      'data-query': activeQuery ? 'active' : undefined,
      rel,
      ...props
    };
    return <Link {...rest} />;
  }
);
LinkQuery.displayName = 'LinkQuery';
