import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { uiBus } from '../../lib/bus';
import { useTransition } from '../../lib/transition/TransitionProvider';

/** G16: 250×53 の白ピル `↓ CONTINUE TO SCROLL ↓`。下端から 58px、水平中央 */
export default function ContinuePill() {
  const { getLenis } = useTransition();
  const pe = useTransform(uiBus.continueVisible, (v) => (v > 0.5 ? 'auto' : 'none'));
  const onClick = () => {
    const lenis = getLenis();
    const target = uiBus.continueTarget.current;
    if (lenis && target) lenis.scrollTo(target, { duration: 1.4 });
  };
  return (
    <motion.button
      type="button"
      className="absolute font-latin"
      onClick={onClick}
      style={{
        left: '50%',
        bottom: 'var(--bp-continue-bottom)',
        translateX: '-50%',
        width: 'var(--bp-continue-w)',
        height: 'var(--bp-continue-h)',
        borderRadius: 999,
        background: '#fff',
        color: '#000',
        fontSize: 13,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 26px',
        opacity: uiBus.continueVisible,
        pointerEvents: pe,
        transition: 'transform 120ms var(--bp-ease)',
      }}
    >
      <span className="bp-bob" aria-hidden="true">↓</span>
      <span>Continue to scroll</span>
      <span className="bp-bob is-alt" aria-hidden="true">↓</span>
    </motion.button>
  );
}
