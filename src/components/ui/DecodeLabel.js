import React, { useEffect, useRef } from 'react';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

const CHARS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * G7: 60ms ごとにランダム英数字を回し、指定文字列（`X 0084` 形式）へ左から確定。
 * @param {{ value: string, active: boolean, className?: string, style?: object }} props
 */
export default function DecodeLabel({ value, active, className = '', style }) {
  const ref = useRef(null);
  const { reducedMotion } = useMotionPrefs();
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!active) { el.textContent = value.replace(/[^ ]/g, '·'); return undefined; }
    if (reducedMotion) { el.textContent = value; return undefined; }
    let i = 0;
    const id = setInterval(() => {
      const out = value.split('').map((c, k) => (k < i ? c : (c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)])));
      el.textContent = out.join('');
      i += 1;
      if (i > value.length) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [value, active, reducedMotion]);
  return (
    <span ref={ref} className={`text-label block ${className}`} style={{ color: 'var(--cur-dim)', transition: 'color 240ms var(--bp-ease)', ...style }} aria-hidden="true">
      {value}
    </span>
  );
}
