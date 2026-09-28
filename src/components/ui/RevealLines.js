import React from 'react';
import { splitChars } from '../../lib/text/splitText';

const hash = (r, k) => ((r * 31 + k * 17 + 7) * 2654435761) % 9;

/**
 * G19: 行マスク・リビール（行 90ms、文字 0〜8px バラけ）。
 * 親に `.bp-reveal` と `.in`（useInView）を付ける前提。
 * @param {{ lines: (string|{text:string, node?: React.ReactNode})[], startRow?: number, as?: string, className?: string, style?: object }} props
 */
export default function RevealLines({ lines, startRow = 0, as: Tag = 'div', className = '', style }) {
  return (
    <Tag className={className} style={style}>
      {lines.map((line, r) => {
        const text = typeof line === 'string' ? line : line.text;
        const node = typeof line === 'string' ? null : line.node;
        return (
          <span className="mask-line" key={r}>
            <span className="line" style={{ '--r': startRow + r }}>
              {node || splitChars(text).map((c, k) => (
                <span key={k} className="ch" style={{ '--j': hash(r, k) }}>{c === ' ' ? ' ' : c}</span>
              ))}
            </span>
          </span>
        );
      })}
    </Tag>
  );
}
