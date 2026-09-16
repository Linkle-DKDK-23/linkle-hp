import React from 'react';
import SheetNumber from '../ui/SheetNumber';
import Ruler from '../ui/Ruler';
import DotRow from '../ui/DotRow';
import DecodeLabel from '../ui/DecodeLabel';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

/**
 * G7: 計測器ラベル 4 種の配置（y = 155/827vh のライン、下部ルーラー、左下の座標デコード）。
 * @param {{ sheet: number, coords: { x: string, y: string }, active: boolean }} props
 */
export default function MeterLabels({ sheet, coords, active }) {
  const { isMobile } = useMotionPrefs();
  const lineY = 'calc(155 / 827 * 100vh)';
  return (
    <>
      <SheetNumber n={sheet} style={{ position: 'absolute', left: 'var(--bp-margin)', top: lineY }} />
      {!isMobile && <Ruler style={{ position: 'absolute', left: 'calc(50% - 250px)', top: lineY }} />}
      <DotRow style={{ position: 'absolute', left: isMobile ? 'auto' : 'calc(50% + 190px)', right: isMobile ? 'var(--bp-margin)' : 'auto', top: lineY }} />
      {!isMobile && <Ruler style={{ position: 'absolute', left: 'calc(50% - 250px)', bottom: 60 }} />}
      <div className="absolute" style={{ left: 'var(--bp-margin)', bottom: 60, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <DecodeLabel value={coords.x} active={active} />
        <DecodeLabel value={coords.y} active={active} />
      </div>
    </>
  );
}
