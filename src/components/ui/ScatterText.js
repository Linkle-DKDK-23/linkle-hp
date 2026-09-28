import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { splitChars } from '../../lib/text/splitText';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { TLink } from '../../lib/transition/useTransitionNavigate';

/**
 * G17': カーソルが触れた文字だけがバラバラに跳ねて、バネで元の位置へ戻る見出し。
 * 参照: lusion 録画 2026-09-28 23.44.54 の "Let's work together!"（文字が上下にずれ、時々ひっくり返る）。
 * `to` を渡すとリンクになり、ホバーで各行に下線が伸びる。
 * @param {{ lines: string[], to?: string, className?: string, style?: object }} props
 */
const rand = (a, b) => a + Math.random() * (b - a);
const SPRING = { type: 'spring', stiffness: 360, damping: 13, mass: 0.7 };

export default function ScatterText({ lines, to, className = '', style }) {
  const { reducedMotion } = useMotionPrefs();
  const els = useRef([]);
  const lastHit = useRef(new Map());
  const timers = useRef([]);
  const raf = useRef(0);
  const pt = useRef({ x: 0, y: 0 });
  const [hits, setHits] = useState({});

  useEffect(() => () => { timers.current.forEach(clearTimeout); cancelAnimationFrame(raf.current); }, []);

  const check = useCallback(() => {
    raf.current = 0;
    const { x, y } = pt.current;
    const now = performance.now();
    const upd = {};
    els.current.forEach((el, i) => {
      if (!el) return;
      const b = el.getBoundingClientRect();
      const pad = b.height * 0.1;
      if (x < b.left - pad || x > b.right + pad || y < b.top - pad || y > b.bottom + pad) return;
      const prev = lastHit.current.get(i);
      if (prev && now - prev < 750) return;
      lastHit.current.set(i, now);
      const flip = Math.random() < 0.16;
      upd[i] = { x: rand(-0.14, 0.14), y: rand(-0.36, 0.36), r: flip ? (Math.random() < 0.5 ? 180 : -180) : rand(-30, 30) };
      timers.current.push(setTimeout(() => setHits((h) => ({ ...h, [i]: null })), 380));
    });
    if (Object.keys(upd).length) setHits((h) => ({ ...h, ...upd }));
  }, []);

  const onMove = (e) => {
    if (reducedMotion) return;
    pt.current = { x: e.clientX, y: e.clientY };
    if (!raf.current) raf.current = requestAnimationFrame(check);
  };

  const text = lines.join(' ');
  let idx = 0;
  const body = (
    <>
      <span className="sr-only">{text}</span>
      {lines.map((line, li) => (
        <span key={li} className="line block relative" aria-hidden="true">
          {splitChars(line).map((c) => {
            const i = idx; idx += 1;
            const hit = hits[i];
            return (
              <motion.span
                key={i}
                ref={(el) => { els.current[i] = el; }}
                className="ch"
                style={{ display: 'inline-block', whiteSpace: 'pre' }}
                animate={hit ? { x: `${hit.x}em`, y: `${hit.y}em`, rotate: hit.r } : { x: '0em', y: '0em', rotate: 0 }}
                transition={SPRING}
              >
                {c}
              </motion.span>
            );
          })}
        </span>
      ))}
    </>
  );
  const cls = `bp-scatter ${to ? 'bp-scatter--link' : ''} ${className}`;
  if (to) {
    return <TLink to={to} className={cls} style={style} onPointerMove={onMove}>{body}</TLink>;
  }
  return <span className={cls} style={style} onPointerMove={onMove}>{body}</span>;
}
