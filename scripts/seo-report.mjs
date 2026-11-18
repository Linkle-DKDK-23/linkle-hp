/**
 * 週次の SEO レポート。Search Console と GA4 から数字を取り、docs/seo/reports/<日付>.md に書き出す。
 *
 *   npm run seo:report            # 直近7日（データの遅れを見て2日前まで）と、その前の7日を比べる
 *   npm run seo:report -- --days=28
 *
 * 認証は鍵ファイルを使わず、gcloud の権限借用（docs/renewal/03-baseline.md）。
 * 事前に `gcloud auth login <オーナーのアカウント>` が済んでいること。
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const ACCOUNT = process.env.SEO_GCLOUD_ACCOUNT || 'linkleworks@gmail.com';
const SA = process.env.SEO_SERVICE_ACCOUNT || 'hp-analytics@linkle-hp-analytics.iam.gserviceaccount.com';
const PROJECT = 'linkle-hp-analytics';
const SITE = 'https://linkle.group/';
const GA_PROPERTY = 'properties/564932285';
const DAYS = Number((process.argv.find(a => a.startsWith('--days=')) || '').split('=')[1]) || 7;
const BRAND = /linkle|リンクル|りんくる/i;
const WATCH = [
  ['建設業', /建設/], ['荷揚げ・揚重', /荷揚|揚重/], ['足場', /足場/], ['造園', /造園|植木/], ['鳶・土工', /鳶|とび|土工/],
  ['防水', /防水/], ['解体', /解体/], ['内装', /内装/], ['塗装', /塗装/], ['管工事', /管工事|配管/],
  ['FDE', /fde|フォワード|forward deployed/i], ['システム開発・業務システム', /システム開発|業務システム|管理システム/],
];

const token = execFileSync('gcloud', ['auth', 'print-access-token', `--account=${ACCOUNT}`, `--impersonate-service-account=${SA}`,
  '--scopes=https://www.googleapis.com/auth/webmasters.readonly,https://www.googleapis.com/auth/analytics.readonly'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
const api = async (url, body) => {
  const r = await fetch(url, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${token}`, 'x-goog-user-project': PROJECT, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status} ${url.split('?')[0]} ${j.error?.message || ''}`);
  return j;
};
const day = offset => { const d = new Date(Date.now() - offset * 864e5); return d.toISOString().slice(0, 10); };
const end = day(2), start = day(1 + DAYS), pEnd = day(2 + DAYS), pStart = day(1 + DAYS * 2);
const sc = (s, e, dimensions = [], rowLimit = 500) => api(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, { startDate: s, endDate: e, dimensions, rowLimit }).then(r => r.rows || []);
const pos = n => (n ? n.toFixed(1) : '—');
const diff = (a, b) => { const d = a - b; return d === 0 ? '±0' : d > 0 ? `+${d}` : `${d}`; };
const sum = (rows, k) => rows.reduce((t, r) => t + r[k], 0);

const [tot, pTot, q, pQ, pages] = await Promise.all([sc(start, end), sc(pStart, pEnd), sc(start, end, ['query']), sc(pStart, pEnd, ['query']), sc(start, end, ['page'], 50)]);
const T = tot[0] || { clicks: 0, impressions: 0, position: 0 }, P = pTot[0] || { clicks: 0, impressions: 0, position: 0 };
const nb = q.filter(r => !BRAND.test(r.keys[0])), pNb = pQ.filter(r => !BRAND.test(r.keys[0]));

/* インデックス状況 */
const sm = await (await fetch(`${SITE}sitemap.xml`)).text();
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const index = [];
for (const u of urls) {
  try {
    const r = await api('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { inspectionUrl: u, siteUrl: SITE });
    const s = r.inspectionResult?.indexStatusResult || {};
    index.push({ u, verdict: s.verdict, state: s.coverageState, crawl: (s.lastCrawlTime || '').slice(0, 10) });
  } catch (e) { index.push({ u, verdict: 'ERROR', state: e.message.slice(0, 60), crawl: '' }); }
}
const indexed = index.filter(i => i.verdict === 'PASS').length;

/* GA4 */
const ga = body => api(`https://analyticsdata.googleapis.com/v1beta/${GA_PROPERTY}:runReport`, { dateRanges: [{ startDate: start, endDate: day(0) }], ...body }).then(r => r.rows || []).catch(e => [{ error: e.message }]);
const [chan, leads, top] = await Promise.all([
  ga({ dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }, { name: 'activeUsers' }] }),
  ga({ dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }], dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: ['generate_lead', 'guide_dialog_open', 'guide_open'] } } } }),
  ga({ dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 10 }),
]);
const gaRows = (rows, f) => rows[0]?.error ? `取得できませんでした（${rows[0].error}）` : rows.length ? rows.map(f).join('\n') : '（データなし）';

const out = `# SEO 週次レポート ${day(0)}

対象期間: ${start}〜${end}（${DAYS}日間）。比較: ${pStart}〜${pEnd}。Search Console の数字は2日ほど遅れて確定します。

## 1. 検索（Search Console）

| 指標 | 今期 | 前期 | 差 |
|---|---|---|---|
| 表示回数 | ${T.impressions} | ${P.impressions} | ${diff(T.impressions, P.impressions)} |
| クリック | ${T.clicks} | ${P.clicks} | ${diff(T.clicks, P.clicks)} |
| 平均掲載順位 | ${pos(T.position)} | ${pos(P.position)} | |
| **社名以外の表示回数** | **${sum(nb, 'impressions')}** | ${sum(pNb, 'impressions')} | ${diff(sum(nb, 'impressions'), sum(pNb, 'impressions'))} |
| 社名以外のクリック | ${sum(nb, 'clicks')} | ${sum(pNb, 'clicks')} | ${diff(sum(nb, 'clicks'), sum(pNb, 'clicks'))} |
| 社名以外の検索語の種類 | ${nb.length} | ${pNb.length} | ${diff(nb.length, pNb.length)} |

### 社名以外の検索語（表示の多い順）

${nb.length ? '| 検索語 | 表示 | クリック | 順位 |\n|---|---|---|---|\n' + nb.sort((a, b) => b.impressions - a.impressions).slice(0, 30).map(r => `| ${r.keys[0]} | ${r.impressions} | ${r.clicks} | ${pos(r.position)} |`).join('\n') : '（まだありません）'}

### 狙っている語のグループ

| グループ | 検索語の種類 | 表示 | クリック | 最上位 |
|---|---|---|---|---|
${WATCH.map(([name, re]) => { const rs = q.filter(r => re.test(r.keys[0]) && !BRAND.test(r.keys[0])); return `| ${name} | ${rs.length} | ${sum(rs, 'impressions')} | ${sum(rs, 'clicks')} | ${rs.length ? pos(Math.min(...rs.map(r => r.position))) : '—'} |`; }).join('\n')}

### ページ別

| ページ | 表示 | クリック | 順位 |
|---|---|---|---|
${pages.sort((a, b) => b.impressions - a.impressions).map(r => `| ${r.keys[0].replace(SITE, '/')} | ${r.impressions} | ${r.clicks} | ${pos(r.position)} |`).join('\n') || '| （データなし） | | | |'}

## 2. インデックス状況

Google に登録済み: **${indexed} / ${index.length} ページ**

| ページ | 状態 | 最終クロール |
|---|---|---|
${index.map(i => `| ${i.u.replace(SITE, '/')} | ${i.verdict === 'PASS' ? '登録済み' : i.state || i.verdict} | ${i.crawl || '—'} |`).join('\n')}

## 3. サイトの利用（GA4・${start}〜今日）

**流入元**
${gaRows(chan, r => `- ${r.dimensionValues[0].value}: セッション ${r.metricValues[0].value} / ユーザー ${r.metricValues[1].value}`)}

**資料請求・お問い合わせ**
${gaRows(leads, r => `- ${r.dimensionValues[0].value}: ${r.metricValues[0].value} 回`)}

**よく見られたページ**
${gaRows(top, r => `- ${r.dimensionValues[0].value}: ${r.metricValues[0].value} 回`)}

## 4. 所見と次の打ち手

（数字を見て記入する）
`;
mkdirSync(new URL('../docs/seo/reports/', import.meta.url), { recursive: true });
const file = new URL(`../docs/seo/reports/${day(0)}.md`, import.meta.url);
writeFileSync(file, out);
console.log(`表示 ${T.impressions}（前期 ${P.impressions}）/ クリック ${T.clicks} / 社名以外の表示 ${sum(nb, 'impressions')} / 登録済み ${indexed}/${index.length}`);
console.log('wrote', file.pathname);
