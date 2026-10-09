/* Guild PDP hero redesign — page adapter + presentation chrome.
   - Mounts the active variation into #gx-root (left hero column) via a small DOM morph.
   - Owns a shadow product photo so the page's own Woo/Elementor scripts can't overwrite it.
   - Intercepts gallery arrows / swipes so they cycle colours in the new state.
   - Renders the variation switcher, notes panel, live region, toast and optional sticky bar
     into a body-level layer (#gx-ui) because the hero has transformed ancestors. */
(function (GX) {
  const VARS = (GX.VARS = GX.VARS || []);
  GX.register = (v) => { VARS.push(v); VARS.sort((a, b) => a.n - b.n); };
  const K = () => GX.K;
  const I = (n, c) => GX.icon(n, c);
  const qs = (s, el) => (el || document).querySelector(s);
  const params = new URLSearchParams(location.search);
  const TEST = params.has('gx-test');
  const CHROME = params.get('gx-chrome') !== '0';

  let cur = null;          // active variation
  let root, vlayer, ui, photo, slide, menuOpen = false, notesOpen = false;
  const local = {};        // per-variation UI state, survives switching back and forth

  /* ---------------- DOM morph ---------------- */
  function morphInto(container, html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    morphChildren(container, tpl.content);
  }
  function morphChildren(from, to) {
    const tc = Array.from(to.childNodes);
    tc.forEach((t, i) => {
      let f = from.childNodes[i];
      const key = t.nodeType === 1 && t.getAttribute('data-k');
      if (key) {
        let m = null;
        for (const c of from.children) if (c.getAttribute('data-k') === key) { m = c; break; }
        if (m && m !== f) { from.insertBefore(m, f || null); f = m; }
      }
      if (!f) from.appendChild(document.importNode(t, true));
      else if (f.nodeType !== t.nodeType || f.nodeName !== t.nodeName || (key && f.getAttribute('data-k') !== key)) from.replaceChild(document.importNode(t, true), f);
      else if (f.nodeType !== 1) { if (f.nodeValue !== t.nodeValue) f.nodeValue = t.nodeValue; }
      else morphEl(f, t);
    });
    while (from.childNodes.length > tc.length) from.removeChild(from.lastChild);
  }
  function morphEl(f, t) {
    for (const a of Array.from(f.attributes)) if (!t.hasAttribute(a.name)) f.removeAttribute(a.name);
    for (const a of Array.from(t.attributes)) if (f.getAttribute(a.name) !== a.value) f.setAttribute(a.name, a.value);
    if (f.tagName === 'INPUT') { f.checked = t.hasAttribute('checked'); f.disabled = t.hasAttribute('disabled'); }
    morphChildren(f, t);
  }

  /* ---------------- rendering ---------------- */
  const api = {
    get store() { return GX.store; },
    get state() { return GX.store.state; },
    get ui() { return cur ? (local[cur.id] = local[cur.id] || (cur.init ? cur.init() : {})) : {}; },
    set: (patch, meta) => GX.store.set(patch, meta),
    refresh: () => render(),
    get layer() { return vlayer; },
    get root() { return root; },
    dodge: () => dodgeQuoteBar(),
    toast,
  };
  GX.api = api;

  function render(fresh) {
    if (!cur) return;
    const out = cur.render(GX.store.state, api);
    const html = typeof out === 'string' ? out : out.root;
    const layer = typeof out === 'string' ? '' : out.layer || '';
    if (fresh) { root.innerHTML = ''; vlayer.innerHTML = ''; }
    morphInto(root, html);
    morphInto(vlayer, layer);
    if (cur.after) cur.after(root, api, vlayer);
    sticky();
    if (ui) dodgeQuoteBar();
  }

  function activate(n, opts) {
    const v = VARS.find((x) => x.n === n) || null;
    if (cur && cur.leave) cur.leave(api);
    cur = n === 0 ? null : v;
    document.body.className = document.body.className.replace(/\bgx-v\d+\b/g, '').trim();
    document.body.classList.toggle('gx-on', !!cur);
    if (cur) document.body.classList.add('gx-v' + cur.n);
    root.hidden = !cur;
    GX.noticeDismissed = true; // don't replay an old notice in a new layout
    if (cur) { render(true); syncPhoto(true); } else { root.innerHTML = ''; vlayer.innerHTML = ''; sticky(); }
    paintSwitcher();
    if (!(opts && opts.silent)) persist();
  }

  /* ---------------- events ---------------- */
  // The saved page runs WP Rocket's delayed-JS loader. Until the site's own scripts have downloaded, it
  // swallows every mousedown/mouseup/click before any other script sees them and replays them afterwards
  // (on a slow connection that's seconds). Pointer events pass through, so when a press on one of our
  // controls produces no mousedown, the control acts on pointerup and the replayed click is skipped.
  let owed = 0, replayUntil = 0;
  addEventListener('rocket-allScriptsLoaded', () => { replayUntil = performance.now() + 800; });
  const isReplay = (e) => {
    if (e.isTrusted || !owed || performance.now() > replayUntil) return false;
    owed--; e.preventDefault(); return true;
  };
  function pick(inp) {
    if (!inp || inp.disabled) return;
    const attr = inp.getAttribute('data-gx-attr');
    if (attr.startsWith('ui:')) { const k = attr.slice(3); if (api.ui[k] !== inp.value) { api.ui[k] = inp.value; render(); } return; }
    const patch = inp.hasAttribute('data-gx-patch') ? JSON.parse(inp.getAttribute('data-gx-patch')) : { [attr]: inp.value };
    const st = GX.store.state;
    if (Object.keys(patch).every((k) => st[k] === patch[k])) return; // already selected
    GX.store.set(patch, { source: cur && cur.id, attr });
    if (cur && cur.picked) cur.picked(attr, api);
  }
  // Activate an option or action button; returns false if `t` isn't one of ours.
  const HIT = 'label.gx-opt, input[data-gx-attr], [data-gx-act]';
  function activateEl(el, t, e) {
    const opt = t.closest('label.gx-opt, input[data-gx-attr]');
    if (opt && el.contains(opt)) {
      pick(opt.matches('input') ? opt : opt.querySelector('input[data-gx-attr]'));
      setTimeout(() => { if (cur) render(); }, 0); // re-sync radios if the native click gets cancelled
      return true;
    }
    const b = t.closest('[data-gx-act]');
    if (!b || !el.contains(b)) return false;
    const act = b.getAttribute('data-gx-act');
    if (act === 'undo') GX.store.undo();
    else if (act === 'dismiss') { GX.noticeDismissed = true; render(); }
    else if (act === 'cart') { e.preventDefault(); toast(`${I('check-circle-fill')}<span><b>Added to cart</b> (prototype) — ${K().esc(GX.buildName(GX.store.state))} · ${GX.money(GX.info(GX.store.state).price)}</span>`); }
    else if (cur && cur.act && cur.act[act]) { e.preventDefault(); cur.act[act](b, api, e); }
    return true;
  }
  function bind(el) {
    el.addEventListener('change', (e) => {
      const inp = e.target.closest('input[data-gx-attr]');
      if (inp && inp.checked) pick(inp);
    });
    let down = null, early = null;
    el.addEventListener('click', (e) => {
      if (isReplay(e)) return;
      // A real click that arrives anyway right after we acted on its pointerup (the loader had already finished).
      if (early && e.isTrusted && performance.now() - early.t < 1000 && e.target.closest(HIT) === early.hit) { early = null; owed = Math.max(0, owed - 1); e.preventDefault(); return; }
      activateEl(el, e.target, e);
    });
    el.addEventListener('pointerdown', (e) => { down = e.button === 0 && e.isPrimary ? { hit: e.target.closest(HIT), mouse: false } : null; });
    el.addEventListener('mousedown', () => { if (down) down.mouse = true; });
    el.addEventListener('pointerup', (e) => {
      const d = down; down = null;
      if (!d || !d.hit || d.mouse || e.button !== 0 || e.target.closest(HIT) !== d.hit) return;
      // No mousedown reached us: mouse events are being held back, so act now (touch lands here too;
      // its real click is then de-duplicated above).
      if (activateEl(el, d.hit, e)) { owed++; early = { hit: d.hit, t: performance.now() }; }
    });
    const hov = (e, on) => {
      const h = e.target.closest && e.target.closest('[data-gx-hover]');
      if (!h || !cur || !cur.hover) return;
      cur.hover(on ? h : null, api);
    };
    el.addEventListener('pointerover', (e) => hov(e, true));
    el.addEventListener('pointerout', (e) => { if (!e.relatedTarget || !e.target.closest('[data-gx-hover]') || !e.target.closest('[data-gx-hover]').contains(e.relatedTarget)) hov(e, false); });
    el.addEventListener('focusin', (e) => hov(e, true));
    el.addEventListener('focusout', (e) => hov(e, false));
  }

  /* ---------------- photo ---------------- */
  let photoToken = 0;
  function setupPhoto() {
    slide = qs('.side-prod-img .woocommerce-product-gallery__wrapper > div:first-child');
    if (!slide) return;
    const a = slide.querySelector('a') || slide;
    const orig = a.querySelector('img:not(.gx-photo)');
    if (!photo) {
      photo = document.createElement('img');
      photo.className = 'gx-photo';
      photo.alt = '';
      photo.decoding = 'async';
      photo.width = 960; photo.height = 720;
      // Reuse the page's local copy only if it really is the default build's photo — the page's own
      // scripts sometimes swap the original to the featured (Valor S+) image before we boot.
      const cur0 = orig ? decodeURIComponent(orig.currentSrc || orig.src || '') : '';
      if (cur0 && cur0.endsWith(GX.imageFile(GX.DEFAULT))) { photo.src = orig.currentSrc || orig.src; photo.dataset.src = GX.imageUrl(GX.DEFAULT); }
      else photo.dataset.src = '';
    }
    if (!a.contains(photo)) (orig && orig.parentNode === a ? orig.after(photo) : a.appendChild(photo));
  }
  function syncPhoto(force) {
    if (!photo || !cur) return;
    const st = GX.store.state;
    const url = GX.imageUrl(st);
    photo.alt = 'EZGO ' + GX.buildName(st);
    if (photo.dataset.src === url && !force) { slide.classList.remove('gx-pulse'); void slide.offsetWidth; slide.classList.add('gx-pulse'); return; }
    if (photo.dataset.src === url) return;
    const token = ++photoToken;
    slide.classList.add('gx-swapping');
    const im = new Image();
    im.onload = () => { if (token !== photoToken) return; photo.src = url; photo.dataset.src = url; slide.classList.remove('gx-swapping'); };
    im.onerror = () => { if (token !== photoToken) return; slide.classList.remove('gx-swapping'); console.warn('[gx] photo failed to load', url); };
    im.src = url;
  }
  function cycleColor(dir) {
    const st = GX.store.state;
    const list = GX.colorsOf(GX.trim(st.series, st.trim));
    const i = list.indexOf(st.color);
    GX.store.set({ color: list[(i + dir + list.length) % list.length] }, { source: 'gallery' });
  }
  function interceptGallery() {
    let x0 = null, y0 = null;
    const inGallery = (t) => t && t.closest && t.closest('.elementor-element-1c20dee');
    let downArrow = null, arrowEarly = 0;
    window.addEventListener('pointerdown', (e) => { downArrow = cur && e.button === 0 && e.target.closest && inGallery(e.target) ? e.target.closest('.nav-arrow') : null; if (downArrow) downArrow.__gxMouse = false; }, true);
    window.addEventListener('pointerup', (e) => {
      const a = downArrow; downArrow = null;
      if (!a || a.__gxMouse || !e.target.closest || e.target.closest('.nav-arrow') !== a) return;
      owed++; arrowEarly = performance.now(); cycleColor(a.classList.contains('prev') ? -1 : 1);
    }, true);
    window.addEventListener('mousedown', () => { if (downArrow) downArrow.__gxMouse = true; }, true);
    ['click', 'touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach((type) => {
      window.addEventListener(type, (e) => {
        if (!cur || !inGallery(e.target)) return;
        e.stopPropagation();
        if (type === 'click' && isReplay(e)) return;
        if (type === 'click') {
          const arrow = e.target.closest('.nav-arrow');
          if (arrow && e.isTrusted && performance.now() - arrowEarly < 1000) { arrowEarly = 0; owed = Math.max(0, owed - 1); e.preventDefault(); }
          else if (arrow) { e.preventDefault(); cycleColor(arrow.classList.contains('prev') ? -1 : 1); }
          else if (e.target.closest('a')) e.preventDefault();
        } else if (type === 'touchstart') { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }
        else if (type === 'touchend' && x0 != null) {
          const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) cycleColor(dx < 0 ? 1 : -1);
          x0 = null;
        } else if (type === 'touchcancel') x0 = null;
      }, { capture: true, passive: type !== 'click' });
    });
    // Page templates may rebuild the gallery wrapper; keep the shadow photo attached.
    const g = qs('.side-prod-img');
    if (g) new MutationObserver(() => { if (photo && !document.contains(photo)) { setupPhoto(); syncPhoto(true); } }).observe(g, { childList: true, subtree: true });
  }

  /* ---------------- chrome: switcher, notes, live, toast, sticky ---------------- */
  function buildUI() {
    ui = document.createElement('div');
    ui.id = 'gx-ui';
    if (!CHROME) ui.classList.add('gx-nochrome');
    ui.innerHTML =
      `<div class="gx-live gx-sr" aria-live="polite" aria-atomic="true"></div>` +
      `<div class="gx-toast" role="status" aria-live="polite"></div>` +
      `<div id="gx-vlayer"></div>` +
      `<div class="gx-sticky" aria-hidden="true"></div>` +
      `<nav class="gx-switch" aria-label="Design variations">` +
        `<div class="gx-switch-menu" id="gx-switch-menu" hidden></div>` +
        `<div class="gx-switch-bar">` +
          `<button type="button" class="gx-sb-btn" data-sw="prev" aria-label="Previous variation (key [)">${I('caret-left')}</button>` +
          `<button type="button" class="gx-sb-main" data-sw="menu" aria-expanded="false" aria-controls="gx-switch-menu"></button>` +
          `<button type="button" class="gx-sb-btn" data-sw="next" aria-label="Next variation (key ])">${I('caret-right')}</button>` +
          `<button type="button" class="gx-sb-btn gx-sb-notes" data-sw="notes" aria-label="Design notes" aria-expanded="false">${I('info')}</button>` +
        `</div>` +
      `</nav>` +
      `<aside class="gx-notes" aria-label="Design notes" hidden></aside>`;
    document.body.appendChild(ui);
    vlayer = qs('#gx-vlayer', ui);
    bind(vlayer);
    ui.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sw]');
      if (!b) return;
      const k = b.getAttribute('data-sw');
      if (k === 'prev') step(-1);
      else if (k === 'next') step(1);
      else if (k === 'menu') toggleMenu();
      else if (k === 'notes') toggleNotes();
      else if (k === 'go') { activate(+b.getAttribute('data-n')); toggleMenu(false); }
      else if (k === 'close-notes') toggleNotes(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { if (menuOpen) toggleMenu(false); if (notesOpen) toggleNotes(false); }
      const t = e.target;
      if (e.ctrlKey || e.metaKey || e.altKey || (t && (t.closest('input,textarea,select,[contenteditable]')))) return;
      if (e.key === '[') step(-1);
      else if (e.key === ']') step(1);
      else if (/^[1-9]$/.test(e.key) && VARS.some((v) => v.n === +e.key)) activate(+e.key);
    });
    document.addEventListener('click', (e) => { if (menuOpen && !e.target.closest('.gx-switch')) toggleMenu(false); });
  }
  const allVars = () => VARS;
  function step(d) {
    const list = allVars(), i = Math.max(0, list.findIndex((v) => v.n === (cur ? cur.n : 1)));
    activate(list[(i + d + list.length) % list.length].n);
  }
  function paintSwitcher() {
    const v = cur || VARS[0];
    const total = VARS.length;
    qs('.gx-sb-main', ui).innerHTML = `<span class="gx-sb-n">V${v.n}<small>/${total}</small></span><span class="gx-sb-name">${v.name}</span>${I('caret-down', 'gx-sb-caret')}`;
    qs('.gx-switch-menu', ui).innerHTML = `<p class="gx-sm-title">Hero selector — ${total} variations</p>` + allVars().map((x) =>
      `<button type="button" class="gx-sm-item${x === v ? ' is-on' : ''}" data-sw="go" data-n="${x.n}" aria-current="${x === v}">` +
      `<span class="gx-sm-n">${x.n}</span><span class="gx-sm-txt"><b>${x.name}</b><small>${x.short}</small></span></button>`).join('') +
      `<p class="gx-sm-keys">Keys: <kbd>[</kbd> <kbd>]</kbd> step · <kbd>1</kbd>–<kbd>${total}</kbd> jump</p>`;
    paintNotes();
  }
  function paintNotes() {
    const v = cur || VARS[0], n = v.notes || {};
    const list = (a) => Array.isArray(a) ? `<ul>${a.map((x) => `<li>${x}</li>`).join('')}</ul>` : `<p>${a}</p>`;
    qs('.gx-notes', ui).innerHTML =
      `<header><span class="gx-notes-n">Variation ${v.n}</span><h2>${v.name}</h2>` +
      `<button type="button" class="gx-sb-btn" data-sw="close-notes" aria-label="Close notes">${I('x')}</button></header>` +
      (n.idea ? `<section><h3>Idea</h3>${list(n.idea)}</section>` : '') +
      (n.bestFor ? `<section><h3>Best for</h3>${list(n.bestFor)}</section>` : '') +
      (n.pros ? `<section><h3>Why it works</h3>${list(n.pros)}</section>` : '') +
      (n.tradeoffs ? `<section><h3>Trade-offs</h3>${list(n.tradeoffs)}</section>` : '') +
      (n.edge ? `<section><h3>Edge cases</h3>${list(n.edge)}</section>` : '') +
      (n.basis ? `<section class="gx-notes-basis"><h3>Research basis</h3>${list(n.basis)}</section>` : '') +
      `<p class="gx-notes-foot">This is the RXV 2 product page, so the series is fixed. The same component lists the RXV 4 or Express 6 trims on those products' own pages (set <code>GX.PAGE_SERIES</code>).</p>`;
  }
  function toggleMenu(force) {
    menuOpen = force == null ? !menuOpen : force;
    qs('.gx-switch-menu', ui).hidden = !menuOpen;
    qs('.gx-sb-main', ui).setAttribute('aria-expanded', menuOpen);
    if (menuOpen) { toggleNotes(false); const on = qs('.gx-sm-item.is-on', ui); on && on.focus(); }
  }
  function toggleNotes(force) {
    notesOpen = force == null ? !notesOpen : force;
    qs('.gx-notes', ui).hidden = !notesOpen;
    qs('.gx-sb-notes', ui).setAttribute('aria-expanded', notesOpen);
    if (notesOpen) toggleMenu(false);
  }

  let toastTimer;
  function toast(html) {
    const t = qs('.gx-toast', ui);
    t.innerHTML = html;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 3200);
  }
  function announce(st, changes) {
    const live = qs('.gx-live', ui);
    live.textContent = `${GX.buildName(st)}, ${GX.money(GX.info(st).price)}. ${changes.map((c) => c.text).join(' ')}`;
  }

  // Optional sticky purchase bar (variations opt in with `sticky: true`; phones only via CSS).
  let io, ctaVisible = true;
  function sticky() {
    const bar = qs('.gx-sticky', ui);
    if (!cur || !cur.sticky) { if (io) { io.disconnect(); io = null; } bar.classList.remove('is-on'); bar.setAttribute('aria-hidden', 'true'); return; }
    const st = GX.store.state;
    bar.innerHTML = `<img src="${GX.thumbUrl(st)}" alt="" width="64" height="48"><div class="gx-sticky-txt"><b>${K().esc(GX.series(st.series).name + ' ' + GX.trim(st.series, st.trim).name)}</b><span>${K().esc(GX.info(st).pw.short + ' · ' + GX.COLORS[st.color].name)}</span></div>` +
      `<span class="gx-sticky-price">${GX.money(GX.info(st).price)}</span><button type="button" class="gx-btn gx-btn--primary gx-btn--sm" data-gx-act="cart">Add to cart</button>`;
    if (io) { io.disconnect(); io = null; }
    stickyCheck();
  }
  // Show the bar only once the shopper has scrolled PAST the hero CTA (a CTA below the fold doesn't
  // count). Checked on every scroll frame so fast jumps past the CTA aren't missed.
  function stickyCheck() {
    const bar = ui && qs('.gx-sticky', ui);
    if (!bar || !cur || !cur.sticky) return;
    const cta = qs('.gx-cta', root);
    const passed = !!cta && cta.getBoundingClientRect().bottom <= 0;
    if (bar.classList.contains('is-on') !== passed) { bar.classList.toggle('is-on', passed); bar.setAttribute('aria-hidden', !passed); }
  }

  // Keep floating chrome above the site's own sticky "Request a Quote" bar.
  function dodgeQuoteBar() {
    const bar = qs('.elementor-element-0a807ef');
    const dock = vlayer && qs('.gx-dock', vlayer); // a variation's own docked bar replaces the site bar
    let off = 16;
    const dr = dock && dock.getBoundingClientRect();
    if (dr && dr.height && dr.top < innerHeight - 4) {
      off = Math.max(16, innerHeight - dr.top + 10);
    } else if (bar) {
      const r = bar.getBoundingClientRect();
      if (r.height && r.top < innerHeight && r.bottom > innerHeight - 220) off = Math.max(16, innerHeight - r.top + 10);
    }
    ui.style.setProperty('--gx-bottom', off + 'px');
  }

  // The hero background is `cover`, so its zoom depends on the hero's height — which each
  // variation changes. Measure the ORIGINAL hero height once (and on resize) so the zoomed-out
  // background (gx.css, --gx-hero0) looks identical in every variation.
  function measureHero0() {
    const hero = qs('.elementor-element-767c751');
    if (!hero) return;
    const on = document.body.classList.contains('gx-on'), hid = root.hidden;
    if (on) { document.body.classList.remove('gx-on'); root.hidden = true; }
    const h = hero.offsetHeight; // forced sync layout; nothing paints in between
    if (on) { document.body.classList.add('gx-on'); root.hidden = hid; }
    if (h) document.documentElement.style.setProperty('--gx-hero0', h + 'px');
  }

  /* ---------------- persistence ---------------- */
  function persist() {
    const v = cur ? cur.n : 0;
    const h = `#v=${v}&b=${GX.encode(GX.store.state)}`;
    try { history.replaceState(null, '', h); } catch (e) { /* file:// in some browsers */ }
    try { localStorage.setItem('gx-v', v); localStorage.setItem('gx-b', GX.encode(GX.store.state)); } catch (e) { /* storage blocked */ }
  }
  function restore() {
    const h = new URLSearchParams(location.hash.replace(/^#/, ''));
    let v = h.get('v'), b = h.get('b');
    if (v == null && /^#v\d+$/.test(location.hash)) v = location.hash.slice(2);
    if (v == null) v = params.get('v');
    try { if (v == null) v = localStorage.getItem('gx-v'); if (!b) b = localStorage.getItem('gx-b'); } catch (e) { /* storage blocked */ }
    const st = GX.decode(b);
    if (st && st.series === GX.PAGE_SERIES) GX.store.replace(st); // builds from other series' pages are ignored
    v = parseInt(v, 10);
    return Number.isFinite(v) && VARS.some((x) => x.n === v) ? v : 1;
  }

  /* ---------------- boot ---------------- */
  let restoring = false;
  function boot() {
    root = qs('#gx-root');
    if (!root) return console.warn('[gx] #gx-root missing');
    if (TEST) document.documentElement.classList.add('gx-test');
    buildUI();
    bind(root);
    setupPhoto();
    interceptGallery();
    GX.store.subscribe((st, S) => {
      GX.noticeDismissed = false;
      render();
      syncPhoto();
      announce(st, S.changes);
      if (!restoring) persist(); // during a hash restore the variation hasn't switched yet
    });
    measureHero0(); // page is still in its original layout here
    restoring = true;
    const first = restore();
    restoring = false;
    activate(first, { silent: true });
    persist();
    dodgeQuoteBar();
    let raf = 0, rz = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (cur && cur.onScroll) cur.onScroll(api); stickyCheck(); dodgeQuoteBar(); }); };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    addEventListener('resize', () => { if (cur && cur.onResize) cur.onResize(api); });
    // Variations may render differently on phones; re-render when crossing the breakpoint.
    const mq = matchMedia('(max-width: 767px)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(() => render());
    addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(measureHero0, 150); });
    if (document.readyState !== 'complete') addEventListener('load', () => { measureHero0(); if (cur && cur.onResize) cur.onResize(api); });
    addEventListener('hashchange', () => {
      restoring = true;
      const n = restore();
      restoring = false;
      activate(n, { silent: true });
      persist();
    });
    document.documentElement.classList.add('gx-ready');
  }
  // Wait for the page's own scripts (which cache the original title/price/photo) to settle — but don't
  // let a slow third-party font or tracker (which holds back `load`) keep the redesign hidden.
  let booted = false;
  const start = () => { if (!booted) { booted = true; boot(); } };
  if (document.readyState === 'complete') setTimeout(start, 0);
  else {
    addEventListener('load', () => setTimeout(start, 0));
    const soon = () => setTimeout(start, 2500);
    if (document.readyState === 'interactive') soon(); else addEventListener('DOMContentLoaded', soon);
  }
})(window.GX = window.GX || {});
