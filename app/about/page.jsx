import { meta, crumbLd } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { Arrow, JsonLd, Label, PageHead, Cta } from '@/components/ui';

const description = 'Linkle株式会社の会社概要。2025年1月設立、東京都豊島区西池袋のシステム開発会社です。業務システム開発、FDE、DX支援・業務効率化、Web制作を行っています。';
export const metadata = meta({ title: '会社概要', description, path: '/about', og: 'about' });
const R = v => JSON.stringify(v);
const address = `${SITE.region}${SITE.locality}${SITE.street}`;

export default function About() {
  return (
    <main data-page="about">
      <JsonLd data={crumbLd([{ name: 'ホーム', path: '/' }, { name: '会社概要', path: '/about' }])} />
      <PageHead crumbs={[{ name: '会社概要' }]} title="会社概要"
        lead="Linkleは、2025年に設立したシステム開発会社です。今の仕事の進め方を伺い、その会社のためのシステムを一からつくります。"
        rings={[[0.86, 0.42, 0.34, 0.62, 1], [1.04, 0.14, 0.2, 0.62, 0.45], [0.5, 0.5, 0.1, 0.6, 0]]}
        ringsM={[[0.95, 0.12, 0.5, 0.62, 0.9], [0.5, 0.5, 0.1, 0.6, 0], [0.5, 0.5, 0.1, 0.6, 0]]} />
      <div className="wrap">
        <section className="row" data-sec="" data-rings={R([[0.5, 0.5, 0.8, 0.985, 0.7], [0.1, 0.2, 0.045, 0.6, 0.5], [0.91, 0.84, 0.07, 0.6, 0.4]])}>
          <div>
            <Label n="01">考え方</Label>
            <h2 className="h2" data-rv="">システムに、<br />仕事を合わせない。</h2>
          </div>
          <div>
            <p className="body" data-rv="">受注から請求までの流れは、会社ごとに違います。既製のソフトは便利ですが、合わない部分は人が手で埋めることになり、その手間は毎日積み重なります。</p>
            <p className="body" data-rv="">私たちは、今の進め方を聞くところから始めます。ご契約の前に御社向けの見本をつくり、画面を見て確かめていただいてから、設計・開発・運用までを自社で一貫して行います。</p>
          </div>
        </section>
        <section className="row" data-sec="" data-rings={R([[1.06, 0.5, 0.34, 0.62, 0.5], [-0.1, 0.9, 0.2, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}>
          <div>
            <Label n="02">会社情報</Label>
            <h2 className="h2" data-rv="">{SITE.name}</h2>
          </div>
          <dl className="tbl" data-rv="">
            <div><dt>会社名</dt><dd>{SITE.name}</dd></div>
            <div><dt>設立</dt><dd className="num">2025年1月23日</dd></div>
            <div><dt>代表者</dt><dd>{SITE.representative}</dd></div>
            <div><dt>資本金</dt><dd className="num">{SITE.capital}</dd></div>
            <div><dt>メンバー</dt><dd className="num">{SITE.members}</dd></div>
            <div><dt>所在地</dt><dd>〒{SITE.postalCode}<br />{address}</dd></div>
            <div><dt>事業内容</dt><dd>業務システム開発 / FDE / DX支援・業務効率化 / Web制作</dd></div>
          </dl>
        </section>
        <section className="row" data-sec="">
          <div>
            <Label n="03">アクセス</Label>
            <h2 className="h2" data-rv="">東京・池袋</h2>
          </div>
          <div>
            <p className="body" data-rv="">〒{SITE.postalCode}<br />{address}</p>
            <p style={{ marginTop: 28 }} data-rv=""><a className="tl" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener">地図を開く<Arrow /></a></p>
          </div>
        </section>
      </div>
      <Cta />
    </main>
  );
}
