import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { crosshairBus } from '../../lib/bus';
import { EASE, T } from '../../lib/motion/timings';

const COLS = [0, 1, 2, 3, 4];

/**
 * S2: `+` クロスヘア 5 列。中央列はレジストレーションマーク（十字 + 直径 12px の円）。
 * y は crosshairBus.y（vh）を 600ms で追従。
 */
export default function Crosshairs() {
  const yVh = useMotionValue(49);
  const y = useTransform(yVh, (v) => `${v}vh`);

  useEffect(() => {
    const off = crosshairBus.y.on('change', (target) => {
      animate(yVh, target, { duration: T.crosshairMove, ease: EASE });
    });
    return off;
  }, [yVh]);

  return (
    <motion.div
      aria-hidden="true"
      className="absolute left-0 right-0"
      style={{ top: 0, y, height: 0, pointerEvents: 'none' }}
    >
      {COLS.map((i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `calc(var(--bp-cross-x0) + var(--bp-cross-pitch) * ${i})`,
            top: 0,
            width: 12,
            height: 12,
            transform: 'translate(-50%, -50%)',
            color: 'var(--cur-cross)',
            transition: 'color 240ms var(--bp-ease)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
            <line x1="6" y1="0" x2="6" y2="12" />
            <line x1="0" y1="6" x2="12" y2="6" />
            {i === 2 && <circle cx="6" cy="6" r="5.5" />}
          </svg>
        </span>
      ))}
    </motion.div>
  );
}
