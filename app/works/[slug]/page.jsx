import { notFound } from 'next/navigation';
import { meta, crumbLd } from '@/lib/seo';
import { Arrow, Big, JsonLd, Label, PageHead, Cta } from '@/components/ui';
import { WORKS, workBySlug } from '@/content/works';
import { bySlug } from '@/content/industries';

const DETAILS = WORKS.filter(w => w.detail);
export const dynamicParams = false;
export const generateStaticParams = () => DETAILS.map(w => ({ slug: w.slug }));
export async function generateMetadata({ params }) {
  const w = workBySlug((await params).slug);
  if (!w) return {};
  return meta({ title: `${w.title} | 開発事例`, description: `${w.client}（${w.scale}）の開発事例。${w.summary}開発範囲: ${w.scope.join('、')}。`, path: `/works/${w.slug}`, og: 'works' });
}
const R = v => JSON.stringify(v);
const n2 = n => String(n).padStart(2, '0');

export default async function Work({ params }) {
  const w = workBySlug((await params).slug);
  if (!w || !w.detail) notFound();
  const ind = w.industry && bySlug(w.industry);
  let n = 0;
  return (
    <main data-page="works">
      <JsonLd data={crumbLd([{ name: 'ホーム', path: '/' }, { name: '開発事例', path: '/works' }, { name: w.title, path: `/works/${w.slug}` }])} />
      <PageHead crumbs={[{ name: '開発事例', path: '/works' }, { name: w.title }]} title={w.title} lead={w.summary}
        rings={[[0.86, 0.42, 0.34, 0.9, 1], [0.86, 0.42, 0.22, 0.62, 0.6], [0.5, 0.5, 0.1, 0.6, 0]]}
        ringsM={[[0.95, 0.12, 0.5, 0.9, 0.9], [0.95, 0.12, 0.3, 0.62, 0.5], [0.5, 0.5, 0.1, 0.6, 0]]} />
      <div className="wrap">
        <section className="row" data-sec="" data-rings={R([[1.12, 0.45, 0.3, 0.9, 0.45], [1.12, 0.45, 0.19, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}>
          <div>
            <Label n={n2(++n)}>概要</Label>
            <h2 className="h2" data-rv="">{w.facts ? '結果' : 'お客様と開発範囲'}</h2>
          </div>
          <div>
            {w.facts && (
              <ul className="facts" data-rv="">
                {w.facts.map(f => <li key={f.t}><Big parts={f.big} /><div><strong>{f.t}</strong><span>{f.d}</span></div></li>)}
              </ul>
            )}
            <dl className="tbl" data-rv="">
              <div><dt>お客様</dt><dd>{w.client}</dd></div>
              <div><dt>会社規模</dt><dd>{w.scale}</dd></div>
              <div><dt>事業</dt><dd>{w.category}</dd></div>
              <div><dt>開発範囲</dt><dd>{w.scope.join(' / ')}</dd></div>
            </dl>
          </div>
        </section>

        <section className="row" data-sec="" data-rings={R([[-0.1, 0.5, 0.3, 0.62, 0.4], [1.1, 0.9, 0.2, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}>
          <div>
            <Label n={n2(++n)}>導入前</Label>
            <h2 className="h2" data-rv="">抱えていた課題</h2>
            <p className="body side-note" data-rv="">{w.background}</p>
          </div>
          <ul className="list2" data-rv="">{w.before.map(i => <li key={i.t}><b>{i.t}</b><span>{i.d}</span></li>)}</ul>
        </section>

        {w.features && (
          <section className="row" data-sec="">
            <div>
              <Label n={n2(++n)}>つくったもの</Label>
              <h2 className="h2" data-rv="">一つの管理画面に<br />まとめた機能</h2>
            </div>
            <ol className="steps" data-rv="">
              {w.features.map((s, i) => <li key={s.t}><span className="num">{n2(i + 1)}</span><div><b>{s.t}</b><p>{s.d}</p></div></li>)}
            </ol>
          </section>
        )}

        {w.steps && (
          <section className="row" data-sec="">
            <div>
              <Label n={n2(++n)}>業務ごとの変化</Label>
              <h2 className="h2" data-rv="">手作業の回数は、<br />業務ごとにこう変わりました。</h2>
            </div>
            <div className="ba" data-rv="">
              {w.steps.map(s => (
                <div className="ba-row" key={s.name}>
                  <p className="ba-name"><b>{s.name}</b><span className="num">{s.count}</span></p>
                  <dl>
                    <div><dt>いままで</dt><dd>{s.before}</dd></div>
                    <div className="on"><dt>導入後</dt><dd>{s.after}</dd></div>
                  </dl>
                </div>
              ))}
            </div>
          </section>
        )}

        {w.effects && (
          <section className="row" data-sec="" data-rings={R([[1.08, 0.5, 0.3, 0.62, 0.4], [-0.08, 0.85, 0.18, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}>
            <div>
              <Label n={n2(++n)}>時間以外の変化</Label>
              <h2 className="h2" data-rv="">属人化・間違い・漏れも、<br />仕組みでなくなりました。</h2>
            </div>
            <div className="ba" data-rv="">
              {w.effects.map(s => (
                <div className="ba-row" key={s.t}>
                  <p className="ba-name"><b>{s.t}</b></p>
                  <dl>
                    <div><dt>いままで</dt><dd>{s.before}</dd></div>
                    <div className="on"><dt>導入後</dt><dd>{s.after}</dd></div>
                  </dl>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="row" data-sec="">
          <div>
            <Label n={n2(++n)}>関連</Label>
            <h2 className="h2" data-rv="">あわせて<br />ご覧ください</h2>
          </div>
          <div className="ind-rows" data-rv="">
            {ind && <a href={`/industries/${ind.slug}`}><span className="num">—</span><b>{ind.short}</b><span>{ind.h1}</span><Arrow /></a>}
            <a href="/construction-dx"><span className="num">—</span><b>建設業全体</b><span>建設業向けシステム開発の全体像</span><Arrow /></a>
            <a href="/works"><span className="num">—</span><b>開発事例</b><span>ほかの事例を見る</span><Arrow /></a>
          </div>
        </section>
      </div>
      <Cta title={['まず、御社向けの', '見本をつくります。']} text="今の業務の流れを聞かせてください。画面の見本を無料でお作りします。" kind="無料見本の依頼" />
    </main>
  );
}
