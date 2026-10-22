import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep the admin CMS, auth flow and API surface out of search results.
      disallow: ['/dashboard', '/login', '/osr', '/osr-portal', '/api/', '/open-ticket', '/help-desk'],
    },
    // /osr-sitemap.xml comes from the separate Office of Safety Recommendations app on this domain
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/osr-sitemap.xml`],
    host: SITE_URL,
  };
}
