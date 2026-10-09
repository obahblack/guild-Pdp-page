/* V2 — Hero Dock: the toggles sit on top of the sticky purchase bar while the shopper is in the hero;
   on scroll the toggle row folds away and only the regular sticky CTA bar remains (reference concept 2).
   Desktop (≥1025px wide, ≥700px tall): fixed dock along the bottom of the screen.
   Smaller screens: the configurator sits inline under the title; the CTA bar appears after it.
   Layout is static: the hero is fitted above the expanded dock once per screen size (never on scroll or
   while the dock folds), so the cart and the two columns never move relative to each other. */
GX.register({
  n: 2, id: 'dock', name: 'Hero Dock',
  short: 'Trim, drivetrain and color sit on top of the sticky purchase bar in the hero; on scroll they fold away and the regular CTA bar stays.',
  notes: {
    idea: 'The reference concept: one component that is the full configurator while the shopper is in the hero, and the regular sticky purchase bar everywhere else. Expanded, one quiet row of toggles (Trim · Drivetrain · Color) sits above the bar with the build, price and the two CTAs; scrolling folds the toggles away.',
    bestFor: 'Long product pages: the shopper can configure up top and buy from anywhere further down without scrolling back.',
    pros: [
      'The left column stays editorial (title, price range, checklist) while every decision sits in one horizontal row.',
      'The bar keeps the site\'s sticky-bar look (dark glass, brand stroke) and replaces its static "Starting at $9,909.00" with the live build and price.',
      '"Customize" reopens the toggles from anywhere on the page.',
      'The hero is fitted above the expanded dock once, so the cart never jumps while scrolling.',
    ],
    tradeoffs: ['The expanded dock takes ~15% of a laptop screen while at the top of the page.', 'The selected color\'s name is shown in the bar (not next to the swatches) to keep the toggle row to one line.'],
    edge: ['Phones and short screens get the same toggles inline, with the bar appearing once the inline CTA scrolls away.', 'Valor offers 5 colors and Freedom 12: switching trims repairs the color with a notice and Undo just above the dock.'],
    basis: ['Reference concept 2 supplied by the client (series switcher removed per feedback).', 'Persistent buy-bar patterns (Apple, automotive configurators) that collapse on scroll.', 'Guild Design System: sticky bar material, primary + secondary pill buttons, no hover colour effects.'],
  },
  init: () => ({ collapsed: false, manual: false, manualY: 0, mode: null, showCompact: false, fitKey: null }),
  modeNow: () => (matchMedia('(min-width: 1025px) and (min-height: 700px)').matches ? 'dock' : 'inline'),

  render(st, api) {
    const K = GX.K, s = GX.series(st.series), t = GX.trim(st.series, st.trim), info = GX.info(st), ui = api.ui;
    ui.mode = this.modeNow();
    const dock = ui.mode === 'dock';
    const P = dock ? 'v2d-' : 'v2i-'; // distinct radio names/ids per placement

    // ----- the three toggle groups (series is fixed by the page) -----
    const group = (key, n, label, val, fs) => `<div class="v2-g v2-g--${key}" data-k="g-${key}">` +
      `<span class="v2-lab" aria-hidden="true">${dock ? '' : `${n}. `}${label}${val ? ` <b>${K.esc(val)}</b>` : ''}</span>${fs}</div>`;
    const trims = K.radios({ name: P + 'trim', attr: 'trim', legend: 'Trim', legendHidden: true, cls: 'v2-fs', listCls: 'v2-pills',
      options: K.trimOptions(st, { render: (x) => `<span class="gx-opt-main">${K.esc(x.name)}</span>` }) });
    const powerOpts = K.powerOptions(st, { render: (p) => `${K.I(p === 'gas' ? 'gas-pump' : 'lightning')}<span class="gx-opt-main">${p === 'gas' ? 'Gas' : 'Electric'}</span>` })
      .sort((a, b) => (a.value === 'gas' ? -1 : 1) - (b.value === 'gas' ? -1 : 1));
    const power = K.radios({ name: P + 'power', attr: 'power', legend: 'Drivetrain', legendHidden: true, cls: 'v2-fs', listCls: 'v2-pills', options: powerOpts });
    const colors = K.radios({ name: P + 'color', attr: 'color', legend: 'Color', legendHidden: true, cls: 'v2-fs', listCls: 'gx-sw-list v2-swatches',
      optCls: 'gx-sw', options: K.colorOptions(st) });
    const groups = `<div class="v2-groups" data-k="groups">` +
      group('trim', 1, 'Trim', '', trims) + group('power', 2, 'Drivetrain', dock ? '' : info.pw.name, power) + group('color', 3, 'Color', dock ? '' : info.color.name, colors) + '</div>';

    // ----- the regular sticky CTA bar: build · price · actions -----
    const collapsed = dock ? ui.collapsed : true;
    const edit = (where) => {
      if (where === 'compact') return `<button type="button" class="gx-btn gx-btn--text v2-edit" data-gx-act="edit">${K.I('sliders-horizontal')}<span>Edit</span></button>`;
      if (where !== 'dock') return '';
      if (collapsed) return `<button type="button" class="gx-btn gx-btn--text v2-edit" data-gx-act="toggle" aria-controls="v2-top" aria-expanded="false">${K.I('sliders-horizontal')}<span>Customize</span></button>`;
      return ui.manual ? `<button type="button" class="gx-btn gx-btn--text v2-edit" data-gx-act="toggle" aria-controls="v2-top" aria-expanded="true">${K.I('caret-down')}<span>Done</span></button>` : '';
    };
    const bar = (where) => `<div class="v2-bar" data-k="bar-${where}">` +
      `<p class="v2-sum"><b>EZGO ${K.nb(s.name)} ${K.esc(t.name)}</b><span>${K.esc(info.pw.short)} · ${K.esc(info.color.name)}</span></p>` +
      `<p class="v2-price"><span class="gx-sr">Your price </span>${GX.money2(info.price)}</p>` +
      `<div class="v2-actions">${edit(where)}` +
      `<button type="button" class="gx-btn gx-btn--primary v2-atc" data-gx-act="cart">${K.I('shopping-cart-simple')}<span>Add to Cart</span></button>` +
      `<a class="gx-btn gx-btn--secondary v2-quote" href="${K.QUOTE_HREF}"><span>Request a Quote</span>${K.I('caret-right')}</a></div></div>`;

    const head = `<div class="v2-copy" data-k="copy">${K.title(st, { eyebrow: false, trim: false })}${K.range(st)}${K.checklist(st, { cls: 'v2-check' })}</div>`;

    if (dock) {
      return {
        root: `<div class="v2" data-k="v2">${head}</div>`,
        layer: `<section class="gx-dock v2-dock${collapsed ? ' is-collapsed' : ''}" data-k="dock" aria-label="Configure and buy your cart">` +
          `<div class="v2-note" data-k="note">${collapsed ? '' : K.notice()}</div>` +
          `<div class="v2-top" id="v2-top"${collapsed ? ' inert' : ''}><div class="v2-top-in"><div class="v2-pad">${groups}</div></div></div>${bar('dock')}</section>`,
      };
    }
    return {
      root: `<div class="v2" data-k="v2">${head}<div class="gx-panel v2-inline" data-k="inline">${K.notice()}${groups}${bar('inline')}</div></div>`,
      layer: `<section class="gx-dock v2-dock v2-dock--compact is-collapsed${ui.showCompact ? ' is-shown' : ''}" data-k="dock" aria-label="Your build"${ui.showCompact ? '' : ' aria-hidden="true" inert'}>${bar('compact')}</section>`,
    };
  },

  after(root, api) {
    document.body.classList.toggle('gx-v2-docked', api.ui.mode === 'dock');
    this.place(api);
  },

  // Align the dock with the hero's content box, then — once per screen size — fit the hero above the
  // EXPANDED dock: the cart row moves up (both columns together) and the cart only shrinks below the
  // site-wide 80% zoom when the screen is too short. Never re-run on scroll, folding or picks.
  place(api) {
    const ui = api.ui, layer = api.layer, dock = layer.querySelector('.v2-dock');
    const col = document.querySelector('.elementor-element-17a4cdf');
    if (col && dock) {
      const l = Math.max(16, col.getBoundingClientRect().left + parseFloat(getComputedStyle(col).paddingLeft));
      layer.style.setProperty('--gx-cl', Math.round(l) + 'px');
      layer.style.setProperty('--gx-cw', Math.round(document.documentElement.clientWidth - 2 * l) + 'px');
    }
    const B = document.body.style;
    if (ui.mode !== 'dock' || !dock) { B.removeProperty('--gx-v2-s'); B.removeProperty('--gx-v2-dy'); ui.fitKey = null; return; }
    const key = innerWidth + 'x' + innerHeight;
    if (ui.fitKey === key) return;
    const photo = document.querySelector('.gx-photo'), hero = document.querySelector('.elementor-element-767c751');
    const topIn = dock.querySelector('.v2-top-in'), barEl = dock.querySelector('.v2-bar');
    if (!photo || !hero || !topIn || !barEl || !photo.offsetHeight) return;
    // Expanded height from its parts, so it's right even while folded or mid-animation.
    const cs = getComputedStyle(dock);
    const H = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) + topIn.scrollHeight + barEl.offsetHeight;
    const dockTop = innerHeight - (parseFloat(cs.bottom) || 16) - H; // page y at scroll 0
    // Layout positions: offsetTop ignores transforms (the page's parallax and our own row translate).
    const docTop = (el) => { let y = 0; for (let e = el; e; e = e.offsetParent) y += e.offsetTop; return y; };
    const h0 = photo.offsetHeight, top0 = docTop(photo);
    const minTop = docTop(hero) + 24, maxBottom = dockTop - 20;
    const BASE = 0.8, TOP = 0.04, BOT = 0.94; // cart pixels span ~4%–94% of the photo; scale is around the centre
    const box = (s) => ({ top: top0 + h0 * (1 - s) / 2 + h0 * s * TOP, bottom: top0 + h0 * (1 - s) / 2 + h0 * s * BOT });
    let s = BASE, b = box(s), dy = Math.min(0, maxBottom - b.bottom);
    if (b.top + dy < minTop) {
      s = Math.max(0.55, Math.min(BASE, (maxBottom - minTop) / (h0 * (BOT - TOP))));
      b = box(s); dy = Math.min(0, maxBottom - b.bottom);
    }
    ui.fitKey = key;
    B.setProperty('--gx-v2-s', s.toFixed(3));
    B.setProperty('--gx-v2-dy', Math.round(dy) + 'px');
  },

  onScroll(api) {
    const ui = api.ui, y = scrollY;
    if (ui.mode === 'dock') {
      let changed = false;
      // "Customize" keeps the toggles open until the shopper scrolls well away (or back to the top).
      if (ui.manual && !(Math.abs(y - ui.manualY) < 260 && y > 40)) { ui.manual = false; changed = true; }
      if (!ui.manual) {
        const want = ui.collapsed ? y > 60 : y > 120; // hysteresis
        if (want !== ui.collapsed) { ui.collapsed = want; changed = true; }
      }
      if (changed) api.refresh();
    } else {
      const buy = document.querySelector('#gx-root .v2-inline .v2-bar');
      const show = !!buy && buy.getBoundingClientRect().bottom < 0;
      if (show !== ui.showCompact) { ui.showCompact = show; api.refresh(); }
    }
  },
  onResize(api) {
    if (this.modeNow() !== api.ui.mode) api.refresh();
    else { clearTimeout(this._rz); this._rz = setTimeout(() => { api.ui.fitKey = null; this.place(api); }, 120); }
  },
  leave(api) {
    document.body.classList.remove('gx-v2-docked');
    document.body.style.removeProperty('--gx-v2-s');
    document.body.style.removeProperty('--gx-v2-dy');
    api.ui.fitKey = null;
  },
  act: {
    toggle(el, api) {
      api.ui.collapsed = !api.ui.collapsed;
      api.ui.manual = !api.ui.collapsed; api.ui.manualY = scrollY;
      api.refresh();
      const b = api.layer.querySelector('.v2-edit') || api.layer.querySelector('.v2-atc'); if (b) b.focus();
    },
    edit(el, api) {
      const p = document.querySelector('#gx-root .v2-inline');
      if (p) p.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    },
  },
});
