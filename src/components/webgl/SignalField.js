import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { BpSignalMaterial } from './materials/signalMaterial';
import { sceneBus } from '../../lib/bus';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

extend({ BpSignalMaterial });

/**
 * G13'': 黒面（BRANDS / リスト / 巨大文字）の背景「シグナル・リッジ」。カーソル付近の線が波形のように隆起する。
 * 可視は sceneBus.signalVisible（useSignal）。出入りは 0.4 秒程度でフェード。
 * RM: カーソル追従なし・時間も止めて静止。
 * SP / タブレット（<1024px）: タップの互換 mousemove に引きずられるため、カーソルは無視して隆起だけをゆっくり左右に流す。
 */
export default function SignalField() {
  const { reducedMotion, isTablet } = useMotionPrefs();
  const { size, viewport } = useThree();
  const mat = useRef(null);
  const mesh = useRef(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  const m = useRef(new THREE.Vector2(0.5, 0.4));
  const lift = useRef(0);
  const alpha = useRef(0);

  useFrame((state, dt) => {
    const step = Math.min(1, (dt || 0.016) * 3);
    alpha.current += ((sceneBus.signalVisible ? 1 : 0) - alpha.current) * step;
    const on = alpha.current > 0.01;
    if (mesh.current) mesh.current.visible = on;
    if (!on || !mat.current) return;
    const hasMouse = !reducedMotion && !isTablet && sceneBus.mouse.y !== 99;
    const t = state.clock.elapsedTime;
    const drift = isTablet && !reducedMotion ? 0.5 + 0.25 * Math.sin(t * 0.3) : 0.62;
    const tx = hasMouse ? (sceneBus.mouse.x + 1) / 2 : drift;
    const ty = hasMouse ? (sceneBus.mouse.y + 1) / 2 : 0.35;
    const follow = Math.min(1, (dt || 0.016) * 4);
    m.current.x += (tx - m.current.x) * follow;
    m.current.y += (ty - m.current.y) * follow;
    // SP / タブレットは画面が狭く文字と重なりやすいので、隆起を控えめにする
    lift.current += ((hasMouse ? 1 : isTablet ? 0.45 : 0.6) - lift.current) * step;
    mat.current.uMouse = m.current;
    mat.current.uLift = lift.current;
    mat.current.uTime = reducedMotion ? 12.0 : t;
    mat.current.uAlpha = alpha.current;
    mat.current.uAspect = size.width / size.height;
    mat.current.uPx = 1 / (size.height * viewport.dpr);
  });

  return (
    <mesh ref={mesh} geometry={geo} frustumCulled={false} renderOrder={-2}>
      <bpSignalMaterial ref={mat} transparent depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}
