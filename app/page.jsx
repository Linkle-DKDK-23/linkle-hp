import { meta } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { Arrow, GuideLink, Label, Cta } from '@/components/ui';
import { hero, statement, services, flow, marquee } from '@/content/home';
import { INDUSTRIES } from '@/content/industries';

export const metadata = meta({
  title: 'Linkle株式会社 | 業務システム開発・FDE・DX支援・Web制作',
  description: 'Linkle株式会社は、業務システム開発・FDE・DX支援・Web制作を行う東京・池袋のシステム開発会社です。既製のソフトに仕事を合わせるのではなく、御社の業務の流れに合わせたシステムを一からつくります。',
  path: '/',
});

const svcRings = act => [0.17, 0.39, 0.61, 0.83].map((y, i) => [0.985, y, 0.155, 0.6, i === act ? 1 : 0.2]);
const R = v => JSON.stringify(v);

export default function Home() {
  return (
    <main data-page="top">
      <section className="hero" data-sec=""
        data-rings={R([[0.84, 0.57, 0.5, 0.62, 1], [1.04, 0.14, 0.3, 0.62, 0.5], [0.6, 1.1, 0.17, 0.62, 0.4]])}
        data-rings-m={R([[0.92, 0.17, 0.62, 0.62, 1], [0.34, 0.02, 0.3, 0.62, 0.45], [0.5, 0.5, 0.1, 0.6, 0]])}>
        <div className="wrap">
          <h1>{hero.lines.map((l, i) => <span className="ln" style={{ '--d': i }} key={i}><span>{l}</span></span>)}</h1>
          <p className="lead hero-fade">{hero.lead}</p>
          <div className="hero-act hero-fade">
            <a className="btn" href="/contact">相談する<Arrow /></a>
            <div className="hero-links">
              <GuideLink from="hero"><span className="tag">GUIDE</span>サービス資料を見る<Arrow /></GuideLink>
              <a href="/construction-dx"><span className="tag">FOCUS</span>建設業向けシステム開発<Arrow /></a>
            </div>
          </div>
        </div>
        <div className="scroll-cue" aria-hidden="true"><i></i>SCROLL</div>
      </section>

      <section className="stmt" data-sec="" data-pin="stmt"
        data-rings={R([[0.5, 0.5, 0.8, 0.985, 1], [0.1, 0.2, 0.045, 0.6, 0.7], [0.91, 0.84, 0.07, 0.6, 0.45]])}
        data-rings-m={R([[0.5, 0.5, 1.25, 0.985, 1], [0.12, 0.14, 0.07, 0.6, 0.6], [0.9, 0.9, 0.1, 0.6, 0.4]])}>
        <div className="pin"><div className="wrap">
          <p data-scrub="">{statement}</p>
        </div></div>
      </section>

      <section className="hs" data-sec="" data-pin="hs"
        data-rings-steps={R(services.map((_, i) => svcRings(i)))}
        data-rings={R(svcRings(0))}
        data-rings-m={R([[1.02, 0.3, 0.3, 0.6, 0.4]])}>
        <div className="pin"><div className="wrap svc">
          <div className="svc-side">
            <p className="label"><span className="num">01</span>事業内容</p>
            <h2 className="h2">事業は四つ。<br />考え方は一つです。</h2>
            <ol className="svc-idx">{services.map(s => <li key={s.id}><i></i>{s.name}</li>)}</ol>
            <p className="hs-count num" aria-hidden="true"><b>01</b> / 04</p>
          </div>
          <div className="hs-view"><div className="hs-track">
            {services.map((s, i) => (
              <article className="svc-step" key={s.id}>
                <p className="num">0{i + 1}</p>
                <h3>{s.name}{s.sub && <small>{s.sub}</small>}</h3>
                <p className="body">{s.body}</p>
                <ul className="pts">{s.points.map(p => <li key={p}>{p}</li>)}</ul>
                <a className="tl" href={`/service#${s.id}`}>{s.link}<Arrow /></a>
              </article>
            ))}
          </div></div>
        </div></div>
      </section>

      <section className="iris" data-sec="" data-pin="iris"
        data-rings={R([[0.79, 0.5, 0.4, 0.87, 1], [0.79, 0.5, 0.275, 0.82, 0.75], [0.79, 0.5, 0.135, 0, 1], [0.79, 0.5, 1.7, 0, 0.2]])}
        data-rings-m={R([[1.0, 0.12, 0.5, 0.87, 0.8], [1.0, 0.12, 0.34, 0.82, 0.6], [1.0, 0.12, 0.16, 0, 0.8]])}>
        <div className="pin"><div className="wrap focus">
          <div>
            <Label n="02">注力領域</Label>
            <h2 className="h2" data-rv="">なかでも、建設業。</h2>
            <p className="body" data-rv="" style={{ '--d': 1 }}>現場の手配、職人への連絡、図面からの材料の拾い出し、請求。建設業の事務は、業種ごとに進め方が違い、既製のソフトでは合わない部分が残ります。Linkleは専門工事会社の業務システムを開発しています。</p>
            <div className="fact" data-rv="" style={{ '--d': 2 }}>
              <b>1<small>日</small>4<small>時間</small></b>
              <span>専門工事会社での開発事例。<br />事務作業にかかる時間を減らしました。</span>
            </div>
            <div className="inds" data-rv="" style={{ '--d': 3 }}>
              {INDUSTRIES.map(i => <a href={`/industries/${i.slug}`} key={i.slug}>{i.short}</a>)}
            </div>
            <a className="tl" href="/construction-dx" data-rv="" style={{ '--d': 4 }}>建設業向けシステム開発を見る<Arrow /></a>
          </div>
        </div></div>
      </section>

      <div className="mq" aria-hidden="true">
        {marquee.map((row, i) => <div key={i}>{row.map(w => <span key={w}>{w}</span>)}</div>)}
      </div>

      <section className="fl" data-sec="" data-pin="flow"
        data-rings={R([[0.5, 1.42, 1.0, 0.985, 1], [0.5, 1.42, 0.84, 0.985, 0.6], [0.5, 1.42, 0.68, 0.985, 0.35]])}
        data-rings-m={R([[0.5, 1.1, 1.3, 0.985, 1], [0.5, 1.1, 1.05, 0.985, 0.6], [0.5, 1.1, 0.8, 0.985, 0.35]])}>
        <div className="pin"><div className="wrap">
          <div className="flow-head">
            <div>
              <Label n="03">進め方</Label>
              <h2 className="h2" data-rv="">まず、見本をつくります。</h2>
            </div>
            <p className="body" data-rv="" style={{ '--d': 1 }}>ご契約の前に、御社向けのシステムの見本を無料でお作りします。画面を見て、使えそうかどうかを確かめてから決めてください。</p>
          </div>
          <ol className="flow">
            {flow.map((f, i) => (
              <li className={f.free ? 'free' : undefined} key={f.t}>
                <span className="num">0{i + 1}</span>
                <h3>{f.t}{f.free && <em>無料</em>}</h3>
                <p>{f.d}</p>
              </li>
            ))}
          </ol>
        </div></div>
      </section>

      <section className="sec" data-sec=""
        data-rings={R([[1.06, 0.5, 0.34, 0.62, 0.55], [-0.1, 0.9, 0.2, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}
        data-rings-m={R([[1.1, 0.9, 0.4, 0.62, 0.35], [0.5, 0.5, 0.1, 0.6, 0], [0.5, 0.5, 0.1, 0.6, 0]])}>
        <div className="wrap co">
          <div>
            <Label n="04">会社概要</Label>
            <h2 className="h2" data-rv="">Linkleについて</h2>
          </div>
          <div>
            <dl className="tbl" data-rv="">
              <div><dt>会社名</dt><dd>{SITE.name}</dd></div>
              <div><dt>設立</dt><dd className="num">2025年1月23日</dd></div>
              <div><dt>代表者</dt><dd>{SITE.representative}</dd></div>
              <div><dt>所在地</dt><dd>{SITE.region}{SITE.locality}{SITE.street}</dd></div>
              <div><dt>メンバー</dt><dd className="num">{SITE.members}</dd></div>
              <div><dt>事業内容</dt><dd>業務システム開発 / FDE / DX支援・業務効率化 / Web制作</dd></div>
            </dl>
            <p style={{ marginTop: 32 }} data-rv=""><a className="tl" href="/about">会社概要を見る<Arrow /></a></p>
          </div>
        </div>
      </section>

      <Cta />
    </main>
  );
}
