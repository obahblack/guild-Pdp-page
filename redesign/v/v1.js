/* V1 — Toggle Panel: product headline + one compact panel of numbered toggles (reference concept 1).
   The series is fixed by the product page (GX.PAGE_SERIES), so the panel starts at the trim.
   Sized like the page's original variation form (small swatches, 36px toggles, 44px design-system
   buttons) and kept clear of the gallery's arrows; the site's own sticky quote bar steps aside while
   it would cover the panel. */
GX.register({
  n: 1, id: 'panel', name: 'Toggle Panel',
  short: 'Product headline with price range, then one compact panel: 1 Trim · 2 Drivetrain · 3 Color, Add to Cart and Request a Quote.',
  notes: {
    idea: 'The reference concept: keep the hero calm — the product name and its price range — and put every decision in one numbered panel in the left column. No feature list competes with the toggles; the cart photo on the right updates with every pick.',
    bestFor: 'The default recommendation: shoppers see every choice at once, in the order they decide, without leaving the hero.',
    pros: [
      'Numbered labels make the order of decisions explicit (trim → drivetrain → color).',
      'Every option is a visible toggle; the selected value is echoed in the label (e.g. "Forest Green", "ELiTE Lithium").',
      'Compact like the original form: 36px toggles, 24px swatches and the design system\'s 44px primary + secondary buttons.',
      'The panel stays inside the page margins and clear of the gallery arrows and the cart photo.',
    ],
    tradeoffs: ['Trim differences (badging, tires, upgrade options) aren\'t explained in the panel.'],
    edge: ['Valor S and S+ come in 5 colors, Freedom in 12: switching to a trim without the current color picks the nearest one and explains it, with Undo.', 'Valor runs on 48V lead-acid and Freedom on ELiTE Lithium, so the drivetrain label names the battery for the selected trim.', 'On shorter screens the site\'s sticky "Request a Quote" bar would sit on top of the panel, so it fades out until the panel has scrolled past it.'],
    basis: ['Reference concept 1 supplied by the client (feature list and series switcher removed per feedback).', 'Baymard: show variation options as visible buttons; label the selected swatch.', 'Guild Design System: primary + secondary pill buttons, 14px/600 form labels, no hover colour effects.'],
  },
  render(st) {
    const K = GX.K, s = GX.series(st.series), t = GX.trim(st.series, st.trim), info = GX.info(st);
    const label = (n, text, val) => `<span class="v1-step">${n}. ${text}</span>${val ? `<span class="v1-val">${val}</span>` : ''}`;

    const trims = K.radios({ name: 'v1-trim', attr: 'trim', legend: label(1, 'Select trim'), cls: 'v1-group', listCls: 'v1-pills',
      options: K.trimOptions(st, { render: (x) => `<span class="gx-opt-main">${K.esc(x.name)}</span>` }) });

    const powerOpts = K.powerOptions(st, { render: (p) => `${K.I(p === 'gas' ? 'gas-pump' : 'lightning')}<span class="gx-opt-main">${p === 'gas' ? 'Gas' : 'Electric'}</span>` })
      .sort((a, b) => (a.value === 'gas' ? -1 : 1) - (b.value === 'gas' ? -1 : 1));
    const blocked = powerOpts.find((o) => o.disabled);
    const power = K.radios({ name: 'v1-power', attr: 'power', legend: label(2, 'Select drivetrain', K.esc(info.pw.name)), cls: 'v1-group', listCls: 'v1-pills v1-pills--2', options: powerOpts }) +
      (blocked ? `<p class="v1-why" data-k="why">${K.I('info')}${K.esc(t.name)} on the ${K.nb(s.name)} is electric-only.</p>` : '');

    const colors = K.radios({ name: 'v1-color', attr: 'color', legend: label(3, 'Select color', K.esc(info.color.name)), cls: 'v1-group v1-colors',
      listCls: 'gx-sw-list v1-swatches', optCls: 'gx-sw', options: K.colorOptions(st) });

    const cta = `<div class="v1-cta" data-k="cta">` +
      `<button type="button" class="gx-btn gx-btn--primary v1-atc" data-gx-act="cart">${K.I('shopping-cart-simple')}<span>Add to Cart</span><span class="v1-atc-price">${GX.money2(info.price)}</span></button>` +
      `<a class="gx-btn gx-btn--secondary v1-quote" href="${K.QUOTE_HREF}"><span>Request a Quote</span>${K.I('caret-right')}</a></div>`;

    return `<div class="v1" data-k="v1"><div class="v1-head" data-k="head1">${K.title(st, { eyebrow: false, trim: false })}${K.range(st)}</div>` +
      `<div class="gx-panel v1-panel" data-k="panel">${K.notice()}${trims}${power}${colors}${cta}</div></div>`;
  },

  after() { this.bar(); },
  onScroll() { this.bar(); },
  onResize() { this.bar(); },
  leave() { document.body.classList.remove('gx-v1-bar-off'); },

  // The site's sticky "Request a Quote" bar is fixed 80px above the bottom of the screen; on laptop
  // heights it lands on the panel. Fade it out while it would overlap, back in once the panel has passed.
  bar() {
    const panel = document.querySelector('#gx-root .v1-panel');
    const bar = [...document.querySelectorAll('.elementor-element-0a807ef')].find((b) => getComputedStyle(b).position === 'fixed' && b.offsetHeight);
    let off = false;
    if (panel && bar) {
      const p = panel.getBoundingClientRect(), b = bar.getBoundingClientRect();
      off = b.top < p.bottom + 12 && b.bottom > p.top && b.left < p.right && b.right > p.left;
    }
    document.body.classList.toggle('gx-v1-bar-off', off);
  },
});
