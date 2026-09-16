import React, { useRef, useState } from 'react';
import { useWrapperInView } from '../../lib/scroll/useWrapperInView';
import { useTransition } from '../../lib/transition/TransitionProvider';
import { useTransitionNavigate, TLink } from '../../lib/transition/useTransitionNavigate';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import RevealLines from '../ui/RevealLines';
import SheetNumber from '../ui/SheetNumber';

const navItems = [
  { path: '/', label: 'ホーム' },
  { path: '/about', label: '会社概要' },
  { path: '/service', label: 'サービス' },
  { path: '/recruit', label: '採用情報' },
  { path: '/contact', label: 'お問い合わせ' },
];

/**
 * G19: 白面フッター（61vh、4 カラム）。既存 Footer.js の文言をすべて引き継ぐ。行マスク・リビール + 黒い `↑`。
 * col1: Linkle / Company + 住所 4 行、col2: Quick Links 5 + Contact 2 行、col3〜4: 大見出し 3 行 + 入力欄 510×65。
 */
export default function FooterReveal({ sheet }) {
  const currentYear = new Date().getFullYear();
  const ref = useRef(null);
  const inView = useWrapperInView(ref, { amount: 0.3, once: true });
  const { getLenis } = useTransition();
  const go = useTransitionNavigate();
  const { isMobile } = useMotionPrefs();
  const [email, setEmail] = useState('');
  const short = typeof window !== 'undefined' && window.innerHeight < 900;
  const lh = short ? 22 : 24;
  const blockGap = short ? 32 : 40;

  const scrollToTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
  };
  const submit = (e) => {
    e.preventDefault();
    go(`/contact?email=${encodeURIComponent(email)}`);
  };

  const colStyle = { position: 'relative', paddingLeft: 16, fontSize: 17, lineHeight: `${lh}px`, color: 'var(--bp-ink-dark)' };
  const guide = <i className="absolute top-0 bottom-0 block" style={{ left: 0, width: 1, background: 'var(--bp-dim-dark)' }} aria-hidden="true" />;
  const headingStyle = { fontFamily: '"Instrument Sans", sans-serif', fontWeight: 500, fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--bp-ink-dark-muted)', marginBottom: 6, display: 'block' };

  return (
    <footer
      ref={ref}
      className={`bp-reveal relative ${inView ? 'in' : ''}`}
      data-surface="light"
      style={{
        height: isMobile ? 'auto' : '61vh',
        minHeight: isMobile ? '61vh' : undefined,
        background: '#fff',
        color: 'var(--bp-ink-dark)',
        padding: isMobile ? '64px var(--bp-margin) 120px' : '56px var(--bp-margin) 40px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, var(--bp-footer-pitch))',
        rowGap: isMobile ? 48 : 0,
        alignItems: 'start',
        overflow: 'hidden',
      }}
    >
      {/* col1 */}
      <div style={colStyle}>
        {guide}
        <RevealLines lines={[{ text: 'Linkle', node: <TLink to="/" className="font-latin uppercase font-medium" style={{ fontSize: 22, letterSpacing: '.08em' }}>Linkle</TLink> }]} startRow={0} />
        <div style={{ marginTop: 20 }}>
          <RevealLines lines={[{ text: 'Company', node: <span style={headingStyle}>Company</span> }]} startRow={1} />
          <RevealLines lines={['Linkle株式会社', '〒171-0021', '東京都豊島区西池袋2-36-1', 'ソフトタウン池袋913号']} startRow={2} style={{ lineHeight: '27px' }} />
        </div>
      </div>

      {/* col2 */}
      <div style={colStyle}>
        {guide}
        <RevealLines lines={[{ text: 'Quick Links', node: <span style={headingStyle}>Quick Links</span> }]} startRow={1} />
        <RevealLines
          as="nav"
          lines={navItems.map((item, i) => ({
            text: item.label,
            node: <TLink to={item.path} className="palt" style={{ display: 'inline-block', transition: 'transform 200ms var(--bp-ease)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}>{item.label}</TLink>,
            key: i,
          }))}
          startRow={2}
        />
        <div style={{ marginTop: blockGap }}>
          <RevealLines lines={[{ text: 'Contact', node: <span style={headingStyle}>Contact</span> }]} startRow={7} />
          <RevealLines lines={['ご質問やご相談は', 'お気軽にお問い合わせください']} startRow={8} />
        </div>
      </div>

      {/* col3〜4 */}
      <div style={{ ...colStyle, gridColumn: isMobile ? '1' : '3 / span 2' }}>
        {guide}
        <RevealLines
          as="p"
          className="m-0 palt font-medium"
          style={{ fontSize: 'var(--fs-footer-h-ja)', lineHeight: 1.3 }}
          lines={['最新のWeb技術とデザインで、', 'お客様のビジネスを', '次のステージへ。']}
          startRow={0}
        />
        <form onSubmit={submit} className="relative" style={{ marginTop: 24, width: isMobile ? '100%' : 'var(--bp-input-w)', maxWidth: '100%' }}>
          <span className="mask-line">
            <span className="line" style={{ '--r': 3 }}>
              <label className="sr-only" htmlFor="footer-email">example@example.com</label>
              <input
                id="footer-email"
                type="email"
                className="bp-field"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingRight: 64 }}
              />
              <button
                type="submit"
                aria-label="お問い合わせ"
                className="absolute"
                style={{ right: 12, top: 0, height: 'var(--bp-input-h)', width: 44, background: 'none', border: 0, fontSize: 20, color: 'var(--bp-ink-dark)' }}
              >
                →
              </button>
            </span>
          </span>
        </form>
      </div>

      {/* 最下行 */}
      <div
        className={isMobile ? 'relative' : 'absolute'}
        style={isMobile
          ? { display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }
          : { left: 'var(--bp-margin)', right: 'var(--bp-margin)', bottom: 40, display: 'grid', gridTemplateColumns: 'repeat(4, var(--bp-footer-pitch))', alignItems: 'center', fontSize: 13 }}
      >
        <div style={{ paddingLeft: 16 }}>
          <RevealLines lines={[`© ${currentYear} Linkle Inc. All rights reserved.`]} startRow={9} />
        </div>
        {!isMobile && <div />}
        {!isMobile && <div style={{ paddingLeft: 16 }}><SheetNumber n={sheet} style={{ color: 'var(--bp-dim-dark)' }} /></div>}
        <div style={{ paddingLeft: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <RevealLines lines={[{ text: 'お問い合わせ', node: <TLink to="/contact" className="palt font-medium" style={{ borderBottom: '1px solid currentColor' }}>お問い合わせ</TLink> }]} startRow={9} />
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="ページの先頭へ"
            className="inline-flex items-center justify-center"
            style={{
              width: 'var(--bp-top-btn)', height: 'var(--bp-top-btn)', borderRadius: '50%', background: '#000', color: '#fff', border: 0, fontSize: 18,
              transition: 'transform 120ms var(--bp-ease), background-color 240ms var(--bp-ease)',
              flex: '0 0 auto',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(.98)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
          >
            ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
