import nextPWA from 'next-pwa';
import type { NextConfig } from 'next';

/** @type {import('next-pwa').PWAConfig} */
const withPWA = nextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  buildExcludes: ['app-build-manifest.json']
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
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
  },
  async redirects() {
    return [
      {
        source: '/blogs',
        destination: '/',
        permanent: false
      }
    ];
  }
};
// @ts-ignore
export default withPWA(nextConfig);
