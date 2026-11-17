/* Armenidade · cabeçalho (menus suspensos, gaveta no celular) e busca instantânea. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const D = JSON.parse($('#ui-data').textContent);
  const hdr = $('[data-hdr]');
  const desktop = matchMedia('(min-width: 1181px)');

  // sombra do cabeçalho ao rolar
  const onScroll = () => hdr.classList.toggle('is-scrolled', scrollY > 4);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ------------------------------------------------------------ menus
  const items = $$('.mnav__item');
  let closeT;
  const setOpen = (li, on) => { li.classList.toggle('is-open', on); li.querySelector('.mnav__btn').setAttribute('aria-expanded', String(on)); };
  const closeAll = (except) => items.forEach((li) => li !== except && setOpen(li, false));
  items.forEach((li) => {
    const btn = li.querySelector('.mnav__btn');
    btn.addEventListener('click', () => { const on = !li.classList.contains('is-open'); closeAll(li); setOpen(li, on); });
    li.addEventListener('mouseenter', () => { if (!desktop.matches) return; clearTimeout(closeT); closeAll(li); setOpen(li, true); });
    li.addEventListener('mouseleave', () => { if (!desktop.matches) return; closeT = setTimeout(() => setOpen(li, false), 180); });
  });
  document.addEventListener('click', (e) => { if (desktop.matches && !e.target.closest('.mnav')) closeAll(); });
  $('.mnav')?.addEventListener('focusout', (e) => { if (desktop.matches && !e.currentTarget.contains(e.relatedTarget)) closeAll(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = items.find((li) => li.classList.contains('is-open'));
    if (open) { setOpen(open, false); open.querySelector('.mnav__btn').focus(); }
  });

  // ------------------------------------------------------------ gaveta (celular)
  const burger = $('[data-drawer]');
  const drawer = (on) => {
    document.body.classList.toggle('nav-open', on);
    burger?.setAttribute('aria-expanded', String(on));
    burger?.setAttribute('aria-label', on ? D.close : D.open);
    if (window.__lenis) on ? window.__lenis.stop() : window.__lenis.start();
  };
  burger?.addEventListener('click', () => drawer(!document.body.classList.contains('nav-open')));
  $('.mnav')?.addEventListener('click', (e) => { if (e.target.closest('a') && document.body.classList.contains('nav-open')) drawer(false); });
  desktop.addEventListener('change', () => { drawer(false); closeAll(); });

  // ------------------------------------------------------------ busca
  const S = $('[data-search]');
  const input = $('[data-search-input]');
  const res = $('[data-search-results]');
  if (!S || !input) return;
  let index = null; let active = -1; let lastFocus = null;
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const DOT = { evento: 'red', atividade: 'blue', instituicao: 'orange', oportunidade: 'blue' };
  async function load() {
    if (index) return index;
    try { index = await (await fetch(D.index)).json(); } catch { index = []; }
    return index;
  }
  function render(q) {
    const words = norm(q).trim().split(/\s+/).filter(Boolean);
    active = -1;
    if (!words.length) { res.innerHTML = `<p class="search__hint">${esc(input.placeholder)}</p>`; return; }
    const hits = index.filter((it) => words.every((w) => it.q.includes(w) || norm(it.t).includes(w)));
    if (!hits.length) { res.innerHTML = `<p class="search__none">${esc(D.empty)}</p>`; return; }
    res.innerHTML = ['evento', 'atividade', 'instituicao', 'oportunidade'].map((k) => {
      const g = hits.filter((x) => x.k === k).slice(0, 6);
      return g.length ? `<div class="search__group"><p><i class="dot dot--${DOT[k]}"></i>${esc(D.kinds[k])}</p>${g.map((x) => `<a class="search__item" href="${esc(x.u)}"><strong>${esc(x.t)}</strong><small>${esc(x.s)}</small></a>`).join('')}</div>` : '';
    }).join('');
  }
  async function openSearch(q = '') {
    lastFocus = document.activeElement;
    S.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    window.__lenis?.stop();
    input.value = q;
    input.focus();
    await load();
    render(input.value);
  }
  function closeSearch() {
    S.hidden = true;
    document.documentElement.style.overflow = '';
    window.__lenis?.start();
    lastFocus?.focus?.();
  }
  $$('[data-search-open]').forEach((b) => b.addEventListener('click', () => openSearch()));
  $$('[data-search-close]').forEach((b) => b.addEventListener('click', closeSearch));
  input.addEventListener('input', () => index && render(input.value));
  input.addEventListener('keydown', (e) => {
    const links = $$('.search__item', res);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!links.length) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach((l, i) => l.classList.toggle('is-active', i === active));
      links[active].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      const l = links[active >= 0 ? active : 0];
      if (l) { e.preventDefault(); location.href = l.href; }
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !S.hidden) closeSearch();
    if (e.key === '/' && S.hidden && !/^(input|textarea|select)$/i.test(document.activeElement?.tagName || '')) { e.preventDefault(); openSearch(); }
    if (e.key === 'Tab' && !S.hidden) {
      const f = $$('input, button, a[href]', S).filter((x) => x.offsetParent);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // campo de busca do hero: abre o painel com o que foi digitado
  $$('[data-search-inline]').forEach((f) => {
    f.addEventListener('submit', (e) => { e.preventDefault(); openSearch(f.q.value); });
    f.q.addEventListener('input', () => { if (f.q.value.trim().length >= 2) { const v = f.q.value; f.q.value = ''; openSearch(v); } });
  });
})();
