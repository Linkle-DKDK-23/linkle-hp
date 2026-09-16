import React from 'react';
import NumberedRow from '../ui/NumberedRow';
import StatBlock from './StatBlock';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { T } from '../../lib/motion/timings';

/**
 * G11: 3 桁ゼロ埋めリスト（+ 右側の stats）
 * @param {{ items: {title:string, description?:any, meta?:string, to?:string, linkLabel?:string, key?:string}[], stats?: {number:string,label:string}[], children?: any }} props
 */
export default function NumberedList({ items, stats, children }) {
  const { isMobile } = useMotionPrefs();
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: stats && !isMobile ? 'minmax(0, 1fr) 220px' : '1fr',
        columnGap: 64,
        alignItems: 'start',
        paddingLeft: 'calc(var(--bp-cross-x0) - var(--bp-margin))',
      }}
    >
      <ol className="m-0 p-0" style={{ borderTop: '1px dotted var(--bp-dim)' }}>
        {items.map((it, i) => (
          <NumberedRow key={it.key || i} index={i} title={it.title} description={it.description} meta={it.meta} to={it.to} linkLabel={it.linkLabel} delay={i * T.listRow.stagger} />
        ))}
      </ol>
      {stats && !isMobile && <StatBlock stats={stats} />}
      {stats && isMobile && <div style={{ marginTop: 32 }}><StatBlock stats={stats} /></div>}
      {children}
    </div>
  );
}
