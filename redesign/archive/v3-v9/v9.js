/* V9 — Build Summary + Drawer: a calm summary card; each row opens a slide-over / bottom sheet. */
GX.register({
  n: 9, id: 'drawer', name: 'Summary + Drawer',
  short: 'A calm "Your build" card with four editable rows; each opens a slide-over (bottom sheet on phones) with that level\'s options.',
  sticky: true,
  notes: {
    idea: 'Keep the hero almost as clean as the original design: title, price, a four-row "Your build" summary and the CTA. Each row opens a focused panel with rich options for that level. Quick color swatches stay inline because color is the most-changed attribute.',
    bestFor: 'Brand-led pages that want a minimal hero; long option lists (Express 6) that would otherwise crowd the column.',
    pros: [
      'Shortest hero of all variations — the cart photo and headline stay dominant.',
      'The drawer has room for descriptions and prices without squeezing the 450px column.',
      'On desktop the panel slides over the left column only, so the cart photo stays visible while choosing.',
      'Adds a sticky price + Add-to-cart bar on phones once the hero CTA scrolls away.',
    ],
    tradeoffs: ['Options are one tap away rather than visible (progressive disclosure).', 'Modal panels need careful focus handling (implemented: focus trap, Esc, focus return).'],
    edge: ['Changes inside the drawer apply live; notices with Undo appear in the summary card.', 'Electric-only trims show a disabled Gas card with the reason inside the Power panel.'],
    basis: ['NN/g bottom-sheet guidance: visible close, Back/Esc support, short tasks.', 'Hoober: ~49% one-handed phone use — sticky bottom CTA for thumb reach.'],
  },
  init: () => ({ open: null, ret: null, focusNext: false }),
  act: {
    open(el, api) { api.ui.open = el.getAttribute('data-step'); api.ui.ret = api.ui.open; api.ui.focusNext = true; api.refresh(); },
    close(el, api) { GX.v9close(api); },
  },
  leave(api) { api.ui.open = null; document.documentElement.classList.remove('gx-lock'); },
  render(st, api) {
    const K = GX.K, s = GX.series(st.series), t = GX.trim(st.series, st.trim), info = GX.info(st), ui = api.ui;
    const row = (step, icon, label, val, extra) => `<div class="v9-row" data-k="r-${step}">` +
      `<button type="button" class="v9-row-btn" data-gx-act="open" data-step="${step}" aria-haspopup="dialog" aria-expanded="${ui.open === step}">` +
      `<span class="v9-ic">${K.I(icon)}</span><span class="v9-txt"><span class="v9-l">${label}</span><span class="v9-v">${val}</span></span>` +
      `<span class="v9-chg">Change${K.I('caret-right')}</span></button>${extra || ''}</div>`;
    const quick = K.radios({ name: 'v9-quick', attr: 'color', legend: 'Quick color', legendHidden: true, cls: 'v9-quick', listCls: 'gx-sw-list',
      optCls: 'gx-sw', options: K.colorOptions(st, { size: 'sm' }) });
    const card = `<div class="gx-panel v9-card" data-k="card"><p class="v9-card-h">Your build</p>${K.notice()}` +
      row('series', 'users-three', 'Model', `${K.nb(s.name)} <small>· ${s.seats} seats</small>`) +
      row('trim', 'seal-check', 'Trim', K.esc(t.name)) +
      row('power', info.pw.icon, 'Power', K.esc(info.pw.name)) +
      row('color', 'palette', 'Color', `<span class="v9-dot" style="--sw:${info.color.hex}"></span>${K.esc(info.color.name)}`, quick) +
      `${K.cta(st, { withPrice: true })}${K.checklist(st, { inline: true })}</div>`;
    const rootHtml = `<div class="v9" data-k="v9">${K.title(st)}${K.price(st)}${card}</div>`;

    let layer = '';
    if (ui.open) {
      const SHEETS = {
        series: { title: 'Choose a model', body: () => K.radios({ name: 'v9-series', attr: 'series', legend: 'Model', legendHidden: true, cls: 'v9-opts',
          options: K.seriesOptions(st, { render: (x) => `<span class="v9-o-main">${K.nb(x.name)}<small>${x.seats} seats</small></span><span class="v9-o-sub">${K.esc(x.tagline)}</span><span class="v9-o-price">from ${GX.money(GX.fromPrice(x.id))}</span>` }) }) },
        trim: { title: `Choose your ${K.nb(s.name)} trim`, body: () => K.families(s).map((f) => (s.trims.length > 3 ? `<p class="v9-fam">${f.name} <small>${K.FAMILY_BLURB[f.name] || ''}</small></p>` : '') +
            K.radios({ name: 'v9-trim-' + f.name.toLowerCase(), attr: 'trim', legend: f.name, legendHidden: true, cls: 'v9-opts',
              options: f.trims.map((x) => ({ value: x.id, checked: x.id === st.trim, aria: `${x.name}, from ${GX.money(GX.trimFrom(x))}`,
                html: `<span class="v9-o-main">${K.esc(x.name)}${x.power.gas ? '' : '<small>Electric only</small>'}</span><span class="v9-o-sub">${K.esc(x.highlights.join(' · '))}</span><span class="v9-o-price">from ${GX.money(GX.trimFrom(x))}</span>` })) })).join('') },
        power: { title: 'Choose power', body: () => K.radios({ name: 'v9-power', attr: 'power', legend: 'Power', legendHidden: true, cls: 'v9-opts',
          options: K.powerOptions(st, { render: (p, pw, price) => `<span class="v9-o-main">${K.I(pw.icon)} ${K.esc(pw.name)}</span><span class="v9-o-sub">${K.esc(pw.blurb)}</span><span class="v9-o-price">${price ? GX.money(price) : 'Not offered'}</span>` }) }) },
        color: { title: `${t.colors.length} colors for ${K.esc(t.name)}`, body: () => K.colorGroup(st, { name: 'v9-color', noHead: true, names: true, size: 'lg', listCls: 'v9-swgrid' }) },
      };
      const sh = SHEETS[ui.open];
      layer = `<div class="v9-layer" data-k="v9l"><div class="v9-scrim" data-gx-act="close"></div>` +
        `<div class="v9-sheet" role="dialog" aria-modal="true" aria-labelledby="v9-sheet-t" data-k="sheet-${ui.open}">` +
        `<header class="v9-sheet-h"><span class="v9-grab" aria-hidden="true"></span><h2 id="v9-sheet-t">${sh.title}</h2><button type="button" class="v9-x" data-gx-act="close" aria-label="Close">${K.I('x')}</button></header>` +
        `<div class="v9-sheet-b">${sh.body()}</div>` +
        `<footer class="v9-sheet-f"><span><small>${K.esc(GX.buildName(st))}</small><b>${GX.money(info.price)}</b></span><button type="button" class="gx-btn gx-btn--primary gx-btn--sm" data-gx-act="close">Done</button></footer></div></div>`;
    }
    return { root: rootHtml, layer };
  },
  after(root, api, layer) {
    const ui = api.ui;
    document.documentElement.classList.toggle('gx-lock', !!ui.open);
    if (!layer.__v9) {
      layer.__v9 = true;
      layer.addEventListener('keydown', (e) => {
        if (!GX.api.ui.open) return;
        if (e.key === 'Escape') { e.preventDefault(); GX.v9close(GX.api); return; }
        if (e.key !== 'Tab') return;
        const f = Array.from(layer.querySelectorAll('.v9-sheet button, .v9-sheet input:checked, .v9-sheet a')).filter((x) => !x.disabled);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }
    if (ui.open && ui.focusNext) {
      ui.focusNext = false;
      const target = layer.querySelector('.v9-sheet input:checked') || layer.querySelector('.v9-sheet button');
      if (target) setTimeout(() => target.focus(), 30);
    }
  },
});

GX.v9close = function (api) {
  const ret = api.ui.ret;
  api.ui.open = null;
  api.refresh();
  const b = ret && document.querySelector(`#gx-root .v9-row-btn[data-step="${ret}"]`);
  if (b) b.focus();
};
