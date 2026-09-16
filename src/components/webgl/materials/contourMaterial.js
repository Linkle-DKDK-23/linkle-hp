import { shaderMaterial } from '@react-three/drei/core/shaderMaterial';
import { GLSL_NOISE, GLSL_TERRAIN } from '../../../lib/webgl/glsl';

/** G9: フルスクリーン fbm 等高線 + シェーダ内ハロー（bloom 相当） */
export const BpContourMaterial = shaderMaterial(
  { uTime: 0, uReveal: 0, uAspect: 1.8, uLines: 14 },
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
  void main() {
    vec2 q = vec2(vUv.x * uAspect, vUv.y) * 3.0 + vec2(0.0, uTime * 0.04);
    float h = terrain(q.x, q.y);
    float f = fract(h * uLines);
    float w = max(fwidth(h), 1e-4);
    float d = min(f, 1.0 - f) / (uLines * w);
    float core = 1.0 - smoothstep(0.0, 1.0, d);
    float halo = exp(-d * 0.35) * 0.35;
    float mask = smoothstep(0.55, 0.35, vUv.y) * uReveal;
    float a = (core + halo) * mask;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vec3(1.0), a);
  }`
);
