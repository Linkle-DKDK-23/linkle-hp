import { useInView } from 'framer-motion';
import { useScrollContainer } from './ScrollContainerContext';

/**
 * framer-motion の useInView に必ず wrapper を root として渡す。
 * @param {React.RefObject<Element>} ref
 * @param {{ amount?: number | 'some' | 'all', once?: boolean, margin?: string }} opts
 */
export function useWrapperInView(ref, opts = {}) {
  const { wrapperRef } = useScrollContainer();
  return useInView(ref, { root: wrapperRef, ...opts });
}
