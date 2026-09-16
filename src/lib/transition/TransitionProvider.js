import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scrollStore } from '../scroll/scrollStore';
import { surfaceRegistry } from '../theme/surfaceRegistry';
import { fontsReady } from '../text/measure';
import { sceneBus } from '../bus';
import { prefetchPage } from '../../pages/loaders';

/**
 * ルート遷移・プリローダー・遷移オーバーレイの状態機械（設計 §2.5）。
 * phase: BOOT → PRELOAD → SPLIT → REVEAL → IDLE → CAPTURE → LOADING → RESET → PRELOAD(short) → …
 */
const TransitionContext = createContext(null);

const initial = { phase: 'BOOT', variant: 'full', to: null, seq: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'PRELOAD':
      return { ...state, phase: 'PRELOAD', variant: action.variant, seq: state.seq + 1 };
    case 'DONE': {
      if (action.phase !== state.phase) return state;
      const next = {
        PRELOAD: 'SPLIT', SPLIT: 'REVEAL', REVEAL: 'IDLE', CAPTURE: 'LOADING', LOADING: 'RESET',
      }[state.phase];
      return next ? { ...state, phase: next } : state;
    }
    case 'GO':
      if (state.phase !== 'IDLE') return state;
      return { ...state, phase: 'CAPTURE', to: action.to };
    case 'POP':
      return { ...state, phase: 'RESET', to: null };
    default:
      return state;
  }
}

const LOADER_TIMEOUT = 5000;

export function TransitionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const navigate = useNavigate();
  const location = useLocation();
  const lenisRef = useRef(null);
  const wrapperRef = useRef(null);
  const expectedPath = useRef(location.pathname);
  const webglReady = useRef(null);
  if (!webglReady.current) {
    let resolve;
    const promise = new Promise((r) => { resolve = r; });
    webglReady.current = { promise, resolve };
  }

  // BOOT → PRELOAD(full)
  useEffect(() => {
    if (state.phase === 'BOOT') dispatch({ type: 'PRELOAD', variant: 'full' });
  }, [state.phase]);

  // phase を <html data-phase> に出す（CSS フック用）
  useEffect(() => {
    document.documentElement.dataset.phase = state.phase;
    if (state.phase === 'IDLE') sceneBus.revealAt = performance.now();
  }, [state.phase]);

  // lenis は IDLE の間だけ動く
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (state.phase === 'IDLE') lenis.start();
    else lenis.stop();
  }, [state.phase]);

  // RESET: 遷移先へ移動し先頭へ戻す → chunk 解決を待って PRELOAD(short)
  useEffect(() => {
    if (state.phase !== 'RESET') return undefined;
    let cancelled = false;
    const run = async () => {
      const to = state.to;
      if (to) {
        expectedPath.current = to;
        navigate(to);
      }
      const lenis = lenisRef.current;
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      if (wrapperRef.current) wrapperRef.current.scrollTop = 0;
      window.scrollTo(0, 0);
      scrollStore.set({ scroll: 0, velocity: 0, direction: 0, progress: 0 });
      surfaceRegistry.reset();
      const path = to || location.pathname;
      await Promise.race([
        prefetchPage(path),
        new Promise((r) => setTimeout(r, LOADER_TIMEOUT)),
      ]);
      // lazy の解決後、次フレームで再計測
      await new Promise((r) => requestAnimationFrame(() => r()));
      surfaceRegistry.measure();
      if (!cancelled) dispatch({ type: 'PRELOAD', variant: 'short' });
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // popstate（戻る/進む）: IDLE 中に想定外の location 変化 → RESET から再生
  useEffect(() => {
    if (location.pathname === expectedPath.current) return;
    expectedPath.current = location.pathname;
    if (state.phase === 'IDLE') dispatch({ type: 'POP' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const go = useCallback((to) => {
    if (!to) return;
    const clean = to.split('?')[0];
    if (clean === location.pathname && !to.includes('?')) return;
    if (state.phase !== 'IDLE') return;
    prefetchPage(clean);
    dispatch({ type: 'GO', to });
  }, [location.pathname, state.phase]);

  const done = useCallback((phase) => dispatch({ type: 'DONE', phase }), []);

  const attachLenis = useCallback((lenis, wrapper) => {
    lenisRef.current = lenis;
    wrapperRef.current = wrapper;
    if (lenis) {
      if (state.phase === 'IDLE') lenis.start();
      else lenis.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const readiness = useMemo(() => ({
    fonts: () => Promise.all([
      fontsReady(),
      ...(document.fonts ? [
        document.fonts.load('500 1em "Instrument Sans"'),
        document.fonts.load('400 1em "JetBrains Mono"'),
        document.fonts.load('500 1em "Zen Kaku Gothic New"'),
      ].map((p) => p.catch(() => null)) : []),
    ]),
    webgl: () => webglReady.current.promise,
    resolveWebGL: () => webglReady.current.resolve(),
  }), []);

  const value = useMemo(() => ({
    phase: state.phase,
    variant: state.variant,
    seq: state.seq,
    go,
    done,
    attachLenis,
    getLenis: () => lenisRef.current,
    readiness,
  }), [state.phase, state.variant, state.seq, go, done, attachLenis, readiness]);

  return <TransitionContext.Provider value={value}>{children}</TransitionContext.Provider>;
}

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error('useTransition must be used within TransitionProvider');
  return ctx;
}
