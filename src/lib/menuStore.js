import { useSyncExternalStore } from 'react';

/** MENU オーバーレイの開閉状態（Header と MenuOverlay で共有） */
let open = false;
const listeners = new Set();

export const menuStore = {
  get: () => open,
  set(v) {
    if (open === v) return;
    open = v;
    listeners.forEach((fn) => fn());
  },
  toggle() {
    this.set(!open);
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export const useMenuOpen = () => useSyncExternalStore(menuStore.subscribe.bind(menuStore), menuStore.get, () => false);
