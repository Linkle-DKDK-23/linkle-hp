/**
 * 書き出した out/ の検査。npm run build の後に実行する。
 * - 各ページに title / description / canonical / h1（1つ）がある
 * - canonical が末尾スラッシュなし（トップを除く）で sitemap.xml と一致する
 * - サイト内リンクの飛び先が存在する
 * - 掲載しないと決めた表現（金額など）が入っていない
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const OUT = new URL('../out/', import.meta.url).pathname;
const SITE = 'https://linkle.group';
const pages = [];
const walk = d => readdirSync(d).forEach(f => { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f === 'index.html') pages.push(p); });
walk(OUT);

const errors = [];
const canon = new Set();
const BANNED = [/万円/, /顧客満足度/, /No\.?\s?1/i, /圧倒的/, /業界最/];
const pick = (html, re) => (html.match(re) || [])[1];

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const rel = '/' + relative(OUT, file).replace(/\/?index\.html$/, '');
  const path = rel === '/' ? '/' : rel;
  if (path.startsWith('/_next') || path === '/404') continue;
  const title = pick(html, /<title>([^<]*)<\/title>/), desc = pick(html, /<meta name="description" content="([^"]*)"/), can = pick(html, /<link rel="canonical" href="([^"]*)"/);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (!title) errors.push(`${path}: title がない`);
  if (!desc) errors.push(`${path}: description がない`);
  else if (desc.length < 60 || desc.length > 130) errors.push(`${path}: description が ${desc.length} 字`);
  if (h1 !== 1) errors.push(`${path}: h1 が ${h1} 個`);
  const want = SITE + (path === '/' ? '/' : path);
  if (can !== want) errors.push(`${path}: canonical が ${can}（期待: ${want}）`);
  canon.add(want);
  const body = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  BANNED.forEach(re => { if (re.test(body)) errors.push(`${path}: 掲載しない表現 ${re}`); });
  for (const m of html.matchAll(/<a [^>]*href="(\/[^"#?]*)[^"]*"/g)) {
    const href = m[1].replace(/\/$/, '') || '/';
    if (href.startsWith('/_next')) continue;
    const target = href === '/' ? join(OUT, 'index.html') : join(OUT, href, 'index.html');
    if (!existsSync(target) && !existsSync(join(OUT, href))) errors.push(`${path}: リンク切れ ${m[1]}`);
  }
}

const sm = readFileSync(join(OUT, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
locs.forEach(l => { if (!canon.has(l)) errors.push(`sitemap: ${l} に対応するページがない`); });
[...canon].forEach(c => { if (!locs.includes(c) && !c.endsWith('/404')) errors.push(`sitemap: ${c} が載っていない`); });
if (!existsSync(join(OUT, '404.html'))) errors.push('404.html がない');

console.log(`pages: ${pages.length}, sitemap: ${locs.length}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('OK');
