import type { NextConfig } from 'next';

// import nextPWA from 'next-pwa';
// /** @type {import('next-pwa').PWAConfig} */
// const withPWA = nextPWA({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   buildExcludes: ['app-build-manifest.json']
// });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // experimental: {},
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8'
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'"
          }
        ]
      }
    ];
  },
  images: {
    deviceSizes: [375, 640, 768, 1024, 1536, 1920],
    minimumCacheTTL: 60 * 60 * 24,
    formats: ['image/avif', 'image/webp'],
    domains: [
      'api.microlink.io',
      'api.dicebear.com',
      'img.clerk.com',
      'lh3.googleusercontent.com',
      'cdn-icons-png.flaticon.com',
      'images.unsplash.com',
      'plus.unsplash.com',
      'www.figma.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com'
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'contrib.rocks',
        pathname: '/**'
      }
    ]
  }
};

// @ts-ignore
// export default withPWA(nextConfig);
export default nextConfig;
