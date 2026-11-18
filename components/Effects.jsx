'use client';
import { useEffect } from 'react';
import { initSite } from '@/lib/effects/site';

/** 演出の起動。ページ遷移は通常のページ読み込みなので、読み込みごとに一度だけ動かす。 */
export default function Effects() {
  useEffect(() => {
    if (window.__lkInit) return;
    window.__lkInit = true;
    const LK = initSite();
    const light = navigator.connection && navigator.connection.saveData;
    if (LK && !LK.reduced && !light) import('@/lib/effects/fx3d').then(m => m.initFx(LK)).catch(() => {});
  }, []);
  return null;
}
