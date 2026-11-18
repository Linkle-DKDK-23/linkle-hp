import { SITE } from '@/lib/site';

export const Arrow = () => (
  <svg className="ar" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M0 5h12.5M8.5 1l4 4-4 4" /></svg>
);

export const RingMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.2" fill="none" stroke="#6ccaf1" strokeWidth="3.4" /></svg>
);

/** 資料へのリンク。JS が動けば入力ダイアログを開き、動かなければ資料を直接開く。 */
export const GuideLink = ({ className, children, from }) => (
  <a className={className} href={SITE.guide} target="_blank" rel="noopener" data-guide="" data-from={from}>{children}</a>
);

export const JsonLd = ({ data }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
);

export const Label = ({ n, children }) => (
  <p className="label" data-rv=""><span className="num">{n}</span>{children}</p>
);

/** 下層ページの冒頭。rings は背景の輪の配置（[x, y, 半径, 内径比, 不透明度] × 最大4）。 */
export function PageHead({ crumbs, title, lead, rings, ringsM }) {
  const lines = Array.isArray(title) ? title : [title];
  return (
    <section className="ph" data-sec="" data-rings={JSON.stringify(rings)} data-rings-m={ringsM ? JSON.stringify(ringsM) : undefined}>
      <div className="wrap">
        <ol className="crumb">
          <li><a href="/">ホーム</a></li>
          {crumbs.map((c, i) => <li key={i}>{c.path ? <a href={c.path}>{c.name}</a> : c.name}</li>)}
        </ol>
        <h1>{lines.map((l, i) => <span className="ln" style={{ '--d': i }} key={i}><span>{l}</span></span>)}</h1>
        {lead && <p className="lead hero-fade">{lead}</p>}
      </div>
    </section>
  );
}

const DISC = [[0.5, 0.5, 1.5, 0, 1]];
const DISC_M = [[0.5, 0.5, 2.6, 0, 1]];

export function Cta({ title = ['今の業務の話を、', '聞かせてください。'], text = 'まだ何も決まっていない段階で構いません。お話を伺ったうえで、御社向けの見本を無料でお作りします。', guideLabel = 'サービス資料を見る', kind }) {
  return (
    <section className="cta" data-sec="" data-rings={JSON.stringify(DISC)} data-rings-m={JSON.stringify(DISC_M)}>
      <div className="wrap">
        <h2 data-rv="">{title.map((l, i) => <span key={i}>{l}{i < title.length - 1 && <br />}</span>)}</h2>
        <p data-rv="" style={{ '--d': 1 }}>{text}</p>
        <div className="cta-act" data-rv="" style={{ '--d': 2 }}>
          <a className="btn" href={kind ? `/contact?kind=${encodeURIComponent(kind)}` : '/contact'}>相談する<Arrow /></a>
          <GuideLink className="tl" from="cta">{guideLabel}<Arrow /></GuideLink>
        </div>
      </div>
    </section>
  );
}
