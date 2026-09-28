import React, { useEffect, useRef } from 'react';
import { scrollStore } from '../../lib/scroll/scrollStore';

/** S2: 右端の溝 160px + ノブ 4×30。白面で黒に反転（--cur-knob） */
export default function ScrollIndicator() {
  const knobRef = useRef(null);
  useEffect(() => {
    const knob = knobRef.current;
    if (!knob) return undefined;
    return scrollStore.subscribe(({ progress }) => {
      knob.style.transform = `translateY(${progress * 130}px)`;
    });
  }, []);
  return (
    <div
      aria-hidden="true"
      className="absolute"
      style={{
        right: 18,
        top: '50%',
        transform: 'translateY(-50%)',
        height: 'var(--bp-indicator)',
        width: 'var(--bp-knob-w)',
      }}
    >
      <div className="absolute inset-y-0" style={{ left: 1.5, width: 1, background: 'var(--cur-cross)', transition: 'background-color 240ms var(--bp-ease)' }} />
      <div
        ref={knobRef}
        className="absolute left-0 top-0"
        style={{
          width: 'var(--bp-knob-w)',
          height: 'var(--bp-knob-h)',
          background: 'var(--cur-knob)',
          transition: 'background-color 240ms var(--bp-ease)',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
