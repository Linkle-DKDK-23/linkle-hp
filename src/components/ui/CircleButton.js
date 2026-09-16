import React from 'react';
import { TLink } from '../../lib/transition/useTransitionNavigate';

/** ヘッダーの円ボタン 46px。中は L 字アイコン 18px */
export default function CircleButton({ to = '/' }) {
  return (
    <TLink to={to} className="bp-circle-btn" aria-label="Linkle">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <rect x="3" y="1" width="4.4" height="13.3" fill="currentColor" />
        <rect x="7.4" y="14.3" width="9" height="4.5" fill="currentColor" />
      </svg>
    </TLink>
  );
}
