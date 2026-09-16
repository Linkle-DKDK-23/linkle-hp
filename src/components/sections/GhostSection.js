import React from 'react';
import { useSectionBase } from './useSectionBase';
import { useTube } from '../gimmicks/TubeController';
import GiantGhostText from '../gimmicks/GiantGhostText';
import SheetNumber from '../ui/SheetNumber';

/** 006 巨大低コントラスト文字（250vh）。G12 + 配管に液が満ちる（G13） */
export default function GhostSection({ top, bottom, tail, sheet, height = '250vh' }) {
  const { ref, p } = useSectionBase('dark');
  useTube(ref, [
    { at: 0, mode: 'glass', topY: 0, bottomY: (vh) => vh * 0.49 - 42, opacity: 1, fill: 0 },
    { at: 0.3, mode: 'fluid', bottomY: (vh) => vh, fill: 0 },
    { at: 0.6, mode: 'fluid', bottomY: (vh) => vh, fill: 1 },
    { at: 1, mode: 'fluid', bottomY: (vh) => vh, fill: 1 },
  ]);
  return (
    <section ref={ref} className="bp-section" data-surface="dark" style={{ height }}>
      <div className="bp-sticky">
        <GiantGhostText top={top} bottom={bottom} tail={tail} progress={p} />
        <SheetNumber n={sheet} style={{ position: 'absolute', left: 'var(--bp-margin)', top: 'calc(100 / 827 * 100vh)', zIndex: 3 }} />
      </div>
    </section>
  );
}
