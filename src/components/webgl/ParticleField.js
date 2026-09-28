import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { BpPointsMaterial, BpLinesMaterial } from './materials/pointsMaterial';
import { sceneBus } from '../../lib/bus';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

extend({ BpPointsMaterial, BpLinesMaterial });

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function buildGeometry(GX, GZ) {
  const N = GX * GZ;
  const cloud = new Float32Array(N * 3);
  const grid = new Float32Array(N * 2);
  const size = new Float32Array(N);
  const pos = new Float32Array(N * 3);
  let i = 0;
  for (let iz = 0; iz < GZ; iz += 1) {
    for (let ix = 0; ix < GX; ix += 1) {
      // 密な核 + まばらな外縁の球分布
      const u = Math.random();
      const r = Math.cbrt(Math.random()) * (u < 0.85 ? 1 : 1.6);
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      cloud[i * 3] = r * Math.sin(ph) * Math.cos(th) * 1.15;
      cloud[i * 3 + 1] = r * Math.cos(ph) * 0.8;
      cloud[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) * 0.8;
      grid[i * 2] = (ix / (GX - 1)) * 2 - 1;
      grid[i * 2 + 1] = (iz / (GZ - 1)) * 2 - 1;
      const q = Math.random();
      size[i] = q < 0.97 ? 1.5 + Math.random() ** 2 * 5.5 : 10 + Math.random() * 4;
      i += 1;
    }
  }
  const points = new THREE.BufferGeometry();
  points.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  points.setAttribute('aCloud', new THREE.BufferAttribute(cloud, 3));
  points.setAttribute('aGrid', new THREE.BufferAttribute(grid, 2));
  points.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  points.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 10);

  // 稜線: 格子の隣接ペア
  const segs = [];
  const idx = (ix, iz) => iz * GX + ix;
  for (let iz = 0; iz < GZ; iz += 1) {
    for (let ix = 0; ix < GX; ix += 1) {
      if (ix < GX - 1) segs.push([idx(ix, iz), idx(ix + 1, iz)]);
      if (iz < GZ - 1) segs.push([idx(ix, iz), idx(ix, iz + 1)]);
    }
  }
  const M = segs.length * 2;
  const lCloud = new Float32Array(M * 3);
  const lGrid = new Float32Array(M * 2);
  const lSeg = new Float32Array(M * 2);
  const lSize = new Float32Array(M);
  const lPos = new Float32Array(M * 3);
  segs.forEach(([a, b], s) => {
    [a, b].forEach((v, k) => {
      const j = s * 2 + k;
      lCloud[j * 3] = cloud[v * 3]; lCloud[j * 3 + 1] = cloud[v * 3 + 1]; lCloud[j * 3 + 2] = cloud[v * 3 + 2];
      lGrid[j * 2] = grid[v * 2]; lGrid[j * 2 + 1] = grid[v * 2 + 1];
      lSeg[j * 2] = grid[a * 2]; lSeg[j * 2 + 1] = grid[a * 2 + 1];
      lSize[j] = 1;
    });
  });
  const lines = new THREE.BufferGeometry();
  lines.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
  lines.setAttribute('aCloud', new THREE.BufferAttribute(lCloud, 3));
  lines.setAttribute('aGrid', new THREE.BufferAttribute(lGrid, 2));
  lines.setAttribute('aSeg', new THREE.BufferAttribute(lSeg, 2));
  lines.setAttribute('aSize', new THREE.BufferAttribute(lSize, 1));
  lines.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 10);
  return { points, lines };
}

/**
 * G2: 粒子雲 → 地形メッシュ。位置は GPU 側で計算し CPU は uniform 更新のみ。
 */
export default function ParticleField() {
  const { isMobile, reducedMotion } = useMotionPrefs();
  const { viewport, camera, size } = useThree();
  const GX = isMobile ? 50 : 100;
  const GZ = isMobile ? 40 : 50;
  const geo = useMemo(() => buildGeometry(GX, GZ), [GX, GZ]);
  const pointsRef = useRef(null);
  const linesRef = useRef(null);
  const pMat = useRef(null);
  const lMat = useRef(null);
  const mouse = useRef(new THREE.Vector2(0, 99));
  const dpr = Math.min(1.5, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  useFrame((state) => {
    const visible = sceneBus.heroVisible;
    if (pointsRef.current) pointsRef.current.visible = visible;
    if (linesRef.current) linesRef.current.visible = visible && !isMobile;
    if (!visible) return;
    const p = sceneBus.hero.get();
    // 文字変形（p .02→.18）と同時に雲→メッシュ、その後はタグライン固定のままドリーバック（lusion のカメラ引き）
    const morph = smoothstep(0.04, 0.3, p);
    const pull = smoothstep(0.3, 0.9, p);
    const t = reducedMotion ? 12.3 : state.clock.elapsedTime;
    const since = sceneBus.revealAt ? (performance.now() - sceneBus.revealAt) / 1200 : 0;
    const k = Math.min(1, Math.max(0, since));
    const radius = 0.55 + 0.3 * (1 - (1 - k) ** 3);

    // マウス（NDC → z=0 平面のワールド座標、lerp .1）
    const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const halfW = halfH * (size.width / size.height);
    const target = reducedMotion
      ? { x: 0, y: 99 }
      : { x: sceneBus.mouse.x * halfW, y: sceneBus.mouse.y * halfH };
    mouse.current.x += (target.x - mouse.current.x) * 0.1;
    mouse.current.y += (target.y - mouse.current.y) * 0.1;

    [pMat.current, lMat.current].forEach((m) => {
      if (!m) return;
      m.uTime = t;
      m.uMorph = morph;
      m.uPull = pull;
      m.uRadius = radius;
      m.uDpr = dpr;
      m.uMouse = mouse.current;
    });
    if (linesRef.current) linesRef.current.visible = visible && !isMobile && (morph > 0.05 || !reducedMotion);
  });

  // eslint-disable-next-line no-unused-vars
  const vp = viewport;

  return (
    <group>
      <points ref={pointsRef} geometry={geo.points} frustumCulled={false} renderOrder={1}>
        <bpPointsMaterial ref={pMat} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {!isMobile && (
        <lineSegments ref={linesRef} geometry={geo.lines} frustumCulled={false} renderOrder={0}>
          <bpLinesMaterial ref={lMat} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
      )}
    </group>
  );
}
