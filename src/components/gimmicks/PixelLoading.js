import React, { useEffect, useMemo, useState } from 'react';
import { glyphOf } from '../../lib/text/pixelFont';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { T } from '../../lib/motion/timings';

const WORD = 'LOADING';
const DOT = 4;
const GAP = 2;
const CELL = DOT + GAP;

/**
 * G21: `LOADING` 7 文字 × 5×7 ドットを、プロッタが左から打つように列優先で点灯（15ms/列）。
 * 全点灯後 200ms 保持して onDone。
 */
export default function PixelLoading({ onDone }) {
  const { reducedMotion } = useMotionPrefs();
  const cells = useMemo(() => {
    const out = [];
    let colBase = 0;
    for (const ch of WORD) {
      const rows = glyphOf(ch);
      for (let x = 0; x < 5; x += 1) {
        for (let y = 0; y < 7; y += 1) {
          if (rows[y][x] === '1') out.push({ col: colBase + x, row: y });
        }
      }
      colBase += 6;
    }
    return out;
  }, []);
  const totalCols = WORD.length * 6 - 1;
  const [litCol, setLitCol] = useState(reducedMotion ? totalCols : -1);

  useEffect(() => {
    let cancelled = false;
    if (reducedMotion) {
      const t = setTimeout(() => { if (!cancelled) onDone(); }, 300);
      return () => { cancelled = true; clearTimeout(t); };
    }
    let col = -1;
    const step = () => {
      if (cancelled) return;
      col += 1;
      setLitCol(col);
      if (col >= totalCols) {
        setTimeout(() => { if (!cancelled) onDone(); }, T.pixelHold * 1000);
      } else {
        setTimeout(step, T.pixelDot * 1000);
      }
    };
    const t = setTimeout(step, 80);
    return () => { cancelled = true; clearTimeout(t); };
  }, [onDone, reducedMotion, totalCols]);

  return (
    <div
      className="absolute"
      style={{
        left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: totalCols * CELL + DOT, height: 7 * CELL - GAP,
      }}
      role="status"
      aria-label="LOADING"
    >
      {cells.map((c) => (
        <i
          key={`${c.col}-${c.row}`}
          className="absolute block"
          style={{
            left: c.col * CELL, top: c.row * CELL, width: DOT, height: DOT, background: '#fff',
            opacity: c.col <= litCol ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}
