import { useScroll } from 'framer-motion';
import { useScrollContainer } from './ScrollContainerContext';

/**
 * セクション進捗 0→1 の MotionValue を返す薄いラッパ。
 * 必ず wrapper を container として渡す（root が window だと進捗が動かない）。
 * @param {React.RefObject<HTMLElement>} ref
 * @param {[string, string]} offset
 */
export function useSectionProgress(ref, offset = ['start start', 'end end']) {
  const { wrapperRef } = useScrollContainer();
  const { scrollYProgress } = useScroll({ container: wrapperRef, target: ref, offset });
  return scrollYProgress;
}
