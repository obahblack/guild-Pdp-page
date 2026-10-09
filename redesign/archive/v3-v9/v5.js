/* V5 — Upgrade Ladder: every valid build in price order, each stating what it adds over the base. */
GX.register({
  n: 5, id: 'ladder', name: 'Upgrade Ladder',
  short: 'Every build listed cheapest to priciest; each rung says what you get over the base build for the extra money.',
  notes: {
    idea: 'Turn the configurator into a price ladder. The cheapest build is the base; every rung above it states what it adds and how much more it costs ("+$580 · Metallic badging · Hole-N-One tires"). Color is picked after.',
    bestFor: 'Budget-led buyers ("what does each extra $500 get me?") and upsell clarity for the dealer.',
    pros: [
      'Makes the value of each step explicit — the core question behind any upgrade.',
      'Only valid builds exist in the list, so nothing is ever disabled.',
      'Short for RXV (6 rungs); Express 6\'s 14 rungs get Electric/Gas filters and "Show all".',
    ],
    tradeoffs: ['Leads with price, which can feel less premium than leading with the product.', 'Trims interleave by price, so the same trim appears twice (electric and gas).'],
    edge: ['If the selected build is beyond the first 6 rungs the list expands so the choice is never hidden.', 'Filters never hide the current selection.'],
    basis: ['Price-anchoring / good-better-best ladders used by Apple and automotive "compare trims" tables.', 'NN/g: state differences explicitly.'],
  },
  init: () => ({ filter: 'all', all: false }),
  act: {
    more(el, api) { api.ui.all = !api.ui.all; api.refresh(); },
  },
  render(st, api) {
    const K = GX.K, s = GX.series(st.series), ui = api.ui;
    const seats = K.radios({ name: 'v5-series', attr: 'series', legend: 'Model', legendHidden: true, cls: 'gx-seg v5-series',
      options: K.seriesOptions(st, { render: (x) => `<span class="gx-opt-main">${K.nb(x.name)}</span><span class="gx-opt-sub">${x.seats} seats</span>` }) });

    const all = GX.builds(st.series);
    const base = all[0];
    const baseSt = { series: st.series, trim: base.t.id, power: base.p, color: st.color };
    const long = all.length > 8;
    let list = all.filter((b) => ui.filter === 'all' || b.p === ui.filter || (b.t.id === st.trim && b.p === st.power));
    const selIdx = list.findIndex((b) => b.t.id === st.trim && b.p === st.power);
    const LIMIT = 6;
    const showAll = !long || ui.all;
    // Collapsed: first rungs, then (if needed) a gap and the selected rung so the choice is never hidden.
    let shown = showAll ? list : list.slice(0, selIdx >= LIMIT ? LIMIT - 1 : LIMIT);
    const gapBefore = !showAll && selIdx >= LIMIT ? list[selIdx] : null;
    if (gapBefore) shown = shown.concat(gapBefore);

    const rung = (b, i) => {
      const on = b.t.id === st.trim && b.p === st.power;
      const pw = GX.POWER[b.kind];
      const bst = { series: st.series, trim: b.t.id, power: b.p, color: st.color };
      const d = b === base ? ['Base build — ' + b.t.highlights[0].toLowerCase()] : K.diffs(baseSt, bst, 3);
      const dp = b.price - base.price;
      const gap = b === gapBefore ? `<div class="v5-gap" data-k="gap" aria-hidden="true">⋯ ${selIdx - (LIMIT - 1)} more</div>` : '';
      return gap + K.radioOne({ name: 'v5-build', attr: 'build', value: b.t.id + '.' + b.p, checked: on, patch: { trim: b.t.id, power: b.p }, cls: 'v5-rung',
        aria: `${b.t.name} ${pw.name}, ${GX.money(b.price)}`,
        html: `<span class="v5-node" aria-hidden="true"></span><span class="v5-body"><span class="v5-top"><span class="v5-name">${K.esc(b.t.name)} <i>${K.I(pw.icon)}${b.p === 'gas' ? 'Gas' : K.esc(pw.short)}</i></span>` +
          `<span class="v5-price">${GX.money(b.price)}</span></span><span class="v5-adds">${dp ? `<b>${GX.delta(dp)}</b>` : ''}${K.esc(d.join(' · '))}</span></span>` });
    };
    const filters = long ? K.radios({ name: 'v5-filter', attr: 'ui:filter', legend: 'Show', legendHidden: true, cls: 'v5-filters', listCls: 'v5-chiplist',
      options: [['all', 'All ' + all.length], ['electric', 'Electric'], ['gas', 'Gas']].map(([v, l]) => ({ value: v, checked: ui.filter === v, html: l })) }) : '';
    const more = long && !showAll ? `<button type="button" class="v5-more" data-gx-act="more">${K.I('caret-down')}Show all ${list.length} builds</button>` :
      (long && ui.all ? `<button type="button" class="v5-more" data-gx-act="more">${K.I('caret-down', 'gx-flip')}Show fewer</button>` : '');

    const ladder = `<fieldset class="gx-fs v5-ladder" data-k="fs-v5"><legend class="gx-legend v5-legend">Pick your build <small>· lowest to highest price</small></legend>${filters}` +
      `<div class="v5-list">${shown.map(rung).join('')}</div>${more}</fieldset>`;

    return `<div class="v5" data-k="v5">${K.title(st)}${K.price(st)}` +
      `<div class="gx-panel v5-panel" data-k="panel">${K.notice()}${seats}${ladder}` +
      K.colorGroup(st, { name: 'v5-color', cls: 'v5-colors' }) + K.cta(st, { withPrice: true }) + K.checklist(st, { inline: true }) + '</div></div>';
  },
});
