/* Guild PDP hero redesign — model: catalog helpers, resolver, store. No DOM here. */
(function (GX) {
  const C = GX;

  /* ---------- catalog helpers ---------- */
  const series = (id) => C.SERIES.find((s) => s.id === id);
  const trim = (sId, tId) => (series(sId) || { trims: [] }).trims.find((t) => t.id === tId);
  const powersOf = (t) => ['electric', 'gas'].filter((p) => t.power[p]);
  const kindOf = (t, p) => (p === 'gas' ? 'gas' : t.power.electric && t.power.electric.kind);
  const priceOf = (t, p) => (t.power[p] ? t.power[p].price : null);
  const colorsOf = (t) => C.COLOR_ORDER.filter((c) => t.colors.includes(c));

  function info(st) {
    const s = series(st.series), t = trim(st.series, st.trim);
    const kind = kindOf(t, st.power);
    return { s, t, kind, pw: C.POWER[kind], color: C.COLORS[st.color], price: priceOf(t, st.power) };
  }

  // Every valid build as a flat list (catalog order).
  const variants = [];
  C.SERIES.forEach((s) => s.trims.forEach((t) => powersOf(t).forEach((p) =>
    t.colors.forEach((c) => variants.push({ series: s.id, trim: t.id, power: p, color: c })))));
  const isValid = (st) => variants.some((v) => v.series === st.series && v.trim === st.trim && v.power === st.power && v.color === st.color);

  function imageFile(st) {
    const t = trim(st.series, st.trim);
    if (t.imgOverride && t.imgOverride[st.color]) return t.imgOverride[st.color];
    return t.img.replace('{C}', C.COLORS[st.color].file);
  }
  const imageUrl = (st) => C.IMG_BASE + imageFile(st);
  const thumbUrl = (st) => C.IMG_BASE + imageFile(st).replace(/\.png$/, '-300x225.png');
  function photoNote(st) {
    const t = trim(st.series, st.trim);
    if (t.imgApprox && t.imgApprox[st.color]) return t.imgApprox[st.color];
    if (t.approx && !(t.imgOverride && t.imgOverride[st.color])) return t.approx;
    return '';
  }

  // Price helpers for a series / trim.
  function fromPrice(sId, filter) {
    let min = Infinity;
    series(sId).trims.forEach((t) => powersOf(t).forEach((p) => {
      if (!filter || filter(t, p)) min = Math.min(min, priceOf(t, p));
    }));
    return min === Infinity ? null : min;
  }
  const trimFrom = (t) => Math.min(...powersOf(t).map((p) => priceOf(t, p)));

  // All builds of a series (trim × power), ascending price.
  function builds(sId) {
    const out = [];
    series(sId).trims.forEach((t) => powersOf(t).forEach((p) => out.push({ t, p, kind: kindOf(t, p), price: priceOf(t, p) })));
    return out.sort((a, b) => a.price - b.price || a.t.rank - b.t.rank);
  }

  function specOf(st) {
    const { s, t, kind } = info(st);
    return Object.assign({}, t.spec, {
      seats: s.seats + ' passengers',
      power: C.POWER[kind].name,
      colors: t.colors.length + ' colors',
    });
  }

  const money = (n) => (n == null ? '—' : '$' + Math.round(n).toLocaleString('en-US'));
  // Store format used by the live site ("$9,274.00").
  const money2 = (n) => (n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const priceRange = (sId) => { const b = builds(sId); return [b[0].price, b[b.length - 1].price]; };
  const delta = (n) => (n === 0 ? 'Included' : (n > 0 ? '+' : '−') + money(Math.abs(n)));
  const buildName = (st, opts) => {
    const { s, t, pw, color } = info(st);
    const parts = [s.name + ' ' + t.name, pw.short];
    if (!opts || opts.color !== false) parts.push(color.name);
    return parts.join(' · ');
  };
  const encode = (st) => [st.series, st.trim, st.power, st.color].join('.');
  function decode(str) {
    const [s, t, p, c] = String(str || '').split('.');
    const st = { series: s, trim: t, power: p, color: c };
    return isValid(st) ? st : null;
  }

  /* ---------- resolver ----------
     Keeps every attribute the user explicitly set (the patch), then picks the nearest valid
     build for the rest: same trim (or its cross-series equivalent) > same power class >
     same colour (or nearest substitute). Returns human-readable change notes for anything
     the user did not ask to change. */
  function resolve(prev, patch) {
    const want = Object.assign({}, prev, patch);
    const pT = trim(prev.series, prev.trim);
    let next = want;
    if (!isValid(want)) {
      let best = null, bestScore = -Infinity;
      variants.forEach((v, i) => {
        if (Object.keys(patch).some((k) => v[k] !== patch[k])) return;
        if (v.series !== want.series) return;
        const vT = trim(v.series, v.trim);
        let sc = 0;
        if (!('trim' in patch)) {
          if (v.trim === want.trim) sc += 1000;
          else if (pT && vT.equiv === pT.equiv) sc += 600;
          sc -= Math.abs(vT.rank - (pT ? pT.rank : 1)) * 20;
        }
        if (!('power' in patch)) {
          if (v.power === want.power) sc += 200;
          if (pT && kindOf(vT, v.power) === kindOf(pT, prev.power)) sc += 20;
        }
        if (!('color' in patch)) {
          if (v.color === want.color) sc += 100;
          else if (C.NEAR_COLOR[want.color] === v.color) sc += 60;
          else if (v.color === vT.defaultColor) sc += 30;
        }
        sc -= i * 1e-6; // stable: catalog order wins ties
        if (sc > bestScore) { bestScore = sc; best = v; }
      });
      next = Object.assign({}, best);
    }
    return { state: next, changes: describe(prev, want, next, patch) };
  }

  function describe(prev, want, next, patch) {
    const out = [];
    const s = series(next.series), t = trim(next.series, next.trim);
    const wT = trim(want.series, want.trim) || trim(prev.series, prev.trim);
    if (next.trim !== want.trim && !('trim' in patch)) {
      const why = want.series !== prev.series
        ? `${wT.name} isn't offered on the ${s.name}`
        : `${wT.name} isn't available ${patch.power === 'gas' ? 'with gas' : 'that way'}`;
      out.push({ attr: 'trim', text: `${why} — switched to ${t.name}.` });
    }
    if (next.power !== want.power && !('power' in patch)) {
      out.push({ attr: 'power', text: `${s.name} ${t.name} is ${next.power === 'electric' ? 'electric-only' : 'gas-only'} — switched to ${C.POWER[kindOf(t, next.power)].name}.` });
    } else if (!('power' in patch) && next.power === 'electric' && prev.power === 'electric') {
      const pT = trim(prev.series, prev.trim);
      const a = kindOf(pT, 'electric'), b = kindOf(t, 'electric');
      if (a !== b) out.push({ attr: 'battery', text: `${t.name} runs on ${C.POWER[b].name} instead of ${C.POWER[a].name}.` });
    }
    if (next.color !== want.color && !('color' in patch)) {
      out.push({ attr: 'color', text: `${C.COLORS[want.color].name} isn't offered on ${t.name} — switched to ${C.COLORS[next.color].name}.` });
    }
    return out;
  }

  // What would happen if the user picked this? Used to label options that force a repair.
  function preview(st, patch) {
    const r = resolve(st, patch);
    return { state: r.state, changes: r.changes, price: priceOf(trim(r.state.series, r.state.trim), r.state.power) };
  }

  /* ---------- store (one level of undo) ---------- */
  const subs = [];
  const store = {
    state: Object.assign({}, C.DEFAULT),
    prev: null,
    changes: [],
    last: null, // {patch, before}
    set(patch, meta) {
      const before = this.state;
      const r = resolve(before, patch);
      const same = encode(r.state) === encode(before);
      this.prev = same ? this.prev : before;
      this.state = r.state;
      this.changes = r.changes;
      this.last = { patch, before, meta: meta || {} };
      if (!same || r.changes.length) subs.forEach((fn) => fn(this.state, this));
      return r;
    },
    replace(st) { // no resolution; st must be valid
      this.prev = null; this.changes = []; this.state = Object.assign({}, st);
      this.last = { patch: {}, before: st, meta: { replace: true } };
      subs.forEach((fn) => fn(this.state, this));
    },
    undo() {
      if (!this.prev) return;
      const p = this.prev;
      this.prev = null; this.changes = [];
      this.last = { patch: {}, before: this.state, meta: { undo: true } };
      this.state = p;
      subs.forEach((fn) => fn(this.state, this));
    },
    subscribe(fn) { subs.push(fn); },
  };

  Object.assign(C, {
    series, trim, powersOf, kindOf, priceOf, colorsOf, info, variants, isValid,
    imageFile, imageUrl, thumbUrl, photoNote, fromPrice, trimFrom, builds, specOf,
    money, money2, priceRange, delta, buildName, encode, decode, resolve, preview, store,
  });
})(typeof window !== 'undefined' ? (window.GX = window.GX || {}) : (module.exports = global.GX = global.GX || {}));
