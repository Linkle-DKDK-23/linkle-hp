import React from 'react';

/**
 * 100vh の透明な「間」。面は前セクションを継承（registry には登録しない）。
 * ブランド面の間に置くときは surface="brand" で塗る（body の黒が透けないように）。
 */
export default function Spacer({ surface }) {
  return (
    <div
      aria-hidden="true"
      data-spacer="true"
      style={{ height: 'var(--bp-section-gap)', background: surface === 'brand' ? 'var(--bp-brand)' : 'transparent' }}
    />
  );
}
