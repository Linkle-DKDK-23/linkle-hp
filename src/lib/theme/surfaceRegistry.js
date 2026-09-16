import { useLayoutEffect } from 'react';
import { scrollStore } from '../scroll/scrollStore';

/**
 * 面（surface）レジストリ（設計 §2.4）。
 * 各セクションが useSurface() で登録し、スクロール位置からヘッダー線 (72px) と
 * 中央線 (49vh) の 2 点で面を判定して <html data-theme / data-theme-mid> に書く。
 */
const registry = [];
let wrapperEl = null;
let lastTheme = '';
let lastMid = '';

function measureEntry(entry) {
  if (!wrapperEl || !entry.el) return;
  const rect = entry.el.getBoundingClientRect();
  const wrect = wrapperEl.getBoundingClientRect();
  const top = rect.top - wrect.top + wrapperEl.scrollTop;
  entry.top = top;
  entry.bottom = top + rect.height;
  if (entry.compute) {
    // SurfaceWipe などが計算値で複数の面を登録する
    entry.ranges = entry.compute(top, rect.height, scrollStore.vh || window.innerHeight);
  } else {
    entry.ranges = [{ surface: entry.surface, top: entry.top, bottom: entry.bottom }];
  }
}

function surfaceAt(y) {
  let found = null;
  for (const entry of registry) {
    if (!entry.ranges) continue;
    for (const r of entry.ranges) {
      if (y >= r.top && y < r.bottom) {
        if (!found || r.top >= found.top) found = r;
      }
    }
  }
  return found ? found.surface : null;
}

export const surfaceRegistry = {
  attach(el) {
    wrapperEl = el;
    this.measure();
  },
  measure() {
    registry.forEach(measureEntry);
    this.update(scrollStore.scroll);
  },
  update(scroll) {
    if (typeof document === 'undefined') return;
    const vh = scrollStore.vh || window.innerHeight;
    const theme = surfaceAt(scroll + 72) || lastTheme || 'dark';
    const mid = surfaceAt(scroll + vh * 0.49) || lastMid || 'dark';
    if (theme !== lastTheme) {
      lastTheme = theme;
      document.documentElement.dataset.theme = theme;
    }
    if (mid !== lastMid) {
      lastMid = mid;
      document.documentElement.dataset.themeMid = mid;
    }
  },
  register(entry) {
    registry.push(entry);
    measureEntry(entry);
    return () => {
      const i = registry.indexOf(entry);
      if (i >= 0) registry.splice(i, 1);
    };
  },
  reset() {
    lastTheme = '';
    lastMid = '';
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = 'dark';
      document.documentElement.dataset.themeMid = 'dark';
    }
  },
  get entries() {
    return registry;
  },
};

if (typeof document !== 'undefined') {
  document.documentElement.dataset.theme = 'dark';
  document.documentElement.dataset.themeMid = 'dark';
  scrollStore.subscribe(({ scroll }) => surfaceRegistry.update(scroll));
  window.addEventListener('resize', () => surfaceRegistry.measure());
}

/**
 * @param {'dark'|'brand'|'light'|'band'} surface
 * @param {React.RefObject<HTMLElement>} ref
 * @param {(top:number, height:number, vh:number) => {surface:string, top:number, bottom:number}[]} [compute]
 */
export function useSurface(surface, ref, compute) {
  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    const entry = { el: ref.current, surface, compute };
    const off = surfaceRegistry.register(entry);
    // フォント読込後にサイズが変わるので再計測
    const t = setTimeout(() => surfaceRegistry.measure(), 50);
    return () => {
      clearTimeout(t);
      off();
    };
  }, [surface, ref, compute]);
}
