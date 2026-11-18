import { meta, crumbLd } from '@/lib/seo';
import { Arrow, JsonLd, Label, PageHead, Cta } from '@/components/ui';
import { WORKS } from '@/content/works';

const description = 'Linkle株式会社の開発事例。専門工事会社の業務システム開発では、紙とExcelで回していた手配から請求までの業務を一つにまとめ、事務作業を1日4時間減らしました。';
export const metadata = meta({ title: '開発事例', description, path: '/works', og: 'works' });
const R = v => JSON.stringify(v);

export default function Works() {
  return (
    <main data-page="works">
      <JsonLd data={crumbLd([{ name: 'ホーム', path: '/' }, { name: '開発事例', path: '/works' }])} />
      <PageHead crumbs={[{ name: '開発事例' }]} title="開発事例"
        lead="Linkleが開発したシステムをご紹介します。お客様のご意向により、社名を掲載していない事例があります。"
        rings={[[0.86, 0.42, 0.34, 0.62, 1], [0.66, 0.2, 0.1, 0.62, 0.4], [1.04, 0.8, 0.18, 0.62, 0.4]]}
        ringsM={[[0.95, 0.12, 0.5, 0.62, 0.9], [0.5, 0.5, 0.1, 0.6, 0], [0.5, 0.5, 0.1, 0.6, 0]]} />
      <div className="wrap">
        <section className="row" data-sec="" data-rings={R([[1.08, 0.5, 0.3, 0.62, 0.4], [-0.08, 0.85, 0.18, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}>
          <div>
            <Label n="01">事例</Label>
            <h2 className="h2" data-rv="">業務システム開発</h2>
          </div>
          <div>
            <div className="work-list" data-rv="">
              {WORKS.map(w => (
                <a href={`/works/${w.slug}`} key={w.slug}>
                  <p className="work-cat">{w.category}<span>{w.client}</span></p>
                  <h3>{w.title}</h3>
                  <p className="work-sum">{w.summary}</p>
                  <p className="work-res"><b>{w.result.big.map((t, i) => i % 2 ? <small key={i}>{t}</small> : t)}</b><span>{w.result.text}</span></p>
                  <span className="tl">事例を見る<Arrow /></span>
                </a>
              ))}
            </div>
            <p className="note" data-rv="" style={{ marginTop: 28 }}>掲載できる事例は、順次追加していきます。</p>
          </div>
        </section>
      </div>
      <Cta />
    </main>
  );
}
