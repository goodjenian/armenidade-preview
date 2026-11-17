/* Armenidade · home: semana em 7 colunas que acendem ao entrar na tela + sinal da eternidade girando com a rolagem. */
(() => {
  const TZ = 'America/Sao_Paulo';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.ScrollCraft) ScrollCraft.mount(document.body);

  // ------------------------------------------------------------ semana
  const box = document.querySelector('[data-week]');
  const dataEl = document.getElementById('week-data');
  if (box && dataEl) {
    const D = JSON.parse(dataEl.textContent);
    const L = D.labels;
    const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const ymd = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    const hm = (d) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
    const [y, m, dd] = ymd(new Date()).split('-').map(Number);
    const days = Array.from({ length: 7 }, (_, i) => {
      const noon = new Date(Date.UTC(y, m - 1, dd + i, 15)); // 12h em São Paulo
      const key = ymd(noon);
      const wd = noon.getUTCDay();
      const items = [];
      for (const a of D.acts) if (a.d.includes(wd)) items.push({ time: a.h, title: a.t, org: a.org, u: a.u });
      for (const e of D.events) if (ymd(new Date(e.d)) === key) items.push({ time: e.timed ? hm(new Date(e.d)) : null, title: e.t, org: e.org, u: e.u, ev: true });
      items.sort((p, q) => (q.ev ? 1 : 0) - (p.ev ? 1 : 0) || (p.time || '99').localeCompare(q.time || '99'));
      return { i, wd, day: +key.slice(8), items };
    });
    box.innerHTML = days.map((d) => `<section class="wcol${d.i === 0 ? ' is-today' : ''}"><div class="wcol__head"><b>${esc(d.i === 0 ? L.today : L.days[d.wd].slice(0, 3))}</b><span>${d.day}</span></div>${
      d.items.length ? `<ul>${d.items.map((it) => {
        const inner = `<time>${esc(it.time || '··:··')}</time><strong>${esc(it.title)}</strong>${it.org ? `<small>${esc(it.org)}</small>` : ''}`;
        return `<li class="${it.ev ? 'is-ev' : ''}">${it.u ? `<a href="${esc(it.u)}">${inner}</a>` : inner}</li>`;
      }).join('')}</ul>` : ''}${d.items.length < 2 ? `<p class="wcol__empty">${d.items.length ? '' : `${esc(L.empty)}<br>`}<a href="${esc(D.links.invite)}">+ ${esc(L.invite_link)}</a></p>` : ''}</section>`).join('');

    const cols = [...box.children];
    if (reduce || !('IntersectionObserver' in window)) cols.forEach((c) => c.classList.add('is-lit'));
    else {
      const io = new IntersectionObserver((ents) => {
        if (!ents.some((e) => e.isIntersecting)) return;
        cols.forEach((c, k) => setTimeout(() => c.classList.add('is-lit'), 80 + k * 90));
        io.disconnect();
      }, { threshold: 0.25 });
      io.observe(box);
    }
  }

  // ------------------------------------------------------------ sinal da eternidade gira com a rolagem
  const spins = [...document.querySelectorAll('[data-spin] .eternity__spin')];
  if (!reduce && spins.length) {
    let ticking = false;
    const tick = () => { ticking = false; const a = (scrollY * 0.15) % 360; spins.forEach((s) => s.style.setProperty('--spin', a.toFixed(1) + 'deg')); };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
    tick();
  }
})();
