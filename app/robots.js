import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

/** 検索エンジンと AI クローラーの両方を許可する。 */
export default function robots() {
  return { rules: [{ userAgent: '*', allow: '/' }], sitemap: `${SITE.url}/sitemap.xml` };
}
