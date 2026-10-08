/** @type {import('next').NextConfig} */

// Compute allowed origins for Next.js 14 Server Actions
const rawAppDomain = (process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000').trim();
const cleanAppDomain = rawAppDomain.replace(/^https?:\/\//, '').split('/')[0];
const baseDomain = cleanAppDomain.split(':')[0];

const defaultAllowedOrigins = [
  'localhost:3000',
  '127.0.0.1:3000',
  'alphaeduhub.in',
  '*.alphaeduhub.in',
  'schoolerp.in',
  '*.schoolerp.in',
  '*.vercel.app',
  cleanAppDomain,
];

// Add wildcard domain for multi-tenant subdomains (e.g. *.schoolerp.com)
if (baseDomain && baseDomain !== 'localhost' && baseDomain !== '127.0.0.1') {
  defaultAllowedOrigins.push(`*.${baseDomain}`);
}

// Add extra origins from environment (comma-separated list for custom domains or staging)
const extraAllowedOrigins = process.env.SERVER_ACTIONS_ALLOWED_ORIGINS
  ? process.env.SERVER_ACTIONS_ALLOWED_ORIGINS.split(',')
      .map((s) => s.trim().replace(/^https?:\/\//, '').split('/')[0])
      .filter(Boolean)
  : [];

const serverActionsAllowedOrigins = Array.from(
  new Set([...defaultAllowedOrigins, ...extraAllowedOrigins])
);

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: serverActionsAllowedOrigins,
    },
    serverComponentsExternalPackages: [
      'bcryptjs',
      '@prisma/client',
      'ioredis',
      'bullmq',
      'razorpay',
    ],
    // Tree-shake icon libraries so only used icons are bundled
    optimizePackageImports: ['lucide-react'],
  },
  poweredByHeader: false,
  webpack: (config) => {
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.razorpay.com; frame-src 'self' https://api.razorpay.com;",
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/landing/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
