/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes: string[] = ['/auth/sign-in', '/auth/verification', '/auth/invitation'];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes: string[] = ['/auth/sign-in', '/auth/sign-up', '/auth/error', '/auth/reset', '/auth/new-password', '/auth/verification', '/auth/invitation'];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const API_AUTH_PREFIX: string = '/api/auth';

/**
 * The default route login `/auth/sign-in`
 * @type {string}
 */
export const SIGN_IN_ROUTE: string = '/auth/sign-in';

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_SIGN_IN_REDIRECT: string = '/';
