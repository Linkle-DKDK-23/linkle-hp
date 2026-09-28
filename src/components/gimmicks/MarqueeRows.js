import React from 'react';
import { isLatin } from '../../lib/text/splitText';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

/**
 * G10: 3 段逆方向マーキー（文字）。行ピッチ 196px、40s、偶数段 reverse、項目列を 2 回複製。
 * 項目間 120px、区切りは 1px×24px の縦目盛り。段 2 の番号（`01 ヒアリング`）は DotGothic16。
 * @param {{ rows: string[][] }} props
 */
export default function MarqueeRows({ rows }) {
  const { isMobile, reducedMotion } = useMotionPrefs();
  const fontSize = isMobile ? 28 : 40;
  const pitch = isMobile ? 120 : 196;
  const renderItem = (item, k) => {
    const m = item.match(/^(\d{2})\s(.+)$/);
    return (
      <span key={k} className="inline-flex items-center" style={{ paddingRight: 120 }}>
        {m ? (
          <>
            <span className="text-num" style={{ fontWeight: 500, marginRight: '.4em' }}>{m[1]}</span>
            <span className="palt" style={{ fontWeight: 700 }}>{m[2]}</span>
          </>
        ) : (
          <span className={isLatin(item) ? 'font-latin' : 'palt'} style={{ fontWeight: 700 }}>{item}</span>
        )}
        <i className="block" style={{ width: 1, height: 24, background: 'var(--bp-dim)', marginLeft: 120 }} aria-hidden="true" />
      </span>
    );
  };
  return (
    <div className="absolute inset-x-0" style={{ top: '50%', transform: `translateY(-${pitch}px) translateY(-${fontSize / 2}px)` }}>
      {rows.map((row, r) => (
        <div
          key={r}
          className="overflow-hidden whitespace-nowrap"
          style={{ height: pitch, display: 'flex', alignItems: 'flex-start', fontSize, lineHeight: 1, color: 'var(--bp-ink)' }}
          aria-label={row.join(' ')}
        >
          <div className={`bp-marquee-track ${r % 2 === 1 ? 'is-reverse' : ''}`} aria-hidden={reducedMotion ? undefined : 'true'}>
            {row.map(renderItem)}
            {!reducedMotion && row.map((it, k) => renderItem(it, `dup-${k}`))}
          </div>
        </div>
      ))}
    </div>
  );
}
