import React from 'react';
import Crosshairs from './Crosshairs';
import ScrollIndicator from './ScrollIndicator';
import BlueCircleButton from '../ui/BlueCircleButton';
import ContinuePill from '../ui/ContinuePill';

/** z 10 の固定 UI 層。既定 pointer-events: none、ボタンのみ auto */
export default function FixedUI() {
  return (
    <div className="fixed inset-0" style={{ zIndex: 'var(--bp-z-ui)', pointerEvents: 'none' }}>
      <Crosshairs />
      <ScrollIndicator />
      <BlueCircleButton />
      <ContinuePill />
    </div>
  );
}
