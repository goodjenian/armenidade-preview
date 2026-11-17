/* Armenidade · faixas onduladas tricolores na margem esquerda, ao longo de todas as seções.
   Traço base apagado + traço forte que se desenha com a rolagem. Só aparece com margem livre. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const COLORS = ['#D90012', '#0033A0', '#F2A800'];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const maxw = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sc-maxw')) * 16 || 1248;
  const box = document.createElement('div');
  box.className = 'waves';
  box.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(NS, 'svg');
  box.appendChild(svg);
  document.body.appendChild(box);
  let lines = [];
  let lastKey = '';

  function build() {
    const H = Math.max(document.documentElement.scrollHeight, innerHeight);
    const margin = (innerWidth - Math.min(innerWidth, maxw())) / 2;
    const key = `${innerWidth}x${H}`;
    if (key === lastKey) return;
    lastKey = key;
    if (margin < 72) { box.hidden = true; return; }
    box.hidden = false;
    const W = Math.round(margin);
    const cx = W * 0.46;
    const A = Math.min(W * 0.22, 46);       // amplitude
    const L = 640;                          // comprimento de onda (px)
    const gap = Math.min(7, Math.max(4.5, W * 0.05));
    box.style.width = W + 'px';
    box.style.height = H + 'px';
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.innerHTML = '';
    lines = COLORS.map((color, k) => {
      const off = (k - 1) * gap;
      const phase = k * 0.18;               // leve torção da faixa
      let d = '';
      for (let y = -20; y <= H + 20; y += 10) {
        const x = cx + off + A * Math.sin((2 * Math.PI * y) / L + phase) + (A * 0.35) * Math.sin((2 * Math.PI * y) / (L * 2.7));
        d += (d ? 'L' : 'M') + x.toFixed(1) + ' ' + y;
      }
      const base = document.createElementNS(NS, 'path');
      base.setAttribute('d', d);
      base.setAttribute('class', 'waves__base');
      base.setAttribute('stroke', color);
      const draw = document.createElementNS(NS, 'path');
      draw.setAttribute('d', d);
      draw.setAttribute('class', 'waves__draw');
      draw.setAttribute('stroke', color);
      svg.append(base, draw);
      const len = draw.getTotalLength();
      draw.style.strokeDasharray = `${len} ${len}`;
      return { draw, len };
    });
    paint();
  }

  function paint() {
    if (!lines.length) return;
    const H = document.documentElement.scrollHeight;
    const p = reduce ? 1 : Math.min(1, (scrollY + innerHeight * 0.85) / H);
    for (const l of lines) l.draw.style.strokeDashoffset = (l.len * (1 - p)).toFixed(1);
  }

  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; paint(); }); } }, { passive: true });
  addEventListener('resize', () => { lastKey = ''; build(); });
  if ('ResizeObserver' in window) new ResizeObserver(() => build()).observe(document.body);
  addEventListener('load', build);
  build();
})();
