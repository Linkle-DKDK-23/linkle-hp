import React from 'react';
import { useTransition } from './TransitionProvider';

/** 遷移アニメ付きの navigate。<Link> の代わりに使う */
export function useTransitionNavigate() {
  const { go } = useTransition();
  return go;
}

/**
 * <a href> に onClick preventDefault を付けたリンク。
 * @param {{ to: string, className?: string, children: React.ReactNode }} props
 */
export function TLink({ to, children, onClick, ...rest }) {
  const go = useTransitionNavigate();
  return (
    <a
      href={to}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        if (onClick) onClick(e);
        go(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
