import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useWrapperInView } from '../../lib/scroll/useWrapperInView';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { TLink } from '../../lib/transition/useTransitionNavigate';
import { EASE, T } from '../../lib/motion/timings';

/**
 * G11: `001` + 名称 + 説明 + 点線罫 + 行末 `→`（任意）
 * @param {{ index: number, title: string, description?: React.ReactNode, meta?: string, to?: string, linkLabel?: string, delay?: number }} props
 */
export default function NumberedRow({ index, title, description, meta, to, linkLabel, delay = 0 }) {
  const ref = useRef(null);
  const inView = useWrapperInView(ref, { amount: 0.3, once: true });
  const { reducedMotion, isMobile } = useMotionPrefs();
  const content = (
    <>
      <span className="num text-num" style={{ fontSize: 13, color: 'var(--bp-ink-muted)' }}>{String(index + 1).padStart(3, '0')}</span>
      <span className="palt" style={{ fontSize: isMobile ? 16 : 18, fontWeight: 500, lineHeight: 1.4 }}>
        {meta && <span className="text-num block" style={{ fontSize: 11, letterSpacing: '.1em', color: 'var(--bp-ink-muted)', marginBottom: 6 }}>{meta}</span>}
        {title}
      </span>
      {!isMobile && (
        <span style={{ fontSize: 'var(--fs-body)', lineHeight: 1.7, color: 'var(--bp-ink-muted)', whiteSpace: 'pre-line' }}>{description}</span>
      )}
      <span aria-hidden={to ? undefined : 'true'} style={{ textAlign: 'right', fontSize: 16 }}>{to ? '→' : ''}</span>
      {isMobile && description && (
        <span style={{ gridColumn: '2 / -1', fontSize: 'var(--fs-body)', lineHeight: 1.7, color: 'var(--bp-ink-muted)', whiteSpace: 'pre-line' }}>{description}</span>
      )}
    </>
  );
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '48px 1fr 24px' : '64px minmax(0, 1fr) minmax(0, 1.4fr) 24px',
    columnGap: 24,
    alignItems: 'baseline',
    minHeight: 64,
    padding: '20px 0',
    color: 'var(--bp-ink)',
  };
  return (
    <motion.li
      ref={ref}
      className="bp-row list-none"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: T.listRow.d, ease: EASE, delay }}
    >
      {to ? (
        <TLink to={to} style={gridStyle} aria-label={linkLabel ? `${title} ${linkLabel}` : title}>{content}</TLink>
      ) : (
        <div style={gridStyle}>{content}</div>
      )}
    </motion.li>
  );
}
