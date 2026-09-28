import React, { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useWrapperInView } from '../../lib/scroll/useWrapperInView';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { EASE, T } from '../../lib/motion/timings';
import { isLatin } from '../../lib/text/splitText';
import PixelGlyph from '../ui/PixelGlyph';
import DimensionLine from '../ui/DimensionLine';

const TILTS4 = [-0.5, 0.5, 1.0, 1.5];
const TILTS6 = [-0.5, 0.5, 1.0, 1.5, 1.0, 0.5];

/** カードの幅（px）。CSS 変数 --bp-card-w と同じ式 */
const cardWidthPx = () => {
  if (typeof window === 'undefined') return 316;
  if (window.innerWidth < 768) return 240;
  return Math.min(316, Math.max(240, window.innerWidth * 0.209));
};

/**
 * カード裏（トランプの裏面）。ブランド面と同色の地に白い二重枠 + ドット地紋 + 中央に L の紋章。
 * lusion（2026-09）のカード裏を B 案の記号系（5×7 ドット）で置き換えたもの。
 */
function CardBack() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        borderRadius: 'var(--bp-card-r)',
        background: 'var(--bp-brand)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        color: '#fff',
      }}
      aria-hidden="true"
    >
      <div className="absolute" style={{ inset: 12, border: '1.5px solid rgba(255,255,255,.9)', borderRadius: 'calc(var(--bp-card-r) - 6px)' }} />
      <div
        className="absolute"
        style={{
          inset: 22,
          border: '1px solid rgba(255,255,255,.7)',
          borderRadius: 'calc(var(--bp-card-r) - 12px)',
          backgroundImage: 'radial-gradient(rgba(255,255,255,.55) 1px, transparent 1.2px)',
          backgroundSize: '12px 12px',
          backgroundPosition: '6px 6px',
        }}
      />
      <div className="relative flex items-center justify-center" style={{ width: 84, height: 84, borderRadius: '50%', background: '#fff', color: 'var(--bp-ink-dark)' }}>
        <PixelGlyph char="L" size={42} />
      </div>
    </div>
  );
}

function Card({ card, i, n, layout, inView, reducedMotion, glyphSize }) {
  const wide = layout === 'wide';
  const tilt = wide ? 0 : (layout === 'track6' ? TILTS6 : TILTS4)[i % 6];
  const step = wide ? 0 : i * 6;
  const latin = isLatin(card.title);
  const items = Array.isArray(card.items) ? card.items : null;
  const flip = !wide && !reducedMotion;
  // 入場: 中央に重なった 1 束（裏向き）→ 扇状に広がって定位置へ → 左から順に表へ裏返る
  const centerDx = flip ? ((n - 1) / 2 - i) * (cardWidthPx() + 32) : 0;

  const front = (
    <div
      className="absolute inset-0 bg-white flex flex-col"
      style={{
        borderRadius: 'var(--bp-card-r)',
        padding: 'var(--bp-card-pad)',
        color: 'var(--bp-ink-dark)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <header className="flex items-start justify-between" style={{ gap: 16 }}>
        <h3
          className={`${latin ? 'font-latin uppercase' : 'palt'} font-medium m-0`}
          style={{ fontSize: latin ? 'var(--fs-card-title)' : 'var(--fs-card-title-ja)', lineHeight: 1.2 }}
        >
          {card.title}
        </h3>
        <span className="flex" style={{ gap: 4 }} aria-hidden="true">
          {String(card.glyph).split('').map((g, k) => <PixelGlyph key={k} char={g} size={glyphSize} />)}
        </span>
      </header>
      <div className="flex-1" style={{ marginTop: 20 }}>
        {items ? (
          <ul className="m-0 p-0 list-none">
            {items.map((it, k) => (
              <li
                key={k}
                style={{
                  fontSize: 'var(--fs-card-item)',
                  lineHeight: 1.5,
                  minHeight: 52,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: k < items.length - 1 ? '1px dotted var(--bp-rule-card)' : 'none',
                  padding: '8px 0',
                }}
              >
                {it}
              </li>
            ))}
          </ul>
        ) : card.items}
      </div>
      {!wide && (
        <footer className="flex items-center justify-between" style={{ transform: 'rotate(180deg)', marginTop: 16 }} aria-hidden="true">
          <span className="flex" style={{ gap: 4 }}>
            {String(card.glyph).split('').map((g, k) => <PixelGlyph key={k} char={g} size={glyphSize} />)}
          </span>
          <span className={`${latin ? 'font-latin uppercase' : 'palt'} font-medium`} style={{ fontSize: latin ? 'var(--fs-card-title)' : 'var(--fs-card-title-ja)' }}>{card.title}</span>
        </footer>
      )}
    </div>
  );

  if (wide) {
    // 幅広カード（地図・フォーム）は裏返さない。通常フローで高さは中身に従う
    return (
      <motion.article
        className="relative bg-white flex flex-col"
        style={{
          width: 'min(100%, calc(2 * var(--bp-card-w) + var(--bp-card-gap)))',
          borderRadius: 'var(--bp-card-r)',
          padding: 'var(--bp-card-pad)',
          color: 'var(--bp-ink-dark)',
          flex: '0 0 auto',
        }}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={reducedMotion ? { duration: 0.2 } : { duration: T.card.d, ease: EASE }}
      >
        <header className="flex items-start justify-between" style={{ gap: 16 }}>
          <h3 className={`${latin ? 'font-latin uppercase' : 'palt'} font-medium m-0`} style={{ fontSize: latin ? 'var(--fs-card-title)' : 'var(--fs-card-title-ja)', lineHeight: 1.2 }}>{card.title}</h3>
          <span className="flex" style={{ gap: 4 }} aria-hidden="true">
            {String(card.glyph).split('').map((g, k) => <PixelGlyph key={k} char={g} size={glyphSize} />)}
          </span>
        </header>
        <div className="flex-1" style={{ marginTop: 20 }}>{card.items}</div>
      </motion.article>
    );
  }

  return (
    <motion.article
      className="relative"
      style={{
        width: 'var(--bp-card-w)',
        height: 'var(--bp-card-h)',
        flex: '0 0 auto',
        perspective: 1400,
        zIndex: n - i, // 束のとき左のカードが上
      }}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: centerDx, y: 160, rotate: (i - (n - 1) / 2) * -4 }}
      animate={inView ? { opacity: 1, x: 0, y: -step, rotate: tilt } : undefined}
      transition={reducedMotion ? { duration: 0.2 } : { duration: T.cardFan, ease: EASE, delay: 0.1 + i * 0.05 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        initial={{ rotateY: flip ? 180 : 0 }}
        animate={inView ? { rotateY: 0 } : undefined}
        transition={{ duration: T.cardFlip, ease: EASE, delay: T.cardFan + 0.15 + i * T.card.stagger * 2 }}
      >
        {front}
        {flip && <CardBack />}
      </motion.div>
    </motion.article>
  );
}

/**
 * G14: 白カード群。row4（4 枚）/ track6（6 枚横トラック、p で横流し）/ wide（2 カード幅 664px、傾きなし）
 * 入場は lusion（2026-09）と同じ「裏向きの束 → 扇 → 左から順に裏返る」。
 * @param {{ cards: {title:string, items:any, glyph:string}[], layout?: 'row4'|'track6'|'wide', progress?: MotionValue }} props
 */
export default function ExpertiseCards({ cards, layout = 'row4', progress }) {
  const ref = useRef(null);
  const inView = useWrapperInView(ref, { amount: 0.4, once: true });
  const { reducedMotion, isMobile, isTablet } = useMotionPrefs();
  const glyphSize = isMobile ? 28 : 34;
  const trackX = useTransform(progress || { get: () => 0, on: () => () => {} }, (v) => {
    if (layout !== 'track6' || typeof window === 'undefined') return 0;
    const t = Math.min(1, Math.max(0, (v - 0.15) / 0.7));
    const cardW = Math.min(316, Math.max(240, window.innerWidth * 0.209));
    const trackW = 6 * cardW + 5 * 32;
    const visible = window.innerWidth - 2 * Math.max(20, window.innerWidth * 0.05);
    return -Math.max(0, trackW - visible) * t;
  });

  if (!cards || cards.length === 0) return null;

  if (layout === 'wide') {
    return (
      <div ref={ref} className="flex justify-center w-full">
        {cards.map((c, i) => <Card key={i} card={c} i={i} n={cards.length} layout="wide" inView={inView} reducedMotion={reducedMotion} glyphSize={glyphSize} />)}
      </div>
    );
  }

  const isTrack = layout === 'track6' && !isTablet;
  return (
    <div ref={ref} className="relative w-full" style={{ paddingTop: 24 }}>
      <DimensionLine axis="x" length="100%" label="1.0°" color="var(--bp-dim-dark)" style={{ position: 'absolute', top: 0, left: 0 }} />
      <motion.div
        className={layout === 'row4' || isTablet ? 'bp-cards-row4' : ''}
        data-lenis-prevent={isTablet ? 'true' : undefined}
        style={{
          display: isTrack ? 'flex' : 'grid',
          gridTemplateColumns: `repeat(${cards.length}, var(--bp-card-w))`,
          gap: 'var(--bp-card-gap)',
          justifyContent: isTrack ? 'flex-start' : 'center',
          x: isTrack ? trackX : 0,
          willChange: isTrack ? 'transform' : undefined,
          alignItems: 'start',
        }}
      >
        {cards.map((c, i) => <Card key={i} card={c} i={i} n={cards.length} layout={layout} inView={inView} reducedMotion={reducedMotion} glyphSize={glyphSize} />)}
      </motion.div>
    </div>
  );
}
