import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { BpContourMaterial } from './materials/contourMaterial';
import { sceneBus } from '../../lib/bus';
import { sampleContourLabels } from './contourLabels';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

extend({ BpContourMaterial });

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** G9: 画面下半分の発光等高線 */
export default function ContourField() {
  const { reducedMotion, isMobile } = useMotionPrefs();
  const { size } = useThree();
  const mat = useRef(null);
  const mesh = useRef(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

  useEffect(() => {
    sceneBus.contourLabels = sampleContourLabels(size.width / size.height);
    sceneBus.notify();
  }, [size.width, size.height]);

  useFrame((state) => {
    const visible = sceneBus.teamVisible;
    if (mesh.current) mesh.current.visible = visible;
    if (!visible || !mat.current) return;
    const p = sceneBus.team.get();
    let reveal = smoothstep(0.05, 0.3, p);
    if (p > 0.9) reveal *= 1 - smoothstep(0.9, 1, p);
    mat.current.uReveal = reveal;
    mat.current.uTime = reducedMotion ? 3.7 : state.clock.elapsedTime;
    mat.current.uAspect = size.width / size.height;
    mat.current.uLines = isMobile ? 10 : 14;
  });

  return (
    <mesh ref={mesh} geometry={geo} frustumCulled={false} renderOrder={-1}>
      <bpContourMaterial ref={mat} transparent depthTest={false} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}
