import React from 'react';
import { useSectionBase } from './useSectionBase';
import DiagonalIntro from '../gimmicks/DiagonalIntro';
import SheetNumber from '../ui/SheetNumber';

/** 002 イントロ（160vh: 表示 100vh + ピン留め 60vh。次のセクションまでの間を詰めた）。G6 */
export default function IntroSection({ topLeft, bottomRight, italicPrefix, sheet }) {
  const { ref, p } = useSectionBase('dark');
  return (
    <section ref={ref} className="bp-section" data-surface="dark" style={{ height: '160vh' }}>
      <div className="bp-sticky" style={{ overflow: 'hidden' }}>
        <SheetNumber n={sheet} style={{ position: 'absolute', left: 'var(--bp-margin)', top: 'calc(100 / 827 * 100vh)' }} />
        <DiagonalIntro topLeft={topLeft} bottomRight={bottomRight} italicPrefix={italicPrefix} progress={p} />
      </div>
    </section>
  );
}
