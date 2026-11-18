import { NAV } from '@/lib/site';
import { RingMark, GuideLink } from './ui';

export default function Header() {
  return (
    <>
      <header className="hd">
        <a className="logo" href="/" aria-label="Linkle トップへ"><RingMark /><span>Linkle</span></a>
        <nav aria-label="メイン">{NAV.map(n => <a href={n.href} data-nav={n.key} key={n.key}>{n.label}</a>)}</nav>
        <div className="hd-cta">
          <GuideLink className="tl plain" from="header">資料を見る</GuideLink>
          <a className="btn sm" href="/contact">相談する</a>
        </div>
        <button className="mb" aria-label="メニュー" aria-expanded="false" aria-controls="mm"><i></i></button>
      </header>
      <div className="mm" id="mm">
        {NAV.map(n => <a href={n.href} key={n.key}>{n.label}</a>)}
        <GuideLink from="menu">資料を見る</GuideLink>
        <a className="btn" href="/contact">相談する</a>
      </div>
      <div className="prog" aria-hidden="true">
        <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23" /><circle cx="26" cy="26" r="23" /></svg>
        <span className="num">01</span>
      </div>
    </>
  );
}
