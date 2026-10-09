/* Guild PDP hero redesign — catalog data (EZGO MY27).
   Sources: RXV 2 = this page's JSON-LD; RXV 4 / Express 6 = staging1.guildgolfcarts.com product data.
   Images live on Guild's CDN; thumbnails are the same name with -300x225. */
(function (GX) {
  GX.IMG_BASE = 'https://959cd70c.delivery.rocketcdn.me/wp-content/uploads/2026/09/';

  // Display order is global so palettes look consistent across trims.
  // hex = median body-panel colour sampled from the product photos (lifted slightly for a dark UI).
  GX.COLORS = {
    'bright-white':      { name: 'Bright White',      hex: '#f1f0ee', file: 'White' },
    'ivory':             { name: 'Ivory',             hex: '#ebe4d5', file: 'Ivory' },
    'almond':            { name: 'Almond',            hex: '#a99c8b', file: 'Almond' },
    'platinum':          { name: 'Platinum',          hex: '#a7a8ad', file: 'Platinum' },
    'slate-grey':        { name: 'Slate Grey',        hex: '#7d7a7b', file: 'Slate' },
    'ocean-grey':        { name: 'Ocean Grey',        hex: '#8ea8b7', file: 'OceanGrey' },
    'metallic-charcoal': { name: 'Metallic Charcoal', hex: '#4b4c4e', file: 'MetallicCharcoal' },
    'black':             { name: 'Black',             hex: '#161616', file: 'Black' },
    'flame-red':         { name: 'Flame Red',         hex: '#c41c1a', file: 'FlameRed' },
    'inferno-red':       { name: 'Inferno Red',       hex: '#8e1a20', file: 'InfernoRed' },
    'electric-blue':     { name: 'Electric Blue',     hex: '#1f4fa0', file: 'ElectricBlue' },
    'patriot-blue':      { name: 'Patriot Blue',      hex: '#1b2a57', file: 'PatriotBlue' },
    'matte-green':       { name: 'Matte Green',       hex: '#3d4b3e', file: 'MatteGreen' },
    'forest-green':      { name: 'Forest Green',      hex: '#135c3e', file: 'ForestGreen' },
  };
  GX.COLOR_ORDER = Object.keys(GX.COLORS);
  // Closest substitute when a colour isn't offered on the new trim.
  GX.NEAR_COLOR = {
    'flame-red': 'inferno-red', 'inferno-red': 'flame-red',
    'electric-blue': 'patriot-blue', 'patriot-blue': 'electric-blue',
    'ivory': 'bright-white', 'almond': 'bright-white',
    'forest-green': 'matte-green', 'matte-green': 'forest-green',
    'slate-grey': 'platinum', 'ocean-grey': 'platinum', 'metallic-charcoal': 'black',
  };

  // Battery/engine types. Each trim offers at most one electric type, so the user-facing
  // choice is always Electric | Gas (or electric-only).
  GX.POWER = {
    '48v':     { cls: 'electric', name: '48V AC Electric', short: '48V Electric', icon: 'lightning', blurb: 'Lead-acid battery pack' },
    'lithium': { cls: 'electric', name: 'ELiTE Lithium',   short: 'ELiTE Lithium', icon: 'battery-charging', blurb: 'Maintenance-free lithium' },
    'gas':     { cls: 'gas',      name: '13.5-hp EFI Gas', short: 'Gas', icon: 'gas-pump', blurb: '13.5-hp fuel-injected engine' },
  };

  const VALOR5 = ['bright-white', 'platinum', 'black', 'inferno-red', 'matte-green'];
  const RXV12 = ['bright-white', 'ivory', 'almond', 'platinum', 'slate-grey', 'ocean-grey', 'metallic-charcoal', 'black', 'inferno-red', 'patriot-blue', 'matte-green', 'forest-green'];
  const E6VALOR4 = ['bright-white', 'platinum', 'black', 'inferno-red'];
  const E6PAL9 = ['bright-white', 'platinum', 'slate-grey', 'ocean-grey', 'metallic-charcoal', 'black', 'flame-red', 'inferno-red', 'electric-blue'];

  // specs: values shown in comparison/spec rows; null = not applicable.
  const SPEC = {
    valorS:  { badging: 'Blacked-out', tires: 'Kenda K500 · 10" steel', height: 'Standard', tech: null, seating: 'Standard' },
    valorSP: { badging: 'Metallic', tires: 'Hole-N-One · 12" alloy', height: 'Standard', tech: null, seating: 'Standard' },
    freedom: { badging: null, tires: 'Upgradeable', height: 'Standard', tech: 'Optional', seating: 'Premium optional' },
  };

  GX.SERIES = [
    {
      id: 'rxv2', name: 'RXV 2', seats: 2, tagline: 'Two-seat golf & neighborhood cart',
      featured: 'RXV2_ValorS2B_MatteGreen_MY27_v39_960x720_1.png',
      trims: [
        { id: 'valor-s', name: 'Valor S', family: 'Valor', rank: 1, equiv: 'valor-s',
          power: { electric: { kind: '48v', price: 9274 }, gas: { price: 9487 } },
          colors: VALOR5, defaultColor: 'matte-green',
          img: 'RXV2_ValorS_{C}_MY27_v39_960x720_1.png',
          highlights: ['Blacked-out badging', 'Kenda K500 traction tires', 'Lowest price'],
          spec: SPEC.valorS },
        { id: 'valor-s-plus', name: 'Valor S+', family: 'Valor', rank: 2, equiv: 'valor-s-plus',
          power: { electric: { kind: '48v', price: 9854 }, gas: { price: 10067 } },
          colors: VALOR5, defaultColor: 'matte-green',
          img: 'RXV2_ValorS_{C}_MY27_v39_960x720_1.png', approx: 'Photo shows Valor S styling',
          imgOverride: { 'matte-green': 'RXV2_ValorS2B_MatteGreen_MY27_v39_960x720_1.png' },
          highlights: ['Metallic badging', 'Hole-N-One turf tires on 12" alloys'],
          spec: SPEC.valorSP },
        { id: 'freedom', name: 'Freedom', family: 'Freedom', rank: 3, equiv: 'freedom',
          power: { electric: { kind: 'lithium', price: 11449 }, gas: { price: 9909 } },
          colors: RXV12, defaultColor: 'forest-green',
          img: 'RXV2_Freedom_{C}_MY27_v39_960x720_1.png',
          imgOverride: { 'matte-green': 'RXV2_Freedom_MatteGreen_MY27_v39_960x720_2.png' },
          highlights: ['12 colors', 'Tech, seating & wheel upgrades', 'Maintenance-free ELiTE option'],
          spec: SPEC.freedom },
      ],
    },
    {
      id: 'rxv4', name: 'RXV 4', seats: 4, tagline: 'Four-seat family & community cart',
      featured: 'RXV4_ValorS2B_Black_MY27_v39_960x720.png',
      trims: [
        { id: 'valor-s', name: 'Valor S', family: 'Valor', rank: 1, equiv: 'valor-s',
          power: { electric: { kind: '48v', price: 10349 }, gas: { price: 10410 } },
          colors: VALOR5, defaultColor: 'black',
          img: 'RXV4_ValorS_{C}_MY27_v39_960x720_1.png',
          imgOverride: { 'matte-green': 'RXV4_ValorS_MatteGreen_MY27_v39_960x720_2.png' },
          highlights: ['Blacked-out badging', 'Kenda K500 traction tires', 'Lowest price'],
          spec: SPEC.valorS },
        { id: 'valor-s-plus', name: 'Valor S+', family: 'Valor', rank: 2, equiv: 'valor-s-plus',
          power: { electric: { kind: '48v', price: 10929 }, gas: { price: 10990 } },
          colors: VALOR5, defaultColor: 'black',
          img: 'RXV4_ValorS_{C}_MY27_v39_960x720_1.png', approx: 'Photo shows Valor S styling',
          imgOverride: { 'black': 'RXV4_ValorS2B_Black_MY27_v39_960x720.png' },
          // EZGO's RXV 4 copy says "blacked-out" for S+; RXV 2 / Express 6 S+ say metallic. Unconfirmed.
          highlights: ['Metallic badging', 'Hole-N-One turf tires on 12" alloys'],
          spec: SPEC.valorSP },
        { id: 'freedom', name: 'Freedom', family: 'Freedom', rank: 3, equiv: 'freedom',
          power: { electric: { kind: 'lithium', price: 11949 }, gas: { price: 10533 } },
          colors: RXV12, defaultColor: 'forest-green',
          img: 'RXV4_Freedom_{C}_MY27_v39_960x720_1.png',
          imgOverride: { 'black': 'RXV4_Freedom_Black_MY27_v39_960x720_2.png' },
          highlights: ['12 colors', 'Tech, seating & wheel upgrades', 'Maintenance-free ELiTE option'],
          spec: SPEC.freedom },
      ],
    },
    {
      id: 'express6', name: 'Express 6', seats: 6, tagline: 'Six-seat touring & lifted trail cart',
      featured: 'Express6_SummitXTL_White_MY27_v25_960x720.png',
      trims: [
        { id: 'valor-s', name: 'Valor S', family: 'Valor', rank: 1, equiv: 'valor-s',
          power: { electric: { kind: '48v', price: 12149 } },
          colors: E6VALOR4, defaultColor: 'black',
          img: 'Express6_ValorS_{C}_MY27_v25_2026_960x720.png',
          imgOverride: { 'platinum': 'Express6_ValorS_Platinum_MY27_v25_2026_960x720-2.png' },
          highlights: ['Blacked-out badging', 'Kenda K500 tires', '48V electric only'],
          spec: { badging: 'Blacked-out', tires: 'Kenda K500', height: 'Standard', tech: null, seating: 'Standard' } },
        { id: 'valor-s-plus', name: 'Valor S+', family: 'Valor', rank: 2, equiv: 'valor-s-plus',
          power: { electric: { kind: '48v', price: 12449 } },
          colors: E6VALOR4, defaultColor: 'black',
          img: 'Express6_ValorS_{C}_MY27_v25_2026_960x720.png', approx: 'Photo shows Valor S styling',
          imgOverride: { 'platinum': 'Express6_ValorS_Platinum_MY27_v25_2026_960x720-2.png' },
          highlights: ['Metallic badging', 'Hole-N-One tires', '48V electric only'],
          spec: { badging: 'Metallic', tires: 'Hole-N-One', height: 'Standard', tech: null, seating: 'Standard' } },
        { id: 'touring-s', name: 'Touring S', family: 'Touring', rank: 3, equiv: 'freedom',
          power: { electric: { kind: 'lithium', price: 14074 }, gas: { price: 14274 } },
          colors: E6PAL9, defaultColor: 'bright-white',
          img: 'Express6_TouringS_{C}_MY27_v25_2026_960x720_1.png',
          imgOverride: { 'ocean-grey': 'Express6_TouringS_OceanGrey_MY27_v25_2026_960x720_2-1.png', 'platinum': 'Express6_TouringS_Platinum_MY27_v25_960x720.png' },
          highlights: ['Premium styling', 'Flexible rear seating', 'Standard ride height'],
          spec: { badging: null, tires: null, height: 'Standard', tech: null, seating: 'Standard' } },
        { id: 'touring-st', name: 'Touring ST', family: 'Touring', rank: 4, equiv: 'freedom',
          power: { electric: { kind: 'lithium', price: 17049 }, gas: { price: 17249 } },
          colors: E6PAL9, defaultColor: 'bright-white',
          img: 'Express6_TouringST_{C}_MY27_v25_2026_960x720.png',
          imgOverride: { 'bright-white': 'Express6_TouringST_White_MY27_v25_2026_960x720-1.png' },
          highlights: ['Technology Package', '10" touchscreen, soundbar, backup camera', 'RGB headlights'],
          spec: { badging: null, tires: null, height: 'Standard', tech: 'Included', seating: 'Standard' } },
        { id: 'touring-stl', name: 'Touring STL', family: 'Touring', rank: 5, equiv: 'freedom',
          power: { electric: { kind: 'lithium', price: 17724 }, gas: { price: 17924 } },
          colors: E6PAL9, defaultColor: 'bright-white',
          img: 'Express6_TouringSTL_{C}_MY27_v25_2026_960x720.png',
          imgOverride: { 'black': 'Express6_TouringSTL_Black_MY27_v25_2026_960x720-1.png' },
          highlights: ['Technology Package', 'Luxury seating'],
          spec: { badging: null, tires: null, height: 'Standard', tech: 'Included', seating: 'Luxury' } },
        { id: 'summit-x', name: 'Summit X', family: 'Summit', rank: 6, equiv: 'freedom',
          power: { electric: { kind: 'lithium', price: 14574 }, gas: { price: 14774 } },
          colors: E6PAL9, defaultColor: 'bright-white',
          img: 'Express6_SummitX_{C}_MY27_v25_960x720.png',
          // Source data maps Summit X charcoal to the wrong colour photo; nearest true-colour photo is Summit XT.
          imgOverride: { 'metallic-charcoal': 'Express6_SummitXT_MetallicCharcoal_MY27_v25_960x720.png' },
          imgApprox: { 'metallic-charcoal': 'Photo shows Summit XT' },
          highlights: ['Lifted ride height', 'More ground clearance', 'Aggressive trail stance'],
          spec: { badging: null, tires: null, height: 'Lifted', tech: null, seating: 'Standard' } },
        { id: 'summit-xt', name: 'Summit XT', family: 'Summit', rank: 7, equiv: 'freedom',
          power: { electric: { kind: 'lithium', price: 17549 }, gas: { price: 17749 } },
          colors: E6PAL9, defaultColor: 'bright-white',
          img: 'Express6_SummitXT_{C}_MY27_v25_960x720.png',
          imgOverride: { 'ocean-grey': 'Express6_SummitXT_OceanGrey_MY27_v25_960x720-1.png', 'platinum': 'Express6_SummitXT_Platinum_MY27_v25_960x720_1.png' },
          highlights: ['Lifted ride height', 'Technology Package'],
          spec: { badging: null, tires: null, height: 'Lifted', tech: 'Included', seating: 'Standard' } },
        { id: 'summit-xtl', name: 'Summit XTL', family: 'Summit', rank: 8, equiv: 'freedom',
          power: { electric: { kind: 'lithium', price: 18049 }, gas: { price: 18249 } },
          colors: E6PAL9, defaultColor: 'bright-white',
          img: 'Express6_SummitXTL_{C}_MY27_v25_960x720.png',
          imgOverride: { 'electric-blue': 'Express6_SummitXTL_ElectricBlue_MY27_v25_960x720-1.png' },
          highlights: ['Lifted', 'Technology Package', 'Luxury seating — most premium'],
          spec: { badging: null, tires: null, height: 'Lifted', tech: 'Included', seating: 'Luxury' } },
      ],
    },
  ];

  GX.SPEC_ROWS = [
    { key: 'seats', label: 'Seats' },
    { key: 'power', label: 'Power' },
    { key: 'height', label: 'Ride height' },
    { key: 'badging', label: 'Badging' },
    { key: 'tires', label: 'Tires' },
    { key: 'tech', label: 'Tech package' },
    { key: 'seating', label: 'Seating' },
    { key: 'colors', label: 'Colors' },
  ];

  // This page is the RXV 2 product page: the series is fixed and only its trims are offered.
  // (The same component serves the RXV 4 / Express 6 product pages by changing this value.)
  GX.PAGE_SERIES = 'rxv2';
  // Default build = what the saved page shows today (variation 52073).
  GX.DEFAULT = { series: 'rxv2', trim: 'freedom', power: 'gas', color: 'forest-green' };
})(window.GX = window.GX || {});
