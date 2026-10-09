/* Single reference-inspired PDP hero; catalog and resolver are shared with the saved product. */
(function (GX) {
  const hero = document.querySelector('.elementor-element-767c751');
  if (!hero) return;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Keep the original SVG headline, its black overlay, and its scroll-animation settings.
  const animatedHeadline = hero.querySelector('.elementor-element-ee49e15');
  if (animatedHeadline) animatedHeadline.remove();
  const brochureLink = [...document.querySelectorAll('a')].find(a => /download brochure/i.test(a.textContent));
  const brochureHref = brochureLink ? brochureLink.href : '';
  const quoteLink = document.querySelector('.elementor-element-93aec4f a');
  const quoteHref = quoteLink ? quoteLink.href : '#';
  hero.classList.add('guild-single-hero');
  hero.innerHTML = `<div class="guild-hero-inner"><div class="guild-hero-copy"><h1>EZGO RXV 2</h1><p class="guild-range"></p><ul class="guild-benefits"><li><span>✓</span>Unmatched warranty coverage</li><li><span>✓</span>Premium support for peace of mind</li><li><span>✓</span>Longest-lasting battery technology</li></ul></div><div class="guild-product"><div class="guild-gallery"><button type="button" data-direction="-1" aria-label="Previous cart color">‹</button><img class="guild-cart" alt="" fetchpriority="high"><button type="button" data-direction="1" aria-label="Next cart color">›</button></div><form class="guild-config"><label>Color<div class="guild-color-control"><span class="guild-swatch"></span><select name="color" aria-label="Cart color"></select><span class="guild-caret">⌄</span></div></label><label>DriveTrain<div class="guild-control">${GX.icon('lightning')}<select name="power" aria-label="Drivetrain"></select><span class="guild-caret">⌄</span></div></label><label>Model<div class="guild-control">${GX.icon('gas-pump')}<select name="trim" aria-label="Cart model"></select><span class="guild-caret">⌄</span></div></label><div class="guild-purchase"><span class="guild-selected-price" aria-live="polite"></span><button class="guild-add" type="submit">${GX.icon('shopping-cart-simple')}<span>Add to cart</span></button></div></form><p class="guild-status" role="status" aria-live="polite"></p></div></div>`;
  if (animatedHeadline) hero.appendChild(animatedHeadline);
  if (brochureHref) {
    const brochure = document.createElement('a');
    brochure.className = 'guild-hero-brochure';
    brochure.href = brochureHref;
    brochure.target = '_blank';
    brochure.rel = 'noopener';
    brochure.innerHTML = `${GX.icon('file-pdf')}<span>Download Brochure</span>`;
    hero.querySelector('.guild-benefits').after(brochure);
  }
  const form = hero.querySelector('.guild-config');
  const mobile = document.createElement('div');
  mobile.className = 'guild-mobile-chooser';
  form.after(mobile);
  const dots = document.createElement('div');
  dots.className = 'guild-mobile-dots';
  dots.setAttribute('role', 'group');
  dots.setAttribute('aria-label', 'Cart color navigation');
  mobile.before(dots);
  const desktop = document.createElement('section');
  desktop.className = 'guild-desktop-chooser';
  desktop.setAttribute('aria-label', 'Customize cart');
  hero.querySelector('.guild-hero-inner').appendChild(desktop);
  const localBase = './EZGO RXV 2 ELiTE & Gas Golf Carts for Sale _ Guild Golf Carts_files/';
  function render() {
    const st = GX.store.state, info = GX.info(st);
    const options = (name, list) => { form.elements[name].innerHTML = list.map(([value, label]) => `<option value="${esc(value)}" ${st[name] === value ? 'selected' : ''}>${esc(label)}</option>`).join(''); };
    options('color', GX.colorsOf(info.t).map(c => [c, GX.COLORS[c].name]));
    options('power', GX.powersOf(info.t).map(p => [p, p === 'gas' ? 'Gas' : 'Electric']));
    options('trim', info.s.trims.map(t => [t.id, t.name]));
    desktop.innerHTML = `<header class="guild-desktop-choice-heading"><h2>Customize Cart</h2><div><span>Selected price</span><strong aria-live="polite">${GX.money2(info.price)}</strong></div></header><div class="guild-desktop-choice-row"><label>Color<div class="guild-desktop-select"><span class="guild-desktop-swatch" style="background:${info.color.hex}"></span><select data-choice="color" aria-label="Cart color">${GX.colorsOf(info.t).map(c => `<option value="${c}" ${c === st.color ? 'selected' : ''}>${esc(GX.COLORS[c].name)}</option>`).join('')}</select></div></label><div class="guild-desktop-power"><span>Power</span><div role="group" aria-label="Power">${['electric','gas'].map(power => `<button type="button" data-power="${power}" aria-pressed="${power === st.power}" ${info.t.power[power] ? '' : 'disabled'}>${GX.icon(power === 'gas' ? 'gas-pump' : 'lightning')} ${power === 'gas' ? 'Gas' : 'Electric'}</button>`).join('')}</div></div><label>Model<div class="guild-desktop-select"><select data-choice="trim" aria-label="Cart model">${info.s.trims.map(t => `<option value="${t.id}" ${t.id === st.trim ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div></label><div class="guild-desktop-actions"><a class="guild-desktop-quote" href="${esc(quoteHref)}">Request a Quote ${GX.icon('caret-right')}</a></div></div>`;
    const allMobileColors = GX.COLOR_ORDER.filter(c => info.s.trims.some(t => t.colors.includes(c)));
    const dotColors = allMobileColors;
    const activeDot = Math.min(3, Math.floor(dotColors.indexOf(st.color) * 4 / dotColors.length));
    dots.innerHTML = Array.from({length:4}, (_, index) => {
      const c = dotColors[Math.min(dotColors.length - 1, Math.floor(index * dotColors.length / 4))];
      return `<button type="button" data-color="${c}" aria-label="View ${esc(GX.COLORS[c].name)} cart" aria-pressed="${index === activeDot}"></button>`;
    }).join('');
    hero.querySelector('.guild-swatch').style.background = info.color.hex;
    hero.querySelector('.guild-selected-price').textContent = GX.money2(info.price);
    mobile.innerHTML = `<div class="guild-mobile-brand">E-Z-GO</div><h2>EZGO ${esc(info.s.name)} ${esc(info.t.name)}</h2><div class="guild-mobile-colors"><p><b>Color:</b> ${esc(info.color.name)}</p><div class="guild-mobile-swatches" role="group" aria-label="Cart color">${allMobileColors.map(c => `<button type="button" data-color="${c}" aria-label="${esc(GX.COLORS[c].name)}" aria-pressed="${c === st.color}" style="--swatch:${GX.COLORS[c].hex}"></button>`).join('')}</div></div><div class="guild-mobile-options-row"><div class="guild-mobile-power"><p>Power</p><div role="group" aria-label="Power">${['electric','gas'].map(power => `<button type="button" data-power="${power}" aria-pressed="${power === st.power}" ${info.t.power[power] ? '' : 'disabled'}>${GX.icon(power === 'gas' ? 'gas-pump' : 'lightning')} ${power === 'gas' ? 'Gas' : 'Electric'}</button>`).join('')}</div></div><label class="guild-mobile-model">Model<div class="guild-mobile-model-field"><select aria-label="Cart model">${info.s.trims.map(t => `<option value="${t.id}" ${t.id === st.trim ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div></label></div><div class="guild-mobile-price"><span>Starting at</span><strong aria-live="polite">${GX.money2(info.price)}</strong></div><a class="guild-mobile-quote" href="${esc(quoteHref)}">Request a Quote ${GX.icon('caret-right')}</a>${brochureHref ? `<a class="guild-mobile-brochure" href="${esc(brochureHref)}" target="_blank" rel="noopener">${GX.icon('file-pdf')} Download Brochure</a>` : ''}`;
    const range = GX.priceRange(st.series);
    hero.querySelector('.guild-range').textContent = `Starting at ${GX.money2(range[0])} – ${GX.money2(range[1])}`;
    const photo = hero.querySelector('.guild-cart');
    const file = GX.imageFile(st);
    photo.src = st.trim === 'freedom' && ['forest-green', 'ocean-grey'].includes(st.color) ? localBase + file : GX.imageUrl(st);
    photo.alt = `EZGO ${info.s.name} ${info.t.name} in ${info.color.name}`;
    hero.querySelector('.guild-status').textContent = '';
  }
  dots.addEventListener('click', e => {
    const button = e.target.closest('button[data-color]');
    if (button) GX.store.set({color:button.dataset.color});
  });
  desktop.addEventListener('change', e => { if (e.target.dataset.choice) GX.store.set({[e.target.dataset.choice]:e.target.value}); });
  desktop.addEventListener('click', e => { const b = e.target.closest('button[data-power]'); if (b && !b.disabled) GX.store.set({power:b.dataset.power}); });
  mobile.addEventListener('click', e => {
    const button = e.target.closest('button');
    if (!button || button.disabled) return;
    if (button.dataset.color) GX.store.set({color:button.dataset.color});
    if (button.dataset.power) GX.store.set({power:button.dataset.power});
  });
  mobile.addEventListener('change', e => { if (e.target.matches('select')) GX.store.set({trim:e.target.value}); });
  form.addEventListener('change', e => { GX.store.set({[e.target.name]: e.target.value}); });
  hero.querySelectorAll('[data-direction]').forEach(b => b.addEventListener('click', () => {
    const st = GX.store.state, colors = GX.colorsOf(GX.trim(st.series, st.trim));
    GX.store.set({color: colors[(colors.indexOf(st.color) + Number(b.dataset.direction) + colors.length) % colors.length]});
  }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    hero.querySelector('.guild-status').textContent = `Selected: ${GX.buildName(GX.store.state)} · ${GX.money2(GX.info(GX.store.state).price)}. This local preview does not submit a live order.`;
  });
  GX.store.subscribe(render);
  render();

  // Preserve the photo's original scale and cart/background alignment when removing mobile copy.
  const alignMobileScene = () => {
    const copy = hero.querySelector('.guild-hero-copy');
    if (innerWidth > 767) {
      copy.style.removeProperty('display');
      hero.style.removeProperty('--mobile-scene-size');
      hero.style.removeProperty('--mobile-scene-y');
      return;
    }
    copy.style.setProperty('display', 'block', 'important');
    const fullHeight = hero.getBoundingClientRect().height + 30;
    const removedHeight = copy.getBoundingClientRect().height;
    const width = hero.getBoundingClientRect().width;
    const sceneHeight = Math.max(fullHeight, width / (2048 / 1068));
    const sceneWidth = sceneHeight * (2048 / 1068);
    copy.style.removeProperty('display');
    hero.style.setProperty('--mobile-scene-size', sceneWidth + 'px ' + sceneHeight + 'px');
    hero.style.setProperty('--mobile-scene-y', ((fullHeight - sceneHeight) / 2 - removedHeight) + 'px');
  };
  addEventListener('resize', alignMobileScene);
  addEventListener('load', alignMobileScene);
  if (document.fonts) document.fonts.ready.then(alignMobileScene);
  requestAnimationFrame(alignMobileScene);

  // The quote bar has a real home after the animated headline, before the features.
  const quoteBar = document.querySelector('.elementor-element-0a807ef:not(.elementor-sticky__spacer)');
  if (quoteBar) {
    document.querySelectorAll('.elementor-element-0a807ef.elementor-sticky__spacer').forEach(el => el.remove());
    quoteBar.setAttribute('data-settings', '{"background_background":"classic"}');
    quoteBar.classList.remove('elementor-sticky', 'elementor-sticky--effects', 'elementor-sticky--active', 'elementor-section--handles-inside', 'animated', 'fadeIn');
    quoteBar.removeAttribute('style');
    quoteBar.classList.add('guild-quote-bar');
    const slot = document.createElement('div');
    // Preserve the original Elementor template scope so its translucent styling applies.
    slot.className = 'guild-quote-slot elementor elementor-19615';
    hero.after(slot);
    slot.appendChild(quoteBar);
    const footer = document.querySelector('footer.elementor-location-footer');
    const endSlot = document.createElement('div');
    endSlot.className = 'guild-quote-end-slot';
    if (footer) footer.before(endSlot);
    let scheduled = false;
    const syncQuote = () => {
      scheduled = false;
      const height = quoteBar.getBoundingClientRect().height;
      slot.style.setProperty('--quote-height', height + 'px');
      endSlot.style.setProperty('--quote-height', height + 'px');
      const home = slot.getBoundingClientRect();
      const padding = parseFloat(getComputedStyle(slot).paddingTop) || 0;
      const start = home.top + scrollY + padding;
      const end = footer ? endSlot.getBoundingClientRect().top + scrollY + 16 : Infinity;
      const bottomGap = innerWidth <= 767 ? 10 : 80;
      const screenTop = innerHeight - bottomGap - height;
      // Clamp one continuous position between its two document anchors; never swap bars.
      const documentTop = Math.max(start, Math.min(scrollY + screenTop, end));
      quoteBar.style.setProperty('--quote-top', (documentTop - scrollY) + 'px');
      quoteBar.style.setProperty('--quote-left', (home.left + home.width / 2) + 'px');
      quoteBar.style.setProperty('--quote-width', Math.min(1140, home.width - (innerWidth <= 767 ? 32 : 64)) + 'px');
    };
    const scheduleQuote = () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(syncQuote); }
    };
    addEventListener('scroll', scheduleQuote, { passive: true });
    addEventListener('resize', scheduleQuote);
    if (window.ResizeObserver) new ResizeObserver(scheduleQuote).observe(quoteBar);
    syncQuote();
  }
})(window.GX);
