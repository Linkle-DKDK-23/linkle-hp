import React from 'react';
import { useSectionBase } from './useSectionBase';
import { useRibbon } from '../../lib/scroll/useRibbon';
import MarqueeRows from '../gimmicks/MarqueeRows';
import SheetNumber from '../ui/SheetNumber';
import { TLink } from '../../lib/transition/useTransitionNavigate';

/** 004 BRANDS 相当（200vh）。G10 文字マーキー 3 段。背景に虹色の帯（G13'） */
export default function BrandsSection({ label, labelTo, rows, sheet }) {
  const { ref } = useSectionBase('dark');
  useRibbon(ref);
  return (
    <section ref={ref} className="bp-section" data-surface="dark" style={{ height: '200vh' }}>
      <div className="bp-sticky">
        <SheetNumber n={sheet} style={{ position: 'absolute', left: 'var(--bp-margin)', top: 'calc(100 / 827 * 100vh)' }} />
        {label && (
          <div className="absolute" style={{ left: 'var(--bp-margin)', top: 'calc(140 / 827 * 100vh)', zIndex: 2 }}>
            {labelTo ? (
              <TLink to={labelTo} className="text-label inline-flex items-center" style={{ color: 'var(--bp-ink)', textTransform: 'none', letterSpacing: '.08em', fontSize: 13, gap: 10 }}>
                {label}
                <span aria-hidden="true">→</span>
              </TLink>
            ) : (
              <span className="text-label" style={{ color: 'var(--bp-ink)', textTransform: 'none', letterSpacing: '.08em', fontSize: 13 }}>{label}</span>
            )}
          </div>
        )}
        <MarqueeRows rows={rows} />
      </div>
    </section>
  );
}
