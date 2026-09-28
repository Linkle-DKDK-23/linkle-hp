// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

/* jsdom にない API のポリフィル（IntersectionObserver / ResizeObserver / matchMedia / rAF） */
class IO {
  constructor(cb) { this.cb = cb; }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!window.IntersectionObserver) window.IntersectionObserver = IO;
if (!window.ResizeObserver) window.ResizeObserver = RO;
if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false, media: '', onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; },
  });
}
if (!window.requestAnimationFrame) window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
if (!window.cancelAnimationFrame) window.cancelAnimationFrame = (id) => clearTimeout(id);
if (!window.scrollTo) window.scrollTo = () => {};
Object.defineProperty(window, 'innerWidth', { value: 1512, writable: true });
Object.defineProperty(window, 'innerHeight', { value: 827, writable: true });
// jsdom の canvas は未実装ログを出すだけなので null を返す（measureText は概算値へフォールバック）
HTMLCanvasElement.prototype.getContext = () => null;
// react-router v7 が読み込み時に参照する TextEncoder / TextDecoder（jsdom 未提供）
const { TextEncoder, TextDecoder } = require('util');
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;
