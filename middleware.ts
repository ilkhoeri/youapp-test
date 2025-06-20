import NextAuth from 'next-auth';
import authConfig from '@/auth/config';
import { DEFAULT_SIGN_IN_REDIRECT, SIGN_IN_ROUTE, API_AUTH_PREFIX, authRoutes, publicRoutes } from './routes/auth';

const { auth } = NextAuth(authConfig);

export default auth(req => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Add exceptions to routes /api/client/:path*
  const isApiClientRoute = nextUrl.pathname.startsWith('/api/pusher/auth');

  const isApiAuthRoute = nextUrl.pathname.startsWith(API_AUTH_PREFIX);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiClientRoute) return; // Do not perform redirect for route /api/client/:path*

  if (isApiAuthRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) return Response.redirect(new URL(DEFAULT_SIGN_IN_REDIRECT, nextUrl));
    return;
  }

  // if (!isLoggedIn) {
  //   return Response.redirect(new URL(SIGN_IN_ROUTE, req.nextUrl.origin));
  // }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encoded = encodeURIComponent(callbackUrl);
    const encodedCallbackUrl = encoded !== encodeURIComponent(DEFAULT_SIGN_IN_REDIRECT) ? `${SIGN_IN_ROUTE}?callbackUrl=${encoded}` : SIGN_IN_ROUTE;

    return Response.redirect(new URL(encodedCallbackUrl, nextUrl));
  }

  return;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  // matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)', '/chat/:path*']
};
