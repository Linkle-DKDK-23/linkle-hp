import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { uiBus } from '../../lib/bus';
import { useTransition } from '../../lib/transition/TransitionProvider';

/**
 * G8: 画面中央（49vh）の 84px ブランド色円ボタン。矢印 rotate / opacity は uiBus の MotionValue。
 */
export default function BlueCircleButton() {
  const { getLenis } = useTransition();
  const pe = useTransform(uiBus.blueOpacity, (v) => (v > 0.5 ? 'auto' : 'none'));
  const rotate = useTransform(uiBus.blueRotate, (v) => `rotate(${v}deg)`);

  const onClick = () => {
    const lenis = getLenis();
    const target = uiBus.blueTarget.current;
    if (lenis && target) lenis.scrollTo(target, { duration: 1.2 });
  };

  return (
    <motion.button
      type="button"
      className="bp-blue-btn absolute"
      aria-label="次のセクションへ"
      style={{
        left: '50%',
        top: '49vh',
        translateX: '-50%',
        translateY: '-50%',
        opacity: uiBus.blueOpacity,
        pointerEvents: pe,
      }}
      onClick={onClick}
    >
      <motion.svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transform: rotate }}>
        <line x1="26" y1="14" x2="2" y2="14" />
        <polyline points="10,6 2,14 10,22" />
      </motion.svg>
    </motion.button>
  );
}
