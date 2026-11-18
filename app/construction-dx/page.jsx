import { meta, crumbLd, faqLd, serviceLd } from '@/lib/seo';
import { OTHER_INDUSTRIES } from '@/lib/site';
import { Arrow, JsonLd, Label, PageHead, Cta } from '@/components/ui';
import { issues, features, faq } from '@/content/construction';
import { INDUSTRIES } from '@/content/industries';

const description = '建設業の業務システム開発。現場の手配、職人への連絡、図面からの材料の拾い出し、請求までを、御社の進め方に合わせた一つのシステムにまとめます。契約の前に、御社向けの見本を無料でお作りします。';
export const metadata = meta({ title: '建設業向けシステム開発 | 手配・材料・請求を一つの業務システムに', description, path: '/construction-dx', og: 'construction' });
const R = v => JSON.stringify(v);

export default function ConstructionDx() {
  return (
    <main data-page="construction">
      <JsonLd data={crumbLd([{ name: 'ホーム', path: '/' }, { name: '建設業向けシステム開発', path: '/construction-dx' }])} />
      <JsonLd data={serviceLd({ name: '建設業向けシステム開発', description, path: '/construction-dx' })} />
      <JsonLd data={faqLd(faq)} />
      <PageHead crumbs={[{ name: '建設業向けシステム開発' }]} title={['建設業向け', 'システム開発']}
        lead="現場の手配、職人への連絡、図面からの材料の拾い出し、請求。紙・Excel・LINEに分かれている建設業の事務を、御社の進め方に合わせた一つの業務システムにまとめます。"
        rings={[[0.86, 0.42, 0.4, 0.87, 1], [0.86, 0.42, 0.275, 0.82, 0.75], [0.86, 0.42, 0.135, 0, 1]]}
        ringsM={[[1.0, 0.14, 0.5, 0.87, 0.8], [1.0, 0.14, 0.34, 0.82, 0.6], [1.0, 0.14, 0.16, 0, 0.8]]} />
      <div className="wrap">
        <section className="row" data-sec="" data-rings={R([[1.08, 0.5, 0.4, 0.87, 0.5], [1.08, 0.5, 0.275, 0.82, 0.35], [1.08, 0.5, 0.135, 0, 0.4]])}>
          <div>
            <Label n="01">現状</Label>
            <h2 className="h2" data-rv="">建設会社の事務で、<br />起きていること。</h2>
            <p className="body side-note" data-rv="">一つでも当てはまれば、システムで減らせる手間があります。</p>
          </div>
          <ul className="list2" data-rv="">{issues.map(i => <li key={i.t}><b>{i.t}</b><span>{i.d}</span></li>)}</ul>
        </section>

        <section className="row" data-sec="" data-rings={R([[-0.1, 0.5, 0.34, 0.62, 0.4], [1.1, 0.9, 0.2, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}>
          <div>
            <Label n="02">できること</Label>
            <h2 className="h2" data-rv="">受注から請求までを、<br />一つの台帳で。</h2>
            <p className="body side-note" data-rv="">案件・取引先・職人・単価・在庫を一つにまとめます。業務の流れは会社ごとに違うので、お話を伺ってから御社に合わせてつくります。</p>
          </div>
          <ul className="list2" data-rv="">{features.map(i => <li key={i.t}><b>{i.t}</b><span>{i.d}</span></li>)}</ul>
        </section>

        <section className="row" data-sec="">
          <div>
            <Label n="03">業種から探す</Label>
            <h2 className="h2" data-rv="">業種ごとに、<br />つくるものは変わります。</h2>
          </div>
          <div>
            <div className="ind-rows" data-rv="">
              {INDUSTRIES.map((i, n) => (
                <a href={`/industries/${i.slug}`} key={i.slug}>
                  <span className="num">{String(n + 1).padStart(2, '0')}</span><b>{i.short}</b><span>{i.summary}</span><Arrow />
                </a>
              ))}
            </div>
            <p className="others" data-rv="">そのほかの業種もご相談ください。<br />{OTHER_INDUSTRIES.map(o => o.name).join(' / ')}</p>
            <p style={{ marginTop: 28 }} data-rv=""><a className="tl" href="/industries">すべての業種を見る<Arrow /></a></p>
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
            <p className="body" data-rv="">紙とExcel、個別の連絡で回していた手配から請求までの業務を、一つのシステムにまとめました。</p>
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
            {faq.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
          </div>
        </section>
      </div>
      <Cta title={['まず、御社向けの', '見本をつくります。']} text="今の業務の流れを聞かせてください。画面の見本を無料でお作りします。" guideLabel="建設業向けの資料を見る" kind="無料見本の依頼" />
    </main>
  );
}
