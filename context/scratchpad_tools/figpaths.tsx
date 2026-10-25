/** Path helpers in a figure's local frame (units of its height H, feet at (0, 0), y up = negative). Reference 1's
 *  back-view readers (f_9.0) given legs: a round head whose top and back are a HAIR MASS (hairline at the nape, strands
 *  from the crown down to it, never free dashes mid-head), the neck in two short lines into a collar band (no centre
 *  seam: from behind there is no placket), a soft bell of a jacket with round sloped shoulders, sleeves that swing with
 *  the walk, closed trouser legs and dark shoes. */
const fmt = (v: number) => v.toFixed(1);
/** Head centre / radii (units of H). */
const HC = -0.916;
const HRX = 0.06;
const HRY = 0.066;
function figPaths(H: number, ph: number, hair: PasserHair, acc: PasserAcc[]) {
  const P = (x: number, y: number) => `${fmt(x * H)} ${fmt(y * H)}`;
  const R = (v: number) => fmt(v * H);
  // ---- legs: closed trouser shapes (slight taper), the lifted foot (heel up) alternating with the step phase
  const lift = [Math.max(0, Math.sin(ph)) * 0.045, Math.max(0, Math.sin(ph + Math.PI)) * 0.045];
  let legs = '';
  let shoes = '';
  [-1, 1].forEach((s, i) => {
    const bot = -0.035 - lift[i];
    const sw = s * lift[i] * 0.25; // the lifted leg's foot tucks in a little
    legs += `M${P(s * 0.008, -0.5)}L${P(s * 0.124, -0.5)}C${P(s * 0.124, -0.36)} ${P(s * 0.106 + sw, -0.2)} ${P(s * 0.1 + sw, bot)}L${P(s * 0.036 + sw, bot)}C${P(s * 0.032 + sw, -0.2)} ${P(s * 0.02, -0.36)} ${P(s * 0.012, -0.415)}Z`;
    const cx = s * 0.068 + sw;
    const sh = 0.026 + lift[i] * 0.25; // a raised heel shows a little more sole
    shoes += `M${P(cx - 0.042, bot)}Q${P(cx, bot - 0.02)} ${P(cx + 0.042, bot)}L${P(cx + 0.04, bot + sh)}Q${P(cx, bot + sh + 0.01)} ${P(cx - 0.04, bot + sh)}Z`;
  });
  // ---- the jacket: a soft bell. Round sloped shoulders (radius ~0.1 H = a third of the width), near-straight sides,
  // a soft curved hem
  const half = (s: number) =>
    `C${P(s * 0.085, -0.848)} ${P(s * 0.145, -0.83)} ${P(s * 0.153, -0.772)}C${P(s * 0.16, -0.71)} ${P(s * 0.146, -0.62)} ${P(s * 0.14, -0.56)}C${P(s * 0.137, -0.52)} ${P(s * 0.139, -0.49)} ${P(s * 0.143, -0.468)}`;
  const torso = `M${P(-0.03, -0.846)}${half(-1)}Q${P(0, -0.448)} ${P(0.143, -0.468)}` + `C${P(0.139, -0.49)} ${P(0.137, -0.52)} ${P(0.14, -0.56)}C${P(0.146, -0.62)} ${P(0.16, -0.71)} ${P(0.153, -0.772)}C${P(0.145, -0.83)} ${P(0.085, -0.848)} ${P(0.03, -0.846)}Z`;
  // the neck (two short lines from under the hair into the collar) and the collar band at the nape (convex up, like
  // the kit's CollarBand: a back collar, never a V or a centre seam)
  const neck = `M${P(-0.026, -0.83)}L${P(-0.025, HC + 0.05)}M${P(0.026, -0.83)}L${P(0.025, HC + 0.05)}`;
  const collar = `M${P(-0.07, -0.828)}Q${P(0, -0.86)} ${P(0.07, -0.828)}L${P(0.074, -0.808)}Q${P(0, -0.838)} ${P(-0.074, -0.808)}Z`;
  // ---- arms: tapered sleeves from the shoulders with a sand hand, hanging a little outward and swinging +-8 deg in
  // antiphase with the legs
  const arm = (s: number, swing: number) => {
    const a = ((-s * 4 + swing) * Math.PI) / 180;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const sx0 = s * 0.132;
    const sy0 = -0.79;
    const Q = (u: number, v: number) => P(sx0 + u * c - v * sn, sy0 + u * sn + v * c);
    const sleeve = `M${Q(-0.03, -0.01)}C${Q(-0.032, 0.1)} ${Q(-0.026, 0.2)} ${Q(-0.023, 0.27)}L${Q(0.023, 0.27)}C${Q(0.026, 0.2)} ${Q(0.032, 0.1)} ${Q(0.03, -0.01)}Q${Q(0, -0.03)} ${Q(-0.03, -0.01)}Z`;
    const hand = `M${Q(-0.019, 0.268)}C${Q(-0.022, 0.3)} ${Q(-0.01, 0.318)} ${Q(0, 0.318)}C${Q(0.012, 0.318)} ${Q(0.022, 0.3)} ${Q(0.019, 0.268)}Z`;
    return {sleeve, hand};
  };
  const sw = Math.sin(ph) * 8;
  const phone = acc.includes('phone');
  const aL = arm(-1, sw);
  let arms = aL.sleeve;
  let hands = aL.hand;
  let armR = '';
  let phoneD = '';
  if (phone) {
    // on a call: the right arm bent up, hand at the ear, the phone's back to us
    const upper = `M${P(0.118, -0.815)}C${P(0.16, -0.8)} ${P(0.2, -0.76)} ${P(0.214, -0.715)}Q${P(0.218, -0.69)} ${P(0.196, -0.684)}L${P(0.16, -0.69)}L${P(0.104, -0.752)}Z`;
    const fore = `M${P(0.172, -0.694)}L${P(0.205, -0.705)}L${P(0.124, -0.892)}L${P(0.092, -0.878)}Z`;
    armR = fore + upper;
    hands += `M${P(0.09, -0.875)}C${P(0.08, -0.9)} ${P(0.1, -0.918)} ${P(0.118, -0.905)}L${P(0.124, -0.89)}Z`;
    phoneD = `M${P(0.072, -0.975)}L${P(0.114, -0.968)}L${P(0.106, -0.878)}L${P(0.064, -0.884)}Z`;
  } else {
    const aR = arm(1, -sw);
    arms += aR.sleeve;
    hands += aR.hand;
  }
  // ---- head (its back) + ears; the hair is a MASS over the top and back, the hairline crosses at the nape
  const head = `M${P(-HRX, HC)}C${P(-HRX, HC - HRY * 1.36)} ${P(HRX, HC - HRY * 1.36)} ${P(HRX, HC)}C${P(HRX, HC + HRY * 0.86)} ${P(0.028, HC + HRY * 1.0)} ${P(0, HC + HRY * 1.0)}C${P(-0.028, HC + HRY * 1.0)} ${P(-HRX, HC + HRY * 0.86)} ${P(-HRX, HC)}Z`;
  const ears = `M${P(-HRX + 0.003, HC + 0.004)}C${P(-HRX - 0.016, HC + 0.0)} ${P(-HRX - 0.016, HC + 0.036)} ${P(-HRX + 0.006, HC + 0.04)}M${P(HRX - 0.003, HC + 0.004)}C${P(HRX + 0.016, HC + 0.0)} ${P(HRX + 0.016, HC + 0.036)} ${P(HRX - 0.006, HC + 0.04)}`;
  // the hair mass: the skull's top + back grown by `g`, down to the hairline at `ny` (its nape point dips `dip`)
  const mass = (g: number, ny: number, dip: number) => {
    const rx = HRX + g;
    const top = HC - HRY * 1.36 - g * 1.5;
    return `M${P(-rx, ny - 0.004)}C${P(-rx - 0.002, HC - 0.02)} ${P(-rx * 0.98, top)} ${P(0, top)}C${P(rx * 0.98, top)} ${P(rx + 0.002, HC - 0.02)} ${P(rx, ny - 0.004)}C${P(rx * 0.7, ny + dip * 0.2)} ${P(0.03, ny + dip * 0.4)} ${P(0, ny + dip)}C${P(-0.03, ny + dip * 0.4)} ${P(-rx * 0.7, ny + dip * 0.2)} ${P(-rx, ny - 0.004)}Z`;
  };
  // strands: long sweeps from the crown down to the hairline (they follow the skull, so they read as hair, not features)
  const strands = (ny: number, k = 1) =>
    `M${P(-0.008, HC - 0.068)}C${P(-0.034, HC - 0.05)} ${P(-0.05 * k, HC - 0.01)} ${P(-0.046 * k, ny - 0.006)}` +
    `M${P(0.006, HC - 0.07)}C${P(0.028, HC - 0.05)} ${P(0.048 * k, HC - 0.012)} ${P(0.044 * k, ny - 0.008)}` +
    `M${P(-0.002, HC - 0.07)}C${P(-0.008, HC - 0.03)} ${P(-0.012, HC + 0.0)} ${P(-0.01, ny + 0.002)}`;
  let hairFill = '';
  let hairInk = '';
  let darkFill = '';
  let capFill = '';
  if (hair === 'short' || hair === 'headphones' || hair === 'bun') {
    const ny = HC + 0.03;
    hairFill = mass(0.005, ny, 0.018);
    hairInk = hairFill + strands(ny);
    if (hair === 'bun') {
      const bun = `M${P(-0.03, HC - 0.088)}C${P(-0.032, HC - 0.13)} ${P(0.032, HC - 0.13)} ${P(0.03, HC - 0.088)}C${P(0.03, HC - 0.07)} ${P(-0.03, HC - 0.07)} ${P(-0.03, HC - 0.088)}Z`;
      hairFill += bun;
      hairInk += bun + `M${P(-0.012, HC - 0.112)}Q${P(0.004, HC - 0.1)} ${P(0.014, HC - 0.112)}`;
    }
    if (hair === 'headphones') {
      // a band over the crown (just outside the hair), cups over the ears
      const rb = HRX + 0.016;
      const tb = HC - HRY * 1.36 - 0.026;
      darkFill =
        `M${P(-rb, HC + 0.004)}C${P(-rb, HC - 0.04)} ${P(-rb * 0.96, tb)} ${P(0, tb)}C${P(rb * 0.96, tb)} ${P(rb, HC - 0.04)} ${P(rb, HC + 0.004)}` +
        `L${P(rb - 0.012, HC + 0.004)}C${P(rb - 0.012, HC - 0.036)} ${P((rb - 0.012) * 0.96, tb + 0.012)} ${P(0, tb + 0.012)}C${P(-(rb - 0.012) * 0.96, tb + 0.012)} ${P(-(rb - 0.012), HC - 0.036)} ${P(-(rb - 0.012), HC + 0.004)}Z` +
        `M${P(-rb - 0.008, HC - 0.012)}Q${P(-rb - 0.012, HC + 0.024)} ${P(-rb - 0.004, HC + 0.05)}L${P(-rb + 0.018, HC + 0.05)}L${P(-rb + 0.018, HC - 0.016)}Z` +
        `M${P(rb + 0.008, HC - 0.012)}Q${P(rb + 0.012, HC + 0.024)} ${P(rb + 0.004, HC + 0.05)}L${P(rb - 0.018, HC + 0.05)}L${P(rb - 0.018, HC - 0.016)}Z`;
    }
  } else if (hair === 'long') {
    // long hair: one mass from the crown over the head and down past the shoulders (it hides the neck and collar),
    // three long strands, a softly uneven ends line
    const rx = HRX + 0.012;
    const top = HC - HRY * 1.36 - 0.012;
    const bot = HC + 0.18;
    hairFill = `M${P(-rx, HC)}C${P(-rx, HC - 0.04)} ${P(-rx * 0.96, top)} ${P(0, top)}C${P(rx * 0.96, top)} ${P(rx, HC - 0.04)} ${P(rx, HC)}C${P(rx + 0.006, HC + 0.08)} ${P(rx + 0.014, bot - 0.04)} ${P(rx + 0.008, bot)}Q${P(0.04, bot + 0.012)} ${P(0.012, bot - 0.004)}Q${P(-0.02, bot + 0.014)} ${P(-rx - 0.008, bot)}C${P(-rx - 0.014, bot - 0.04)} ${P(-rx - 0.006, HC + 0.08)} ${P(-rx, HC)}Z`;
    hairInk = hairFill + `M${P(-0.03, HC - 0.04)}C${P(-0.046, HC + 0.03)} ${P(-0.05, HC + 0.1)} ${P(-0.046, bot - 0.012)}M${P(0.004, HC - 0.06)}C${P(-0.004, HC + 0.02)} ${P(0.004, HC + 0.1)} ${P(0.0, bot - 0.006)}M${P(0.032, HC - 0.04)}C${P(0.048, HC + 0.03)} ${P(0.052, HC + 0.1)} ${P(0.05, bot - 0.012)}`;
  } else if (hair === 'cap') {
    // a cap over the top ~60 %: its band sags gently, the back strap is an arch cut up into it (hair shows through),
    // a button on top; a short hairline under it
    const by = HC + 0.008;
    const rx = HRX + 0.006;
    const top = HC - HRY * 1.36 - 0.01;
    capFill = `M${P(-rx, by)}C${P(-rx, HC - 0.04)} ${P(-rx * 0.96, top)} ${P(0, top)}C${P(rx * 0.96, top)} ${P(rx, HC - 0.04)} ${P(rx, by)}Q${P(0, by + 0.014)} ${P(-rx, by)}Z`;
    const ny = HC + 0.034;
    hairFill = mass(0.003, ny, 0.014);
    hairInk = hairFill;
    const aw = 0.022;
    const ab = by + 0.004;
    const archTop = by - 0.03;
    darkFill = `M${P(-0.004, top - 0.012)}a${R(0.008)} ${R(0.006)} 0 1 1 ${R(0.016)} 0a${R(0.008)} ${R(0.006)} 0 1 1 ${R(-0.016)} 0Z`;
    hairInk += `M${P(-aw, ab)}L${P(-aw, by - 0.008)}C${P(-aw, archTop)} ${P(aw, archTop)} ${P(aw, by - 0.008)}L${P(aw, ab)}M${P(-aw - 0.008, by - 0.006)}L${P(aw + 0.008, by - 0.006)}`;
  }
  // ---- accessories on the back
  let accFill = '';
  let accInk = '';
  if (acc.includes('backpack')) {
    const bp = `M${P(-0.094, -0.775)}C${P(-0.094, -0.81)} ${P(0.094, -0.81)} ${P(0.094, -0.775)}L${P(0.1, -0.575)}Q${P(0.1, -0.55)} ${P(0.07, -0.548)}L${P(-0.07, -0.548)}Q${P(-0.1, -0.55)} ${P(-0.1, -0.575)}Z`;
    accFill += bp;
    // the flap, a zip pull, and the shoulder straps running up over the shoulders
    accInk += bp + `M${P(-0.09, -0.7)}Q${P(0, -0.722)} ${P(0.09, -0.7)}M${P(0.0, -0.712)}l${R(0.004)} ${R(0.026)}M${P(-0.07, -0.8)}Q${P(-0.1, -0.84)} ${P(-0.11, -0.826)}M${P(0.07, -0.8)}Q${P(0.1, -0.84)} ${P(0.11, -0.826)}`;
  }
  if (acc.includes('strap')) {
    const strap = `M${P(-0.124, -0.8)}L${P(-0.1, -0.826)}L${P(0.152, -0.55)}L${P(0.13, -0.526)}Z`;
    const bag = `M${P(0.09, -0.565)}Q${P(0.152, -0.58)} ${P(0.216, -0.565)}L${P(0.212, -0.44)}Q${P(0.152, -0.418)} ${P(0.096, -0.436)}Z`;
    accFill += strap + bag;
    accInk += strap + bag + `M${P(0.096, -0.52)}Q${P(0.152, -0.535)} ${P(0.214, -0.52)}`;
  }
  return {legs, shoes, torso, neck, collar, arms, hands, armR, phoneD, head, ears, hairFill, hairInk, darkFill, capFill, accFill, accInk};
}

/** One passer-by: a complete back-view line-art figure (white paper fills, ink outlines; closed trouser legs and
 *  sleeves, an identity detail), reference 1's readers (f_9.0) given legs. (x, y) = feet, H = height (world px). The
 *  upper body rolls +-1.5 deg with the gait. */
export const Passer: React.FC<{x: number; y: number; H: number; t: number; hz: number; hair: PasserHair; acc: PasserAcc[]; ink: number; seed: string}> = ({x, y, H, t, hz, hair, acc, ink, seed}) => {
  const ph = t * hz * Math.PI + rand(seed, 'ph') * 6.28;
  const bob = -Math.abs(Math.sin(ph)) * 0.012 * H;
  const sway = Math.sin(ph) * 0.006 * H;
  const roll = Math.sin(ph) * 1.5;
  const g = figPaths(H, ph, hair, acc);
  const W = palette.white;
  const layer = (d: string, k: string, fill = W, w = ink) =>
    d ? (
      <React.Fragment key={k}>
        <Fill d={d} color={fill} offset={false} mode="none" seed={`${seed}/${k}f`} />
        <Ink d={d} width={w} taper={false} seed={`${seed}/${k}i`} />
      </React.Fragment>
    ) : null;
  const long = hair === 'long';
  return (
    <XG m={mat.translate(x + sway, y + bob)}>
      {layer(g.legs, 'lg')}
      <Fill d={g.shoes} color={palette.ink} offset={false} mode="none" seed={`${seed}/sh`} />
      <XG m={mat.about(mat.rotate(roll), 0, -0.47 * H)}>
        {layer(g.torso, 'to')}
        <Ink d={g.neck} width={ink * 0.8} taper={false} seed={`${seed}/nk`} />
        {long ? null : layer(g.collar, 'co', W, ink * 0.8)}
        {layer(g.accFill ? g.accInk : '', 'ac')}
        {layer(g.arms, 'ar')}
        {layer(g.hands, 'hn', palette.sand, ink * 0.8)}
        <Ink d={g.ears} width={ink * 0.8} taper={false} seed={`${seed}/ea`} />
        {layer(g.head, 'hd')}
        {g.hairFill ? <Fill d={g.hairFill} color={W} offset={false} mode="none" seed={`${seed}/hf`} /> : null}
        {g.hairInk ? <Ink d={g.hairInk} width={ink * 0.85} taper={false} seed={`${seed}/hi`} /> : null}
        {layer(g.capFill, 'cp')}
        {g.darkFill ? <Fill d={g.darkFill} color={palette.ink} offset={false} mode="none" seed={`${seed}/dk`} /> : null}
        {layer(g.armR, 'aR')}
        {layer(g.phoneD, 'ph')}
      </XG>
    </XG>
  );
};

