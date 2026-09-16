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

function Card({ card, i, layout, inView, reducedMotion, glyphSize }) {
  const wide = layout === 'wide';
  const tilt = wide ? 0 : (layout === 'track6' ? TILTS6 : TILTS4)[i % 6];
  const step = wide ? 0 : i;
  const latin = isLatin(card.title);
  const items = Array.isArray(card.items) ? card.items : null;
  return (
    <motion.article
      className="relative bg-white flex flex-col"
      style={{
        width: wide ? 'min(100%, calc(2 * var(--bp-card-w) + var(--bp-card-gap)))' : 'var(--bp-card-w)',
        height: wide ? 'auto' : 'var(--bp-card-h)',
        borderRadius: 'var(--bp-card-r)',
        padding: 'var(--bp-card-pad)',
        boxShadow: 'none',
        color: 'var(--bp-ink-dark)',
        transform: `translateY(calc(-1 * ${step} * var(--bp-card-step))) rotate(${tilt}deg)`,
        flex: '0 0 auto',
      }}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={reducedMotion ? { duration: 0.2 } : { duration: T.card.d, ease: EASE, delay: i * T.card.stagger }}
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
    </motion.article>
  );
}

/**
 * G14: 白カード群。row4（4 枚）/ track6（6 枚横トラック、p で横流し）/ wide（2 カード幅 664px、傾きなし）
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
        {cards.map((c, i) => <Card key={i} card={c} i={i} layout="wide" inView={inView} reducedMotion={reducedMotion} glyphSize={glyphSize} />)}
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
        {cards.map((c, i) => <Card key={i} card={c} i={i} layout={layout} inView={inView} reducedMotion={reducedMotion} glyphSize={glyphSize} />)}
      </motion.div>
    </div>
  );
}
