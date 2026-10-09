/* V8 — Preset Builds: start from a ready-made build, then fine-tune. */
GX.presets = function (sId) {
  const all = GX.builds(sId);
  const pick = (fn, cmp) => all.filter(fn).sort(cmp || ((a, b) => a.price - b.price))[0];
  const cands = [
    { key: 'value', icon: 'tag', label: 'Best value', why: 'Lowest price', b: all[0] },
    { key: 'lithium', icon: 'battery-charging', label: 'Maintenance-free', why: 'ELiTE Lithium — no battery watering', b: pick((x) => x.kind === 'lithium') },
    { key: 'custom', icon: 'palette', label: 'Most customizable', why: 'Widest color choice + upgrade options', b: pick((x) => x.t.id === 'freedom') },
    { key: 'gas', icon: 'gas-pump', label: 'No charging', why: 'Gas — refuel in minutes', b: pick((x) => x.p === 'gas') },
    { key: 'loaded', icon: 'crown', label: 'Fully loaded', why: 'Top trim, every feature', b: pick(() => true, (a, b) => b.price - a.price) },
  ];
  const seen = new Set(), out = [];
  cands.forEach((c) => {
    if (!c.b || out.length >= 4) return;
    const k = c.b.t.id + '.' + c.b.p;
    if (seen.has(k)) return;
    seen.add(k); out.push(c);
  });
  return out;
};

GX.register({
  n: 8, id: 'presets', name: 'Preset Builds',
  short: 'Start from one of four ready-made builds (Best value, Maintenance-free…), pick a color, fine-tune only if you want.',
  notes: {
    idea: 'Most shoppers don\'t want to configure — they want a sensible build. Offer four presets per series that answer common intents (lowest price, no maintenance, most customizable, no charging / fully loaded). Color stays a separate, visual choice; a "Fine-tune" drawer exposes every option.',
    bestFor: 'Undecided shoppers and anyone in a hurry; reduces the decision to one click + color.',
    pros: [
      'Turns four abstract attributes into outcomes people recognise ("no battery watering").',
      'Presets are derived from the catalog, so they stay correct when prices change.',
      'Full control is still one click away, and any manual change shows as "Custom build".',
    ],
    tradeoffs: ['Labels are judgments ("Best value"); marketing should own the wording.', 'Two layers (presets + fine-tune) is more UI to maintain.'],
    edge: ['Presets are derived per series, de-duplicated and capped at four (RXV: value · lithium · customizable · gas; Express 6: value · lithium · gas · fully loaded).', 'Picking a preset keeps the current color when the trim offers it.'],
    basis: ['Good-better-best / preset bundles in automotive "popular builds" and Apple\'s pre-configured models.', 'Hick\'s law: fewer, outcome-labelled choices speed decisions.'],
  },
  init: () => ({ open: false }),
  act: { tune(el, api) { api.ui.open = !api.ui.open; api.refresh(); } },
  render(st, api) {
    const K = GX.K, s = GX.series(st.series), t = GX.trim(st.series, st.trim), ui = api.ui;
    const series = K.radios({ name: 'v8-series', attr: 'series', legend: 'Model', legendHidden: true, cls: 'gx-seg v8-series',
      options: K.seriesOptions(st, { render: (x) => `<span class="gx-opt-main">${K.nb(x.name)}</span><span class="gx-opt-sub">${x.seats} seats</span>` }) });

    const presets = GX.presets(st.series);
    const match = presets.find((p) => p.b.t.id === st.trim && p.b.p === st.power);
    const cards = presets.map((p) => K.radioOne({ name: 'v8-preset', attr: 'build', value: p.key, checked: p === match, patch: { trim: p.b.t.id, power: p.b.p }, cls: 'v8-card',
      aria: `${p.label}: ${p.b.t.name} ${GX.POWER[p.b.kind].name}, ${GX.money(p.b.price)}`,
      html: `<span class="v8-ic">${K.I(p.icon)}</span><span class="v8-label">${p.label}</span><span class="v8-build">${K.esc(p.b.t.name)} · ${p.b.p === 'gas' ? 'Gas' : K.esc(GX.POWER[p.b.kind].short)}</span>` +
        `<span class="v8-why">${K.esc(p.why)}</span><span class="v8-price">${GX.money(p.b.price)}</span><span class="v8-tick" aria-hidden="true">${K.I('check')}</span>` })).join('');
    const grid = `<fieldset class="gx-fs v8-presets" data-k="fs-v8"><legend class="gx-legend">Start with a popular setup</legend><div class="v8-grid">${cards}</div></fieldset>`;

    const tuneBody = ui.open ? `<div class="v8-tune-body" id="v8-tune">` +
      K.radios({ name: 'v8-trim', attr: 'trim', legend: 'Trim', cls: 'v8-chips', options: K.trimOptions(st, { render: (x) => `<span class="gx-opt-main">${K.esc(x.name)}</span><span class="gx-opt-sub">from ${GX.money(GX.trimFrom(x))}</span>` }) }) +
      K.radios({ name: 'v8-power', attr: 'power', legend: 'Power', cls: 'gx-seg v8-power', options: K.powerOptions(st, { render: (p, pw, price) => `<span class="gx-opt-main">${K.I(pw.icon)} ${p === 'gas' ? 'Gas' : K.esc(pw.short)}</span><span class="gx-opt-sub">${price ? GX.money(price) : 'Not offered'}</span>` }) }) +
      '</div>' : '';
    const tune = `<div class="v8-tune${ui.open ? ' is-open' : ''}" data-k="tune"><button type="button" class="v8-tune-btn" data-gx-act="tune" aria-expanded="${!!ui.open}" aria-controls="v8-tune">` +
      `${K.I('sliders-horizontal')}<span class="v8-tune-l">${match ? 'Fine-tune' : 'Custom build'}</span><span class="v8-tune-v">${K.esc(t.name)} · ${K.esc(GX.info(st).pw.short)}</span>${K.I('caret-down', ui.open ? 'gx-flip' : '')}</button>${tuneBody}</div>`;

    return `<div class="v8" data-k="v8">${K.title(st)}${K.price(st)}` +
      `<div class="gx-panel v8-panel" data-k="panel">${K.notice()}${series}${grid}${K.colorGroup(st, { name: 'v8-color', cls: 'v8-colors' })}${tune}` +
      `${K.cta(st, { withPrice: true })}${K.checklist(st, { inline: true })}</div></div>`;
  },
});
