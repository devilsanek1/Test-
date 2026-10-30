// type.js — the type guide's system as an SVG layout helper for the stills (docs/look/TYPE_GUIDE.md, DRAFT).
// Loaded by the still pages in scripts/type/stills/ (<script src="../lib/type.js">). Every word is an SVG <text>
// placed by its BASELINE (y) and its ink start / centre / end (x), so a still's numbers are the guide's numbers.
//
//   const S = TYPE.stage();                       // the 1080 x 1920 SVG over the page's #stage
//   TYPE.text(S, {t: 'Did you know', x: 120, y: 395, role: 'hand', size: 136, tone: 'night'});
//   TYPE.group(S, {seat: 'C', baselines: [395, 515], step: 100, lines: ['on giant', 'computers,'], tone: 'night'});
//   window.__ready = TYPE.run(() => { ...the layout... });   // fonts first, then the layout; render.mjs waits for it
//
// Roles (§b): hand = Gaegu (300 on night / dusk skies, 400 on light), brush = Nanum Brush Script 400; any other CSS
// family by `font`. Tones (§b colours): night = warm white #FFF0DE + the dark halo; light = umber #2B1B0A (no halo
// unless asked). `accent: true` = amber #FFB868 (night) / burnt #8E3A12 (light). Tracking +0.02 em unless set.
// x is the INK edge (start / end) or the ink centre (middle), measured with canvas actualBoundingBox*, so "from x 130"
// and "right-aligned near x 920" mean the visible letters, not the advance box.
(function () {
  const C = {
    hand: 'Gaegu', brush: 'Nanum Brush Script',
    warm: '#FFF0DE', amber: '#FFB868', amberLight: '#FFC98A', umber: '#2B1B0A', burnt: '#8E3A12',
    haloNight: '20,26,58', haloLight: '255,255,255',
    seats: {L: 440, C: 520, R: 600},
  };
  const NS = 'http://www.w3.org/2000/svg';
  const ctx = document.createElement('canvas').getContext('2d');
  const log = [];

  function fontOf(o) {
    const fam = o.font || (o.role === 'brush' ? C.brush : C.hand);
    const w = o.weight || (o.role === 'brush' ? 400 : (o.tone === 'light' ? 400 : 300));
    return {fam, w, size: o.size || 116, track: o.track ?? 0.02};
  }
  // ink metrics of a string (advance with tracking, ink left / right relative to the origin, ascent / descent)
  function measure(t, o) {
    const f = fontOf(o);
    ctx.font = `${f.w} ${f.size}px '${f.fam}'`;
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
    const fill = o.fill || (o.accent ? (o.tone === 'light' ? C.burnt : C.amber) : (o.tone === 'light' ? C.umber : C.warm));
    el.style.cssText = `font-family:'${f.fam}';font-weight:${f.w};font-size:${f.size}px;letter-spacing:${f.track * f.size}px;` +
      `fill:${fill};font-kerning:normal;${o.opacity != null ? `opacity:${o.opacity};` : ''}${o.style || ''}`;
    el.textContent = o.t;
    const haloKind = o.halo === undefined ? (o.tone === 'light' ? null : 'night') : (o.halo === true ? (o.tone === 'light' ? 'light' : 'night') : o.halo || null);
    if (haloKind) el.setAttribute('filter', `url(#${haloFilter(svg, f.size, haloKind, o.haloStrength || 1)})`);
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
  const FACES = ['300 100px Gaegu', '400 100px Gaegu', '400 100px "Nanum Brush Script"', '300 100px Mali',
    '400 100px "Zen Kurenaido"', '300 100px Jost', '400 100px Jost', '400 100px "Patrick Hand"'];
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
  window.TYPE = {C, measure, stage, text, group, haloFilter, run, done, log};
})();
