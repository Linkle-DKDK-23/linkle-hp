import { notFound } from 'next/navigation';
import { meta, crumbLd, faqLd, serviceLd } from '@/lib/seo';
import { Arrow, JsonLd, Label, PageHead, Cta } from '@/components/ui';
import { INDUSTRIES, bySlug } from '@/content/industries';

export const dynamicParams = false;
export const generateStaticParams = () => INDUSTRIES.map(i => ({ slug: i.slug }));

export async function generateMetadata({ params }) {
  const d = bySlug((await params).slug);
  if (!d) return {};
  return meta({ title: d.title, description: d.description, path: `/industries/${d.slug}`, og: 'construction' });
}
const R = v => JSON.stringify(v);

export default async function Industry({ params }) {
  const d = bySlug((await params).slug);
  if (!d) notFound();
  const path = `/industries/${d.slug}`;
  const related = d.related.map(bySlug).filter(Boolean);
  return (
    <main data-page="construction">
      <JsonLd data={crumbLd([{ name: 'ホーム', path: '/' }, { name: '建設業向けシステム開発', path: '/construction-dx' }, { name: '業種から探す', path: '/industries' }, { name: d.name, path }])} />
      <JsonLd data={serviceLd({ name: d.h1, description: d.description, path })} />
      <JsonLd data={faqLd(d.faq)} />
      <PageHead crumbs={[{ name: '建設業向け', path: '/construction-dx' }, { name: '業種から探す', path: '/industries' }, { name: d.short }]}
        title={d.h1.replace('の業務システム開発', 'の|業務システム開発').split('|')} lead={d.lead}
        rings={[[0.88, 0.4, 0.36, 0.87, 1], [0.88, 0.4, 0.245, 0.82, 0.7], [0.88, 0.4, 0.12, 0, 1]]}
        ringsM={[[1.0, 0.12, 0.46, 0.87, 0.8], [1.0, 0.12, 0.31, 0.82, 0.6], [1.0, 0.12, 0.15, 0, 0.8]]} />
      <div className="wrap">
        <p className="aliases" data-rv="">{d.aliases.map(a => <span key={a}>{a}</span>)}</p>

        <section className="row" data-sec="" data-rings={R([[1.08, 0.5, 0.36, 0.87, 0.45], [1.08, 0.5, 0.245, 0.82, 0.3], [1.08, 0.5, 0.12, 0, 0.35]])}>
          <div>
            <Label n="01">現状</Label>
            <h2 className="h2" data-rv="">{d.issues.heading}</h2>
          </div>
          <ul className="list1" data-rv="">{d.issues.items.map(i => <li key={i.t}><b>{i.t}</b><span>{i.d}</span></li>)}</ul>
        </section>

        <section className="row" data-sec="" data-rings={R([[-0.1, 0.5, 0.3, 0.62, 0.4], [1.1, 0.9, 0.2, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}>
          <div>
            <Label n="02">できること</Label>
            <h2 className="h2" data-rv="">{d.flow.heading}</h2>
            <p className="body side-note" data-rv="">{d.flow.intro}</p>
            <p className="note" data-rv="">以下は、この業種で想定している構成の例です。実際には、御社の業務の流れを伺ってから設計します。</p>
          </div>
          <ol className="steps" data-rv="">
            {d.flow.steps.map((s, i) => <li key={s.t}><span className="num">{String(i + 1).padStart(2, '0')}</span><div><b>{s.t}</b><p>{s.d}</p></div></li>)}
          </ol>
        </section>

        <section className="row" data-sec="">
          <div>
            <Label n="03">選び方</Label>
            <h2 className="h2" data-rv="">{d.fit.heading}</h2>
            <p className="body side-note" data-rv="">{d.fit.intro}</p>
          </div>
          <div className="fit" data-rv="">
            <div><h3>既製のアプリが向く会社</h3><ul>{d.fit.packaged.map(t => <li key={t}>{t}</li>)}</ul></div>
            <div className="on"><h3>専用の開発が向く会社</h3><ul>{d.fit.custom.map(t => <li key={t}>{t}</li>)}</ul></div>
          </div>
        </section>

        <section className="row" data-sec="" data-rings={R([[0.16, 0.55, 0.3, 0.9, 0.6], [0.5, 0.5, 0.1, 0.6, 0], [0.5, 0.5, 0.1, 0.6, 0]])}>
          <div>
            <Label n="04">開発事例</Label>
            <h2 className="h2" data-rv="">専門工事会社の<br />業務システム</h2>
          </div>
          <div>
            <div className="fact" data-rv="" style={{ marginTop: 0 }}>
              <b>1<small>日</small>4<small>時間</small></b>
              <span>事務作業にかかる時間を減らしました。</span>
            </div>
            <p className="body" data-rv="">{d.caseNote}</p>
            <p className="note" data-rv="">お客様のご意向により、社名は掲載していません。</p>
            <p style={{ marginTop: 28 }} data-rv=""><a className="tl" href="/works/specialty-contractor">事例を見る<Arrow /></a></p>
          </div>
        </section>

        <section className="row" data-sec="">
          <div>
            <Label n="05">よくある質問</Label>
            <h2 className="h2" data-rv="">ご相談の前に</h2>
          </div>
          <div className="faq" data-rv="">
            {d.faq.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
          </div>
        </section>

        <section className="row" data-sec="">
          <div>
            <Label n="06">近い業種</Label>
            <h2 className="h2" data-rv="">あわせて<br />ご覧ください</h2>
          </div>
          <div>
            <div className="ind-rows" data-rv="">
              {related.map(r => <a href={`/industries/${r.slug}`} key={r.slug}><span className="num">—</span><b>{r.short}</b><span>{r.summary}</span><Arrow /></a>)}
              <a href="/construction-dx"><span className="num">—</span><b>建設業全体</b><span>建設業向けシステム開発の全体像</span><Arrow /></a>
            </div>
            <p style={{ marginTop: 28 }} data-rv=""><a className="tl" href="/industries">すべての業種を見る<Arrow /></a></p>
          </div>
        </section>
      </div>
      <Cta title={['まず、御社向けの', '見本をつくります。']} text={`${d.name}の今の業務の流れを聞かせてください。画面の見本を無料でお作りします。`} guideLabel="建設業向けの資料を見る" kind="無料見本の依頼" />
    </main>
  );
}
