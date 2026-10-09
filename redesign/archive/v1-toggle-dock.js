/* V1 — Toggle Dock: the four product decisions in a protected row below the hero. */
GX.register({
  n: 1, id: 'stack', name: 'Toggle Dock',
  short: 'A clean, full-width control dock below the cart: series, trim, power and color—nothing competing with the product image.',
  notes: {
    idea: 'Keep the product and title visually quiet, then place the four configuration decisions in a dedicated full-width dock below them. Remove promotional and feature lists so the only content competing for attention is the cart and its controls.',
    bestFor: 'The clearest first iteration of the generated concept: visual shoppers who want every decision available without a tall form.',
    pros: [
      'The dock occupies its own grid row, so it can never overlap the cart image.',
      'All four decisions remain visible as direct toggles—no drawers or hidden steps.',
      'A compact build summary confirms the exact selection beside the purchase actions.',
      'Long trim and color sets scroll inside their own bounded control rather than breaking the page margins.',
    ],
    tradeoffs: ['Express 6 has eight trims, so its trim rail scrolls horizontally on narrower screens.', 'The dock is intentionally product-led and does not explain feature differences.'],
    edge: ['Unavailable power options remain visible and state why they cannot be selected.', 'Compatibility repairs still produce a notice with Undo above the controls.'],
    basis: ['Reference concept supplied for this iteration.', 'Baymard: expose variation choices as buttons and update the product image immediately.'],
  },
  render(st) {
    const K = GX.K, s = GX.series(st.series), t = GX.trim(st.series, st.trim), info = GX.info(st);
    const field = (n, label, body, cls) => `<div class="v1-field ${cls || ''}" data-k="field-${n}"><span class="v1-field-label"><b>${n}</b>${label}</span>${body}</div>`;

    const series = K.radios({
      name: 'v1-series', attr: 'series', legend: 'Series', legendHidden: true, cls: 'gx-seg v1-series', listCls: 'v1-toggle-row',
      options: K.seriesOptions(st, { render: (x) => `<span class="gx-opt-main">${K.nb(x.name)}</span>` }),
    });
    const trims = K.radios({
      name: 'v1-trim', attr: 'trim', legend: 'Trim', legendHidden: true, cls: 'gx-seg v1-trims', listCls: 'v1-toggle-row',
      options: K.trimOptions(st, { render: (x) => `<span class="gx-opt-main">${K.esc(K.shortName(x))}</span>` }),
    });
    const power = K.radios({
      name: 'v1-power', attr: 'power', legend: 'Drivetrain', legendHidden: true, cls: 'gx-seg v1-power', listCls: 'v1-toggle-row',
      options: K.powerOptions(st, { render: (p, pw) => `<span class="gx-opt-main">${K.I(pw.icon)}${p === 'gas' ? 'Gas' : 'Electric'}</span>` }),
    });
    const colors = `<div class="v1-color-control"><div class="v1-color-scroll">${K.colorGroup(st, { name: 'v1-color', noHead: true, size: 'sm', listCls: 'v1-color-row' })}</div>` +
      `<span class="v1-color-name">${K.esc(GX.COLORS[st.color].name)} <small>${t.colors.length} colors</small></span></div>`;

    const summary = `<div class="v1-summary" data-k="summary"><span class="v1-summary-icon">${K.I('tag')}</span><span><small>Your build</small><b>${K.esc(s.name + ' ' + t.name)}</b><em>${K.esc(info.pw.short + ' · ' + GX.COLORS[st.color].name)}</em></span></div>`;
    const dock = `<section class="gx-panel v1-dock" data-k="dock" aria-label="Configure your cart">${K.notice({ cls: 'v1-notice' })}` +
      `<div class="v1-controls">${field('1', 'Series', series, 'v1-field--series')}${field('2', 'Trim', trims, 'v1-field--trim')}${field('3', 'Drivetrain', power, 'v1-field--power')}${field('4', 'Color', colors, 'v1-field--color')}</div>` +
      `<div class="v1-buy">${summary}<div class="v1-buy-price"><small>As configured</small><b>${GX.money(info.price)}</b></div>${K.cta(st)}</div></section>`;

    return `<div class="v1" data-k="v1"><div class="v1-copy" data-k="copy">${K.title(st)}${K.price(st, { cls: 'v1-price', label: 'MSRP as configured' })}</div>${dock}</div>`;
  },
});
