import { meta, crumbLd, serviceLd } from '@/lib/seo';
import { Arrow, JsonLd, Label, PageHead, Cta } from '@/components/ui';
import { SERVICE_BLOCKS } from '@/content/service';
import { flow } from '@/content/home';

const description = 'Linkle株式会社の事業内容。業務システム開発、FDE（常駐型の開発）、DX支援・業務効率化、Web制作。要件の整理から設計・開発・運用までを自社で一貫して行います。';
export const metadata = meta({ title: '事業内容 | 業務システム開発・FDE・DX支援・Web制作', description, path: '/service', og: 'service' });

const R = v => JSON.stringify(v);
const side = act => [0.17, 0.39, 0.61, 0.83].map((y, i) => [1.05, y, 0.155, 0.6, i === act ? 1 : 0.2]);

export default function Service() {
  return (
    <main data-page="service">
      <JsonLd data={crumbLd([{ name: 'ホーム', path: '/' }, { name: '事業内容', path: '/service' }])} />
      {SERVICE_BLOCKS.map(b => <JsonLd key={b.id} data={serviceLd({ name: b.name, description: b.body, path: `/service#${b.id}` })} />)}
      <PageHead crumbs={[{ name: '事業内容' }]} title="事業内容"
        lead="業務システム開発、FDE、DX支援、Web制作。どれも、今の仕事の進め方を伺うところから始めます。要件の整理から運用までを、自社で一貫して行います。"
        rings={[[0.62, 0.4, 0.22, 0.6, 1], [0.75, 0.4, 0.22, 0.6, 0.6], [0.88, 0.4, 0.22, 0.6, 0.38], [1.01, 0.4, 0.22, 0.6, 0.22]]}
        ringsM={[[0.62, 0.13, 0.3, 0.6, 0.9], [0.82, 0.13, 0.3, 0.6, 0.5], [1.02, 0.13, 0.3, 0.6, 0.3]]} />
      <div className="wrap">
        {SERVICE_BLOCKS.map((b, i) => (
          <section className="row svc-block" id={b.id} data-sec="" data-rings={R(side(i))} key={b.id}>
            <div>
              <Label n={`0${i + 1}`}>{b.label}</Label>
              <h2 className="h2" data-rv="">{b.name}{b.sub && <><br /><span className="h2-sub">{b.sub}</span></>}</h2>
            </div>
            <div>
              <p className="body" data-rv="">{b.body}</p>
              <ul className="list2" data-rv="" style={{ marginTop: 40 }}>
                {b.items.map(it => <li key={it.t}><b>{it.t}</b><span>{it.d}</span></li>)}
              </ul>
              {b.diff && (
                <div className="diff" data-rv="">
                  <p className="diff-t">{b.diff.title}</p>
                  <ul>{b.diff.items.map(t => <li key={t}>{t}</li>)}</ul>
                </div>
              )}
              {b.link && <p style={{ marginTop: 36 }} data-rv=""><a className="tl" href={b.link.href}>{b.link.label}<Arrow /></a></p>}
            </div>
          </section>
        ))}
        <section className="row" data-sec="" data-rings={R([[0.5, 1.42, 1.0, 0.985, 1], [0.5, 1.42, 0.84, 0.985, 0.6], [0.5, 1.42, 0.68, 0.985, 0.35]])}>
          <div>
            <Label n="05">進め方</Label>
            <h2 className="h2" data-rv="">まず、見本をつくります。</h2>
          </div>
          <div>
            <p className="body" data-rv="" style={{ marginBottom: 56 }}>ご契約の前に、御社向けのシステムの見本を無料でお作りします。画面を見て、使えそうかどうかを確かめてから決めてください。</p>
            <ol className="flow two">
              {flow.map((f, i) => (
                <li className={f.free ? 'free' : undefined} data-rv="" key={f.t}>
                  <span className="num">0{i + 1}</span><h3>{f.t}{f.free && <em>無料</em>}</h3><p>{f.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
      <Cta />
    </main>
  );
}
