/* V3 — Power-First: the gas-vs-electric decision leads; trims are filtered to that fuel. */
GX.register({
  n: 3, id: 'power', name: 'Power-First',
  short: 'A big Electric ⟷ Gas switch leads; below it only the trims sold with that fuel, each with its exact price.',
  notes: {
    idea: 'Many buyers arrive having already decided "gas or electric" (charging at home? hills? HOA rules?). Lead with that switch, then list only the trims sold with that fuel — each row shows the exact price and battery type, so there are no dead ends.',
    bestFor: 'Buyers with a firm powertrain preference; mirrors how EZGO\'s own site groups models.',
    pros: [
      'Every listed row is a valid, priced build — no disabled combinations in the list.',
      'Electric rows name the battery (48V lead-acid vs ELiTE Lithium), the distinction the current page hides.',
      'The switch shows "from" prices for each fuel, so the cost of gas vs electric is clear up front.',
    ],
    tradeoffs: ['Reverses the brand\'s Series → Trim hierarchy; trim is the second decision.', 'A shopper who wants a specific trim may need to flip fuels to find it.'],
    edge: ['Express 6 + Gas lists only Touring and Summit; a footnote explains that Valor S/S+ are electric-only.', 'Flipping fuel when the current trim lacks it moves to the nearest trim and says so, with Undo.'],
    basis: ['EZGO.com groups RXV models by ELiTE Lithium / 48V AC / Gas.', 'Configurator studies: avoid presenting combinations that can\'t be built.'],
  },
  render(st) {
    const K = GX.K, s = GX.series(st.series), t = GX.trim(st.series, st.trim);
    const has = (p) => s.trims.some((x) => x.power[p]);
    const kinds = (p) => [...new Set(s.trims.filter((x) => x.power[p]).map((x) => GX.POWER[GX.kindOf(x, p)].short))].join(' or ');

    const sw = ['electric', 'gas'].map((p) => {
      const from = GX.fromPrice(st.series, (x, q) => q === p);
      return K.radioOne({ name: 'v3-fuel', attr: 'power', value: p, checked: st.power === p, disabled: !has(p), cls: 'v3-side v3-side--' + p,
        aria: `${p === 'gas' ? 'Gas' : 'Electric'}, from ${GX.money(from)}`,
        html: `<span class="v3-ic">${K.I(p === 'gas' ? 'gas-pump' : 'lightning')}</span><span class="v3-side-txt"><span class="v3-side-name">${p === 'gas' ? 'Gas' : 'Electric'}</span>` +
          `<span class="v3-side-sub">${p === 'gas' ? '13.5-hp EFI · quick refuel' : K.esc(kinds('electric'))}</span></span><span class="v3-side-from"><small>from</small>${GX.money(from)}</span>` });
    }).join('');
    const fuel = `<fieldset class="gx-fs v3-fuel" data-k="fs-v3-fuel"><legend class="gx-legend">Electric or gas?</legend><div class="v3-switch" data-on="${st.power}">${sw}<span class="v3-thumb" aria-hidden="true"></span></div></fieldset>`;

    const seats = K.radios({ name: 'v3-series', attr: 'series', legend: 'Seats', cls: 'v3-seats', listCls: 'v3-seatlist',
      options: K.seriesOptions(st, { render: (x) => `<span class="gx-opt-main">${x.seats}</span><span class="gx-opt-sub">${K.nb(x.name)}</span>` }) });

    const rows = s.trims.filter((x) => x.power[st.power]).map((x) => {
      const kind = GX.kindOf(x, st.power), pw = GX.POWER[kind];
      return K.radioOne({ name: 'v3-trim', attr: 'trim', value: x.id, checked: x.id === st.trim, cls: 'v3-row',
        aria: `${x.name}, ${pw.name}, ${GX.money(GX.priceOf(x, st.power))}`,
        html: `<span class="v3-radio" aria-hidden="true"></span><span class="v3-row-txt"><span class="v3-row-name">${K.esc(x.name)}</span>` +
          `<span class="v3-row-sub">${K.esc(pw.short)} · ${K.esc(x.highlights[0])}</span></span><span class="v3-row-price">${GX.money(GX.priceOf(x, st.power))}</span>` });
    }).join('');
    const missing = s.trims.filter((x) => !x.power[st.power]);
    const foot = missing.length ? `<p class="v3-foot">${K.I('info')}${K.esc(missing.map((x) => x.name).join(' and '))} ${missing.length > 1 ? 'are' : 'is'} ${st.power === 'gas' ? 'electric' : 'gas'}-only on the ${K.nb(s.name)}.</p>` : '';
    const trims = `<fieldset class="gx-fs v3-trims" data-k="fs-v3-trims"><legend class="gx-legend">${st.power === 'gas' ? 'Gas' : 'Electric'} ${K.nb(s.name)} trims</legend><div class="v3-rows">${rows}</div>${foot}</fieldset>`;

    return `<div class="v3" data-k="v3">${K.title(st)}${K.price(st)}` +
      `<div class="gx-panel v3-panel" data-k="panel">${K.notice()}${fuel}<div class="v3-mid">${seats}</div>${trims}` +
      K.colorGroup(st, { name: 'v3-color', cls: 'v3-colors' }) + K.cta(st, { withPrice: true }) + K.checklist(st, { inline: true }) + '</div></div>';
  },
});
