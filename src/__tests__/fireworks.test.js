import React from 'react';
import { render, act } from '@testing-library/react';
import { motionValue } from 'framer-motion';
import Fireworks from '../components/gimmicks/Fireworks';
import { MotionPrefsProvider } from '../lib/motion/MotionPrefsProvider';

/** Canvas2D の呼び出しを記録するスタブ */
function makeCtx() {
  const calls = { fillText: 0, arc: 0, stroke: 0, fill: 0, clear: 0 };
  return {
    calls,
    setTransform() {}, clearRect() { calls.clear += 1; }, beginPath() {}, moveTo() {}, lineTo() {},
    arc() { calls.arc += 1; }, stroke() { calls.stroke += 1; }, fill() { calls.fill += 1; },
    fillText() { calls.fillText += 1; },
    globalAlpha: 1, fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: '', textBaseline: '',
  };
}

describe('G15 花火（Fireworks）', () => {
  let ctx;
  let frames;
  const origGetContext = HTMLCanvasElement.prototype.getContext;
  const origRaf = window.requestAnimationFrame;
  const origCaf = window.cancelAnimationFrame;

  beforeEach(() => {
    ctx = makeCtx();
    frames = [];
    HTMLCanvasElement.prototype.getContext = () => ctx;
    Object.defineProperty(HTMLCanvasElement.prototype, 'clientWidth', { configurable: true, get: () => 1200 });
    Object.defineProperty(HTMLCanvasElement.prototype, 'clientHeight', { configurable: true, get: () => 800 });
    window.requestAnimationFrame = (cb) => { frames.push(cb); return frames.length; };
    window.cancelAnimationFrame = () => {};
  });
  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = origGetContext;
    window.requestAnimationFrame = origRaf;
    window.cancelAnimationFrame = origCaf;
  });

  /** rAF に積まれたフレームを dt 秒刻みで n 回進める */
  const step = (n, dt = 1 / 60) => {
    let now = performance.now();
    for (let i = 0; i < n; i += 1) {
      const cb = frames.shift();
      if (!cb) break;
      now += dt * 1000;
      act(() => cb(now));
    }
  };

  it('rate=1 で打ち上がり、頂点で弾けて火花（グリフ）が描かれる', () => {
    render(<MotionPrefsProvider><Fireworks rate={motionValue(1)} active /></MotionPrefsProvider>);
    // jsdom では IntersectionObserver が発火しないので、rate の積算（約 1.4 秒）で 1 発目が上がる
    step(60);
    const beforeBurst = ctx.calls.fillText;
    step(180);
    // 上昇中はロケットの `+` だけ、弾けると火花が一気に増える
    expect(ctx.calls.fillText).toBeGreaterThan(beforeBurst + 100);
    expect(ctx.calls.arc).toBeGreaterThan(0); // 閃光 / ○ / ・
  });

  it('active=false でも burst() で 3 発上がる', async () => {
    // jest の fake timers は rAF も差し替えてしまうので、burst の setTimeout（〜480ms）は実時間で待つ
    const ref = React.createRef();
    render(<MotionPrefsProvider><Fireworks ref={ref} rate={motionValue(0)} active={false} /></MotionPrefsProvider>);
    step(5);
    expect(ctx.calls.fillText).toBe(0);
    act(() => { ref.current.burst(); });
    await new Promise((r) => setTimeout(r, 600));
    step(150);
    expect(ctx.calls.fillText).toBeGreaterThan(200);
  });
});
