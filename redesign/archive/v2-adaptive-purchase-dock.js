/* V2 — Adaptive Purchase Dock: full configurator in the hero, compact purchase bar after it. */
GX.register({
  n: 2, id: 'cards', name: 'Adaptive Purchase Dock',
  short: 'An expanded configurator anchored in the hero that collapses into a compact sticky purchase bar as the shopper scrolls.',
  sticky: true,
  notes: {
    idea: 'Treat the in-hero configurator and the sticky purchase CTA as two states of one component. It starts expanded with every selection visible, then becomes a compact build summary and Add to cart action when the hero CTA leaves the viewport.',
    bestFor: 'Long product pages where shoppers should be able to purchase without returning to the hero.',
    pros: [
      'The expanded state is part of the hero rather than a floating overlay.',
      'The compact state preserves the selected build, price and primary action while scrolling.',
      'Intersection-based collapse follows the actual CTA visibility rather than an arbitrary scroll distance.',
      'The product image and configurator have separate grid rows and cannot overlap.',
    ],
    tradeoffs: ['The sticky bar occupies a small amount of viewport space after the hero.', 'The compact state intentionally drops secondary controls and Request a quote.'],
    edge: ['The bar returns to its expanded in-hero state when the shopper scrolls back.', 'Reduced-motion preferences remove the slide transition without changing behavior.'],
    basis: ['Reference concept supplied for this iteration.', 'Persistent-cart patterns used on long-form product detail pages.'],
  },
  render(st) {
    const K = GX.K, s = GX.series(st.series), t = GX.trim(st.series, st.trim), info = GX.info(st);
    const field = (n, label, body, cls) => `<div class="v2-field ${cls || ''}" data-k="field-${n}"><span class="v2-field-label"><b>${n}</b>${label}</span>${body}</div>`;

    const series = K.radios({
      name: 'v2-series', attr: 'series', legend: 'Series', legendHidden: true, cls: 'gx-seg v2-series', listCls: 'v2-toggle-row',
      options: K.seriesOptions(st, { render: (x) => `<span class="gx-opt-main">${K.nb(x.name)}</span>` }),
    });
    const trims = K.radios({
      name: 'v2-trim', attr: 'trim', legend: 'Trim', legendHidden: true, cls: 'gx-seg v2-trims', listCls: 'v2-toggle-row',
      options: K.trimOptions(st, { render: (x) => `<span class="gx-opt-main">${K.esc(K.shortName(x))}</span>` }),
    });
    const power = K.radios({
      name: 'v2-power', attr: 'power', legend: 'Drivetrain', legendHidden: true, cls: 'gx-seg v2-power', listCls: 'v2-toggle-row',
      options: K.powerOptions(st, { render: (p, pw) => `<span class="gx-opt-main">${K.I(pw.icon)}${p === 'gas' ? 'Gas' : 'Electric'}</span>` }),
    });
    const colors = `<div class="v2-color-control"><div class="v2-color-scroll">${K.colorGroup(st, { name: 'v2-color', noHead: true, size: 'sm', listCls: 'v2-color-row' })}</div>` +
      `<span class="v2-color-name">${K.esc(GX.COLORS[st.color].name)} <small>${t.colors.length} colors</small></span></div>`;

    const summary = `<div class="v2-summary" data-k="summary"><span class="v2-summary-icon">${K.I('tag')}</span><span><small>Your build</small><b>${K.esc(s.name + ' ' + t.name)}</b><em>${K.esc(info.pw.short + ' · ' + GX.COLORS[st.color].name)}</em></span></div>`;
    const dock = `<section class="gx-panel v2-dock" data-k="dock" aria-label="Configure and purchase your cart">${K.notice({ cls: 'v2-notice' })}` +
      `<div class="v2-controls">${field('1', 'Series', series, 'v2-field--series')}${field('2', 'Trim', trims, 'v2-field--trim')}${field('3', 'Drivetrain', power, 'v2-field--power')}${field('4', 'Color', colors, 'v2-field--color')}</div>` +
      `<div class="v2-buy">${summary}<div class="v2-buy-price"><small>As configured</small><b>${GX.money(info.price)}</b></div>${K.cta(st)}</div></section>`;

    return `<div class="v2" data-k="v2"><div class="v2-copy" data-k="copy">${K.title(st)}${K.price(st, { label: 'MSRP as configured' })}</div>${dock}</div>`;
  },
});
