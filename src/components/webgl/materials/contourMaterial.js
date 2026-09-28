import { shaderMaterial } from '@react-three/drei/core/shaderMaterial';
import { GLSL_NOISE, GLSL_TERRAIN } from '../../../lib/webgl/glsl';

/**
 * G9: フルスクリーン fbm 等高線 + シェーダ内ハロー（bloom 相当）。
 * lusion（2026-09 録画）に合わせて「太く少ない発光ライン + 霧のような広いハロー + 背景の縦の筋（デジタルレイン）」。
 * 線の本数は uLines（4〜5 本）、地形のスケールは大きく（q = uv * 1.35）、明るさは線に沿って揺らぐ。
 */
export const BpContourMaterial = shaderMaterial(
  { uTime: 0, uReveal: 0, uAspect: 1.8, uLines: 5 },
  /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }`,
  /* glsl */ `
  precision highp float;
  uniform float uTime, uReveal, uAspect, uLines;
  varying vec2 vUv;
  ${GLSL_NOISE}
  ${GLSL_TERRAIN}
  float hash11(float p) { return fract(sin(p * 127.1) * 43758.5453); }
  void main() {
    // 地形（ゆっくり流れる）
    vec2 q = vec2(vUv.x * uAspect, vUv.y) * 1.35 + vec2(uTime * 0.012, -uTime * 0.02);
    float h = terrain(q.x, q.y);
    float f = fract(h * uLines);
    float w = max(fwidth(h) * uLines, 1e-4);
    float d = min(f, 1.0 - f) / w;          // 最寄りの線までの距離（px 相当）

    // 線に沿った明るさの揺らぎ（電流のように一部だけ強く光り、大半は薄い）
    float pulse = 0.5 + 0.5 * snoise(vec2(h * 5.0 + uTime * 0.22, vUv.x * 1.6 - uTime * 0.07));
    pulse = smoothstep(0.35, 1.0, pulse);
    float core = (1.0 - smoothstep(0.7, 2.4, d)) * (0.18 + 0.82 * pulse);
    float glow = exp(-d * 0.09) * 0.22 * (0.2 + 0.8 * pulse);
    float mist = exp(-d * 0.03) * 0.05;

    // 画面下 35% の帯に集める。地平線側は柔らかく、最下端に向けて沈む
    float mask = smoothstep(0.52, 0.28, vUv.y) * smoothstep(-0.05, 0.22, vUv.y);

    // デジタルレイン: 縦の細い筋が上から落ちる（列ごとに速度と位相が違う。まばら）
    float col = floor(vUv.x * uAspect * 90.0);
    float seed = hash11(col);
    float speed = 0.05 + 0.12 * hash11(col + 7.3);
    float yy = fract(vUv.y * 1.6 + uTime * speed + seed * 9.0);
    float dash = smoothstep(0.0, 0.05, yy) * (1.0 - smoothstep(0.35, 0.55, yy));
    float colMask = step(0.86, hash11(col + 31.7));           // 14% の列だけ
    float rain = dash * colMask * smoothstep(0.3, 0.45, fract(vUv.x * uAspect * 90.0)) * (1.0 - smoothstep(0.55, 0.7, fract(vUv.x * uAspect * 90.0)));
    rain *= 0.10 * smoothstep(0.1, 0.6, vUv.y);

    float a = (core + glow + mist) * mask * uReveal + rain * uReveal;
    if (a < 0.003) discard;
    vec3 tint = mix(vec3(0.75, 0.85, 1.0), vec3(1.0), core); // 芯は白、ハローは淡い青
    gl_FragColor = vec4(tint, min(a, 1.0));
  }`
);
