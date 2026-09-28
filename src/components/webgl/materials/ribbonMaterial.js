import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei/core/shaderMaterial';
import { GLSL_NOISE } from '../../../lib/webgl/glsl';

/**
 * G13': 虹色の帯（液体ガラス）。lusion 録画 45〜49s の「カーソルを追って横に漂う虹色のリボン」。
 * 画面幅いっぱいの水平な帯が、カーソルの y に追従し、カーソルの x 付近で太く明るくなり、ノイズで縦にうねる。
 * 帯の縁が虹色（hue は x と帯内の位置と時間で回る）、芯は淡い。黒面で加算合成。
 */
export const BpRibbonMaterial = shaderMaterial(
  { uTime: 0, uAlpha: 0, uAspect: 1.8, uMouse: new THREE.Vector2(0.5, 0.5) },
  /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }`,
  /* glsl */ `
  precision highp float;
  uniform float uTime, uAlpha, uAspect;
  uniform vec2 uMouse;
  varying vec2 vUv;
  ${GLSL_NOISE}
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(vec3(1.0), clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  void main() {
    float x = vUv.x;
    float dxm = (x - uMouse.x) * uAspect;           // カーソルからの横距離（縦横比補正）
    float near = exp(-dxm * dxm * 2.2);              // カーソル付近で太く・明るく

    // 中心線: カーソルの y + ゆっくりしたうねり + カーソル付近の小刻みな揺れ
    float wave = 0.045 * snoise(vec2(x * 2.2 + uTime * 0.18, uTime * 0.07))
               + 0.020 * snoise(vec2(x * 5.5 - uTime * 0.32, 2.7))
               + 0.030 * near * sin(uTime * 1.6 + x * 12.0);
    float cy = uMouse.y + wave;

    // 太さ: 基本は細く、カーソル付近で膨らむ。ノイズで所々くびれる
    float th = 0.014 + 0.050 * near + 0.012 * (0.5 + 0.5 * snoise(vec2(x * 3.5 + uTime * 0.25, 9.1)));
    float d = (vUv.y - cy) / th;                     // -1..1 が帯の内側
    float ad = abs(d);
    float body = exp(-ad * ad * 1.8);
    float rim = exp(-pow((ad - 1.0) * 3.5, 2.0));    // ガラスの縁の光
    float ends = smoothstep(0.0, 0.08, x) * smoothstep(1.0, 0.92, x);

    float hue = fract(x * 0.9 + d * 0.18 + uTime * 0.04);
    vec3 irid = hsv2rgb(vec3(hue, 0.85, 1.0));
    vec3 col = irid * (0.35 * body + 0.9 * rim) + vec3(1.0) * 0.15 * rim;
    float a = (0.22 * body + 0.55 * rim) * ends * (0.35 + 0.65 * near) * uAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(col, min(a, 1.0));
  }`
);
