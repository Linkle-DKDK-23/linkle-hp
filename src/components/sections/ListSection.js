import React from 'react';
import { useSectionBase } from './useSectionBase';
import { useSignal } from '../../lib/scroll/useSignal';
import NumberedList from '../gimmicks/NumberedList';
import SheetNumber from '../ui/SheetNumber';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

/**
 * 005 AWARDS 相当（3 桁番号リスト）。G11。背景にシグナル・リッジ（G13''）。
 * @param {{ items: any[], stats?: any[], sheet: number, height?: string, heading?: string, subheading?: string, flow?: boolean, children?: any }} props
 */
export default function ListSection({
  items, stats, sheet, height = '200vh', heading, subheading, flow = false, children,
}) {
  const { ref } = useSectionBase('dark');
  const { isMobile } = useMotionPrefs();
  useSignal(ref);
  const useFlow = flow || isMobile;
  return (
    <section ref={ref} className="bp-section bp-signal-legible" data-surface="dark" style={{ height: useFlow ? 'auto' : height, minHeight: useFlow ? '100dvh' : undefined }}>
      <div className={useFlow ? 'relative' : 'bp-sticky'} style={useFlow ? { padding: '20vh 0 12vh' } : undefined}>
        <SheetNumber n={sheet} style={{ position: 'absolute', left: 'var(--bp-margin)', top: 'calc(100 / 827 * 100vh)' }} />
        <div
          className={useFlow ? '' : 'absolute inset-x-0'}
          style={useFlow ? { padding: '0 var(--bp-margin)' } : { top: 'calc(170 / 827 * 100vh)', padding: '0 var(--bp-margin)', maxHeight: 'calc(100dvh - 170 / 827 * 100vh - 40px)', overflow: 'hidden' }}
        >
          {(heading || subheading) && (
            <div style={{ marginBottom: 32 }}>
              {heading && <h2 className="m-0 font-medium palt" style={{ fontSize: 'var(--fs-section-ja)', lineHeight: 1.1, color: 'var(--bp-ink)' }}>{heading}</h2>}
              {subheading && <p className="m-0 bp-body" style={{ marginTop: 12, color: 'var(--bp-ink-muted)' }}>{subheading}</p>}
            </div>
          )}
          <NumberedList items={items} stats={stats} />
          {children}
        </div>
      </div>
    </section>
  );
}
