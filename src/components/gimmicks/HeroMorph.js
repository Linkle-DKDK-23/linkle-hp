import React, { useMemo } from 'react';
import { motion, useTransform } from 'framer-motion';
import { splitChars, isLatin } from '../../lib/text/splitText';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import HeroTitle from './HeroTitle';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** 1 文字分の G4 変形 MotionValue 群 */
function useLetterMorph(p, i, n, reducedMotion, isMobile) {
  const t = useTransform(p, (v) => clamp01((v - 0.02 - i * 0.03) / 0.3));
  const scaleX = useTransform(t, (v) => (reducedMotion ? 1 : i === 0 ? 1 - 0.4 * v : 1 + 1.6 * v));
  const skewX = useTransform(t, (v) => (reducedMotion ? 0 : -18 * v));
  const x = useTransform(t, (v) => (reducedMotion ? 0 : `${(isMobile ? 30 : 60) * v * (i / n)}vw`));
  const rotate = useTransform(t, (v) => (reducedMotion ? 0 : (i % 2 ? -6 : 4) * v));
  const opacity = useTransform([t, p], ([v, pv]) => (reducedMotion ? (pv >= 0.3 ? 0 : 1) : 1 - smoothstep(0.55, 1, v)));
  return { scaleX, skewX, x, rotate, opacity, transformOrigin: 'left bottom' };
}

function TagLine({ p, j, text, italic, reducedMotion, align }) {
  const u = useTransform(p, (v) => clamp01((v - 0.25 - j * 0.05) / 0.2));
  const clip = useTransform(u, (v) => (reducedMotion ? 'inset(0 0 0 0)' : `inset(0 0 ${(1 - v) * 100}% 0)`));
  const color = useTransform(u, [0, 1], ['#8a8d96', '#f0f1fa']);
  const opacity = useTransform(p, (v) => (reducedMotion ? (v >= 0.3 ? 1 : 0) : 1));
  const latin = isLatin(text);
  return (
    <motion.span
      className={`block ${italic ? 'skew-italic' : ''} ${latin ? 'font-latin' : 'palt'}`}
      style={{
        clipPath: clip,
        color,
        opacity,
        fontSize: latin ? 'var(--fs-tagline)' : 'var(--fs-tagline-ja)',
        lineHeight: 1.42,
        fontWeight: 400,
        textAlign: align,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </motion.span>
  );
}

function RowNumber({ p, j }) {
  const opacity = useTransform(p, (v) => smoothstep(0.5, 0.6, v));
  return (
    <motion.span
      className="text-label absolute"
      style={{ left: 'calc(var(--bp-cross-x0) - var(--bp-margin))', top: '.45em', opacity, color: 'var(--bp-dim)' }}
      aria-hidden="true"
    >
      {String(j + 1).padStart(2, '0')}
    </motion.span>
  );
}

/**
 * G4: 巨大文字のゴム変形 → 左 4 行 / 右 2 行のタグライン着地。行番号 01〜06（B 案）。
 * 巨大文字は HeroTitle の span を使い回す（外側 span に MotionValue を渡す）。
 * @param {{ progress: MotionValue, lines: string[], play: boolean, left: string[], right: string[], italicLeft?: number[], italicRight?: boolean }} props
 */
export default function HeroMorph({ progress: p, lines, play, left, right, italicLeft = [], italicRight = false }) {
  const { reducedMotion, isMobile } = useMotionPrefs();
  const letters = useMemo(() => lines.flatMap((l) => splitChars(l)), [lines]);
  const n = letters.length;
  // hooks は固定数: 最大 12 文字まで対応（ページ名は最長 'OUR SERVICES' = 11）
  const styles = [];
  for (let i = 0; i < 12; i += 1) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    styles.push(useLetterMorph(p, i, Math.max(1, n), reducedMotion, isMobile));
  }
  const vignette = useTransform(p, (v) => 0.6 * smoothstep(0.6, 1, v));
  const titleOpacity = useTransform(p, (v) => (v > 0.62 ? 0 : 1));

  return (
    <>
      {/* 巨大文字（G3 のせり上がり + G4 の変形） */}
      <motion.div className="absolute left-0 right-0" style={{ bottom: '7vh', padding: '0 var(--bp-margin)', opacity: titleOpacity, zIndex: 2 }}>
        <HeroTitle lines={lines} play={play} letterStyles={styles.slice(0, n)} />
      </motion.div>

      {/* タグライン 6 行: 左 4 + 右 2 を同一 grid 行に置き align-items: end でベースライン共有 */}
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: '9vh',
          padding: '0 var(--bp-margin)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
          alignItems: 'end',
          columnGap: 40,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      >
        <div className="relative">
          {left.map((text, j) => (
            <span key={j} className="block relative">
              {!isMobile && <RowNumber p={p} j={j} />}
              <TagLine p={p} j={j} text={text} italic={italicLeft.includes(j)} reducedMotion={reducedMotion} align="left" />
            </span>
          ))}
          {isMobile && right.map((text, j) => (
            <span key={`r${j}`} className="block relative">
              <TagLine p={p} j={left.length + j} text={text} italic={italicRight} reducedMotion={reducedMotion} align="left" />
            </span>
          ))}
        </div>
        {!isMobile && (
          <div className="relative">
            {right.map((text, j) => (
              <span key={j} className="block relative">
                <RowNumber p={p} j={left.length + j} />
                <TagLine p={p} j={left.length + j} text={text} italic={italicRight} reducedMotion={reducedMotion} align="right" />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 後半: 周辺減光 */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,1) 100%)', opacity: vignette, zIndex: 1, pointerEvents: 'none' }}
        aria-hidden="true"
      />
    </>
  );
}
