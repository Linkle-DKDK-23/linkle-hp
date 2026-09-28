let cached = null;

/** webgl2 か webgl のコンテキストが取れるか */
export function isWebGLAvailable() {
  if (cached !== null) return cached;
  try {
    if (typeof document === 'undefined') return (cached = false);
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    cached = !!gl;
  } catch (e) {
    cached = false;
  }
  return cached;
}
