import { meta, crumbLd } from '@/lib/seo';
import { Arrow, Big, JsonLd, Label, PageHead, Cta } from '@/components/ui';
import { WORKS } from '@/content/works';

const description = 'Linkle株式会社の開発事例。荷揚げ会社の業務システムでは、受注から入金までの手作業が20回から4回に減りました。足場工事、造園、管工事の業務システム、動画プラットフォームの開発支援も掲載しています。';
export const metadata = meta({ title: '開発事例', description, path: '/works', og: 'works' });
const R = v => JSON.stringify(v);

export default function Works() {
  return (
    <main data-page="works">
      <JsonLd data={crumbLd([{ name: 'ホーム', path: '/' }, { name: '開発事例', path: '/works' }])} />
      <PageHead crumbs={[{ name: '開発事例' }]} title="開発事例"
        lead="Linkleが開発したシステムをご紹介します。荷揚げ、足場、造園、管工事の業務システムと、動画プラットフォームの開発支援です。"
        rings={[[0.86, 0.42, 0.34, 0.62, 1], [0.66, 0.2, 0.1, 0.62, 0.4], [1.04, 0.8, 0.18, 0.62, 0.4]]}
        ringsM={[[0.95, 0.12, 0.5, 0.62, 0.9], [0.5, 0.5, 0.1, 0.6, 0], [0.5, 0.5, 0.1, 0.6, 0]]} />
      <div className="wrap">
        <section className="row" data-sec="" data-rings={R([[1.08, 0.5, 0.3, 0.62, 0.4], [-0.08, 0.85, 0.18, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}>
          <div>
            <Label n="01">事例</Label>
            <h2 className="h2" data-rv="">{WORKS.length}つの事例</h2>
          </div>
          <div className="work-list">
            {WORKS.map(w => {
              const body = (
                <>
                  <p className="work-cat">{w.category}<span>{w.client}</span></p>
                  <h3>{w.title}</h3>
                  <p className="work-sum">{w.summary}</p>
                  {w.fact && <p className="work-res"><Big parts={w.fact.big} /><span>{w.fact.text}</span></p>}
                  <dl className="work-meta">
                    {w.scale && <div><dt>会社規模</dt><dd>{w.scale}</dd></div>}
                    <div><dt>{w.category === '開発支援' ? '支援範囲' : '開発範囲'}</dt><dd>{w.scope.join(' / ')}</dd></div>
                  </dl>
                  {w.detail && <span className="tl">事例を見る<Arrow /></span>}
                </>
              );
              return w.detail
                ? <a className="work" id={w.slug} href={`/works/${w.slug}`} data-rv="" key={w.slug}>{body}</a>
                : <div className="work" id={w.slug} data-rv="" key={w.slug}>{body}</div>;
            })}
          </div>
        </section>
      </div>
      <Cta />
    </main>
  );
}
