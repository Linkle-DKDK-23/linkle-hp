import { useEffect } from 'react';
import { useWrapperInView } from './useWrapperInView';
import { sceneBus } from '../bus';

/**
 * G13': 黒面の背景に虹色の帯（RibbonField）を出すセクションが呼ぶ。
 * 隣り合うセクションが同時に見えている間に消えないよう、可視セクション数で ON/OFF する。
 * @param {React.RefObject<HTMLElement>} ref セクション要素
 */
export function useRibbon(ref) {
  const inView = useWrapperInView(ref, { margin: '-5% 0px -5% 0px' });
  useEffect(() => {
    if (!inView) return undefined;
    sceneBus.ribbonCount += 1;
    sceneBus.setVisible('ribbonVisible', true);
    return () => {
      sceneBus.ribbonCount = Math.max(0, sceneBus.ribbonCount - 1);
      if (sceneBus.ribbonCount === 0) sceneBus.setVisible('ribbonVisible', false);
    };
  }, [inView]);
}
