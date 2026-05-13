import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/note/', '/daily/', '/search'],
    },
    sitemap: 'https://notes.jiayouvibe.com/sitemap.xml',
  };
}
