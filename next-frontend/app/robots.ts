import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/search',
        '/api/*',
        '/_next/*',
        '/static/*',
      ],
    },
    sitemap: 'https://saisatgurutextile.com/sitemap.xml',
  };
}
