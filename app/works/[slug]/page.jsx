import { notFound } from 'next/navigation';
import { meta, crumbLd } from '@/lib/seo';
import { Arrow, JsonLd, Label, PageHead, Cta } from '@/components/ui';
import { WORKS, workBySlug } from '@/content/works';
import { INDUSTRIES } from '@/content/industries';

export const dynamicParams = false;
export const generateStaticParams = () => WORKS.map(w => ({ slug: w.slug }));
export async function generateMetadata({ params }) {
  const w = workBySlug((await params).slug);
  if (!w) return {};
  return meta({ title: `${w.title} | 開発事例`, description: `${w.summary}事務作業にかかる時間を1日4時間減らしました。Linkle株式会社の開発事例です。`, path: `/works/${w.slug}`, og: 'works' });
}
const R = v => JSON.stringify(v);

export default async function Work({ params }) {
  const w = workBySlug((await params).slug);
  if (!w) notFound();
  return (
    <main data-page="works">
      <JsonLd data={crumbLd([{ name: 'ホーム', path: '/' }, { name: '開発事例', path: '/works' }, { name: w.title, path: `/works/${w.slug}` }])} />
      <PageHead crumbs={[{ name: '開発事例', path: '/works' }, { name: w.title }]} title={w.title} lead={w.summary}
        rings={[[0.86, 0.42, 0.34, 0.9, 1], [0.86, 0.42, 0.22, 0.62, 0.6], [0.5, 0.5, 0.1, 0.6, 0]]}
        ringsM={[[0.95, 0.12, 0.5, 0.9, 0.9], [0.95, 0.12, 0.3, 0.62, 0.5], [0.5, 0.5, 0.1, 0.6, 0]]} />
      <div className="wrap">
        <section className="row" data-sec="">
          <div>
            <Label n="01">概要</Label>
            <h2 className="h2" data-rv="">結果</h2>
          </div>
          <div>
            <div className="fact" data-rv="" style={{ marginTop: 0 }}>
              <b>{w.result.big.map((t, i) => i % 2 ? <small key={i}>{t}</small> : t)}</b>
              <span>{w.result.text}</span>
            </div>
            <dl className="tbl" data-rv="">
              <div><dt>お客様</dt><dd>{w.client}</dd></div>
              <div><dt>事業</dt><dd>{w.category}</dd></div>
              <div><dt>担当範囲</dt><dd>要件の整理 / 設計 / 開発 / 運用</dd></div>
            </dl>
            <p className="note" data-rv="">お客様のご意向により、社名は掲載していません。</p>
          </div>
        </section>
        <section className="row" data-sec="" data-rings={R([[-0.1, 0.5, 0.3, 0.62, 0.4], [1.1, 0.9, 0.2, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}>
          <div>
            <Label n="02">導入前</Label>
            <h2 className="h2" data-rv="">紙とExcelと、<br />個別の連絡。</h2>
          </div>
          <ul className="pts" data-rv="" style={{ marginTop: 0 }}>{w.before.map(t => <li key={t}>{t}</li>)}</ul>
        </section>
        <section className="row" data-sec="">
          <div>
            <Label n="03">つくったもの</Label>
            <h2 className="h2" data-rv="">手配から請求までを、<br />一つのシステムに。</h2>
          </div>
          <ul className="pts" data-rv="" style={{ marginTop: 0 }}>{w.after.map(t => <li key={t}>{t}</li>)}</ul>
        </section>
        <section className="row" data-sec="">
          <div>
            <Label n="04">関連</Label>
            <h2 className="h2" data-rv="">業種別のご案内</h2>
          </div>
          <div>
            <div className="inds" data-rv="">{INDUSTRIES.map(i => <a href={`/industries/${i.slug}`} key={i.slug}>{i.short}</a>)}</div>
            <p data-rv=""><a className="tl" href="/construction-dx">建設業向けシステム開発を見る<Arrow /></a></p>
          </div>
        </section>
      </div>
      <Cta title={['まず、御社向けの', '見本をつくります。']} text="今の業務の流れを聞かせてください。画面の見本を無料でお作りします。" kind="無料見本の依頼" />
    </main>
  );
}
