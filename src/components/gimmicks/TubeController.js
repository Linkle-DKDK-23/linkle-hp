import { useLayoutEffect } from 'react';
import { scrollStore } from '../../lib/scroll/scrollStore';

/**
 * G13 配管の状態合成。ページ側が useTube(sectionRef, keyframes) で区間を登録し、
 * 現在 sticky 表示中（viewport 中央線を含む）のセクションの keyframes を p で線形補間して
 * LiquidTube に渡す。keyframes: [{ at, mode, topY, bottomY, fill, breakT, opacity }]
 * 数値フィールドは px か (vh, vw) => px の関数。
 */
const segments = [];
let wrapperEl = null;
const state = {
  mode: 'none', topY: 0, bottomY: 0, fill: 0, breakT: 0, opacity: 1,
};
const listeners = new Set();
const NUM_FIELDS = ['topY', 'bottomY', 'fill', 'breakT', 'opacity'];

const resolve = (v, vh, vw) => (typeof v === 'function' ? v(vh, vw) : (v ?? 0));
const lerp = (a, b, t) => a + (b - a) * t;

function measure(seg) {
  if (!wrapperEl || !seg.el) return;
  const rect = seg.el.getBoundingClientRect();
  const wrect = wrapperEl.getBoundingClientRect();
  seg.top = rect.top - wrect.top + wrapperEl.scrollTop;
  seg.height = rect.height;
}

function fillDefaults(kfs) {
  // 各 keyframe に欠けている数値は直前の値を引き継ぐ
  let prev = { mode: 'none', topY: 0, bottomY: 0, fill: 0, breakT: 0, opacity: 1 };
  return kfs.map((k) => {
    const full = { ...prev, ...k };
    prev = full;
    return full;
  });
}

function interpolate(kfs, p, vh, vw) {
  if (!kfs.length) return null;
  let a = kfs[0];
  let b = kfs[0];
  for (let i = 0; i < kfs.length; i += 1) {
    if (kfs[i].at <= p) { a = kfs[i]; b = kfs[Math.min(i + 1, kfs.length - 1)]; }
  }
  const span = Math.max(1e-6, b.at - a.at);
  const t = a === b ? 0 : Math.min(1, Math.max(0, (p - a.at) / span));
  const out = { mode: t < 1 ? a.mode : b.mode };
  NUM_FIELDS.forEach((f) => {
    out[f] = lerp(resolve(a[f], vh, vw), resolve(b[f], vh, vw), t);
  });
  // mode は step（a のモード）。ただし a が none で b が可視のときは b の値で出現させる
  if (a.mode === 'none' && b.mode !== 'none' && t > 0) out.mode = b.mode;
  return out;
}

export const tubeController = {
  attach(el) { wrapperEl = el; segments.forEach(measure); },
  measure() { segments.forEach(measure); },
  register(seg) {
    segments.push(seg);
    measure(seg);
    return () => {
      const i = segments.indexOf(seg);
      if (i >= 0) segments.splice(i, 1);
    };
  },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  get state() { return state; },
  tick() {
    const scroll = scrollStore.scroll;
    const vh = scrollStore.vh || window.innerHeight;
    const vw = scrollStore.vw || window.innerWidth;
    const mid = scroll + vh / 2;
    let active = null;
    for (const seg of segments) {
      if (seg.top === undefined) continue;
      if (mid >= seg.top && mid < seg.top + seg.height) { active = seg; break; }
    }
    if (!active) {
      // 登録されていない区間では直前の状態を保持（セクション間の連続性）
      listeners.forEach((fn) => fn(state));
      return;
    }
    const p = Math.min(1, Math.max(0, (scroll - active.top) / Math.max(1, active.height - vh)));
    const next = interpolate(active.kfs, p, vh, vw);
    if (next) Object.assign(state, next);
    listeners.forEach((fn) => fn(state));
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => tubeController.measure());
}

/**
 * @param {React.RefObject<HTMLElement>} sectionRef
 * @param {Array<object>} keyframes
 */
export function useTube(sectionRef, keyframes) {
  useLayoutEffect(() => {
    if (!sectionRef.current) return undefined;
    const seg = { el: sectionRef.current, kfs: fillDefaults(keyframes) };
    const off = tubeController.register(seg);
    const t = setTimeout(() => tubeController.measure(), 60);
    return () => { clearTimeout(t); off(); };
    // keyframes はページ内で不変の前提
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionRef]);
}
