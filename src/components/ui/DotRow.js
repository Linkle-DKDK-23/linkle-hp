import React from 'react';

/** G7: ドット列 `::::::::::` */
export default function DotRow({ count = 10, className = '', style }) {
  return (
    <span className={`text-label ${className}`} style={{ color: 'var(--cur-dim)', letterSpacing: '.2em', transition: 'color 240ms var(--bp-ease)', ...style }} aria-hidden="true">
      {':'.repeat(count)}
    </span>
  );
}
