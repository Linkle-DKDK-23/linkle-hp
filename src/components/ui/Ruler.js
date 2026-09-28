import React from 'react';

/** G7: 目盛りルーラー `| . . . . | . . . . |` 幅 185px */
export default function Ruler({ width = 185, className = '', style }) {
  const marks = [];
  for (let i = 0; i <= 10; i += 1) {
    const major = i % 5 === 0;
    marks.push(
      <i
        key={i}
        className="absolute block"
        style={{
          left: `${(i / 10) * 100}%`,
          top: major ? 0 : 3,
          width: 1,
          height: major ? 9 : 3,
          background: 'currentColor',
          opacity: major ? 1 : 0.7,
        }}
      />
    );
  }
  return (
    <span
      className={`inline-block relative ${className}`}
      style={{ width, height: 9, color: 'var(--cur-dim)', transition: 'color 240ms var(--bp-ease)', ...style }}
      aria-hidden="true"
    >
      {marks}
    </span>
  );
}
