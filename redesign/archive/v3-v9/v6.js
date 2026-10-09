/* V6 — Guided Stepper: one decision at a time; finished steps collapse into editable summaries. */
GX.register({
  n: 6, id: 'stepper', name: 'Guided Stepper',
  short: 'A 4-step "Build yours" accordion: one decision at a time, finished steps collapse into a summary you can change.',
  notes: {
    idea: 'Walk the shopper through Seats → Trim → Power → Color. Only the current step is open; each completed step collapses to one line ("Trim · Freedom · Change"). Picking an option advances to the next step automatically.',
    bestFor: 'First-time buyers who want guidance, and mobile, where a short panel matters.',
    pros: [
      'Compact: one open step keeps the hero short and the CTA close.',
      'The collapsed rows double as a live build summary.',
      'Steps with only one possible answer (Express 6 Valor = 48V only) explain themselves instead of asking.',
    ],
    tradeoffs: ['Hides options behind a click (Baymard warns against hiding choices).', 'Shoppers who jump around pay an extra click per change.'],
    edge: ['Changing an earlier step that invalidates a later one re-opens nothing; the later summary updates and the notice explains what changed (with Undo).', 'All four steps start complete with the page\'s default build, so the CTA works immediately.'],
    basis: ['Rivian / Polestar step-by-step configurators.', 'NN/g progressive disclosure: show what most people need, make the rest one click away.'],
  },
  init: () => ({ open: 'trim' }),
  picked(attr, api) {
    const order = ['series', 'trim', 'power', 'color'];
    const i = order.indexOf(attr);
    if (i < 0) return;
    let next = order[i + 1] || null;
    const st = api.state, t = GX.trim(st.series, st.trim);
    if (next === 'power' && GX.powersOf(t).length === 1) next = 'color';
    api.ui.open = next;
    api.refresh();
  },
  act: {
    open(el, api) { const s = el.getAttribute('data-step'); api.ui.open = api.ui.open === s ? null : s; api.refresh(); },
  },
  render(st, api) {
    const K = GX.K, s = GX.series(st.series), t = GX.trim(st.series, st.trim), info = GX.info(st), ui = api.ui;
    const single = GX.powersOf(t).length === 1;
    const steps = [
      { id: 'series', n: 1, title: 'Seats', val: `${s.seats} seats · ${K.nb(s.name)}`,
        body: () => K.radios({ name: 'v6-series', attr: 'series', legend: 'How many riders?', legendHidden: true, cls: 'v6-opts', listCls: 'v6-grid3',
          options: K.seriesOptions(st, { render: (x) => `<span class="v6-big">${x.seats}</span><span class="gx-opt-main">${K.nb(x.name)}</span><span class="gx-opt-sub">from ${GX.money(GX.fromPrice(x.id))}</span>` }) }) },
      { id: 'trim', n: 2, title: 'Trim', val: K.esc(t.name),
        body: () => K.radios({ name: 'v6-trim', attr: 'trim', legend: 'Which trim?', legendHidden: true, cls: 'v6-opts', listCls: 'v6-list',
          options: K.trimOptions(st, { render: (x) => `<span class="v6-row-txt"><span class="gx-opt-main">${K.esc(x.name)}</span><span class="gx-opt-sub">${K.esc(x.highlights.slice(0, 2).join(' · '))}</span></span><span class="gx-opt-price">from ${GX.money(GX.trimFrom(x))}</span>` }) }) },
      { id: 'power', n: 3, title: 'Power', val: K.esc(info.pw.name) + (single ? ' <small>(only option)</small>' : ''),
        body: () => single
          ? `<p class="v6-only">${K.I('info')}<span>${K.esc(t.name)} on the ${K.nb(s.name)} is sold with <b>${K.esc(info.pw.name)}</b> only — ${K.esc(info.pw.blurb.toLowerCase())}.</span></p>`
          : K.radios({ name: 'v6-power', attr: 'power', legend: 'Electric or gas?', legendHidden: true, cls: 'v6-opts', listCls: 'v6-grid2',
            options: K.powerOptions(st, { render: (p, pw, price) => `${K.I(pw.icon, 'gx-opt-ic')}<span class="v6-row-txt"><span class="gx-opt-main">${p === 'gas' ? 'Gas' : K.esc(pw.short)}</span><span class="gx-opt-sub">${K.esc(pw.blurb)}</span></span><span class="gx-opt-price">${price ? GX.money(price) : '—'}</span>` }) }) },
      { id: 'color', n: 4, title: 'Color', val: `<span class="v6-dot" style="--sw:${info.color.hex}"></span>${K.esc(info.color.name)}`,
        body: () => K.colorGroup(st, { name: 'v6-color', noHead: true, names: true, listCls: 'v6-swgrid' }) },
    ];
    const openIdx = steps.findIndex((x) => x.id === ui.open);
    const progress = `<div class="v6-progress" data-k="prog" aria-hidden="true">${steps.map((x, i) => `<span class="${i === openIdx ? 'is-cur' : 'is-done'}"></span>`).join('')}</div>`;
    const html = steps.map((x) => {
      const open = ui.open === x.id;
      return `<section class="v6-step${open ? ' is-open' : ''}" data-k="st-${x.id}">` +
        `<button type="button" class="v6-head" data-gx-act="open" data-step="${x.id}" aria-expanded="${open}" aria-controls="v6-b-${x.id}">` +
        `<span class="v6-num">${open ? x.n : K.I('check')}</span><span class="v6-title">${x.title}</span><span class="v6-val">${x.val}</span>` +
        `<span class="v6-chg">${open ? K.I('caret-down', 'gx-flip') : 'Change'}</span></button>` +
        `<div class="v6-body" id="v6-b-${x.id}"${open ? '' : ' hidden'}>${open ? x.body() : ''}</div></section>`;
    }).join('');
    const summary = `<div class="v6-sum" data-k="sum"><span class="v6-sum-l">Your ${K.nb(s.name)}</span><span class="v6-sum-v">${K.esc(GX.buildName(st))}</span><span class="v6-sum-p">${GX.money(info.price)}</span></div>`;
    return `<div class="v6" data-k="v6">${K.title(st)}${K.price(st)}` +
      `<div class="gx-panel v6-panel" data-k="panel">${K.notice()}<div class="v6-top"><span class="v6-kicker">Build your cart</span><span class="v6-stepof">${openIdx >= 0 ? `Step ${openIdx + 1} of 4` : 'All set'}</span></div>${progress}` +
      `<div class="v6-steps">${html}</div>${summary}${K.cta(st)}${K.checklist(st, { inline: true })}</div></div>`;
  },
});
