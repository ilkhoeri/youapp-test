import { currentUser } from '@/resource/db/user/get-accounts';
import { cookiesValues } from '@/resource/client/contexts/cookies-server';
import { Toaster } from '@/resource/client/components/sonner';
import { AppProvider } from '@/resource/client/contexts/app-provider';
import { ThemeProvider } from '@/resource/client/theme';
import { auth } from '@/auth/auth';
import { bodyConfig } from './config/fonts';

import type { Metadata } from 'next';

import '../resource/styles/globals.css';
import '../resource/styles/variables.css';

export const metadata: Metadata = {
  title: {
    template: '%s | YouApp',
    default: 'YouApp'
  },
  description: 'Connect with like-minded Buddies who share your passions and interests. Be the real YOU!',
  applicationName: 'YouApp',
  category: 'Personal Platform',
  manifest: '/manifest.json',
  generator: 'Oeri',
  publisher: 'Oeri',
  referrer: 'origin-when-cross-origin',
  keywords: ['you', 'app', 'youapp'],
  creator: 'IlKhoeri - Oeri',
  authors: [
    { name: 'ilkhoeri', url: 'https://github.com/ilkhoeri' },
    { name: 'oeri', url: 'https://oeri.vercel.app' }
  ],
  openGraph: {
    images: '/public/icons/logo-full.svg'
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  }
};

export const viewport = {
  minimumScale: 1,
  maximumScale: 1,
  initialScale: 1,
  userScalable: true,
  width: 'device-width',
  height: 'device-height',
  viewportFit: 'cover',
  interactiveWidget: 'overlays-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [session, user, cookieStore] = await Promise.all([auth(), currentUser(), cookiesValues()]);

  return (
    <AppProvider {...cookieStore} {...{ session, user }}>
      <html lang="en" dir={cookieStore.dir} suppressHydrationWarning>
        <head>
          <link rel="icon" type="image/x-icon" sizes="any" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="96x96" href="/favicon.ico" />
          <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
          <meta name="apple-mobile-web-app-title" content="Portal" />
        </head>
        <body {...bodyConfig('relative antialiased')}>
          <ThemeProvider defaultTheme="system">
            <div vaul-drawer-wrapper="" className="min-h-[100vh]">
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </AppProvider>
  );
}
