import { meta, crumbLd } from '@/lib/seo';
import { JsonLd, Label, PageHead } from '@/components/ui';
import ContactForm from '@/components/ContactForm';

const description = 'Linkle株式会社へのお問い合わせ。システム開発のご相談、無料見本のご依頼、FDE・Web制作のご相談はこちらから。まだ何も決まっていない段階でも構いません。';
export const metadata = meta({ title: 'お問い合わせ', description, path: '/contact', og: 'contact' });

export default function Contact() {
  return (
    <main data-page="contact">
      <JsonLd data={crumbLd([{ name: 'ホーム', path: '/' }, { name: 'お問い合わせ', path: '/contact' }])} />
      <PageHead crumbs={[{ name: 'お問い合わせ' }]} title="お問い合わせ"
        lead="今の業務の話を聞かせてください。まだ何も決まっていない段階で構いません。お話を伺ったうえで、御社向けの見本を無料でお作りします。"
        rings={[[0.9, 0.3, 0.34, 0.62, 1], [1.06, 0.62, 0.2, 0.62, 0.45], [0.5, 0.5, 0.1, 0.6, 0]]}
        ringsM={[[0.95, 0.12, 0.5, 0.62, 0.9], [0.5, 0.5, 0.1, 0.6, 0], [0.5, 0.5, 0.1, 0.6, 0]]} />
      <div className="wrap">
        <section className="row" data-sec="" data-rings={JSON.stringify([[1.1, 0.6, 0.34, 0.62, 0.4], [-0.08, 0.9, 0.2, 0.62, 0.3], [0.5, 0.5, 0.1, 0.6, 0]])}>
          <div>
            <Label n="01">フォーム</Label>
            <h2 className="h2" data-rv="">ご相談・お見積りは<br />無料です。</h2>
            <p className="body side-note" data-rv="">内容を確認のうえ、担当者よりメールでご連絡します。</p>
          </div>
          <div data-rv=""><ContactForm /></div>
        </section>
      </div>
    </main>
  );
}
