import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTransition } from '../../lib/transition/TransitionProvider';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { sceneBus } from '../../lib/bus';
import ParticleField from './ParticleField';
import ContourField from './ContourField';
import RibbonField from './RibbonField';
import ParticleField2D from './ParticleField2D';
import ContourField2D from './ContourField2D';

/**
 * R3F <Canvas> 1 枚（z 0、fixed）。G2 / G9 / G13' を内包。可視シーンが 0 のとき frameloop='never'。
 * 消える側のフェードアウト（RibbonField）を描き切るため、停止は 800ms 遅らせる。
 * WebGL 非対応時は Canvas2D 版を同じ位置に描く。
 */
export default function SceneCanvas() {
  const { readiness } = useTransition();
  const { webgl, isMobile } = useMotionPrefs();
  const [loop, setLoop] = useState('always');

  useEffect(() => {
    let t = 0;
    const update = () => {
      const any = sceneBus.heroVisible || sceneBus.teamVisible || sceneBus.ribbonVisible;
      clearTimeout(t);
      if (any) setLoop('always');
      else t = setTimeout(() => setLoop('never'), 800);
    };
    update();
    const off = sceneBus.subscribe(update);
    return () => { clearTimeout(t); off(); };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      sceneBus.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneBus.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => { sceneBus.mouse.x = 0; sceneBus.mouse.y = 99; };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  useEffect(() => {
    if (!webgl) readiness.resolveWebGL();
  }, [webgl, readiness]);

  if (!webgl) {
    return (
      <div className="fixed inset-0" style={{ zIndex: 'var(--bp-z-canvas)', pointerEvents: 'none' }} aria-hidden="true">
        <ParticleField2D />
        <ContourField2D />
      </div>
    );
  }

  const dpr = isMobile ? [1, 1.25] : [1, 1.5];
  const lowTier = typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

  return (
    <div className="fixed inset-0" style={{ zIndex: 'var(--bp-z-canvas)', pointerEvents: 'none' }} aria-hidden="true">
      <Canvas
        dpr={lowTier ? 1 : dpr}
        frameloop={loop}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 50, near: 0.1, far: 20, position: [0, 0, 3] }}
        onCreated={({ gl, scene, camera }) => {
          gl.setClearColor('#000000', 1);
          const p = gl.compileAsync ? gl.compileAsync(scene, camera) : Promise.resolve();
          Promise.resolve(p).catch(() => null).then(() => readiness.resolveWebGL());
          setTimeout(() => readiness.resolveWebGL(), 3000);
        }}
      >
        <Suspense fallback={null}>
          <ParticleField />
          <ContourField />
          <RibbonField />
        </Suspense>
      </Canvas>
    </div>
  );
}
