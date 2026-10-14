#!/usr/bin/env node
/**
 * sitemap.xml を生成して public/ に書き出す（`npm run build` の prebuild で自動実行）。
 * ルートは App.js の <Route> と一致させる（ニュースは一覧のみで記事ページは無い）。
 * /news の lastmod は src/data/news.json の最新日付、その他は生成日。
 */
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://linkle.group';

const PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/service', changefreq: 'monthly', priority: '0.9' },
  { path: '/news', changefreq: 'weekly', priority: '0.7' },
  { path: '/recruit', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'yearly', priority: '0.6' },
];

const toDate = (d) => (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10);

/** news.json（配列 or { items }）から最新の date を返す。無ければ null */
function latestNewsDate(news) {
  const items = Array.isArray(news) ? news : (news && (news.items || news.news)) || [];
  const dates = items
    .map((n) => n && (n.date || n.publishedAt || n.updatedAt))
    .filter(Boolean)
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()));
  if (!dates.length) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

/**
 * @param {{ baseUrl?: string, news?: any, now?: Date }} opts
 * @returns {string} sitemap XML
 */
function buildSitemap({ baseUrl = BASE_URL, news = [], now = new Date() } = {}) {
  const today = toDate(now);
  const newsDate = latestNewsDate(news);
  const urls = PAGES.map((p) => {
    const lastmod = p.path === '/news' && newsDate ? toDate(newsDate) : today;
    return [
      '  <url>',
      `    <loc>${baseUrl}${p.path}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${p.changefreq}</changefreq>`,
      `    <priority>${p.priority}</priority>`,
      '  </url>',
    ].join('\n');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

function main() {
  const root = path.resolve(__dirname, '..');
  let news = [];
  try {
    news = JSON.parse(fs.readFileSync(path.join(root, 'src/data/news.json'), 'utf8'));
  } catch (e) {
    news = [];
  }
  const out = path.join(root, 'public/sitemap.xml');
  fs.writeFileSync(out, buildSitemap({ news }));
  // eslint-disable-next-line no-console
  console.log(`sitemap: ${PAGES.length} URLs → ${path.relative(root, out)}`);
}

if (require.main === module) main();

module.exports = { buildSitemap, latestNewsDate, PAGES, BASE_URL };
