import { Arrow } from '@/components/ui';

export const metadata = { title: 'ページが見つかりません | Linkle株式会社', robots: { index: false } };

export default function NotFound() {
  return (
    <main data-page="404">
      <section className="ph nf" data-sec="" data-rings={JSON.stringify([[0.8, 0.5, 0.4, 0.62, 1], [0.5, 0.5, 0.1, 0.6, 0], [0.5, 0.5, 0.1, 0.6, 0]])}>
        <div className="wrap">
          <p className="label"><span className="num">404</span>Not Found</p>
          <h1><span className="ln"><span>ページが見つかりません</span></span></h1>
          <p className="lead hero-fade">お探しのページは、移動または削除された可能性があります。</p>
          <p className="hero-fade" style={{ marginTop: 40 }}><a className="btn" href="/">トップへ戻る<Arrow /></a></p>
        </div>
      </section>
    </main>
  );
}
