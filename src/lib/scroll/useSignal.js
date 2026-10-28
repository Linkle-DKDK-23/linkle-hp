import { useEffect } from 'react';
import { useWrapperInView } from './useWrapperInView';
import { sceneBus } from '../bus';

/**
 * G13'': 黒面の背景にシグナル・リッジ（SignalField）を出すセクションが呼ぶ。
 * 隣り合うセクションが同時に見えている間に消えないよう、可視セクション数で ON/OFF する。
 * @param {React.RefObject<HTMLElement>} ref セクション要素
 */
export function useSignal(ref) {
  const inView = useWrapperInView(ref, { margin: '-5% 0px -5% 0px' });
  useEffect(() => {
    if (!inView) return undefined;
    sceneBus.signalCount += 1;
    sceneBus.setVisible('signalVisible', true);
    return () => {
      sceneBus.signalCount = Math.max(0, sceneBus.signalCount - 1);
      if (sceneBus.signalCount === 0) sceneBus.setVisible('signalVisible', false);
    };
  }, [inView]);
}
