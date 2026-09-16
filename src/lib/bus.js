import { motionValue } from 'framer-motion';

/**
 * ページ側からシーン / 固定 UI へ状態を渡す singleton 群。
 * すべて MotionValue か plain object で、React の再レンダーを起こさない。
 */
export const sceneBus = {
  hero: motionValue(0), // ヒーローの p（G2 morph / pull）
  team: motionValue(0), // TEAM 相当の p（G9 reveal）
  heroVisible: false,
  teamVisible: false,
  mouse: { x: 0, y: 0 },
  revealAt: 0, // REVEAL 完了時刻（粒子の拡散 1.2s 用）
  contourLabels: [],
  listeners: new Set(),
  notify() {
    this.listeners.forEach((fn) => fn(this));
  },
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },
  setVisible(key, v) {
    if (this[key] === v) return;
    this[key] = v;
    this.notify();
  },
};

export const crosshairBus = {
  y: motionValue(49), // vh 単位
};

export const uiBus = {
  blueRotate: motionValue(0),
  blueOpacity: motionValue(0),
  blueTarget: { current: null }, // クリックで scrollTo する要素
  continueVisible: motionValue(0),
  continueTarget: { current: null },
};
