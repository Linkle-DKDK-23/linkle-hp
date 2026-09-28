import React from 'react';
import { glyphOf } from '../../lib/text/pixelFont';

/**
 * 5×7 ドットの 1 文字。lit 数で左上から（列優先）点灯。
 * @param {{ char: string, size?: number, lit?: number, color?: string, className?: string }} props
 */
export default function PixelGlyph({ char, size = 34, lit = 35, color = 'currentColor', className = '' }) {
  const rows = glyphOf(char);
  const cells = [];
  let idx = 0;
  for (let x = 0; x < 5; x += 1) {
    for (let y = 0; y < 7; y += 1) {
      const on = rows[y][x] === '1';
      cells.push({ x, y, on: on && idx < lit });
      if (on) idx += 1;
    }
  }
  const dot = size / 7;
  return (
    <span
      className={`inline-block relative ${className}`}
      style={{ width: dot * 5, height: size, verticalAlign: 'top' }}
      aria-hidden="true"
    >
      {cells.filter((c) => c.on).map((c) => (
        <i
          key={`${c.x}-${c.y}`}
          className="absolute block"
          style={{ left: c.x * dot, top: c.y * dot, width: dot + 0.3, height: dot + 0.3, background: color }}
        />
      ))}
    </span>
  );
}
