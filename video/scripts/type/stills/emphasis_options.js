// emphasis_options.js: the pleasantness pass's options for the stressed word and the big number
// (docs/look/type/PLEASANT.md §3; the owner, 2026-10-30: "shouldn't look like a blood message on the wall").
// Each option draws one full 1080 x 1920 frame's words into the SVG it is given, at video 4's real moments:
//   dusk:   S7 at 24.70 s, "But Helsinki" (23.417 s) / "wants" (24.000 s) / "that heat." (24.583 s), on the dusk sky
//   night:  S12 at 40.00 s, "So your chatbot" (38.433 s) / "could soon" (39.367 s) "heat" (39.933 s), on the night sky
//   number: S1 at 3.60 s, "70,000" (2.300 s) / "homes?" (3.383 s), on the night sky
// Used by stills 15-17 (stills/grid.js lays them out) and by single-option pages (one option at full size).
(function () {
  const T = () => window.TYPE;
  const PLUM = '#3A2B48', UMBER = '#2B1B0A', WARM = '#FFF0DE', HONEY = '#FFD58C', AMBER = '#FFB868';

  // S7: three rows like hand lettering; the stressed word on row 2, stepped right; ink inside y 292-585
  function dusk(S, o = {}) {
    const ink = o.ink || PLUM, tone = 'light';
    T().text(S, {t: 'But Helsinki', x: 130, y: 362, role: 'hand', size: 116, tone, fill: ink});
    const w = T().text(S, {t: o.word || 'wants', x: o.x2 ?? 236, y: o.b2 ?? 482, font: o.font || 'Gaegu', weight: o.weight || 700,
      size: o.size || 160, italic: o.italic, track: o.track, style: o.style, tone, fill: o.fill || ink, glow: o.glow, halo: false});
    if (o.wash) T().wash(S, w, o.wash);
    T().text(S, {t: 'that heat.', x: 920, y: 580, anchor: 'end', role: 'hand', size: 116, tone, fill: ink});
  }
  // S12: two rows; the stressed word ends row 2, 40 px after "soon"
  function night(S, o = {}) {
    const tone = 'night';
    T().text(S, {t: 'So your chatbot', x: 110, y: 390, role: 'hand', size: 116, tone});
    const c = T().text(S, {t: 'could soon', x: 120, y: 545, role: 'hand', size: 116, tone});
    const w = T().text(S, {t: o.word || 'heat', x: c.x1 + (o.gap ?? 40), y: 545, font: o.font || 'Gaegu', weight: o.weight || 700,
      size: o.size || 156, italic: o.italic, track: o.track, style: o.style, tone, fill: o.fill || WARM, glow: o.glow});
    if (o.wash) T().wash(S, w, o.wash);
  }
  // S1: the figures on their own row (baseline 480), the unit word in the hand under them (578), edge x ~930
  function number(S, o = {}) {
    const tone = 'night';
    const f = {font: o.font || 'Gaegu', weight: o.weight || 700, size: o.size || 250, italic: o.italic, track: o.track ?? -0.02,
      style: o.style, tone, fill: o.fill || WARM, glow: o.glow};
    if (f.font === 'Gaegu') {
      // the hand's comma sits loose ("70, 000"): set "70", the comma tucked in, "000", the whole centred on cx
      const m1 = T().measure('70', f), mc = T().measure(',', f), m2 = T().measure('000', f);
      const w1 = m1.right - m1.left, wc = mc.right - mc.left, w2 = m2.right - m2.left, g1 = 0.02 * f.size, g2 = 0.05 * f.size;
      const x0 = (o.cx ?? 466) - (w1 + g1 + wc + g2 + w2) / 2;
      const a = T().text(S, {...f, t: '70', x: x0, y: 482});
      const c = T().text(S, {...f, t: ',', x: a.x1 + g1, y: 482});
      T().text(S, {...f, t: '000', x: c.x1 + g2, y: 482});
    } else {
      T().text(S, {...f, t: '70,000', x: o.cx ?? 466, y: 482, anchor: 'middle'});
    }
    T().text(S, {t: 'homes?', x: 930, y: 580, anchor: 'end', role: 'hand', size: 116, tone});
  }
  const warmGlowLight = {color: '255,214,160', a: 0.95, r: 0.34};   // a gentle warm halo on the light sky
  const goldGlow = {color: '255,184,92', a: 0.42, r: 0.34};          // the golden glow on night skies
  const honeyWashLight = {color: '#FFE0B2', a: 0.85, seed: 5, rim: 0.12};
  const honeyWashNight = {color: '#F0A04B', a: 0.62, seed: 5, rim: 0, blend: 'screen'};

  window.EMPH = {
    colors: {PLUM, UMBER, WARM, HONEY, AMBER},
    dusk: [
      {key: 'A', label: 'A · the hand Bold, 1.4x, the running ink (umber, today’s)', draw: (S) => dusk(S, {ink: UMBER})},
      {key: 'B', label: 'B · A in a softer deep plum ink (all words)', draw: (S) => dusk(S, {})},
      {key: 'C', label: 'C · B + a gentle warm halo behind the word (light)', draw: (S) => dusk(S, {glow: warmGlowLight})},
      {key: 'D', label: 'D · B + a soft painted wash, pale honey', draw: (S) => dusk(S, {weight: 400, size: 150, wash: honeyWashLight})},
      {key: 'E', label: 'E · a smooth friendly script (Caveat 700), plum', draw: (S) => dusk(S, {font: 'Caveat', weight: 700, size: 176, b2: 484, x2: 250})},
      {key: 'F', label: 'F · a soft serif italic (Fraunces 500 italic), plum', draw: (S) => dusk(S, {font: 'Fraunces', weight: 500, italic: true, size: 150, x2: 246})},
      {key: 'G', label: 'G · capitals for comparison: B as WANTS', draw: (S) => dusk(S, {word: 'WANTS', size: 140, track: 0.04, b2: 484})},
    ],
    night: [
      {key: 'A', label: 'A · the hand Bold, 1.4x, warm white (size and weight only)', draw: (S) => night(S, {})},
      {key: 'B', label: 'B · A in the windows’ honey light + a golden glow', draw: (S) => night(S, {fill: HONEY, glow: goldGlow})},
      {key: 'C', label: 'C · honey, no glow (the gentle colour alone)', draw: (S) => night(S, {fill: HONEY})},
      {key: 'D', label: 'D · warm white + a soft painted wash of lamplight', draw: (S) => night(S, {weight: 400, size: 150, wash: honeyWashNight})},
      {key: 'E', label: 'E · a smooth friendly script (Caveat 700), honey + glow', draw: (S) => night(S, {font: 'Caveat', weight: 700, size: 172, fill: HONEY, glow: goldGlow})},
      {key: 'F', label: 'F · a soft serif italic (Fraunces 500 italic), honey + glow', draw: (S) => night(S, {font: 'Fraunces', weight: 500, italic: true, size: 140, fill: HONEY, glow: goldGlow})},
      {key: 'G', label: 'G · capitals for comparison: B as HEAT', draw: (S) => night(S, {word: 'HEAT', size: 132, track: 0.04, fill: HONEY, glow: goldGlow})},
    ],
    number: [
      {key: 'A', label: 'A · the hand Bold, warm white (size and weight only)', draw: (S) => number(S, {})},
      {key: 'B', label: 'B · the hand Bold in honey light + a golden glow', draw: (S) => number(S, {fill: HONEY, glow: goldGlow})},
      {key: 'C', label: 'C · a smooth script (Caveat 700), honey + glow', draw: (S) => number(S, {font: 'Caveat', weight: 700, size: 262, track: 0, fill: HONEY, glow: goldGlow})},
      {key: 'D', label: 'D · a soft serif italic (Fraunces 500 italic), honey + glow', draw: (S) => number(S, {font: 'Fraunces', weight: 500, italic: true, size: 196, track: 0, style: 'font-variant-numeric:lining-nums', fill: HONEY, glow: goldGlow})},
    ],
    fn: {dusk, night, number, warmGlowLight, goldGlow, honeyWashLight, honeyWashNight},
  };
})();
