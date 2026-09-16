import React from 'react';

/**
 * 寸法線 `|——|` + 値ラベル。水平 / 垂直。
 * @param {{ length: number|string, label?: string, axis?: 'x'|'y', color?: string, className?: string, style?: object }} props
 */
export default function DimensionLine({ length, label, axis = 'x', color = 'var(--cur-dim)', className = '', style }) {
  const horizontal = axis === 'x';
  return (
    <span
      className={`inline-block relative ${className}`}
      style={{
        width: horizontal ? length : 9,
        height: horizontal ? 9 : length,
        color,
        transition: 'color 240ms var(--bp-ease)',
        ...style,
      }}
      aria-hidden="true"
    >
      <i className="absolute block" style={horizontal ? { left: 0, top: 4, right: 0, height: 1, background: 'currentColor' } : { top: 0, left: 4, bottom: 0, width: 1, background: 'currentColor' }} />
      <i className="absolute block" style={horizontal ? { left: 0, top: 0, width: 1, height: 9, background: 'currentColor' } : { top: 0, left: 0, height: 1, width: 9, background: 'currentColor' }} />
      <i className="absolute block" style={horizontal ? { right: 0, top: 0, width: 1, height: 9, background: 'currentColor' } : { bottom: 0, left: 0, height: 1, width: 9, background: 'currentColor' }} />
      {label && (
        <span
          className="text-label absolute"
          style={horizontal
            ? { left: '50%', top: -16, transform: 'translateX(-50%)', color: 'inherit', whiteSpace: 'nowrap' }
            : { top: '50%', left: 14, transform: 'translateY(-50%)', color: 'inherit', whiteSpace: 'nowrap' }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
