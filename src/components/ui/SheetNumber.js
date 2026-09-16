import React from 'react';

/** G7: シート番号 `[[ 003 ]]` */
export default function SheetNumber({ n, className = '', style }) {
  return (
    <span className={`text-label ${className}`} style={{ color: 'var(--cur-dim)', transition: 'color 240ms var(--bp-ease)', ...style }} aria-hidden="true">
      [[ {String(n).padStart(3, '0')} ]]
    </span>
  );
}
