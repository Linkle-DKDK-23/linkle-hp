import React, { useEffect, useRef } from 'react';
import { useMotionValueEvent } from 'framer-motion';
import { useSectionBase, nextSectionOf } from './useSectionBase';
import { uiBus } from '../../lib/bus';
import DotLiquid from '../gimmicks/DotLiquid';
import ScatterText from '../ui/ScatterText';
import Pill from '../ui/Pill';
import SheetNumber from '../ui/SheetNumber';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { isLatin } from '../../lib/text/splitText';

/**
 * 008 ブルー・リキッド相当（ブランド面）。lusion 録画 2026-09-28 23.44.54 の "Let's work together!" 面と同じ構成:
 * 画面下部に白いグリフ粒の液体（G15' DotLiquid）、中央に小さなラベル + 巨大な白見出し（G17' ScatterText、
 * カーソルで文字が跳ねる）、その下にピル、下端に CONTINUE ピル（G16）。
 *
 * スクロール（lusion 録画 2026-09-29 0.07.08）: 高さ (hold + 200)vh。sticky の CTA は hold+100vh ぶん固定され、
 * 後続の FooterSection（overlap で 200vh 食い込む）の白面が hold vh の時点から下端を上がって CTA を直線で覆う。
 * @param {{ headingLines?: string[], paragraph?: string, pills?: {label:string,to:string,variant?:string}[], sheet: number, hold?: number }} props
 */
export default function LiquidSection({ headingLines, paragraph, pills = [], sheet, hold = 100 }) {
  const { ref, p } = useSectionBase('brand');
  const { isMobile } = useMotionPrefs();
  const total = hold + 200;
  const holdRef = useRef(hold);
  holdRef.current = hold;

  // CONTINUE ピル: 入って 30vh でフェードイン、白面が上がり始めたら（hold vh）30vh でフェードアウト
  useMotionValueEvent(p, 'change', (v) => {
    const s = v * (total - 100); // vh 単位のスクロール量（p は start-start → end-end なので分母は height − 100vh）
    const vis = Math.min(s / 30, 1 - (s - holdRef.current) / 30);
    uiBus.continueVisible.set(Math.max(0, Math.min(1, vis)));
  });
  useEffect(() => {
    // CONTINUE の遷移先は白面（フッター本体）。無ければ次セクション
    const nextEl = nextSectionOf(ref.current);
    const light = nextEl && nextEl.querySelector('[data-surface="light"]');
    uiBus.continueTarget.current = light || nextEl;
    return () => uiBus.continueVisible.set(0);
  }, [ref]);

  const latin = headingLines ? isLatin(headingLines[0]) : true;

  return (
    <section ref={ref} className="bp-section" data-surface="brand" style={{ height: `${total}vh`, background: 'var(--bp-brand)', color: 'var(--bp-white)' }}>
      <div className="bp-sticky" style={{ overflow: 'hidden' }}>
        <SheetNumber n={sheet} style={{ position: 'absolute', left: 'var(--bp-margin)', top: 'calc(100 / 827 * 100vh)', color: 'var(--bp-dim-dark)', zIndex: 2 }} />
        <DotLiquid active />
        {headingLines && (
          <div
            className="absolute inset-0 flex flex-col items-center text-center"
            style={{
              justifyContent: 'center',
              padding: `0 var(--bp-margin) ${isMobile ? '22vh' : '16vh'}`,
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            {paragraph && (
              <p className="m-0 text-label" style={{ marginBottom: isMobile ? 18 : 26, color: 'var(--bp-white)', opacity: 0.9, maxWidth: 560 }}>{paragraph}</p>
            )}
            <h2
              className="m-0 font-medium"
              style={{
                fontSize: latin ? 'clamp(44px, 8.5vw, 132px)' : 'clamp(30px, 6.4vw, 96px)',
                lineHeight: 1.08,
                letterSpacing: latin ? '-0.01em' : '0',
                pointerEvents: 'auto',
                color: 'var(--bp-white)',
              }}
            >
              <ScatterText lines={headingLines} to={pills[0] ? pills[0].to : undefined} />
            </h2>
            {pills.length > 0 && (
              <div className="flex flex-wrap justify-center" style={{ gap: 12, marginTop: isMobile ? 26 : 36, pointerEvents: 'auto' }}>
                {pills.map((pl) => (
                  <Pill key={pl.label} variant={pl.variant || 'dark'} to={pl.to}>{pl.label}</Pill>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
