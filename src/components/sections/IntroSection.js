import React from 'react';
import { useSectionBase } from './useSectionBase';
import DiagonalIntro from '../gimmicks/DiagonalIntro';
import SheetNumber from '../ui/SheetNumber';

/** 002 イントロ（200vh）。G6 */
export default function IntroSection({ topLeft, bottomRight, italicPrefix, sheet }) {
  const { ref } = useSectionBase('dark');
  return (
    <section ref={ref} className="bp-section" data-surface="dark" style={{ height: '200vh' }}>
      <div className="bp-sticky">
        <SheetNumber n={sheet} style={{ position: 'absolute', left: 'var(--bp-margin)', top: 'calc(100 / 827 * 100vh)' }} />
        <DiagonalIntro topLeft={topLeft} bottomRight={bottomRight} italicPrefix={italicPrefix} />
      </div>
    </section>
  );
}
