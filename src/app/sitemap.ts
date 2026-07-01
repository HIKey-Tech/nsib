import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Curated list of public, indexable routes.
// ponytail: static list is right while the page set is small and hand-known.
// Upgrade path: if published reports/news should be indexed individually, make this
// async and append rows from /api — accepting the DB dependency at request time.
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/history', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/team', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/directorates', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/department', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/operations-centre', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/publications', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/accident-reports', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/air-reports', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/marine-reports', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/rail-reports', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/news', priority: 0.8, changeFrequency: 'daily' },
  { path: '/event', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/reporting', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/reporting-guidelines', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/investigation-manuals', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/investigation-forms-and-checklists', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/legislations', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/mou', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/foi', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/comment-on-regulations', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/learning-portal', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/vacancies', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/faqs', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/social', priority: 0.4, changeFrequency: 'weekly' },
  { path: '/contact-us', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/vessel-tracking', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/flight-track', priority: 0.5, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
