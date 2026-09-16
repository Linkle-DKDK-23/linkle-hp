/**
 * スクロール状態の module-singleton（設計 §2.3）。React state は使わない。
 */
export const scrollStore = {
  scroll: 0,
  limit: 0,
  velocity: 0,
  direction: 0,
  progress: 0,
  vh: typeof window !== 'undefined' ? window.innerHeight : 0,
  vw: typeof window !== 'undefined' ? window.innerWidth : 0,
  listeners: new Set(),
  set(next) {
    Object.assign(this, next);
    this.listeners.forEach((fn) => fn(this));
  },
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    scrollStore.vh = window.innerHeight;
    scrollStore.vw = window.innerWidth;
  });
}
