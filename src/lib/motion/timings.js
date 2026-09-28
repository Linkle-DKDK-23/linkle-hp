/** 設計 §4 の duration / easing / stagger 定数 */
export const EASE = [0.2, 0.8, 0.2, 1];
export const EASE_CSS = 'cubic-bezier(.2,.8,.2,1)';

export const T = {
  preloadFull: { min: 1.8, counter: 1.6 },
  preloadShort: { min: 0.9, counter: 0.9 },
  split: 0.6,
  reveal: 1.1,
  capture: 0.9,
  pixelDot: 0.015,
  pixelHold: 0.2,
  heroLetter: { d: 1.1, stagger: 0.08, staggerSp: 0.05, line2Delay: 0.25 },
  dimensionFlash: 0.4,
  bunsetsu: { d: 0.6, stagger: 0.04 },
  decode: 0.06,
  listRow: { d: 0.5, stagger: 0.06 },
  card: { d: 0.7, stagger: 0.08 },
  cardFan: 0.7,   // G14: 裏向きの束が扇状に広がって定位置へ
  cardFlip: 0.6,  // G14: 1 枚が表に裏返る時間（左から 0.16s 間隔）
  pillDelay: 1.2,
  pillIn: 0.8,
  pillHide: 0.3,
  theme: 0.24,
  crosshairMove: 0.6,
  revealLine: 0.09,
  flipStagger: 0.02,
};
