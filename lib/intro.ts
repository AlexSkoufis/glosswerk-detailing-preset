/** Run `cb` once the studio-light intro has opened (or right away if there is none). Returns a cleanup. */
export function afterIntro(cb: () => void) {
  if (!document.documentElement.classList.contains('is-intro')) {
    cb();
    return () => {};
  }
  const h = () => cb();
  window.addEventListener('gw:intro-done', h, { once: true });
  return () => window.removeEventListener('gw:intro-done', h);
}
