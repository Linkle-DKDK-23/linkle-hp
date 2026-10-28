import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei/core/shaderMaterial';
import { GLSL_NOISE } from '../../../lib/webgl/glsl';

/**
 * G13'': 黒面の背景「シグナル・リッジ」。
 * 画面下から積み重なる細い水平線（リッジライン）が、ノイズとカーソルで波形のように隆起する。
 * 手前の線が奥の線を隠す（隠線処理）ので、線だけで地形の奥行きが出る。
 * 色は白の細線を基調に、隆起の頂と走査光（左→右に流れる帯）だけブランド色 #6ccaf1 で光らせる。黒面で加算合成。
 */
const LINES = 64.0; // 線の本数（画面高さ 1.1 に並べる）
const MAX_H = 0.24; // 隆起の最大高さ（UV）
const REACH = 24; // 1 ピクセルで調べる線の数（最大隆起 1.6 × MAX_H / 間隔 + 余裕）

export const BpSignalMaterial = shaderMaterial(
  {
    uTime: 0, uAlpha: 0, uAspect: 1.8, uPx: 0.001, uMouse: new THREE.Vector2(0.5, 0.5), uLift: 1,
  },
  /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }`,
  /* glsl */ `
  precision highp float;
  uniform float uTime, uAlpha, uAspect, uPx, uLift;
  uniform vec2 uMouse;
  varying vec2 vUv;
  ${GLSL_NOISE}

  const float LINES = ${LINES.toFixed(1)};
  const float SPACING = 1.1 / LINES;
  const float Y0 = -0.06;
  const float MAX_H = ${MAX_H.toFixed(3)};
  const vec3 BRAND = vec3(0.424, 0.792, 0.945);

  // i 本目（0 = 最前列 = 画面最下）の線の、x における高さ
  float ridge(float x, float i) {
    float base = Y0 + i * SPACING;
    // 奥ほどわずかに幅が詰まる（簡易パース）
    float px = (x - 0.5) * (1.0 + i * 0.006) + 0.5;
    // 中央が盛り上がり、両端は平ら
    float cx = 0.5 + 0.16 * sin(uTime * 0.07 + i * 0.05);
    float dc = (px - cx) * uAspect;
    float env = exp(-dc * dc * 3.2);
    // 奥（上）の線ほど静か: 隆起は画面下半分に集める
    env *= smoothstep(0.62, 0.05, base);
    // ノイズは縦横比補正した座標で取る（縦長の SP でも山の幅が詰まってトゲトゲしない）
    float ax = (px - 0.5) * uAspect;
    float n = snoise(vec2(ax * 2.6 + i * 0.13, i * 0.29 - uTime * 0.11));
    n += 0.35 * snoise(vec2(ax * 5.6 - uTime * 0.2, i * 0.53 + 3.1));
    n = max(0.0, n * 0.7 + 0.12);
    float h = env * n * n * 0.9 + 0.012 * snoise(vec2(ax * 18.0, i * 1.7 + uTime * 0.4));
    // カーソル: 近い線ほど x 方向のガウスで鋭く持ち上がる
    float dxm = (px - uMouse.x) * uAspect;
    float dym = (base - uMouse.y) / 0.16;
    float bump = exp(-dxm * dxm * 26.0) * exp(-dym * dym) * uLift;
    h += bump * (0.38 + 0.18 * sin(px * 60.0 - uTime * 3.0) * exp(-dxm * dxm * 60.0));
    return base + MAX_H * h;
  }

  void main() {
    float x = vUv.x;
    float y = vUv.y;
    float first = max(0.0, floor((y - MAX_H * 1.6 - Y0) / SPACING));
    float line = 0.0;   // 線の濃さ
    float crest = 0.0;  // 頂の強さ（ブランド色）
    float shade = 0.0;  // 線の直下の面の陰影
    float idx = -1.0;
    for (int k = 0; k < ${REACH}; k++) {
      float i = first + float(k);
      if (i >= LINES) break;
      float yi = ridge(x, i);
      float base = Y0 + i * SPACING;
      if (yi < y - uPx * 3.0) continue;          // この線は画素より下 → もっと奥の線へ
      // 傾きで線幅を補正（急斜面でも細線が途切れない）
      float slope = (ridge(x + 0.002, i) - yi) / 0.002 / uAspect;
      float d = abs(y - yi) / sqrt(1.0 + slope * slope);
      line = 1.0 - smoothstep(uPx * 0.6, uPx * 1.6, d);
      crest = clamp((yi - base) / MAX_H, 0.0, 1.0);
      // 画素が線の下（面の中）なら、線の直下だけ淡く色づける
      if (y < yi) shade = exp(-(yi - y) / 0.012) * crest;
      idx = i;
      break;
    }
    if (idx < 0.0) discard;

    float depth = 1.0 - idx / LINES;                           // 手前ほど明るい
    float sweep = exp(-pow((fract(uTime * 0.06) * 1.6 - 0.3 - x) * 7.0, 2.0)); // 走査光
    float hot = smoothstep(0.15, 0.9, crest);
    vec3 col = mix(vec3(0.82, 0.86, 0.9), BRAND, clamp(hot + sweep * 0.6, 0.0, 1.0));
    col += vec3(1.0) * hot * hot * 0.35;
    float edge = smoothstep(0.0, 0.06, x) * smoothstep(1.0, 0.94, x);
    float top = smoothstep(0.78, 0.30, y);                      // 上部は闇に溶かす
    float a = line * (0.05 + 0.13 * depth + 0.5 * hot + 0.28 * sweep * (0.25 + hot)) + shade * 0.10;
    vec3 c = mix(BRAND, col, line);
    a *= edge * top * uAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(c, min(a, 1.0));
  }`
);
