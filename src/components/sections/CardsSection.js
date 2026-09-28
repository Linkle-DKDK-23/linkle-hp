import React from 'react';
import { useSectionBase } from './useSectionBase';
import ExpertiseCards from '../gimmicks/ExpertiseCards';
import SheetNumber from '../ui/SheetNumber';
import { TLink } from '../../lib/transition/useTransitionNavigate';
import { isLatin } from '../../lib/text/splitText';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

/**
 * 007 AREA OF EXPERTISE 相当（ブランド面）。白カード群。G14 / G22 ロゴ黒。
 * 面の頭の白い巨大文字は GhostSection のクロスフェード（G18'）で同じ文字が白くなって流れてくるため、ここでは描かない。
 * variant='flow' は sticky を使わず通常フロー（Contact のフォーム用）。
 * @param {{ label?: string, labelTo?: string, labelLinkText?: string, paragraph?: string, cards: any[], layout?: string, sheet: number, height?: string, variant?: 'sticky'|'flow', children?: any, extra?: any }} props
 */
export default function CardsSection({
  label, labelTo, labelLinkText, paragraph, cards, layout = 'row4', sheet, height = '300vh', variant = 'sticky', children, extra,
}) {
  const { ref, p } = useSectionBase('brand');
  const { isMobile } = useMotionPrefs();
  const isFlow = variant === 'flow';

  return (
    <section
      ref={ref}
      className="bp-section"
      data-surface="brand"
      style={{ height: isFlow ? 'auto' : height, minHeight: isFlow ? '100dvh' : undefined, background: 'var(--bp-brand)', color: 'var(--bp-ink-dark)' }}
    >
      <div className={isFlow ? 'relative' : 'bp-sticky'} style={isFlow ? { padding: '12vh 0', minHeight: '100dvh', overflow: 'hidden' } : undefined}>
        <SheetNumber n={sheet} style={{ position: 'absolute', left: 'var(--bp-margin)', top: 'calc(100 / 827 * 100vh)', zIndex: 2, color: 'var(--bp-dim-dark)' }} />

        <div
          className={isFlow ? 'relative' : 'absolute inset-0 flex flex-col'}
          style={{
            padding: isFlow ? '0 var(--bp-margin)' : 'calc(120 / 827 * 100vh) var(--bp-margin) 40px',
            // SP は上詰め: 面がスクロールインした瞬間からカードが見えるようにする（中央寄せだと先頭に空白が続く）
            justifyContent: isMobile ? 'flex-start' : 'center',
            zIndex: 1,
          }}
        >
          {(label || paragraph) && (
            <div className="flex items-end justify-between" style={{ marginBottom: isMobile ? 24 : 40, gap: 24, flexWrap: 'wrap' }}>
              <div>
                {label && <h2 className="m-0 font-medium palt" style={{ fontSize: isLatin(label) ? 'var(--fs-card-title)' : 'var(--fs-card-title-ja)', lineHeight: 1.2 }}>{label}</h2>}
                {paragraph && <p className="m-0" style={{ marginTop: 10, fontSize: 'var(--fs-body)', lineHeight: 1.7, color: 'var(--bp-ink-dark-muted)', maxWidth: 560 }}>{paragraph}</p>}
              </div>
              {labelTo && (
                <TLink to={labelTo} className="inline-flex items-center font-medium" style={{ fontSize: 14, gap: 10, color: 'var(--bp-ink-dark)', borderBottom: '1px solid currentColor', paddingBottom: 2 }}>
                  {labelLinkText}
                  <span aria-hidden="true">→</span>
                </TLink>
              )}
            </div>
          )}
          <ExpertiseCards cards={cards} layout={layout} progress={p} />
          {extra}
        </div>
        {children}
      </div>
    </section>
  );
}
