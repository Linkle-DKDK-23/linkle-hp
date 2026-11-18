import { SITE } from '@/lib/site';
import { INDUSTRIES } from '@/content/industries';
import { WORKS } from '@/content/works';

export const dynamic = 'force-static';

export default function sitemap() {
  const paths = ['/', '/service', '/construction-dx', '/industries', ...INDUSTRIES.map(i => `/industries/${i.slug}`), '/works', ...WORKS.map(w => `/works/${w.slug}`), '/about', '/recruit', '/news', '/contact'];
  return paths.map(p => ({ url: SITE.url + (p === '/' ? '/' : p), changeFrequency: 'monthly', priority: p === '/' ? 1 : p.startsWith('/industries/') ? 0.7 : 0.8 }));
}
