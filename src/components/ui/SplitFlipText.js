import React, { useEffect, useRef, useState } from 'react';
import { splitChars } from '../../lib/text/splitText';
import { useWrapperInView } from '../../lib/scroll/useWrapperInView';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

/**
 * G17: 文字二重分割。span.a / span.b を縦に積み translateY(-100%) を 20ms stagger で入れ替える。
 * @param {{ text: string, colorTop: string, colorBottom: string, trigger?: 'inview'|'hover'|'both', as?: string, className?: string, style?: object }} props
 */
export default function SplitFlipText({
  text, colorTop = 'var(--bp-ink)', colorBottom = 'var(--bp-brand)', trigger = 'both', as: Tag = 'span', className = '', style,
}) {
  const ref = useRef(null);
  const inView = useWrapperInView(ref, { amount: 0.5, once: true });
  const [on, setOn] = useState(false);
  const { reducedMotion } = useMotionPrefs();

  useEffect(() => {
    if ((trigger === 'inview' || trigger === 'both') && inView && !reducedMotion) {
      setOn(true);
      const t = setTimeout(() => setOn(false), 1200 + text.length * 20);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [inView, trigger, text.length, reducedMotion]);

  const hover = (trigger === 'hover' || trigger === 'both') && !reducedMotion;
  return (
    <Tag ref={ref} className={`bp-flip ${on ? 'is-on' : ''} ${hover ? 'hover-on' : ''} ${className}`} style={style} aria-label={text}>
      {splitChars(text).map((c, i) => (
        <span key={i} className="char" style={{ '--i': i }} aria-hidden="true">
          <span className="a" style={{ color: colorTop }}>{c === ' ' ? ' ' : c}</span>
          <span className="b" style={{ color: colorBottom }}>{c === ' ' ? ' ' : c}</span>
        </span>
      ))}
    </Tag>
  );
}
