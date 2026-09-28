import React, { useEffect, useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { splitChars, fitGiantFontSize } from '../../lib/text/splitText';
import { fontsReady } from '../../lib/text/measure';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { EASE, T } from '../../lib/motion/timings';
import DimensionLine from '../ui/DimensionLine';

/**
 * G3: 巨大ブランド名せり上がり。各行 overflow:hidden、文字 span が y 110% + rotate ±30° から着地。
 * 着地 200ms 前に文字の左右に寸法線を 400ms だけ出す。
 * G4 用に各文字の外側 span へ style を渡せる（letterStyles[i]）。
 * @param {{ lines: string[], play: boolean, letterStyles?: object[], titleStyle?: object, measureFont?: string }} props
 *   書体は全ページ共通で Bungee（400 のみ、大文字）。titleStyle / measureFont を渡すとページ単位で差し替えられる。
 */
export default function HeroTitle({ lines, play, letterStyles = [], titleStyle, measureFont }) {
  const { reducedMotion, isMobile } = useMotionPrefs();
  const [fs, setFs] = useState(120);

  useLayoutEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = Math.max(20, vw * 0.05);
      setFs(fitGiantFontSize(lines, vw - margin * 2, vh, measureFont));
    };
    compute();
    fontsReady().then(compute);
    let t = 0;
    const onResize = () => { clearTimeout(t); t = setTimeout(compute, 150); };
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
  }, [lines, measureFont]);

  const [flash, setFlash] = useState(-1);
  useEffect(() => {
    if (!play || reducedMotion) return undefined;
    const stagger = isMobile ? T.heroLetter.staggerSp : T.heroLetter.stagger;
    const timers = [];
    let n = 0;
    lines.forEach((line, li) => {
      splitChars(line).forEach(() => {
        const i = n;
        const delay = i * stagger + (li > 0 ? T.heroLetter.line2Delay * li : 0) + T.heroLetter.d - 0.2;
        timers.push(setTimeout(() => setFlash(i), delay * 1000));
        timers.push(setTimeout(() => setFlash((cur) => (cur === i ? -1 : cur)), (delay + T.dimensionFlash) * 1000));
        n += 1;
      });
    });
    return () => timers.forEach(clearTimeout);
  }, [play, lines, reducedMotion, isMobile]);

  let counter = 0;
  const stagger = isMobile ? T.heroLetter.staggerSp : T.heroLetter.stagger;

  return (
    <div
      className="uppercase"
      style={{ fontFamily: '"Bungee", "Chakra Petch", sans-serif', fontWeight: 400, fontSize: fs, lineHeight: 0.85, letterSpacing: 0, color: 'var(--bp-ink)', ...titleStyle }}
      aria-label={lines.join(' ')}
    >
      {lines.map((line, li) => (
        <div key={li} className="whitespace-nowrap" style={{ overflow: 'hidden', paddingTop: '.05em', marginTop: '-.05em' }} aria-hidden="true">
          {splitChars(line).map((ch, ci) => {
            const i = counter;
            counter += 1;
            const delay = i * stagger + (li > 0 ? T.heroLetter.line2Delay * li : 0);
            return (
              <motion.span
                key={ci}
                className="inline-block relative"
                style={{ willChange: 'transform', ...(letterStyles[i] || {}) }}
              >
                <motion.span
                  className="inline-block"
                  style={{ transformOrigin: i % 2 ? 'right bottom' : 'left bottom', willChange: 'transform' }}
                  initial={reducedMotion ? { opacity: 0 } : { y: '110%', rotate: i % 2 ? 30 : -30 }}
                  animate={play ? (reducedMotion ? { opacity: 1 } : { y: 0, rotate: 0 }) : undefined}
                  transition={reducedMotion ? { duration: 0.2 } : { duration: T.heroLetter.d, ease: EASE, delay }}
                >
                  {ch}
                </motion.span>
                {flash === i && (
                  <>
                    <DimensionLine axis="y" length=".7em" style={{ position: 'absolute', left: -14, bottom: '.05em', opacity: 0.9 }} />
                    <DimensionLine axis="y" length=".7em" style={{ position: 'absolute', right: -14, bottom: '.05em', opacity: 0.9 }} />
                  </>
                )}
              </motion.span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
