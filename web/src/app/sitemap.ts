import type { MetadataRoute } from 'next';

function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  // Keep this minimal and safe. Dynamic content can be added later from CMS.
  const routes = [
    '/',
    '/about',
    '/collections',
    '/categories',
    '/products',
    '/journal',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
    '/accessibility',
  ];

  return routes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
  }));
}

