import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { menuStore, useMenuOpen } from '../../lib/menuStore';
import { useTransition } from '../../lib/transition/TransitionProvider';
import { useTransitionNavigate } from '../../lib/transition/useTransitionNavigate';
import { MENU_ITEMS } from '../../pages/loaders';
import Pill from '../ui/Pill';

/**
 * MENU オーバーレイ（設計 §2.6）: 黒面 + 方眼、001〜006 の縦組み。clip-path で開閉 600ms。
 */
export default function MenuOverlay() {
  const open = useMenuOpen();
  const { pathname } = useLocation();
  const { getLenis } = useTransition();
  const go = useTransitionNavigate();

  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    if (open) lenis.stop();
    else if (document.documentElement.dataset.phase === 'IDLE') lenis.start();
  }, [open, getLenis]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') menuStore.set(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div
      id="bp-menu"
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className="fixed inset-0 bp-grid-inline"
      style={{
        zIndex: 'var(--bp-z-overlay)',
        background: 'var(--bp-black)',
        clipPath: open ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
        transition: 'clip-path 600ms var(--bp-ease)',
        pointerEvents: open ? 'auto' : 'none',
        padding: 'calc(var(--bp-header-y) * 2) var(--bp-margin) 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <nav aria-label="MENU">
        <ol className="flex flex-col" style={{ gap: 'clamp(6px, 1.4vh, 14px)' }}>
          {MENU_ITEMS.map((item, i) => {
            const current = item.path === pathname;
            return (
              <li key={item.path} className="flex items-baseline" style={{ gap: 24 }}>
                <span
                  className="text-num"
                  style={{ fontSize: 'var(--fs-label)', letterSpacing: '.12em', color: current ? 'var(--bp-brand)' : 'var(--bp-dim)', minWidth: 32 }}
                >
                  {String(i + 1).padStart(3, '0')}
                </span>
                <a
                  href={item.path}
                  tabIndex={open ? 0 : -1}
                  aria-current={current ? 'page' : undefined}
                  className="palt font-medium"
                  style={{
                    fontSize: 'var(--fs-section-ja)',
                    lineHeight: 1.1,
                    color: 'var(--bp-ink)',
                    transition: 'transform 240ms var(--bp-ease), opacity 240ms var(--bp-ease)',
                    display: 'inline-block',
                    opacity: open ? 1 : 0,
                    transform: open ? 'translateY(0)' : 'translateY(12px)',
                    transitionDelay: open ? `${120 + i * 50}ms` : '0ms',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    menuStore.set(false);
                    if (!current) go(item.path);
                  }}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="flex items-center justify-between">
        <span className="text-label" style={{ color: 'var(--bp-dim)' }}>[[ MENU ]]</span>
        <Pill variant="light" dots={2} onClick={() => menuStore.set(false)} tabIndex={open ? 0 : -1}>
          MENU
        </Pill>
      </div>
    </div>
  );
}
