import { SITE } from './site';

/** ページ別メタ。canonical は末尾スラッシュなし（CloudFront Function の 301 と一致させる）。 */
export function meta({ title, description, path = '/', og = 'home' }) {
  const url = SITE.url + (path === '/' ? '/' : path);
  const full = path === '/' ? title : `${title} | ${SITE.name}`;
  const image = `${SITE.url}/og/${og}.png`;
  return {
    title: { absolute: full },
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'ja_JP', siteName: SITE.name, title: full, description, url, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: full, description, images: [image] },
  };
}

export const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  alternateName: SITE.short,
  url: SITE.url,
  logo: `${SITE.url}/logo512.png`,
  foundingDate: SITE.founded,
  email: SITE.email,
  address: { '@type': 'PostalAddress', postalCode: SITE.postalCode, addressRegion: SITE.region, addressLocality: SITE.locality, streetAddress: SITE.street, addressCountry: 'JP' },
  employee: { '@type': 'Person', name: SITE.representative, jobTitle: '代表者' },
  description: 'Linkle株式会社は、東京・池袋のシステム開発会社です。業務システム開発、FDE（常駐型の開発）、DX支援・業務効率化、Web制作を行い、建設業の専門工事会社向けの業務システムに力を入れています。',
  ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  knowsAbout: ['業務システム開発', '建設業向けシステム開発', 'FDE（Forward Deployed Engineer）', 'DX支援', '業務効率化', 'Web制作'],
};

export const siteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.name,
  alternateName: SITE.short,
  url: SITE.url,
  inLanguage: 'ja',
  publisher: { '@id': `${SITE.url}/#organization` },
};

/** 開発事例。日付は掲載日。 */
export const caseLd = ({ title, description, path, published }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  url: SITE.url + path,
  datePublished: published,
  dateModified: published,
  inLanguage: 'ja',
  author: { '@id': `${SITE.url}/#organization` },
  publisher: { '@id': `${SITE.url}/#organization` },
  image: `${SITE.url}/og/works.png`,
  mainEntityOfPage: SITE.url + path,
});

export const crumbLd = items => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: SITE.url + (it.path === '/' ? '/' : it.path) })),
});

export const faqLd = faq => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const serviceLd = ({ name, description, path }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description,
  url: SITE.url + path,
  provider: { '@id': `${SITE.url}/#organization` },
  areaServed: 'JP',
});
