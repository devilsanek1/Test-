// type.js — the type guide's system as an SVG layout helper for the stills (docs/look/TYPE_GUIDE.md, DRAFT).
// Loaded by the still pages in scripts/type/stills/ (<script src="../lib/type.js">). Every word is an SVG <text>
// placed by its BASELINE (y) and its ink start / centre / end (x), so a still's numbers are the guide's numbers.
//
//   const S = TYPE.stage();                       // the 1080 x 1920 SVG over the page's #stage
//   TYPE.text(S, {t: 'Did you know', x: 120, y: 395, role: 'hand', size: 136, tone: 'night'});
//   TYPE.group(S, {seat: 'C', baselines: [395, 515], step: 100, lines: ['on giant', 'computers,'], tone: 'night'});
//   window.__ready = TYPE.run(() => { ...the layout... });   // fonts first, then the layout; render.mjs waits for it
//
// Roles (§b): hand = Gaegu (300 on night / dusk skies, 400 on light; 700 for the stress), brush = Nanum Brush Script 400
// (retired by PLEASANT.md; kept for the record); any other CSS family by `font`. Tones (§b colours): night = warm white
// #FFF0DE + the dark halo; light = deep plum #3A2B48 (no halo unless asked). `accent: true` = C.accentNight / C.accentLight (see C). Tracking +0.02 em unless set. `italic: true`;
// `glow: true | {color, a, r}` = the warm glow instead of the halo; `stress: true` = the lit hand (the hand's Bold in
// the accent with the tone's glow; `bloom: 0-1` = its entrance caught mid-way); TYPE.wash(svg, placedWord, o) = a soft
// painted wash behind a word (PLEASANT.md option D).
// x is the INK edge (start / end) or the ink centre (middle), measured with canvas actualBoundingBox*, so "from x 130"
// and "right-aligned near x 920" mean the visible letters, not the advance box.
(function () {
  const C = {
    hand: 'Gaegu', brush: 'Nanum Brush Script',
    warm: '#FFF0DE', amber: '#FFB868', amberLight: '#FFC98A', umber: '#2B1B0A', burnt: '#8E3A12',
    // the pleasantness pass (docs/look/type/PLEASANT.md): a softer deep plum ink for light skies, the windows' honey
    // light for night skies, and the warm glows (golden on night, a soft peach-gold on light skies)
    plum: '#3A2B48', honey: '#FFD58C', glowNight: '255,184,92', glowLight: '255,214,160',
    haloNight: '20,26,58', haloLight: '255,255,255',
    seats: {L: 440, C: 520, R: 600},
  };
  // the running ink and the accent per tone (TYPE_GUIDE §b, after PLEASANT.md: the brush and the burnt colour retired):
  // light skies: plum ink, and the stress keeps the ink (its warmth is the halo's light); night: warm white, honey light
  C.inkLight = C.plum; C.accentLight = C.plum; C.accentNight = C.honey;
  const NS = 'http://www.w3.org/2000/svg';
  const ctx = document.createElement('canvas').getContext('2d');
  const log = [];

  function fontOf(o) {
    const fam = o.font || (o.role === 'brush' ? C.brush : C.hand);
    const w = o.weight || (o.stress ? 700 : (o.role === 'brush' ? 400 : (o.tone === 'light' ? 400 : 300)));
    return {fam, w, size: o.size || 116, track: o.track ?? 0.02, it: o.italic ? 'italic ' : ''};
  }
  // ink metrics of a string (advance with tracking, ink left / right relative to the origin, ascent / descent)
  function measure(t, o) {
    const f = fontOf(o);
    ctx.font = `${f.it}${f.w} ${f.size}px '${f.fam}'`;
    ctx.letterSpacing = `${f.track * f.size}px`;
    const m = ctx.measureText(t);
    // canvas includes the trailing letter-spacing in the advance; SVG does too
    return {adv: m.width, left: -m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight - f.track * f.size,
            asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent, f};
  }
  function stage(id = 'stage') {
    const host = document.getElementById(id);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', 1080); svg.setAttribute('height', 1920); svg.setAttribute('viewBox', '0 0 1080 1920');
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;z-index:10';
    svg.appendChild(document.createElementNS(NS, 'defs'));
    host.appendChild(svg);
    return svg;
  }
  // the halo (§b): text-shadow 0 0 0.22em at 40 % + 0 0 0.06em at 25 %, in the sky's darker (or lighter) tone, no offset
  function haloFilter(svg, size, kind, strength = 1) {
    const id = `halo_${kind}_${Math.round(size)}_${Math.round(strength * 100)}`;
    if (svg.querySelector('#' + id)) return id;
    const rgb = kind === 'light' ? C.haloLight : C.haloNight;
    const a1 = (kind === 'light' ? 0.30 : 0.40) * strength, a2 = (kind === 'light' ? 0 : 0.25) * strength;
    const f = document.createElementNS(NS, 'filter');
    f.setAttribute('id', id); f.setAttribute('x', '-30%'); f.setAttribute('y', '-60%'); f.setAttribute('width', '160%'); f.setAttribute('height', '220%');
    f.setAttribute('color-interpolation-filters', 'sRGB');
    // CSS text-shadow blur radius r = Gaussian sigma 2x: sigma = r / 2
    f.innerHTML = `
      <feGaussianBlur in="SourceAlpha" stdDeviation="${(0.22 * size) / 2}" result="b1"/>
      <feFlood flood-color="rgb(${rgb})" flood-opacity="${a1}"/><feComposite in2="b1" operator="in" result="s1"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="${(0.06 * size) / 2}" result="b2"/>
      <feFlood flood-color="rgb(${rgb})" flood-opacity="${a2}"/><feComposite in2="b2" operator="in" result="s2"/>
      <feMerge><feMergeNode in="s1"/><feMergeNode in="s2"/><feMergeNode in="SourceGraphic"/></feMerge>`;
    svg.querySelector('defs').appendChild(f);
    return id;
  }
  // the warm glow (PLEASANT.md): a soft, wide light behind a word, no edge; on night skies the golden glow under the
  // dark halo's contrast, on light skies a soft peach-gold light under dark ink. g: {color 'r,g,b', a, r (em), halo}
  function glowFilter(svg, size, kind, g = {}) {
    const color = g.color || (kind === 'light' ? C.glowLight : C.glowNight);
    const a = g.a ?? (kind === 'light' ? 0.95 : 0.42), r = g.r ?? 0.34;
    const id = `glow_${kind}_${Math.round(size)}_${color.replace(/,/g, '_')}_${Math.round(a * 100)}_${Math.round(r * 100)}`;
    if (svg.querySelector('#' + id)) return id;
    const f = document.createElementNS(NS, 'filter');
    f.setAttribute('id', id); f.setAttribute('x', '-40%'); f.setAttribute('y', '-80%'); f.setAttribute('width', '180%'); f.setAttribute('height', '260%');
    f.setAttribute('color-interpolation-filters', 'sRGB');
    const dark = kind === 'light' ? '' : `
      <feGaussianBlur in="SourceAlpha" stdDeviation="${(0.06 * size) / 2}" result="b2"/>
      <feFlood flood-color="rgb(${C.haloNight})" flood-opacity="0.30"/><feComposite in2="b2" operator="in" result="s2"/>`;
    f.innerHTML = `
      <feMorphology in="SourceAlpha" operator="dilate" radius="${(0.04 * size).toFixed(1)}" result="fat"/>
      <feGaussianBlur in="fat" stdDeviation="${(r * size) / 2}" result="b1"/>
      <feFlood flood-color="rgb(${color})" flood-opacity="${a}"/><feComposite in2="b1" operator="in" result="s1"/>${dark}
      <feMerge><feMergeNode in="s1"/>${dark ? '<feMergeNode in="s2"/>' : ''}<feMergeNode in="SourceGraphic"/></feMerge>`;
    svg.querySelector('defs').appendChild(f);
    return id;
  }
  // a soft painted wash behind a placed word (PLEASANT.md option D): an irregular watercolour swash in a pale warm tone,
  // a little wider than the word's ink, never a box: wobbly edges, a granulated body and a slightly darker dried edge.
  // w: the object TYPE.text returned; o: {color, a, padX, padY, tilt (deg), seed}
  function wash(svg, w, o = {}) {
    const color = o.color || '#FFD9A6', a = o.a ?? 0.85, seed = o.seed ?? 3, tilt = o.tilt ?? -2.5, rim = o.rim ?? 0.3;
    const h = w.bottom - w.top, padX = o.padX ?? 0.22 * h + 18, padY = o.padY ?? 0.16 * h;
    const x0 = w.x0 - padX, x1 = w.x1 + padX * 1.25, y0 = w.top - padY * 0.4, y1 = w.bottom + padY;
    const id = `wash_${seed}_${Math.round(x0)}_${Math.round(y0)}`;
    const defs = svg.querySelector('defs');
    defs.insertAdjacentHTML('beforeend', `
      <filter id="${id}" x="-15%" y="-40%" width="130%" height="180%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.010 0.050" numOctaves="3" seed="${seed}" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="${(0.24 * h).toFixed(0)}" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feGaussianBlur in="d" stdDeviation="2.4" result="soft"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="${seed + 7}" result="g"/>
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.12" result="ga"/>
        <feComposite in="soft" in2="ga" operator="in" result="body"/>
        <feMorphology in="soft" operator="erode" radius="${(0.05 * h).toFixed(1)}" result="inner"/>
        <feComposite in="soft" in2="inner" operator="out" result="rim"/>
        <feColorMatrix in="rim" type="matrix" values="0.92 0 0 0 0  0 0.86 0 0 0  0 0 0.80 0 0  0 0 0 ${rim} 0" result="rimc"/>
        <feGaussianBlur in="rimc" stdDeviation="1.2" result="rims"/>
        <feMerge><feMergeNode in="body"/><feMergeNode in="rims"/></feMerge></filter>`);
    // the swash: a long soft blob, fuller on the left (the brush lands), thinning to the right (it lifts)
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, hh = (y1 - y0) / 2;
    const d = `M ${x0} ${my} C ${x0} ${y0 - hh * 0.10}, ${x0 + (x1 - x0) * 0.25} ${y0}, ${mx} ${y0 + hh * 0.06}
      S ${x1} ${y0 + hh * 0.30}, ${x1} ${my + hh * 0.05} S ${x1 - (x1 - x0) * 0.2} ${y1 - hh * 0.05}, ${mx} ${y1}
      S ${x0} ${y1 + hh * 0.08}, ${x0} ${my} Z`;
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); p.setAttribute('fill', color); p.setAttribute('opacity', a);
    p.setAttribute('class', 'noink'); p.setAttribute('filter', `url(#${id})`);
    if (o.blend) p.style.mixBlendMode = o.blend;
    p.setAttribute('transform', `rotate(${tilt} ${mx.toFixed(1)} ${my.toFixed(1)})`);
    (w.el.parentNode || svg).insertBefore(p, w.el);
    return p;
  }
  // one run of text on one baseline. o: {t, x, y, anchor: start|middle|end, role, font, weight, size, track, tone,
  // accent, fill, halo (true / false / 'night' / 'light'), scale (about the ink's baseline centre), rotate, opacity,
  // parent (an SVG <g>), cls}
  function text(svg, o) {
    const m = measure(o.t, o);
    const f = m.f;
    const anchor = o.anchor || 'start';
    // origin so that the INK sits where asked
    let ox = o.x;
    if (anchor === 'start') ox = o.x - m.left;
    else if (anchor === 'end') ox = o.x - m.right;
    else ox = o.x - (m.left + m.right) / 2;
    const el = document.createElementNS(NS, 'text');
    el.setAttribute('x', ox.toFixed(2)); el.setAttribute('y', o.y);
    el.setAttribute('class', 'ink ' + (o.cls || ''));
    const fill = o.fill || ((o.accent || o.stress) ? (o.tone === 'light' ? C.accentLight : C.accentNight) : (o.tone === 'light' ? C.inkLight : C.warm));
    // the lit hand (PLEASANT.md): `stress: true` = the hand's Bold in the accent with the tone's warm glow; `bloom` (0-1)
    // is the entrance's progress (the glow rises with it), so a still can catch it mid-bloom
    if (o.stress && o.glow === undefined) {
      const full = o.tone === 'light' ? 0.95 : 0.42;
      o = {...o, glow: o.bloom != null ? {a: +(full * o.bloom).toFixed(2)} : true};
    }
    el.style.cssText = `font-family:'${f.fam}';font-weight:${f.w};font-size:${f.size}px;letter-spacing:${f.track * f.size}px;` +
      `${o.italic ? 'font-style:italic;' : ''}fill:${fill};font-kerning:normal;${o.opacity != null ? `opacity:${o.opacity};` : ''}${o.style || ''}`;
    el.textContent = o.t;
    const haloKind = o.halo === undefined ? (o.tone === 'light' ? null : 'night') : (o.halo === true ? (o.tone === 'light' ? 'light' : 'night') : o.halo || null);
    // a warm glow (`glow: true` or {color, a, r}) replaces the plain halo: it carries its own contrast halo on night skies
    if (o.glow) el.setAttribute('filter', `url(#${glowFilter(svg, f.size, o.tone === 'light' ? 'light' : 'night', o.glow === true ? {} : o.glow)})`);
    else if (haloKind) el.setAttribute('filter', `url(#${haloFilter(svg, f.size, haloKind, o.haloStrength || 1)})`);
    const inkL = ox + m.left, inkR = ox + m.right;
    const cx = (inkL + inkR) / 2;
    const tf = [];
    if (o.rotate) tf.push(`rotate(${o.rotate} ${cx.toFixed(1)} ${o.y})`);
    if (o.scale && o.scale !== 1) tf.push(`translate(${cx.toFixed(1)} ${o.y}) scale(${o.scale}) translate(${(-cx).toFixed(1)} ${-o.y})`);
    if (tf.length) el.setAttribute('transform', tf.join(' '));
    (o.parent || svg).appendChild(el);
    const box = {t: o.t, x0: Math.round(inkL), x1: Math.round(inkR), top: Math.round(o.y - m.asc), base: o.y, bottom: Math.round(o.y + m.desc), w: Math.round(inkR - inkL), font: `${f.fam} ${f.w} ${f.size}px`, fill};
    log.push(box);
    return {el, ...box};
  }
  // a group of lines on a seat (§c): line i starts `step * i` px right of line 0 (the gentle stagger); the group's ink
  // box is centred on the seat. lines: strings, or {t, ...overrides}. Returns the placed lines.
  function group(svg, o) {
    const seatX = typeof o.seat === 'number' ? o.seat : C.seats[o.seat || 'C'];
    const step = o.step ?? 100;
    const L = o.lines.map((ln) => (typeof ln === 'string' ? {t: ln} : ln));
    const ms = L.map((ln) => measure(ln.t, {...o, ...ln}));
    const widths = ms.map((m) => m.right - m.left);
    const offs = L.map((ln, i) => (ln.dx != null ? ln.dx : i * step));
    const left = Math.min(...offs), right = Math.max(...offs.map((d, i) => d + widths[i]));
    const x0 = seatX - (left + right) / 2;
    const bl = o.baselines || (L.length === 1 ? [455] : [395, 515]);
    return L.map((ln, i) => text(svg, {...o, ...ln, t: ln.t, x: x0 + offs[i], y: ln.y ?? bl[i], anchor: 'start'}));
  }
  // every face the stills use, loaded before any measuring (canvas metrics are wrong until the face is in)
  const FACES = ['300 100px Gaegu', '400 100px Gaegu', '700 100px Gaegu', '400 100px "Nanum Brush Script"', '300 100px Mali',
    '400 100px "Zen Kurenaido"', '300 100px Jost', '400 100px Jost', '400 100px "Patrick Hand"',
    '600 100px Caveat', '700 100px Caveat', 'italic 400 100px Fraunces', 'italic 500 100px Fraunces'];
  async function run(fn) {
    await Promise.all(FACES.map((f) => document.fonts.load(f, 'AIaH0123')));
    await document.fonts.ready;
    await fn();
    return done();
  }
  async function done() {
    await document.fonts.ready;
    // make sure every family used is actually loaded (document.fonts.ready resolves before lazy loads start)
    const fams = new Set(log.map((b) => b.font));
    await Promise.all([...fams].map((s) => { const [fam, w, px] = s.match(/^(.*) (\d+) (\d+(?:\.\d+)?)px$/).slice(1); return document.fonts.load(`${w} ${px}px '${fam}'`); }));
    window.__typeLog = log;
    return true;
  }
  window.TYPE = {C, measure, stage, text, group, haloFilter, glowFilter, wash, run, done, log};
})();
