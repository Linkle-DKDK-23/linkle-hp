import React, { useLayoutEffect, useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { fitGhostFontSize, isLatin } from '../../lib/text/splitText';
import { fontsReady } from '../../lib/text/measure';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

/**
 * G12: 巨大低コントラスト文字 2 段 + 見切れる末尾行。
 * 各行は max(18vw, 1.15 × 100vw ÷ emW) で画面幅を 15% 以上超える（高さクランプなし、縦は溢れる）。
 * 下段のベースラインを bottom 6vh に固定し、上段・tail はその上に積む（上端で見切れてよい）。
 * @param {{ top: string, bottom: string, tail: string, progress: MotionValue }} props
 */
export default function GiantGhostText({ top, bottom, tail, progress }) {
  const { isMobile, reducedMotion } = useMotionPrefs();
  const [fs, setFs] = useState({ top: 300, bottom: 300, tail: 300, showTail: true });

  useLayoutEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const min = isMobile ? 0.24 : 0.18;
      const fTop = fitGhostFontSize(top, vw, min, true);
      const fBottom = fitGhostFontSize(bottom, vw, min, false);
      const fTail = fitGhostFontSize(tail, vw, min, true);
      // 下段（bottom 6vh）+ 上段（line-height .9）の上端が sticky の上端を超えたら tail は描画しない
      const topEdge = vh - 0.06 * vh - fBottom * 0.9 - fTop * 0.9;
      setFs({ top: fTop, bottom: fBottom, tail: fTail, showTail: topEdge > fTail * 0.45 });
    };
    compute();
    fontsReady().then(compute);
    let t = 0;
    const onResize = () => { clearTimeout(t); t = setTimeout(compute, 150); };
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
  }, [top, bottom, tail, isMobile]);

  const xTop = useTransform(progress, [0, 1], reducedMotion ? ['0vw', '0vw'] : ['-4vw', '4vw']);
  const xBottom = useTransform(progress, [0, 1], reducedMotion ? ['0vw', '0vw'] : ['3vw', '-3vw']);
  const fontOf = (s) => (isLatin(s) ? 'font-latin' : 'palt');

  return (
    <div className="absolute inset-0" style={{ zIndex: 1, overflow: 'hidden', width: '100vw', pointerEvents: 'none' }} aria-hidden="true">
      <div className="absolute left-0 right-0" style={{ bottom: '6vh' }}>
        <div className="relative">
          {fs.showTail && (
            <div
              className={`skew-italic whitespace-nowrap ${fontOf(tail)}`}
              style={{
                position: 'absolute', bottom: `${fs.top * 0.9}px`, left: '-6vw',
                fontSize: fs.tail, lineHeight: 0.9, fontWeight: 500, color: 'var(--bp-ghost)',
                transform: 'translateY(-.55em) skewX(-10deg)',
              }}
            >
              {tail}
            </div>
          )}
          <motion.div
            className={`whitespace-nowrap ${fontOf(top)}`}
            style={{ x: xTop, marginLeft: '-6vw', fontSize: fs.top, lineHeight: 0.9, fontWeight: 500, color: 'var(--bp-ghost)', fontStyle: isLatin(top) ? 'italic' : 'normal' }}
          >
            <span className={isLatin(top) ? '' : 'skew-italic'} style={{ display: 'inline-block' }}>{top}</span>
          </motion.div>
          <motion.div
            className={`whitespace-nowrap ${fontOf(bottom)}`}
            style={{ x: xBottom, marginLeft: '4vw', fontSize: fs.bottom, lineHeight: 0.9, fontWeight: 500, color: 'var(--bp-ghost)' }}
          >
            {bottom}
          </motion.div>
        </div>
      </div>
      {/* 文字の上を通る方眼（このセクションだけ z 2 に重ねる） */}
      <div className="absolute inset-0 bp-grid-inline" style={{ zIndex: 2, pointerEvents: 'none' }} />
    </div>
  );
}
