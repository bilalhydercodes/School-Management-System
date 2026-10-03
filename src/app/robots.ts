import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/contact',
          '/privacy-policy',
          '/terms',
          '/refund-policy',
          '/login',
          '/portal',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/superadmin/',
          '/teacher/',
          '/change-password/',
          '/dev/',
          '/unauthorized',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/about',
          '/contact',
          '/privacy-policy',
          '/terms',
          '/refund-policy',
          '/login',
          '/portal',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/superadmin/',
          '/teacher/',
          '/change-password/',
          '/dev/',
        ],
      },
    ],
    sitemap: 'https://alphaeduhub.in/sitemap.xml',
    host: 'https://alphaeduhub.in',
  };
}
