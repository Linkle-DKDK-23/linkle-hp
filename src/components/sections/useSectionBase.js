import { useRef } from 'react';
import { useSurface } from '../../lib/theme/surfaceRegistry';
import { useSectionProgress } from '../../lib/scroll/useSectionProgress';

/** 全セクション共通: ref + surface 登録 + 進捗 MotionValue */
export function useSectionBase(surface) {
  const ref = useRef(null);
  useSurface(surface, ref);
  const p = useSectionProgress(ref);
  return { ref, p };
}

/** Spacer を飛ばして次のセクション要素を返す（青円ボタン / CONTINUE の scrollTo 先） */
export function nextSectionOf(el) {
  let n = el ? el.nextElementSibling : null;
  while (n && n.dataset && n.dataset.spacer) n = n.nextElementSibling;
  return n;
}
