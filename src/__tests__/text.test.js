import { splitBunsetsu, fitGhostFontSize, fitGiantFontSize } from '../lib/text/splitText';
import { terrain } from '../lib/webgl/terrain';
import { PIXEL_GLYPHS } from '../lib/text/pixelFont';

describe('文節分割（G6）', () => {
  it('助詞・句読点を直前に結合し、連結すると元の文と一致する', () => {
    const text = '私たちは、最新のWeb技術とデザインを駆使し、お客様のビジネスを成長させるソリューションを提供します。';
    const parts = splitBunsetsu(text);
    expect(parts.join('')).toBe(text);
    expect(parts.length).toBeGreaterThan(3);
    parts.forEach((p) => expect(p).not.toMatch(/^[、。]/));
  });
});

describe('フォントサイズ（G3 / G12）', () => {
  it('G12: 各行が画面幅の 115% 以上になる（下限 18vw）', () => {
    const vw = 1512;
    ['未来を創る', '働く', 'US', 'CONTACT'].forEach((line) => {
      const fs = fitGhostFontSize(line, vw, 0.18, false);
      expect(fs).toBeGreaterThanOrEqual(0.18 * vw);
    });
    // 短い文字列ほど大きくなる
    expect(fitGhostFontSize('働く', vw)).toBeGreaterThan(fitGhostFontSize('未来を創る', vw));
  });
  it('G3: キャップ 32vh（1 行）/ 24vh（2 行）を超えない', () => {
    const fs1 = fitGiantFontSize(['LINKLE'], 1512 - 151, 827);
    expect(fs1 * 0.7).toBeLessThanOrEqual(0.32 * 827 + 1);
    const fs2 = fitGiantFontSize(['ABOUT', 'US'], 1512 - 151, 827);
    expect(fs2 * 0.7).toBeLessThanOrEqual(0.24 * 827 + 1);
  });
});

describe('地形関数 / ピクセル文字', () => {
  it('terrain は −1..1 に収まる', () => {
    for (let i = 0; i < 200; i += 1) {
      const v = terrain(Math.random() * 6, Math.random() * 6);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
  it('LOADING と数字の 5×7 行列が揃っている', () => {
    'LOADING0123456789'.split('').forEach((c) => {
      expect(PIXEL_GLYPHS[c]).toHaveLength(7);
      PIXEL_GLYPHS[c].forEach((row) => expect(row).toMatch(/^[01]{5}$/));
    });
  });
});
