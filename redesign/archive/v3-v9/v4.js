/* V4 — Price Matrix: trims × (Electric, Gas) grid; one click picks trim + power. */
GX.register({
  n: 4, id: 'matrix', name: 'Price Matrix',
  short: 'A trims × Electric/Gas price grid: one click picks trim and power together; impossible combos show "—".',
  notes: {
    idea: 'Show every trim and powertrain combination with its price in one glance. Each cell is a choice; a cell that can\'t be built shows "—" with the reason. Color follows below.',
    bestFor: 'Price-comparison shoppers and dealers on the phone with a customer ("the S+ gas is $10,067").',
    pros: [
      'All six RXV prices (fourteen for Express 6) are visible at once — no clicking around to discover cost.',
      'Impossible combinations are visible as gaps, not surprises.',
      'One decision instead of two: trim and power are picked together.',
    ],
    tradeoffs: ['Densest layout; reads like a spec table rather than a showroom.', 'Trim differences are reduced to a one-line caption.'],
    edge: ['Express 6 renders 8 rows with family dividers; Valor rows show "—" under Gas.', 'The battery type is printed in each Electric cell (48V vs Lithium).'],
    basis: ['Baymard: users notice and compare price changes across variations.', 'Configurator studies: show unavailable combinations explicitly instead of hiding them.'],
  },
  render(st) {
    const K = GX.K, s = GX.series(st.series), t = GX.trim(st.series, st.trim);
    const seriesRow = K.radios({ name: 'v4-series', attr: 'series', legend: 'Model', legendHidden: true, cls: 'gx-seg v4-series',
      options: K.seriesOptions(st, { render: (x) => `<span class="gx-opt-main">${K.nb(x.name)}</span><span class="gx-opt-sub">${x.seats} seats</span>` }) });

    const fams = K.families(s), grouped = fams.length > 2;
    const cell = (x, p) => {
      if (!x.power[p]) return `<span class="v4-cell v4-cell--na" title="${K.esc(x.name)} isn't offered with ${p === 'gas' ? 'gas' : 'electric'} power">—<span class="gx-sr">${K.esc(x.name)} ${p}: not offered</span></span>`;
      const kind = GX.kindOf(x, p);
      return K.radioOne({ name: 'v4-build', attr: 'build', value: x.id + '.' + p, checked: x.id === st.trim && p === st.power,
        patch: { trim: x.id, power: p }, cls: 'v4-cell',
        aria: `${x.name} ${GX.POWER[kind].name}, ${GX.money(GX.priceOf(x, p))}`,
        html: `<span class="v4-price">${GX.money(GX.priceOf(x, p))}</span><span class="v4-kind">${p === 'gas' ? 'Gas' : kind === 'lithium' ? 'Lithium' : '48V'}</span>` });
    };
    const row = (x) => `<div class="v4-row${x.id === st.trim ? ' is-row' : ''}" data-k="r-${x.id}"><span class="v4-trim"><b>${K.esc(x.name)}</b><small>${K.esc(x.highlights[0])}</small></span>${cell(x, 'electric')}${cell(x, 'gas')}</div>`;
    const body = grouped
      ? fams.map((f) => `<div class="v4-fam" data-k="f-${f.name}">${f.name}<small>${K.FAMILY_BLURB[f.name] || ''}</small></div>` + f.trims.map(row).join('')).join('')
      : s.trims.map(row).join('');
    const matrix = `<fieldset class="gx-fs v4-matrix" data-k="fs-v4"><legend class="gx-legend gx-sr">Trim and power</legend>` +
      `<div class="v4-head" aria-hidden="true"><span>Trim</span><span>${K.I('lightning')}Electric</span><span>${K.I('gas-pump')}Gas</span></div>` +
      `<div class="v4-body${grouped ? ' v4-body--scroll' : ''}">${body}</div></fieldset>`;

    const sel = `<p class="v4-sel" data-k="sel">${K.I('check-circle-fill')}<span><b>${K.esc(t.name)}</b> · ${K.esc(GX.info(st).pw.name)} — ${K.esc(t.highlights.join(' · '))}</span></p>`;

    return `<div class="v4" data-k="v4">${K.title(st)}${K.price(st)}` +
      `<div class="gx-panel v4-panel" data-k="panel">${K.notice()}${seriesRow}${matrix}${sel}` +
      K.colorGroup(st, { name: 'v4-color', cls: 'v4-colors' }) + K.cta(st) + K.checklist(st, { inline: true }) + '</div></div>';
  },
});
