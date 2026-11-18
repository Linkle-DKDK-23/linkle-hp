/**
 * next build の後処理。Next は trailingSlash: true のとき canonical と og:url に末尾スラッシュを付けるが、
 * 本番は CloudFront Function が /about/ → /about に 301 するため、スラッシュなしに揃える。
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OUT = new URL('../out/', import.meta.url).pathname;
let n = 0;
const walk = d => readdirSync(d).forEach(f => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) return walk(p);
  if (!f.endsWith('.html')) return;
  const html = readFileSync(p, 'utf8');
  const fixed = html.replace(/(<link rel="canonical" href="|<meta property="og:url" content=")(https:\/\/linkle\.group\/[^"]+?)\/"/g, '$1$2"');
  if (fixed !== html) { writeFileSync(p, fixed); n++; }
});
walk(OUT);
console.log(`postbuild: canonical / og:url を ${n} ファイルで修正`);
