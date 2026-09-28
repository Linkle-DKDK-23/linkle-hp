import { createContext, useContext } from 'react';

/**
 * 仮想スクロールの wrapper（#scroll-wrapper）を配布する Context。
 * value: { wrapperRef, contentRef, getLenis }
 */
export const ScrollContainerContext = createContext({
  wrapperRef: { current: null },
  contentRef: { current: null },
  getLenis: () => null,
});

export const useScrollContainer = () => useContext(ScrollContainerContext);
