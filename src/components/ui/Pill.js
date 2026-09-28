import React from 'react';
import { TLink } from '../../lib/transition/useTransitionNavigate';

/**
 * 角丸フルのピル（45px）。ホバー反転 / フォーカスリング / 押下 scale(.98)
 * @param {{ variant?: 'dark'|'light', dots?: 0|1|2, to?: string, onClick?: Function, children: any, className?: string, type?: string }} props
 */
export default function Pill({
  variant = 'dark', dots = 0, to, onClick, children, className = '', type = 'button', ...rest
}) {
  const cls = `bp-pill bp-pill--${variant} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      {dots > 0 && (
        <span className="dot" aria-hidden="true">
          {Array.from({ length: dots }).map((_, i) => <i key={i} />)}
        </span>
      )}
    </>
  );
  if (to) {
    return <TLink to={to} className={cls} onClick={onClick} {...rest}>{inner}</TLink>;
  }
  return (
    <button type={type} className={cls} onClick={onClick} {...rest}>{inner}</button>
  );
}
