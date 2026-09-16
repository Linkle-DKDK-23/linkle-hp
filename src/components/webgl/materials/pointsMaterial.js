import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei/core/shaderMaterial';
import { GLSL_NOISE, GLSL_TERRAIN } from '../../../lib/webgl/glsl';

const VERT_COMMON = /* glsl */ `
uniform float uTime, uMorph, uPull, uRadius, uDpr;
uniform vec2 uMouse;
attribute vec3 aCloud;
attribute vec2 aGrid;
attribute float aSize;
${GLSL_NOISE}
${GLSL_TERRAIN}
vec3 isoRotate(vec3 p) {
  float cx = 0.8165, sx = 0.5774;          // rotX(35.26°)
  p = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);
  float cy = 0.7071, sy = 0.7071;          // rotY(45°)
  p = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);
  return p;
}
vec3 bpPosition() {
  vec3 cloud = aCloud * uRadius;
  cloud += 0.06 * vec3(
    snoise(cloud.xy * 1.3 + uTime * 0.15),
    snoise(cloud.yz * 1.3 + 7.0 + uTime * 0.15),
    snoise(cloud.zx * 1.3 + 3.0 + uTime * 0.15));
  cloud.y += 0.32;
  vec2 dm = cloud.xy - uMouse;
  float rep = smoothstep(0.35, 0.0, length(dm));
  cloud.xy += normalize(dm + 1e-4) * rep * 0.25;
  vec3 mesh = vec3(aGrid.x * 1.6, terrain(aGrid.x, aGrid.y) * 0.25, aGrid.y * 1.0);
  mesh = isoRotate(mesh);
  mesh.y -= 0.05;
  vec3 pos = mix(cloud, mesh, uMorph);
  pos *= mix(1.0, 0.7, uPull);
  return pos;
}
`;

/** G2: 頂点群（Points）。柔らかい球 + 中心ハイライト、AdditiveBlending */
export const BpPointsMaterial = shaderMaterial(
  {
    uTime: 0, uMorph: 0, uPull: 0, uRadius: 0.55, uDpr: 1, uMouse: new THREE.Vector2(0, 99),
  },
  /* glsl */ `
  ${VERT_COMMON}
  varying float vAlpha;
  void main() {
    vec3 pos = bpPosition();
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float size = mix(aSize, aSize * 0.6, uMorph);
    gl_PointSize = size * uDpr * (3.0 / -mv.z);
    vAlpha = mix(1.0, 0.8, uMorph);
    gl_Position = projectionMatrix * mv;
  }`,
  /* glsl */ `
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float body = 1.0 - smoothstep(0.35, 0.5, d);
    float core = 1.0 - smoothstep(0.0, 0.18, d);
    float a = (body * 0.55 + core * 0.45) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(1.0), a);
  }`
);

/** G2: 稜線（LineSegments）。uMorph で確定、雲状態では確率的に点灯 */
export const BpLinesMaterial = shaderMaterial(
  {
    uTime: 0, uMorph: 0, uPull: 0, uRadius: 0.55, uDpr: 1, uMouse: new THREE.Vector2(0, 99),
  },
  /* glsl */ `
  ${VERT_COMMON}
  attribute vec2 aSeg;
  varying float vLine;
  void main() {
    vec3 pos = bpPosition();
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float flicker = 0.10 * step(0.985, snoise(aSeg * 4.0 + uTime * 0.3));
    vLine = max(uMorph * 0.10, flicker * (1.0 - uMorph));
    gl_Position = projectionMatrix * mv;
  }`,
  /* glsl */ `
  varying float vLine;
  void main() {
    if (vLine < 0.005) discard;
    gl_FragColor = vec4(vec3(1.0), vLine);
  }`
);
