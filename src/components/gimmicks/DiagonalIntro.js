import React, { useMemo, useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { splitBunsetsu, isLatin } from '../../lib/text/splitText';
import { useWrapperInView } from '../../lib/scroll/useWrapperInView';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { EASE, T } from '../../lib/motion/timings';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** 退場の開始位置（セクション進捗）。lusion では次見出しが現れる直前に文が左へ流れ出る */
const EXIT_START = 0.72;
const EXIT_LEN = 0.22;

function Block({ text, italicPrefix, startIndex, inView, align, style, reducedMotion }) {
  const parts = useMemo(() => splitBunsetsu(text), [text]);
  const latin = isLatin(text);
  let prefixLeft = italicPrefix || '';
  return (
    <p
      className={`palt ${latin ? 'font-latin' : ''}`}
      style={{
        fontSize: latin ? 'var(--fs-intro)' : 'var(--fs-intro-ja)',
        lineHeight: 1.3,
        fontWeight: 400,
        color: 'var(--bp-ink)',
        textAlign: align,
        margin: 0,
        ...style,
      }}
    >
      {parts.map((w, k) => {
        let italic = false;
        if (prefixLeft && prefixLeft.startsWith(w)) { italic = true; prefixLeft = prefixLeft.slice(w.length); }
        return (
          <motion.span
            key={k}
            className={`inline-block ${italic ? 'skew-italic' : ''}`}
            style={{ marginRight: '.4em', willChange: 'transform' }}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: '.6em' }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={reducedMotion ? { duration: 0.2 } : { duration: T.bunsetsu.d, ease: EASE, delay: (startIndex + k) * T.bunsetsu.stagger }}
          >
            {w}
          </motion.span>
        );
      })}
    </p>
  );
}

/**
 * G6: 対角配置（左上 / 右下）+ 文節ステージ出現。
 * progress（セクション進捗 0〜1）を渡すと、終盤に 2 つの文が左へ流れ出て次セクションへ場所を渡す（lusion の退場）。
 * @param {{ topLeft: string, bottomRight: string, italicPrefix?: string, progress?: import('framer-motion').MotionValue<number> }} props
 */
export default function DiagonalIntro({ topLeft, bottomRight, italicPrefix, progress }) {
  const ref = useRef(null);
  const inView = useWrapperInView(ref, { amount: 0.3, once: true });
  const { reducedMotion, isMobile } = useMotionPrefs();
  const topCount = useMemo(() => splitBunsetsu(topLeft).length, [topLeft]);
  const still = useMemo(() => ({ get: () => 0, on: () => () => {} }), []);
  const src = progress || still;
  const xTop = useTransform(src, (v) => (reducedMotion ? 0 : `${-120 * smoothstep(EXIT_START, EXIT_START + EXIT_LEN, v)}vw`));
  const xBottom = useTransform(src, (v) => (reducedMotion ? 0 : `${-120 * smoothstep(EXIT_START + 0.04, EXIT_START + EXIT_LEN + 0.04, v)}vw`));
  const fade = useTransform(src, (v) => (reducedMotion ? 1 - smoothstep(EXIT_START, EXIT_START + 0.1, v) : 1));
  return (
    <div
      ref={ref}
      className="absolute inset-0"
      style={{
        display: 'grid',
        gridTemplateRows: '1fr 1fr',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        padding: '0 var(--bp-margin)',
      }}
    >
      <motion.div style={{ gridArea: isMobile ? '1 / 1' : '1 / 1', paddingTop: 'calc(170 / 827 * 100vh)', maxWidth: 'min(56vw, 720px)', minWidth: isMobile ? '100%' : undefined, x: xTop, opacity: fade }}>
        <Block text={topLeft} italicPrefix={italicPrefix} startIndex={0} inView={inView} align="left" reducedMotion={reducedMotion} />
      </motion.div>
      <motion.div style={{ gridArea: isMobile ? '2 / 1' : '2 / 2', alignSelf: 'end', justifySelf: 'end', paddingBottom: '10vh', maxWidth: 'min(56vw, 720px)', minWidth: isMobile ? '100%' : undefined, x: xBottom, opacity: fade }}>
        <Block text={bottomRight} startIndex={topCount} inView={inView} align="right" reducedMotion={reducedMotion} />
      </motion.div>
    </div>
  );
}
