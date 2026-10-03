import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/sign-in', '/portal'],
        disallow: ['/api/', '/admin/', '/superadmin/', '/teacher/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/superadmin/'],
      },
    ],
    sitemap: 'https://alphaeduhub.in/sitemap.xml',
    host: 'https://alphaeduhub.in',
  };
}
