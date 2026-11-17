/* Armenidade · rolagem suave (Lenis). Desligada para quem pede menos movimento; toque continua nativo. */
(() => {
  if (!window.Lenis || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
  window.__lenis = lenis;
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  // âncoras da mesma página deslizam em vez de pular
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el || el.getAttribute('role') === 'tabpanel') return;
    e.preventDefault();
    lenis.scrollTo(el, { duration: 1.3 });
    history.pushState(null, '', url.hash);
  });
})();
