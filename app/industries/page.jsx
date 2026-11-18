import { meta, crumbLd } from '@/lib/seo';
import { OTHER_INDUSTRIES } from '@/lib/site';
import { Arrow, JsonLd, Label, PageHead, Cta } from '@/components/ui';
import { INDUSTRIES } from '@/content/industries';

const description = '建設業の業種別に、Linkleがつくる業務システムをご案内します。荷揚げ・揚重、造園、鳶・土工、防水、解体、内装仕上、建築塗装、足場のほか、外構、型枠、設備、電気などの専門工事にも対応します。';
export const metadata = meta({ title: '業種から探す | 建設業の業種別 業務システム開発', description, path: '/industries', og: 'construction' });
const R = v => JSON.stringify(v);

export default function Industries() {
  return (
    <main data-page="construction">
      <JsonLd data={crumbLd([{ name: 'ホーム', path: '/' }, { name: '建設業向けシステム開発', path: '/construction-dx' }, { name: '業種から探す', path: '/industries' }])} />
      <PageHead crumbs={[{ name: '建設業向けシステム開発', path: '/construction-dx' }, { name: '業種から探す' }]} title="業種から探す"
        lead="同じ建設業でも、手配の仕方、使う帳票、請求の単位は業種ごとに違います。御社の業種に近いページから、どのような業務をシステムにまとめられるかをご覧ください。"
        rings={[[0.84, 0.4, 0.3, 0.62, 1], [1.02, 0.7, 0.2, 0.62, 0.45], [0.66, 0.16, 0.08, 0.62, 0.35]]}
        ringsM={[[0.95, 0.12, 0.5, 0.62, 0.9], [0.5, 0.5, 0.1, 0.6, 0], [0.5, 0.5, 0.1, 0.6, 0]]} />
      <div className="wrap">
        <section className="row" data-sec="" data-rings={R([[1.08, 0.5, 0.3, 0.62, 0.4], [-0.08, 0.85, 0.18, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}>
          <div>
            <Label n="01">業種別のご案内</Label>
            <h2 className="h2" data-rv="">8つの業種</h2>
            <p className="body side-note" data-rv="">業種ごとの事務の課題と、システムで一つにまとまる業務の流れをまとめています。</p>
          </div>
          <div className="ind-rows" data-rv="">
            {INDUSTRIES.map((i, n) => (
              <a href={`/industries/${i.slug}`} key={i.slug}>
                <span className="num">{String(n + 1).padStart(2, '0')}</span><b>{i.short}</b><span>{i.summary}</span><Arrow />
              </a>
            ))}
          </div>
        </section>
        <section className="row" data-sec="">
          <div>
            <Label n="02">そのほかの業種</Label>
            <h2 className="h2" data-rv="">こちらの業種も<br />ご相談ください。</h2>
            <p className="body side-note" data-rv="">ここにない業種でも、業務の流れを伺ってからおつくりします。</p>
          </div>
          <ul className="list2" data-rv="">{OTHER_INDUSTRIES.map(o => <li key={o.name}><b>{o.name}</b><span>{o.d}</span></li>)}</ul>
        </section>
      </div>
      <Cta title={['御社の業種の話を、', '聞かせてください。']} text="業種名と、今いちばん手間のかかっている業務を教えてください。御社向けの見本を無料でお作りします。" guideLabel="建設業向けの資料を見る" kind="無料見本の依頼" />
    </main>
  );
}
