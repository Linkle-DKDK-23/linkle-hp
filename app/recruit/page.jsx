import { meta, crumbLd } from '@/lib/seo';
import { Arrow, JsonLd, Label, PageHead } from '@/components/ui';

const description = 'Linkle株式会社の採用情報。モバイルエンジニア、Webデザイナー、インフラエンジニア、PM/PL、セキュリティエンジニアを募集しています。カジュアル面談からでも歓迎です。';
export const metadata = meta({ title: '採用情報', description, path: '/recruit', og: 'recruit' });
const R = v => JSON.stringify(v);

const POSITIONS = [
  { t: '【PM/PL】Webアプリエンジニア', d: '要件の整理から設計・開発・リリースまで、チームを率いて進めます。自分でも手を動かすPM/PLです。' },
  { t: 'モバイルエンジニア', d: 'iOS / Android アプリの設計と開発。業務システムと連動する、現場で使うアプリをつくります。' },
  { t: 'Webデザイナー', d: 'UI/UXの設計からデザインまで。使う人が迷わない画面を、開発のすぐ隣でつくります。' },
  { t: 'インフラエンジニア', d: 'AWSを中心としたクラウドの設計と運用。止まらない基盤でシステムを支えます。' },
  { t: 'セキュリティエンジニア', d: '脆弱性診断、セキュアな設計、運用監視。お客様の業務データを守ります。' },
];
const POINTS = [
  { t: '任せる、すぐ直す', d: '意思決定が速く、自分の判断で進められる範囲が広い環境です。' },
  { t: '学習の支援', d: '技術書の購入、セミナーやカンファレンスへの参加を会社が支援します。' },
  { t: 'フラットな組織', d: '肩書きにかかわらず、誰でも意見を出せます。' },
  { t: '使う人の近くで', d: 'お客様の業務を直接見て、使われるものをつくります。' },
];

export default function Recruit() {
  return (
    <main data-page="recruit">
      <JsonLd data={crumbLd([{ name: 'ホーム', path: '/' }, { name: '採用情報', path: '/recruit' }])} />
      <PageHead crumbs={[{ name: '採用情報' }]} title="採用情報"
        lead="使う人の仕事を見て、その人のためのシステムをつくる。そういう開発をしたい方と働きたいと考えています。経験よりも、つくることへの熱量を重視します。"
        rings={[[0.84, 0.44, 0.3, 0.62, 1], [0.98, 0.44, 0.3, 0.62, 0.5], [1.12, 0.44, 0.3, 0.62, 0.25]]}
        ringsM={[[0.9, 0.12, 0.42, 0.62, 0.9], [1.1, 0.12, 0.42, 0.62, 0.4], [0.5, 0.5, 0.1, 0.6, 0]]} />
      <div className="wrap">
        <section className="row" data-sec="" data-rings={R([[1.08, 0.5, 0.3, 0.62, 0.4], [-0.08, 0.85, 0.18, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}>
          <div>
            <Label n="01">募集職種</Label>
            <h2 className="h2" data-rv="">現在募集中の<br />ポジション</h2>
          </div>
          <ul className="list1" data-rv="">{POSITIONS.map(p => <li key={p.t}><b>{p.t}</b><span>{p.d}</span></li>)}</ul>
        </section>
        <section className="row" data-sec="">
          <div>
            <Label n="02">働く環境</Label>
            <h2 className="h2" data-rv="">Linkleで働く</h2>
          </div>
          <ul className="list2" data-rv="">{POINTS.map(p => <li key={p.t}><b>{p.t}</b><span>{p.d}</span></li>)}</ul>
        </section>
      </div>
      <section className="cta" data-sec="" data-rings={R([[0.5, 0.5, 1.5, 0, 1]])} data-rings-m={R([[0.5, 0.5, 2.6, 0, 1]])}>
        <div className="wrap">
          <h2 data-rv="">まずは、<br />話してみませんか。</h2>
          <p data-rv="" style={{ '--d': 1 }}>カジュアル面談からでも歓迎です。お問い合わせフォームの種別で「採用について」をお選びください。</p>
          <div className="cta-act" data-rv="" style={{ '--d': 2 }}>
            <a className="btn" href={`/contact?kind=${encodeURIComponent('採用について')}`}>カジュアル面談を申し込む<Arrow /></a>
          </div>
        </div>
      </section>
    </main>
  );
}
