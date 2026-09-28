import React, { useCallback } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useSurface } from '../../lib/theme/surfaceRegistry';
import { useSectionProgress } from '../../lib/scroll/useSectionProgress';
import { useRibbon } from '../../lib/scroll/useRibbon';
import GiantGhostText from '../gimmicks/GiantGhostText';
import SheetNumber from '../ui/SheetNumber';

/**
 * 面のクロスフェード区間（セクション進捗）。lusion 録画 49.5〜50.0s: 黒→青、文字は暗灰→白が約 0.5 秒で同時に変わる。
 * 直線のワイプではなく面全体の色が変わり、同じ巨大文字が白のまま上へ流れて次のブランド面に続く。
 */
const FADE_START = 0.86;
const FADE_END = 0.97;

/** 006 巨大低コントラスト文字（250vh）。G12 + 背景に虹色の帯（G13'）。終盤でブランド面へクロスフェード（G18'） */
export default function GhostSection({ top, bottom, tail, sheet, height = '250vh' }) {
  const ref = useRef(null);
  const p = useSectionProgress(ref);
  // 面の登録: フェードの中点でヘッダー線（scroll + 72）がブランド面に入るように分割する
  const compute = useCallback((t, h, vh) => {
    const mid = t + (FADE_START + FADE_END) / 2 * Math.max(1, h - vh) + 72;
    return [
      { surface: 'dark', top: t, bottom: mid },
      { surface: 'brand', top: mid, bottom: t + h },
    ];
  }, []);
  useSurface('dark', ref, compute);
  useRibbon(ref);

  const bg = useTransform(p, [FADE_START, FADE_END], ['rgba(108,202,241,0)', 'rgba(108,202,241,1)']);
  const ink = useTransform(p, [FADE_START, FADE_END], ['#14171b', '#ffffff']);
  const gridOpacity = useTransform(p, [FADE_START, FADE_END], [1, 0]);
  const sheetOpacity = useTransform(p, [FADE_START, FADE_END], [1, 0]);

  return (
    <section ref={ref} className="bp-section" data-surface="dark" style={{ height }}>
      <div className="bp-sticky">
        <motion.div className="absolute inset-0" style={{ backgroundColor: bg, zIndex: 0 }} aria-hidden="true" />
        <GiantGhostText top={top} bottom={bottom} tail={tail} progress={p} color={ink} gridOpacity={gridOpacity} />
        <motion.div style={{ opacity: sheetOpacity }}>
          <SheetNumber n={sheet} style={{ position: 'absolute', left: 'var(--bp-margin)', top: 'calc(100 / 827 * 100vh)', zIndex: 3 }} />
        </motion.div>
      </div>
    </section>
  );
}
