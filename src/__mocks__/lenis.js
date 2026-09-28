/* Jest 用の lenis モック（ESM only のため）。API の形だけ合わせる */
export default class Lenis {
  constructor(opts = {}) {
    this.options = opts;
    this.scroll = 0;
    this.limit = 0;
    this.velocity = 0;
    this.direction = 0;
    this.progress = 0;
    this.handlers = {};
  }
  on(evt, cb) {
    (this.handlers[evt] = this.handlers[evt] || []).push(cb);
    return () => this.off(evt, cb);
  }
  off(evt, cb) {
    this.handlers[evt] = (this.handlers[evt] || []).filter((f) => f !== cb);
  }
  raf() {}
  stop() { this.isStopped = true; }
  start() { this.isStopped = false; }
  scrollTo() {}
  resize() {}
  destroy() {}
}
