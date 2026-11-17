/* Armenidade · rolagem suave (Lenis) só com mouse/trackpad. No celular a rolagem é a nativa do aparelho
   (mais rápida e sem script extra); quem pede menos movimento também fica com a nativa. */
(() => {
  // endereço relativo a este arquivo: funciona também na prévia (subcaminho) e mantém o ?v= do build
  const here = document.currentScript && document.currentScript.src;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const s = document.createElement('script');
  s.src = here ? new URL('vendor/lenis.min.js' + new URL(here).search, here).href : '/assets/vendor/lenis.min.js';
  s.onload = () => {
    if (!window.Lenis) return;
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
  };
  document.head.appendChild(s);
})();
