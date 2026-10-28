/**
 * ビルド後に、ルートごとの静的 HTML（build/index.html, build/about/index.html, ...）を書き出す。
 * 中身は build/index.html と同じで、<head> の title / description / canonical / OGP / Twitter / JSON-LD だけがページ別。
 * X・LINE・Facebook などのクローラーは JS を実行しないため、OGP は静的 HTML に入っている必要がある。
 * CloudFront Function（infra/cloudfront/viewer-request.js）が /about → /about/index.html に書き換えて配信する。
 * タグには data-rh を付け、クライアント遷移時に react-helmet-async が置き換えられるようにする。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHead } from '../src/lib/seo/head.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(root, 'build');
const config = JSON.parse(fs.readFileSync(path.join(root, 'src/content/seo.json'), 'utf8'));
const template = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf8');

const PLACEHOLDER = /<meta name="seo-placeholder"\s*\/?>/;
if (!PLACEHOLDER.test(template)) throw new Error('build/index.html に seo-placeholder が見つかりません');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

for (const route of Object.keys(config.pages)) {
  const head = buildHead(config, route);
  const tags = [
    ...head.metas.map((m) => `<meta ${m.name ? `name="${esc(m.name)}"` : `property="${esc(m.property)}"`} content="${esc(m.content)}" data-rh="true"/>`),
    ...head.links.map((l) => `<link rel="${esc(l.rel)}" href="${esc(l.href)}" data-rh="true"/>`),
    // JSON 内の "</" はスクリプト終端と誤認されないようエスケープ
    `<script type="application/ld+json" data-rh="true">${JSON.stringify(head.jsonLd).replace(/<\//g, '<\\/')}</script>`,
  ].join('');
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(head.title)}</title>`)
    .replace(PLACEHOLDER, tags);
  const out = route === '/' ? path.join(buildDir, 'index.html') : path.join(buildDir, route.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log(`prerender-meta: ${path.relative(root, out)}  ${head.title}`);
}
