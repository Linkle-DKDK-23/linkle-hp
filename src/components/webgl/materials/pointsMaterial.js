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
/* 雲: 球分布を渦（curl 風）でゆっくり捻る + 呼吸 */
vec3 bpPosition() {
  vec3 cloud = aCloud * uRadius;
  float ang = 0.35 * uTime + 1.4 * length(cloud.xz);         // 中心ほど速く回る渦
  float c = cos(ang), s = sin(ang);
  cloud.xz = mat2(c, -s, s, c) * cloud.xz;
  cloud += 0.07 * vec3(
    snoise(cloud.xy * 1.3 + uTime * 0.12),
    snoise(cloud.yz * 1.3 + 7.0 + uTime * 0.12),
    snoise(cloud.zx * 1.3 + 3.0 + uTime * 0.12));
  cloud.y += 0.32;
  vec2 dm = cloud.xy - uMouse;
  float rep = smoothstep(0.35, 0.0, length(dm));
  cloud.xy += normalize(dm + 1e-4) * rep * 0.25;
  vec3 mesh = vec3(aGrid.x * 1.6, terrain(aGrid.x, aGrid.y) * 0.25, aGrid.y * 1.0);
  mesh = isoRotate(mesh);
  mesh.y -= 0.05;
  vec3 pos = mix(cloud, mesh, uMorph);
  pos *= mix(1.0, 0.7, uPull);                                 // ドリーバック
  return pos;
}
`;

/**
 * G2: 頂点群（Points）。lusion の「灰色の泡状の雲」に寄せる:
 * 大小の柔らかい球（グレー 0.55〜1.0 のばらつき）、奥の粒は薄く、3% がシアンの火花。
 * 地形メッシュに移ると白い頂点に締まる。
 */
export const BpPointsMaterial = shaderMaterial(
  {
    uTime: 0, uMorph: 0, uPull: 0, uRadius: 0.55, uDpr: 1, uMouse: new THREE.Vector2(0, 99),
  },
  /* glsl */ `
  ${VERT_COMMON}
  varying float vAlpha;
  varying float vShade;
  varying float vSpark;
  void main() {
    vec3 pos = bpPosition();
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    // 雲では 1.6 倍の柔らかい球、メッシュでは小さな白い頂点
    float size = mix(aSize * 1.6, aSize * 0.6, uMorph);
    gl_PointSize = size * uDpr * (3.0 / -mv.z);
    // 奥行きで薄く（雲の量感）
    float depth = clamp((pos.z + 1.0) / 2.0, 0.0, 1.0);
    vAlpha = mix(0.35 + 0.65 * depth, 0.8, uMorph);
    // 粒ごとの明度（グレーの泡）。メッシュでは白
    float rnd = fract(sin(dot(aGrid, vec2(12.9898, 78.233))) * 43758.5453);
    vShade = mix(0.55 + 0.45 * rnd, 1.0, uMorph);
    vSpark = step(0.97, rnd) * (1.0 - uMorph);
    gl_Position = projectionMatrix * mv;
  }`,
  /* glsl */ `
  varying float vAlpha;
  varying float vShade;
  varying float vSpark;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float body = 1.0 - smoothstep(0.30, 0.5, d);
    float core = 1.0 - smoothstep(0.0, 0.16, d);
    float a = (body * 0.5 + core * 0.5) * vAlpha;
    if (a < 0.01) discard;
    vec3 col = vec3(vShade);
    col = mix(col, vec3(0.35, 0.95, 1.0), vSpark);   // シアンの火花
    gl_FragColor = vec4(col, a);
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
