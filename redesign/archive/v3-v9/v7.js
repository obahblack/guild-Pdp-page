/* V7 — Photo Swatches: colors are real cart photos; model/trim/power are compact chips. */
GX.register({
  n: 7, id: 'photos', name: 'Photo Swatches',
  short: 'Colors are real photos of that exact cart; seats, trim and power become compact chips above them.',
  notes: {
    idea: 'Color is the most emotional choice, so show it as the actual cart in each finish (the real product photos, not dots). The structural choices — seats, trim, power — shrink to compact chip rows above the photo grid.',
    bestFor: 'Mobile shoppers and color-led buyers; the strongest option where the main photo is off-screen.',
    pros: [
      'No guessing what "Ocean Grey" or "Almond" looks like — each tile is the real cart.',
      'Photos follow trim and series, so the grid is always the exact build being configured.',
      'Chip rows keep the structural choices compact and scannable.',
    ],
    tradeoffs: ['Loads up to 12 thumbnails (≈55 KB each, lazy-loaded).', 'Valor S and S+ share photos, so trim differences aren\'t visible in the tiles.'],
    edge: ['If a thumbnail fails to load, the tile falls back to a color disc with the name.', 'Express 6 Summit X Metallic Charcoal uses the Summit XT photo (the source photo is mis-mapped) and says so.'],
    basis: ['Baymard: swatches should show the actual variation; update imagery to match the selection.', 'Apparel/auto sites (Nike, Tesla paint pickers) show the product in each color.'],
  },
  render(st) {
    const K = GX.K, s = GX.series(st.series), t = GX.trim(st.series, st.trim), info = GX.info(st);
    const chipRow = (label, inner) => `<div class="v7-row" data-k="row-${label}"><span class="v7-row-l">${label}</span>${inner}</div>`;
    const series = K.radios({ name: 'v7-series', attr: 'series', legend: 'Seats', legendHidden: true, cls: 'v7-chips',
      options: K.seriesOptions(st, { render: (x) => `${K.I('users')}<span class="gx-opt-main">${K.nb(x.name)}</span>` }) });
    const trims = K.radios({ name: 'v7-trim', attr: 'trim', legend: 'Trim', legendHidden: true, cls: 'v7-chips',
      options: K.trimOptions(st, { render: (x) => `<span class="gx-opt-main">${K.esc(x.name)}</span>` }) });
    const power = K.radios({ name: 'v7-power', attr: 'power', legend: 'Power', legendHidden: true, cls: 'v7-chips',
      options: K.powerOptions(st, { render: (p, pw) => `${K.I(pw.icon)}<span class="gx-opt-main">${p === 'gas' ? 'Gas' : K.esc(pw.short)}</span>` }) });

    const tiles = GX.colorsOf(t).map((c) => {
      const cs = { series: st.series, trim: st.trim, power: st.power, color: c };
      const col = GX.COLORS[c];
      return K.radioOne({ name: 'v7-color', attr: 'color', value: c, checked: st.color === c, cls: 'v7-tile' + (K.isLight(c) ? ' is-light' : ''), aria: col.name,
        html: `<span class="v7-img" style="--sw:${col.hex}"><img src="${GX.thumbUrl(cs)}" alt="" loading="lazy" decoding="async" width="300" height="225" onerror="this.parentNode.classList.add('is-fallback');this.remove()"></span>` +
          `<span class="v7-name"><span class="v7-dot" style="--sw:${col.hex}"></span>${K.esc(col.name)}</span><span class="v7-tick" aria-hidden="true">${K.I('check')}</span>` });
    }).join('');
    const colors = `<fieldset class="gx-fs v7-colors" data-k="fs-v7c"><legend class="gx-legend v7-legend">Choose your color <span>${K.esc(info.color.name)} · ${t.colors.length} finishes</span></legend><div class="v7-grid">${tiles}</div></fieldset>`;

    return `<div class="v7" data-k="v7">${K.title(st)}${K.price(st)}` +
      `<div class="gx-panel v7-panel" data-k="panel">${K.notice()}<div class="v7-rows">${chipRow('Seats', series)}${chipRow('Trim', trims)}${chipRow('Power', power)}</div>` +
      `${colors}${K.cta(st, { withPrice: true })}${K.checklist(st, { inline: true })}</div></div>`;
  },
});
