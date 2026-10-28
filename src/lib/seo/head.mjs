/**
 * ページごとの <head>（title / description / canonical / OGP / Twitter / JSON-LD）を組み立てる。
 * 実行時の <Seo>（react-helmet-async）と、ビルド後の静的 HTML 書き出し（scripts/prerender-meta.mjs）の両方がこれを使う。
 * SNS のクローラーは JS を実行しないため、静的 HTML 側にも同じタグが要る。
 * @param {object} config src/content/seo.json
 * @param {string} path ルート（'/' | '/about' | ...）
 * @returns {{ title: string, metas: {name?: string, property?: string, content: string}[], links: {rel: string, href: string}[], jsonLd: object }}
 */
export function buildHead(config, path) {
  const { site, organization: org, pages } = config;
  const page = pages[path] || pages['/'];
  const url = path === '/' ? `${site.url}/` : `${site.url}${path}`;
  const image = `${site.url}/og/${page.key}.png?v=${site.ogImageVersion}`;
  const orgId = `${site.url}/#organization`;
  const websiteId = `${site.url}/#website`;

  const metas = [
    { name: 'description', content: page.description },
    { property: 'og:type', content: path === '/' ? 'website' : 'article' },
    { property: 'og:site_name', content: site.name },
    { property: 'og:locale', content: site.locale },
    { property: 'og:url', content: url },
    { property: 'og:title', content: page.title },
    { property: 'og:description', content: page.description },
    { property: 'og:image', content: image },
    { property: 'og:image:secure_url', content: image },
    { property: 'og:image:type', content: 'image/png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: page.ogAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: page.title },
    { name: 'twitter:description', content: page.description },
    { name: 'twitter:image', content: image },
    { name: 'twitter:image:alt', content: page.ogAlt },
  ];
  const links = [{ rel: 'canonical', href: url }];

  const breadcrumb = [{ name: 'ホーム', item: `${site.url}/` }];
  if (path !== '/' && page.name) breadcrumb.push({ name: page.name, item: url });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: org.legalName,
        legalName: org.legalName,
        alternateName: org.alternateName,
        url: `${site.url}/`,
        logo: { '@type': 'ImageObject', url: `${site.url}/logo512.png`, width: 512, height: 512 },
        image: `${site.url}/og/home.png?v=${site.ogImageVersion}`,
        description: pages['/'].description,
        foundingDate: org.foundingDate,
        founder: { '@type': 'Person', name: org.founder },
        numberOfEmployees: { '@type': 'QuantitativeValue', value: org.numberOfEmployees },
        address: {
          '@type': 'PostalAddress',
          postalCode: org.postalCode,
          addressCountry: 'JP',
          addressRegion: org.addressRegion,
          addressLocality: org.addressLocality,
          streetAddress: org.streetAddress,
        },
        areaServed: 'JP',
        knowsAbout: org.knowsAbout,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          url: `${site.url}/contact`,
          availableLanguage: 'Japanese',
        },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${site.url}/`,
        name: site.name,
        alternateName: site.shortName,
        inLanguage: 'ja',
        publisher: { '@id': orgId },
      },
      {
        '@type': path === '/about' ? 'AboutPage' : path === '/contact' ? 'ContactPage' : 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: 'ja',
        isPartOf: { '@id': websiteId },
        about: { '@id': orgId },
        primaryImageOfPage: { '@type': 'ImageObject', url: image, width: 1200, height: 630 },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: breadcrumb.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: b.item })),
      },
    ],
  };

  return { title: page.title, metas, links, jsonLd };
}
