import { measureEm } from './measure';

/** 文字分割（サロゲートペア対応） */
export function splitChars(s) {
  return Array.from(s);
}

export const isLatin = (s) => !/[　-鿿＀-￯]/.test(s);

const PARTICLES = new Set([
  'は', 'が', 'を', 'に', 'で', 'と', 'の', 'へ', 'も', 'や', 'か', 'ね', 'よ', 'な',
  '、', '。', '，', '．', 'です', 'ます', 'し', 'て', 'た', 'だ', 'る', 'れ', 'う',
  'として', 'ため', 'から', 'まで', 'など', 'こと', 'いる', 'ある', 'する',
]);

let segmenter = null;
function getSegmenter() {
  if (segmenter !== null) return segmenter;
  try {
    segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('ja', { granularity: 'word' }) : false;
  } catch (e) {
    segmenter = false;
  }
  return segmenter;
}

/**
 * 文節分割（設計 §4 G6）。Intl.Segmenter の word 分割 + 助詞・句読点を直前へ結合。
 * 未対応ブラウザでは句読点の後ろでのみ分割。
 * @param {string} text
 * @returns {string[]}
 */
export function splitBunsetsu(text) {
  const seg = getSegmenter();
  let parts;
  if (seg) {
    parts = Array.from(seg.segment(text)).map((s) => s.segment);
  } else {
    parts = text.split(/(?<=[、。，．])/).filter(Boolean);
  }
  const out = [];
  for (const w of parts) {
    const trimmed = w.trim();
    if (trimmed === '') {
      if (out.length) out[out.length - 1] += w;
      continue;
    }
    const attach = PARTICLES.has(trimmed) || /^[、。，．・「」（）()]+$/.test(trimmed) || (/^[぀-ゟ]{1,2}$/.test(trimmed) && out.length);
    if (attach && out.length) out[out.length - 1] += w;
    else out.push(w);
  }
  // 極端に短い（1 文字）かな断片は直前に結合
  const merged = [];
  for (const p of out) {
    if (merged.length && /^[぀-ゟ]$/.test(p)) merged[merged.length - 1] += p;
    else merged.push(p);
  }
  return merged;
}

/**
 * ヒーロー巨大文字のフォントサイズ（設計 §4 G3。23vw 上限は外し、幅フィットを主、キャップを従とする）。
 * @param {string[]} lines
 * @param {number} containerW  マージン内幅 px
 * @param {number} vh
 * @param {string} [font]  計測に使う書体（既定はヒーロー巨大文字の Bungee 400。ページ単位で差し替える時に渡す）
 */
export function fitGiantFontSize(lines, containerW, vh, font = '400 100px "Bungee"') {
  const wMax = Math.max(...lines.map((l) => measureEm(l, font)));
  const fsByWidth = containerW / wMax;
  const capRatio = lines.length > 1 ? 0.24 : 0.32;
  const fsByCap = (capRatio * vh) / 0.7;
  return Math.max(24, Math.min(fsByWidth, fsByCap));
}

/**
 * G12: 各行が画面幅を 15% 以上超える最小サイズ（下限 minVw × vw）。
 */
export function fitGhostFontSize(line, vw, minVw = 0.18, italic = false) {
  const latin = isLatin(line);
  // 欧文は Chakra Petch 700（italic 700 も読み込み済み）、和文は Dela Gothic One（巨大見出し用ディスプレイ書体）
  const font = latin ? `${italic ? 'italic ' : ''}700 100px "Chakra Petch"` : '400 100px "Dela Gothic One"';
  const emW = Math.max(0.2, measureEm(line, font));
  return Math.max(minVw * vw, (1.15 * vw) / emW);
}
