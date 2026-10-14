const { buildSitemap, latestNewsDate, PAGES } = require('../../scripts/generate-sitemap');

describe('sitemap.xml の生成', () => {
  const now = new Date('2026-10-14T00:00:00Z');

  it('App.js の 6 ルートがすべて含まれ、ドメインは linkle.group', () => {
    const xml = buildSitemap({ now });
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    ['/', '/about', '/service', '/news', '/recruit', '/contact'].forEach((p) => {
      expect(xml).toContain(`<loc>https://linkle.group${p}</loc>`);
    });
    expect((xml.match(/<url>/g) || []).length).toBe(PAGES.length);
    expect(xml).toContain('<lastmod>2026-10-14</lastmod>');
  });

  it('/news の lastmod はニュースの最新日付、無ければ生成日', () => {
    const news = [{ date: '2026-09-01' }, { date: '2026-10-02' }, { date: 'invalid' }];
    expect(latestNewsDate(news).toISOString().slice(0, 10)).toBe('2026-10-02');
    expect(latestNewsDate([])).toBeNull();
    const xml = buildSitemap({ now, news });
    expect(xml).toMatch(/<loc>https:\/\/linkle\.group\/news<\/loc>\s*<lastmod>2026-10-02<\/lastmod>/);
    expect(xml).toMatch(/<loc>https:\/\/linkle\.group\/about<\/loc>\s*<lastmod>2026-10-14<\/lastmod>/);
  });
});
