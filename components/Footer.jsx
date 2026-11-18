import { SITE } from '@/lib/site';
import { RingMark, GuideLink } from './ui';

export default function Footer() {
  return (
    <footer className="ft"><div className="wrap">
      <div className="ft-top">
        <div>
          <a className="logo" href="/"><RingMark /><span>Linkle</span></a>
          <address>{SITE.name}<br />〒{SITE.postalCode} {SITE.region}{SITE.locality}西池袋2-36-1<br />ソフトタウン池袋913号</address>
        </div>
        <div><h4>SERVICE</h4><ul>
          <li><a href="/service#system">業務システム開発</a></li>
          <li><a href="/service#fde">FDE</a></li>
          <li><a href="/service#dx">DX支援・業務効率化</a></li>
          <li><a href="/service#web">Web制作</a></li>
          <li><a href="/construction-dx">建設業向けシステム開発</a></li>
          <li><a href="/industries">業種から探す</a></li>
        </ul></div>
        <div><h4>COMPANY</h4><ul>
          <li><a href="/about">会社概要</a></li>
          <li><a href="/works">開発事例</a></li>
          <li><a href="/news">ニュース</a></li>
          <li><a href="/recruit">採用</a></li>
        </ul></div>
        <div><h4>CONTACT</h4><ul>
          <li><a href="/contact">相談する</a></li>
          <li><GuideLink from="footer">資料を見る</GuideLink></li>
        </ul></div>
      </div>
      <div className="ft-btm"><span>© {new Date().getFullYear()} Linkle Inc.</span><span>Tokyo, Japan</span></div>
    </div></footer>
  );
}
