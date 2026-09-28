import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { BpRibbonMaterial } from './materials/ribbonMaterial';
import { sceneBus } from '../../lib/bus';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

extend({ BpRibbonMaterial });

/**
 * G13': 黒面（BRANDS / リスト / 巨大文字）の背景に出る、カーソル追従の虹色の帯。
 * 可視は sceneBus.ribbonVisible（useRibbon）。出入りは 0.4 秒程度でフェード。
 * RM: カーソル追従なし・画面中央で静止。
 * SP / タブレット（<1024px）: タップで発火する互換 mousemove に引きずられて上端に寄ってしまうため、
 * カーソルは無視して縦は画面中央に固定し、明るい膨らみだけをゆっくり左右に流す。
 */
export default function RibbonField() {
  const { reducedMotion, isTablet } = useMotionPrefs();
  const { size } = useThree();
  const mat = useRef(null);
  const mesh = useRef(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  const m = useRef(new THREE.Vector2(0.5, 0.5));
  const alpha = useRef(0);

  useFrame((state, dt) => {
    const step = Math.min(1, (dt || 0.016) * 3);
    alpha.current += ((sceneBus.ribbonVisible ? 1 : 0) - alpha.current) * step;
    const on = alpha.current > 0.01;
    if (mesh.current) mesh.current.visible = on;
    if (!on || !mat.current) return;
    const hasMouse = !reducedMotion && !isTablet && sceneBus.mouse.y !== 99;
    const drift = isTablet && !reducedMotion ? 0.5 + 0.22 * Math.sin(state.clock.elapsedTime * 0.35) : 0.5;
    const tx = hasMouse ? (sceneBus.mouse.x + 1) / 2 : drift;
    const ty = hasMouse ? (sceneBus.mouse.y + 1) / 2 : 0.5;
    const follow = Math.min(1, (dt || 0.016) * 2.5);
    m.current.x += (tx - m.current.x) * follow;
    m.current.y += (ty - m.current.y) * follow;
    mat.current.uMouse = m.current;
    mat.current.uTime = reducedMotion ? 5.0 : state.clock.elapsedTime;
    mat.current.uAlpha = alpha.current;
    mat.current.uAspect = size.width / size.height;
  });

  return (
    <mesh ref={mesh} geometry={geo} frustumCulled={false} renderOrder={-2}>
      <bpRibbonMaterial ref={mat} transparent depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}
