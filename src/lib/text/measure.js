/**
 * 文字幅の計測（offscreen canvas 1 枚を共有、結果はキャッシュ）。
 * jsdom など getContext が取れない環境では概算値を返す。
 */
let ctx = null;
const cache = new Map();

function getCtx() {
  if (ctx !== null) return ctx;
  try {
    const c = document.createElement('canvas');
    ctx = c.getContext('2d') || false;
  } catch (e) {
    ctx = false;
  }
  return ctx;
}

const isCJK = (ch) => /[　-鿿＀-￯]/.test(ch);

/**
 * 1em あたりの文字列幅（em 単位）。
 * @param {string} text
 * @param {string} font  例: '700 100px "Chakra Petch"'（100px で測ることを前提）
 */
export function measureEm(text, font) {
  const key = `${font}|${text}`;
  if (cache.has(key)) return cache.get(key);
  const c = getCtx();
  let em;
  if (c && typeof c.measureText === 'function') {
    c.font = font;
    const w = c.measureText(text).width;
    em = w > 0 ? w / 100 : null;
  }
  if (em === null || em === undefined || Number.isNaN(em)) {
    em = Array.from(text).reduce((acc, ch) => acc + (isCJK(ch) ? 1 : ch === ' ' ? 0.3 : 0.62), 0);
  }
  cache.set(key, em);
  return em;
}

export function clearMeasureCache() {
  cache.clear();
}

/** document.fonts.ready を安全に待つ */
export function fontsReady() {
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    return document.fonts.ready.then(() => clearMeasureCache());
  }
  return Promise.resolve();
}
