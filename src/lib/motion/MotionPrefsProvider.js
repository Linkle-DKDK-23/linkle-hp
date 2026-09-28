import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isWebGLAvailable } from '../webgl/detect';

const MotionPrefsContext = createContext({
  reducedMotion: false,
  webgl: true,
  isMobile: false,
  isTablet: false,
});

export const useMotionPrefs = () => useContext(MotionPrefsContext);

const query = (q) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q) : null);

export function MotionPrefsProvider({ children }) {
  const [reducedMotion, setRM] = useState(() => !!query('(prefers-reduced-motion: reduce)')?.matches);
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1512));
  const webgl = useMemo(() => isWebGLAvailable(), []);

  useEffect(() => {
    const mq = query('(prefers-reduced-motion: reduce)');
    const onMq = (e) => setRM(e.matches);
    mq?.addEventListener?.('change', onMq);
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => {
      mq?.removeEventListener?.('change', onMq);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const value = useMemo(
    () => ({ reducedMotion, webgl, isMobile: width < 768, isTablet: width < 1024 }),
    [reducedMotion, webgl, width]
  );
  return <MotionPrefsContext.Provider value={value}>{children}</MotionPrefsContext.Provider>;
}
