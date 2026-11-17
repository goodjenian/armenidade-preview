/* Armenidade · páginas internas: filtros ligados à URL e formulários. Sem dependências. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const params = new URLSearchParams(location.search);
  const setParam = (k, v) => { const p = new URLSearchParams(location.search); v ? p.set(k, v) : p.delete(k); history.replaceState(null, '', `${location.pathname}${p.toString() ? '?' + p : ''}${location.hash}`); };
  const pressChip = (group, attr, val) => $$('.chip:not([data-more-filters])', group).forEach((c) => c.setAttribute('aria-pressed', String((c.dataset[attr] || '') === (val || ''))));

  // ------------------------------------------------------------ "mais filtros" (celular): já aberto se algum filtro extra estiver em uso
  $$('[data-more-filters]').forEach((b) => {
    const bar = b.closest('.filterbar');
    const set = (on) => { bar.classList.toggle('is-more', on); b.setAttribute('aria-expanded', String(on)); };
    set(['cidade', 'org', 'passados', 'idade', 'br'].some((k) => params.get(k)));
    b.addEventListener('click', () => set(!bar.classList.contains('is-more')));
  });

  // ------------------------------------------------------------ agenda
  const ff = $('[data-filters]');
  if (ff) {
    const st = { type: params.get('tipo') || '', city: params.get('cidade') || '', org: params.get('org') || '', past: params.get('passados') === '1' };
    ff.city.value = st.city; ff.org.value = st.org; ff.past.checked = st.past;
    const apply = () => {
      let n = 0;
      $$('#eventos-lista .ecard').forEach((c) => {
        const ok = (!st.type || c.dataset.type === st.type) && (!st.city || c.dataset.city === st.city) && (!st.org || c.dataset.org === st.org) && (st.past || c.dataset.past !== '1');
        c.hidden = !ok; if (ok) n++;
      });
      $$('[data-month]').forEach((m) => { m.hidden = !$$('.ecard', m).some((c) => !c.hidden); });
      $('[data-empty]').hidden = n > 0;
      pressChip(ff, 'type', st.type);
    };
    $$('.chip[data-type]', ff).forEach((c) => c.addEventListener('click', () => { st.type = c.dataset.type; setParam('tipo', st.type); apply(); }));
    ff.addEventListener('change', () => { st.city = ff.city.value; st.org = ff.org.value; st.past = ff.past.checked; setParam('cidade', st.city); setParam('org', st.org); setParam('passados', st.past ? '1' : ''); apply(); });
    apply();
  }

  // ------------------------------------------------------------ instituições
  const of = $('[data-org-filters]');
  if (of) {
    let cat = params.get('cat') || '';
    const q = $('input[name=q]', of);
    q.value = params.get('q') || '';
    const apply = () => {
      const term = norm(q.value.trim());
      let n = 0;
      $$('.ogrid > li').forEach((li) => { const ok = (!cat || li.dataset.cat === cat) && (!term || li.dataset.search.includes(term)); li.hidden = !ok; if (ok) n++; });
      $('[data-empty]').hidden = n > 0;
      pressChip(of, 'cat', cat);
    };
    $$('.chip', of).forEach((b) => b.addEventListener('click', () => { cat = b.dataset.cat; setParam('cat', cat); apply(); }));
    q.addEventListener('input', () => { setParam('q', q.value.trim()); apply(); });
    apply();
  }

  // ------------------------------------------------------------ oportunidades
  const pf = $('[data-opp-filters]');
  if (pf) {
    let type = params.get('tipo') || '';
    const AGES = { any: [0, 99], teen: [0, 18], young: [18, 35], adult: [36, 99] };
    const sel = $('select[name=age]', pf);
    const br = $('input[name=br]', pf);
    br.checked = params.get('br') === '1';
    if (params.get('idade') && AGES[params.get('idade')]) sel.value = params.get('idade');
    const apply = () => {
      const [lo, hi] = AGES[sel.value] || AGES.any;
      let n = 0;
      $$('.opp2').forEach((r) => {
        const ok = (!type || r.dataset.types.split(' ').includes(type)) && (+r.dataset.amin <= hi && +r.dataset.amax >= lo) && (!br.checked || r.dataset.br === '1');
        r.hidden = !ok; if (ok) n++;
      });
      $('[data-empty]').hidden = n > 0;
      pressChip(pf, 'type', type);
    };
    $$('.chip[data-type]', pf).forEach((b) => b.addEventListener('click', () => { type = b.dataset.type; setParam('tipo', type); apply(); }));
    sel.addEventListener('change', () => { setParam('idade', sel.value === 'any' ? '' : sel.value); apply(); });
    br.addEventListener('change', () => { setParam('br', br.checked ? '1' : ''); apply(); });
    apply();
  }

  // ------------------------------------------------------------ enviar
  const tabs = $$('[role=tab]');
  if (!tabs.length) return;
  const I = JSON.parse($('#form-i18n').textContent);
  const select = (id, focus) => {
    tabs.forEach((t) => { const on = t.getAttribute('aria-controls') === id; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    $$('[role=tabpanel]').forEach((p) => { p.hidden = p.id !== id; });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { select(t.getAttribute('aria-controls')); history.replaceState(null, '', location.pathname + location.search + '#' + t.getAttribute('aria-controls')); });
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      select(n.getAttribute('aria-controls'), true);
    });
  });
  const pick = () => { const hsh = location.hash.slice(1); if (['evento', 'atividade', 'atualizar'].includes(hsh)) select(hsh); };
  pick();
  addEventListener('hashchange', pick);
  const org = params.get('org');
  if (org) $$('select[name=org_id]').forEach((s) => { if ([...s.options].some((o) => o.value === org)) s.value = org; });

  // leitura do cartaz
  const file = $('[data-poster]');
  const st = $('[data-poster-status]');
  const prev = $('[data-poster-preview]');
  file?.addEventListener('change', async () => {
    const f = file.files[0];
    if (!f) return;
    prev.src = URL.createObjectURL(f); prev.hidden = false;
    st.className = 'status'; st.textContent = I.reading;
    try {
      const fd = new FormData(); fd.append('cartaz', f);
      const r = await fetch('/api/eventos/extrair', { method: 'POST', body: fd });
      const j = await r.json();
      if (!j.disponivel || !j.campos) { st.textContent = I.unavailable; return; }
      const form = $('#evento');
      const c = j.campos;
      const set = (n, v) => { const el = form.elements[n]; if (el && v && !el.value) el.value = v; };
      set('titulo', c.titulo); set('local', c.local); set('endereco', c.endereco); set('organizador_texto', c.organizador_texto); set('descricao_pt', c.descricao_pt); set('link_ingresso', c.link_ingresso);
      if (c.cidade) form.elements.cidade.value = c.cidade;
      if (c.tipo && [...form.elements.tipo.options].some((o) => o.value === c.tipo)) form.elements.tipo.value = c.tipo;
      if (c.data_inicio) { const [d, tm] = c.data_inicio.split('T'); set('data', d); if (tm && !/^00:00/.test(tm)) set('hora', tm.slice(0, 5)); }
      if (c.org_id && [...form.elements.org_id.options].some((o) => o.value === c.org_id)) form.elements.org_id.value = c.org_id;
      if (c.organizador_texto && !form.elements.org_id.value) {
        const want = norm(c.organizador_texto);
        const hit = [...form.elements.org_id.options].find((o) => o.value && (want.includes(norm(o.text)) || norm(o.text).includes(want)));
        if (hit) form.elements.org_id.value = hit.value;
      }
      st.className = 'status ok'; st.textContent = I.done;
    } catch { st.textContent = I.unavailable; }
  });

  // envio
  $$('form[data-endpoint]').forEach((form) => form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = $('.full > .status', form);
    const btn = $('button[type=submit]', form);
    const noDays = form.id === 'atividade' && !$$('input[name=dias]:checked', form).length;
    if (!form.checkValidity() || noDays) {
      form.reportValidity?.();
      if (noDays) $('input[name=dias]', form).focus();
      return;
    }
    const fd = new FormData(form);
    if (form.id === 'evento') {
      const d = fd.get('data'); const hr = fd.get('hora');
      fd.set('data_inicio', `${d}T${hr || '00:00'}:00-03:00`);
      if (!file?.files[0]) fd.delete('cartaz');
    }
    btn.disabled = true; btn.textContent = I.sending; status.className = 'status'; status.textContent = '';
    try {
      const r = await fetch(form.dataset.endpoint, { method: 'POST', body: fd });
      const j = await r.json().catch(() => ({}));
      $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
      if (!r.ok || j.ok === false) {
        const msgs = Object.entries(j.campos || {}).map(([k, m]) => {
          const el = form.elements[k];
          if (el && el.setAttribute) el.setAttribute('aria-invalid', 'true');
          if (k === 'org_id' && form.elements.organizacao_texto) form.elements.organizacao_texto.setAttribute('aria-invalid', 'true');
          return m;
        });
        $('[aria-invalid=true]', form)?.focus();
        throw new Error([j.erro || I.err, ...msgs].join(' '));
      }
      status.className = 'status ok'; status.textContent = I.sent;
      form.reset(); if (prev) prev.hidden = true;
    } catch (err) {
      status.className = 'status err'; status.textContent = err.message && err.message !== 'Failed to fetch' ? err.message : I.err;
    } finally { btn.disabled = false; btn.textContent = I.send; }
  }));
})();
