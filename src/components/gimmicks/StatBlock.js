import React from 'react';

/** G11 右側: `20+ チームメンバー` / `99% 顧客満足度` */
export default function StatBlock({ stats }) {
  return (
    <dl className="flex flex-col" style={{ gap: 28 }}>
      {stats.map((s) => (
        <div key={s.label}>
          <dd className="text-num" style={{ fontSize: 'var(--fs-stat)', fontWeight: 500, lineHeight: 1, color: 'var(--bp-ink)' }}>{s.number}</dd>
          <dt className="text-label" style={{ color: 'var(--bp-ink-muted)', marginTop: 10, textTransform: 'none', letterSpacing: '.08em' }}>{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}
