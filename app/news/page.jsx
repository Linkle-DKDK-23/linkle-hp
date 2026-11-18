import { meta, crumbLd } from '@/lib/seo';
import { JsonLd, Label, PageHead, Cta } from '@/components/ui';
import news from '@/content/news.json';

/** お知らせは content/news.json に追記する（新しい順）。{ "date": "2026-12-01", "category": "お知らせ", "title": "…", "body": "…" } */
const description = 'Linkle株式会社のニュース。お知らせ、新しいサービスや開発事例のリリース、メディア掲載、採用に関する最新情報をお届けします。';
export const metadata = meta({ title: 'ニュース', description, path: '/news', og: 'news' });
const R = v => JSON.stringify(v);

export default function News() {
  const items = [...news].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <main data-page="news">
      <JsonLd data={crumbLd([{ name: 'ホーム', path: '/' }, { name: 'ニュース', path: '/news' }])} />
      <PageHead crumbs={[{ name: 'ニュース' }]} title="ニュース" lead="お知らせ、リリース、メディア掲載などの最新情報です。"
        rings={[[0.86, 0.42, 0.3, 0.62, 1], [0.66, 0.2, 0.08, 0.62, 0.4], [0.5, 0.5, 0.1, 0.6, 0]]}
        ringsM={[[0.95, 0.12, 0.5, 0.62, 0.9], [0.5, 0.5, 0.1, 0.6, 0], [0.5, 0.5, 0.1, 0.6, 0]]} />
      <div className="wrap">
        <section className="row" data-sec="" data-rings={R([[1.08, 0.5, 0.3, 0.62, 0.4], [-0.08, 0.85, 0.18, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}>
          <div>
            <Label n="01">一覧</Label>
            <h2 className="h2" data-rv="">お知らせ</h2>
          </div>
          <div data-rv="">
            {items.length === 0 ? (
              <p className="body news-empty">まだお知らせはありません。</p>
            ) : (
              <ul className="news">
                {items.map(n => (
                  <li key={n.date + n.title} id={n.date}>
                    <p className="news-meta"><time className="num" dateTime={n.date}>{n.date.replaceAll('-', '.')}</time><span>{n.category}</span></p>
                    <h3>{n.title}</h3>
                    {n.body && <p className="body">{n.body}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      <Cta />
    </main>
  );
}
