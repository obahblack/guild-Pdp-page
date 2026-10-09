/* Guild PDP hero redesign — shared HTML building blocks used by every variation.
   Everything returns HTML strings; the host morphs them into the page so focus and
   CSS transitions survive re-renders. Selection always uses native radio inputs. */
(function (GX) {
  const I = (n, c) => GX.icon(n, c);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nb = (s) => esc(s).replace(/ (\d)/g, '&nbsp;$1'); // "RXV 2" never breaks
  const QUOTE_HREF = 'https://staging1.guildgolfcarts.com/#elementor-action%3Aaction%3Dpopup%3Aopen%26settings%3DeyJpZCI6IjE2NTMyIiwidG9nZ2xlIjpmYWxzZX0%3D';

  /* ---------- radio group ----------
     opt = { value, html, checked, disabled, reason, cls, patch, aria } */
  let uid = 0;
  function radios(o) {
    const name = 'gx-' + o.name;
    const lid = name + '-lg';
    const legend = o.legend == null ? '' :
      `<legend class="gx-legend${o.legendHidden ? ' gx-sr' : ''}" id="${lid}">${o.legend}</legend>`;
    const opts = o.options.map((op) => {
      const id = name + '-' + String(op.value).replace(/[^a-z0-9]+/gi, '-');
      const rid = op.reason ? id + '-why' : '';
      const patch = op.patch ? ` data-gx-patch='${esc(JSON.stringify(op.patch))}'` : '';
      return `<label class="gx-opt ${o.optCls || ''} ${op.cls || ''}${op.checked ? ' is-on' : ''}${op.disabled ? ' is-off' : ''}" data-k="${esc(op.value)}" for="${id}">` +
        `<input class="gx-r" type="radio" id="${id}" name="${name}" value="${esc(op.value)}" data-gx-attr="${o.attr}"${patch}` +
        `${op.checked ? ' checked' : ''}${op.disabled ? ' disabled' : ''}${rid ? ` aria-describedby="${rid}"` : ''}${op.aria ? ` aria-label="${esc(op.aria)}"` : ''}>` +
        `${op.html}${op.reason ? `<span class="gx-why" id="${rid}">${op.reason}</span>` : ''}</label>`;
    }).join('');
    return `<fieldset class="gx-fs ${o.cls || ''}" data-k="fs-${o.name}"${o.legend == null ? ` aria-label="${esc(o.aria || o.name)}"` : ''}>${legend}<div class="gx-opts ${o.listCls || ''}">${opts}</div></fieldset>`;
  }

  // One radio for hand-built groups (e.g. trims split into family columns).
  function radioOne(o) {
    const id = 'gx-' + o.name + '-' + String(o.value).replace(/[^a-z0-9]+/gi, '-');
    const patch = o.patch ? ` data-gx-patch='${esc(JSON.stringify(o.patch))}'` : '';
    return `<label class="gx-opt ${o.cls || ''}${o.checked ? ' is-on' : ''}${o.disabled ? ' is-off' : ''}" data-k="${esc(o.value)}" for="${id}">` +
      `<input class="gx-r" type="radio" id="${id}" name="gx-${o.name}" value="${esc(o.value)}" data-gx-attr="${o.attr}"${patch}` +
      `${o.checked ? ' checked' : ''}${o.disabled ? ' disabled' : ''}${o.aria ? ` aria-label="${esc(o.aria)}"` : ''}>${o.html}</label>`;
  }

  /* ---------- option sources ---------- */
  function seriesOptions(st, o) {
    o = o || {};
    return GX.SERIES.map((s) => ({
      value: s.id, checked: st.series === s.id,
      html: o.render ? o.render(s) :
        `<span class="gx-opt-main">${nb(s.name)}</span><span class="gx-opt-sub">${I('users')}${s.seats} seats</span>`,
      aria: `${s.name}, ${s.seats} seats, from ${GX.money(GX.fromPrice(s.id))}`,
    }));
  }
  function trimOptions(st, o) {
    o = o || {};
    const s = GX.series(st.series);
    return s.trims.map((t) => {
      const forced = !t.power[st.power];
      return {
        value: t.id, checked: st.trim === t.id,
        cls: 'fam-' + t.family.toLowerCase(),
        html: o.render ? o.render(t, s) : `<span class="gx-opt-main">${esc(t.name)}</span>`,
        aria: `${t.name}, from ${GX.money(GX.trimFrom(t))}${forced ? ', ' + (st.power === 'gas' ? 'electric only' : 'gas only') : ''}`,
      };
    });
  }
  function powerOptions(st, o) {
    o = o || {};
    const t = GX.trim(st.series, st.trim);
    return ['electric', 'gas'].map((p) => {
      const has = !!t.power[p];
      const kind = has ? GX.kindOf(t, p) : (p === 'gas' ? 'gas' : '48v');
      const pw = GX.POWER[kind];
      return {
        value: p, checked: st.power === p, disabled: !has,
        reason: has ? '' : `${esc(t.name)} on the ${nb(GX.series(st.series).name)} is ${p === 'gas' ? 'electric' : 'gas'}-only`,
        html: o.render ? o.render(p, pw, has ? GX.priceOf(t, p) : null, t) :
          `${I(pw.icon, 'gx-opt-ic')}<span class="gx-opt-main">${p === 'gas' ? 'Gas' : esc(pw.short)}</span>` +
          `<span class="gx-opt-price">${has ? GX.money(GX.priceOf(t, p)) : 'Not offered'}</span>`,
        aria: has ? `${pw.name}, ${GX.money(GX.priceOf(t, p))}` : `${pw.name}, not offered`,
      };
    });
  }
  function swatch(cId, size) {
    const c = GX.COLORS[cId];
    return `<span class="gx-sw-dot${size ? ' gx-sw-' + size : ''}" style="--sw:${c.hex}" aria-hidden="true">${I('check', 'gx-sw-tick')}</span>`;
  }
  function colorOptions(st, o) {
    o = o || {};
    const t = GX.trim(st.series, st.trim);
    return GX.colorsOf(t).map((cId) => ({
      value: cId, checked: st.color === cId, cls: 'gx-swo' + (isLight(cId) ? ' is-light' : ''),
      html: o.render ? o.render(cId, GX.COLORS[cId]) :
        swatch(cId, o.size) + (o.names ? `<span class="gx-sw-name">${esc(GX.COLORS[cId].name)}</span>` : ''),
      aria: GX.COLORS[cId].name,
    }));
  }
  const LIGHT = ['bright-white', 'ivory', 'platinum', 'almond', 'ocean-grey'];
  const isLight = (c) => LIGHT.includes(c);

  // Colour group with a live "Color: Name · 12 colors" header.
  function colorGroup(st, o) {
    o = o || {};
    const t = GX.trim(st.series, st.trim);
    const head = `<div class="gx-row-head"><span class="gx-legend-text">${o.label || 'Color'}</span>` +
      `<span class="gx-row-val">${esc(GX.COLORS[st.color].name)}</span>` +
      `<span class="gx-row-meta">${t.colors.length} colors on ${esc(t.name)}</span></div>`;
    return `<div class="gx-colors ${o.cls || ''}">${o.noHead ? '' : head}` +
      radios({ name: o.name || 'color', attr: 'color', legend: o.label || 'Color', legendHidden: true, cls: 'gx-fs-sw', listCls: 'gx-sw-list ' + (o.listCls || ''), optCls: 'gx-sw', options: colorOptions(st, o) }) + '</div>';
  }

  /* ---------- title / price ---------- */
  function title(st, o) {
    o = o || {};
    const { s, t } = GX.info(st);
    return `<div class="gx-head ${o.cls || ''}" data-k="head">` +
      (o.eyebrow === false ? '' : `<p class="gx-eyebrow">${o.eyebrow || `2027 · ${s.seats}-passenger · ${st.power === 'gas' ? 'Gas' : 'Electric'}`}</p>`) +
      `<h1 class="gx-title"><span class="gx-title-series">EZGO ${nb(s.name)}</span>${o.trim === false ? '' : ` <span class="gx-title-trim">${esc(t.name)}</span>`}</h1></div>`;
  }
  function price(st, o) {
    o = o || {};
    const { price: p } = GX.info(st);
    const note = GX.photoNote(st);
    return `<div class="gx-price ${o.cls || ''}" data-k="price">` +
      `<span class="gx-price-val" aria-live="off">${GX.money(p)}</span>` +
      `<span class="gx-price-lbl">${o.label || 'MSRP as configured'}</span>` +
      (note && o.note !== false ? `<span class="gx-photo-note">${I('info')}${esc(note)}</span>` : '') + '</div>';
  }

  // Series price range in the store's format: "Starting At $9,274.00 - $11,449.00".
  function range(st, o) {
    o = o || {};
    const [lo, hi] = GX.priceRange(st.series);
    const note = o.note === false ? '' : GX.photoNote(st);
    return `<div class="gx-range ${o.cls || ''}" data-k="range"><p class="gx-range-val">Starting At ${GX.money2(lo)} - ${GX.money2(hi)}</p>` +
      (note ? `<span class="gx-photo-note">${I('info')}${esc(note)}</span>` : '') + '</div>';
  }

  /* ---------- notice (auto-repairs) ---------- */
  function notice(o) {
    o = o || {};
    const S = GX.store;
    if (!S.changes.length || (S.last && S.last.meta.undo) || GX.noticeDismissed) return `<div class="gx-notice-slot" data-k="notice"></div>`;
    return `<div class="gx-notice-slot" data-k="notice"><div class="gx-notice ${o.cls || ''}" role="status">` +
      `${I('info', 'gx-notice-ic')}<div class="gx-notice-txt">${S.changes.map((c) => `<p>${esc(c.text)}</p>`).join('')}</div>` +
      `<button type="button" class="gx-notice-undo" data-gx-act="undo">${I('arrow-counter-clockwise')}Undo</button>` +
      `<button type="button" class="gx-notice-x" data-gx-act="dismiss" aria-label="Dismiss">${I('x')}</button></div></div>`;
  }

  /* ---------- CTA + checklist ---------- */
  function cta(st, o) {
    o = o || {};
    return `<div class="gx-cta ${o.cls || ''}" data-k="cta">` +
      `<button type="button" class="gx-btn gx-btn--primary" data-gx-act="cart">${I('shopping-cart-simple')}<span>${o.label || 'Add to cart'}</span>${o.withPrice ? `<span class="gx-btn-price">${GX.money(GX.info(st).price)}</span>` : ''}</button>` +
      (o.quote === false ? '' : `<a class="gx-btn gx-btn--ghost" href="${QUOTE_HREF}">${I('chat-circle-text') || ''}<span>Request a quote</span></a>`) +
      '</div>';
  }
  function checklist(st, o) {
    o = o || {};
    const { kind, t } = GX.info(st);
    const powerLine = { lithium: 'Maintenance-free ELiTE lithium — no watering', '48v': 'Proven 48V AC electric drive', gas: 'Fuel-injected 13.5-hp gas engine, quick refuel' }[kind];
    const items = ['Unmatched warranty coverage', 'Premium support for peace of mind', powerLine];
    if (t.spec.height === 'Lifted') items.push('Lifted ride height for rougher terrain');
    if (o.inline) items[0] = 'Unmatched warranty', items[1] = 'Premium support';
    return `<ul class="gx-check${o.inline ? ' gx-check--inline' : ''} ${o.cls || ''}" data-k="check">${items.map((x) => `<li>${I('check-circle-fill')}<span>${esc(x)}</span></li>`).join('')}</ul>`;
  }

  /* ---------- spec rows ---------- */
  function specRows(st, cmp, o) {
    o = o || {};
    const a = GX.specOf(st), b = cmp ? GX.specOf(cmp) : null;
    const s = GX.series(st.series);
    const rows = GX.SPEC_ROWS.filter((r) => (o.keys ? o.keys.includes(r.key) : true))
      .filter((r) => s.trims.some((t) => r.key in { seats: 1, power: 1, colors: 1 } || t.spec[r.key]));
    return `<dl class="gx-spec ${o.cls || ''}" data-k="spec">` + rows.map((r) => {
      const v = a[r.key] || '—', w = b ? (b[r.key] || '—') : v;
      const ch = b && v !== w;
      return `<div class="gx-spec-row${ch ? ' is-changed' : ''}" data-k="sr-${r.key}"><dt>${r.label}</dt><dd>` +
        (ch ? `<span class="gx-spec-was">${esc(v)}</span>${I('arrow-right', 'gx-spec-arrow')}<span class="gx-spec-now">${esc(w)}</span>` : esc(v)) + '</dd></div>';
    }).join('') + '</dl>';
  }

  // Human phrases for "what is different about build B compared with A".
  const FMT = {
    height: (v) => (v === 'Lifted' ? 'Lifted ride height' : 'Standard height'),
    badging: (v) => v + ' badging',
    tires: (v) => (v === 'Upgradeable' ? 'Wheel & tire upgrades' : v + ' tires'),
    tech: (v) => (v === 'Included' ? 'Technology Package' : 'Tech Package optional'),
    seating: (v) => ({ Luxury: 'Luxury seating', 'Premium optional': 'Premium seating optional', Standard: 'Standard seating' }[v] || v),
    colors: (v) => v,
  };
  function diffs(a, b, max) {
    const A = GX.specOf(a), B = GX.specOf(b), out = [];
    if (A.power !== B.power) out.push(B.power);
    // Strong differentiators first, "optional" ones last.
    const weak = (k, v) => /optional|Upgradeable/i.test(v);
    const keys = ['height', 'tech', 'seating', 'colors', 'badging', 'tires'];
    [false, true].forEach((pass) => keys.forEach((k) => { if (B[k] && A[k] !== B[k] && weak(k, B[k]) === pass) out.push(FMT[k](B[k])); }));
    return max ? out.slice(0, max) : out;
  }

  // Groups trims by family when a series has more than 3 trims (Express 6).
  function families(s) {
    const out = [];
    s.trims.forEach((t) => {
      let g = out.find((x) => x.name === t.family);
      if (!g) out.push((g = { name: t.family, trims: [] }));
      g.trims.push(t);
    });
    return out;
  }
  // "Touring ST" -> "ST" inside a family group; Freedom stays "Freedom".
  const shortName = (t) => t.name.replace(t.family, '').trim() || t.name;
  const FAMILY_BLURB = { Valor: 'Value · standard height', Touring: 'Street · standard height', Summit: 'Lifted · trail-ready', Freedom: 'Most customizable' };

  GX.K = { esc, nb, I, radios, radioOne, seriesOptions, trimOptions, powerOptions, colorOptions, colorGroup, swatch, isLight,
    title, price, range, notice, cta, checklist, specRows, diffs, families, shortName, FAMILY_BLURB, QUOTE_HREF, uid: () => ++uid };
})(window.GX = window.GX || {});
