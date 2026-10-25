// ---------------------------------------------------------------- BackBody (Keeper, Caretaker)

/** Head centre of a BackBody: higher than the kit Person's, so a neck block shows between the head and the collar. */
const backHeadY = (g: Geo) => -g.h - g.hr * 1.5;
/** Feet to cap top of a BackBody at s = 1 (the presets scale `h` by this, so `h` is the true height). */
const backFigH = (g: Geo) => LEG + g.h + g.hr * 2.6;
/** One palette step darker (collar bands). */
const darker = (c: string) =>
  c === palette.sand ? palette.tan : c === palette.teal ? palette.tealDark : c === palette.cream ? palette.sand : c === palette.sage ? palette.teal : c === palette.tan ? palette.brown : palette.tealDark;

type BackBodyProps = {g: Geo; seed: string; coat: string; legs: string; shoes?: string; hair?: string; cap?: string | false; W: number; walk?: number; detail?: boolean};

/** A back-view figure built here instead of the kit Person when it wears a cap (style bible 6, closeup_board_people):
 *  the head circle IS the hair colour with sand ears at mid-height, the cap sits ON TOP (crown to just below the middle,
 *  a band line, its brim arc hanging at the back), a sand neck block shows under the head, a coat collar band with its
 *  collar line sits on the shoulders. No skin-coloured crown and no dark crescent low on the head, so it never reads as
 *  a face (review 4). Person-local units: hip line at 0, the same w / h / hr / round as personGeo (arms, belts fit). */
const BackBody: React.FC<BackBodyProps> = ({g, seed, coat, legs, shoes = palette.tealDark, hair = palette.brown, cap, W, walk, detail = true}) => {
  const t = useTime();
  const {w, h, hr} = g;
  const hy = backHeadY(g);
  const lw = w * 0.31;
  const gp = w * 0.05;
  let lL = 0;
  let lR = 0;
  let bob = 0;
  if (walk) {
    const ph = t * walk * Math.PI + rand(seed, 'wph') * 6.28;
    lL = Math.max(0, Math.sin(ph)) * LEG * 0.16;
    lR = Math.max(0, -Math.sin(ph)) * LEG * 0.16;
    bob = -Math.abs(Math.sin(ph)) * LEG * 0.035;
  }
  const f = (v: number) => v.toFixed(2);
  const legsD = rectPath(-gp - lw, -2, lw, LEG - lL) + rectPath(gp, -2, lw, LEG - lR);
  const shoesD = rectPath(-gp - lw - 1, LEG - lL - 12, lw + 3, 14) + rectPath(gp - 2, LEG - lR - 12, lw + 3, 14);
  const legInk = `M${f(-gp - lw)} 0V${f(LEG - lL)}M${f(-gp)} 0V${f(LEG - 2 - lL)}M${f(gp)} 0V${f(LEG - 2 - lR)}M${f(gp + lw)} 0V${f(LEG - lR)}`;
  const torsoD = torso(0, 0, w, h, g.round, 0.07);
  // neck block (sand) from inside the head down into the collar; ink on its two sides
  const neckD = rectPath(-hr * 0.45, hy + hr * 0.55, hr * 0.9, -h + hr * 0.3 - (hy + hr * 0.55));
  const neckInk = `M${f(-hr * 0.45)} ${f(hy + hr * 0.9)}V${f(-h - hr * 0.12)}M${f(hr * 0.45)} ${f(hy + hr * 0.9)}V${f(-h - hr * 0.12)}`;
  // collar band on the shoulders: top edge round the neck, the collar line below
  const ct = -h - hr * 0.16;
  const collarTop = `M${f(-hr * 0.68)} ${f(ct)}Q0 ${f(-h + hr * 0.06)} ${f(hr * 0.68)} ${f(ct)}`;
  const collarD = collarTop + `L${f(hr * 1.14)} ${f(-h + hr * 0.38)}Q0 ${f(-h + hr * 0.8)} ${f(-hr * 1.14)} ${f(-h + hr * 0.38)}Z`;
  const collarInk = collarTop + `M${f(-hr * 0.68)} ${f(ct)}L${f(-hr * 1.14)} ${f(-h + hr * 0.38)}Q0 ${f(-h + hr * 0.8)} ${f(hr * 1.14)} ${f(-h + hr * 0.38)}L${f(hr * 0.68)} ${f(ct)}`;
  // head (hair colour) + ears at mid-height
  const ey = hy + hr * 0.12;
  const ears = blob(-hr * 0.98, ey, hr * 0.2, hr * 0.3, {seed: `${seed}/e1`}) + blob(hr * 0.98, ey, hr * 0.2, hr * 0.3, {seed: `${seed}/e2`});
  const earInk = arc(-hr * 0.98, ey, hr * 0.2, hr * 0.3, 95, 265, {seed: `${seed}/ei1`}) + arc(hr * 0.98, ey, hr * 0.2, hr * 0.3, -85, 85, {seed: `${seed}/ei2`});
  const headD = blob(0, hy, hr, hr, {seed: `${seed}/head`});
  const headInk = circle(0, hy, hr, {seed: `${seed}/head`, overlap: 18});
  // cap: crown down to just below the middle, band line, brim arc hanging at the back, button on top
  const by = hy + hr * 0.08;
  const R2 = hr * 1.05;
  const cw = Math.sqrt(Math.max(0, R2 * R2 - (by - hy) * (by - hy)));
  const crownD = `M${f(-cw)} ${f(by)}A${f(R2)} ${f(R2)} 0 1 1 ${f(cw)} ${f(by)}Q0 ${f(by + hr * 0.12)} ${f(-cw)} ${f(by)}Z`;
  const bandInk = `M${f(-cw * 0.97)} ${f(by - hr * 0.22)}Q0 ${f(by - hr * 0.08)} ${f(cw * 0.97)} ${f(by - hr * 0.22)}`;
  const brimD = `M${f(-hr * 0.7)} ${f(by + hr * 0.02)}Q0 ${f(by + hr * 0.1)} ${f(hr * 0.7)} ${f(by + hr * 0.02)}Q${f(hr * 0.46)} ${f(by + hr * 0.42)} 0 ${f(by + hr * 0.44)}Q${f(-hr * 0.46)} ${f(by + hr * 0.42)} ${f(-hr * 0.7)} ${f(by + hr * 0.02)}Z`;
  const crownInk = `M${f(-cw)} ${f(by)}A${f(R2)} ${f(R2)} 0 1 1 ${f(cw)} ${f(by)}`;
  const strands = `M${f(-hr * 0.42)} ${f(hy - hr * 0.55)}Q${f(-hr * 0.5)} ${f(hy + hr * 0.1)} ${f(-hr * 0.36)} ${f(hy + hr * 0.72)}M${f(hr * 0.06)} ${f(hy - hr * 0.7)}Q${f(-hr * 0.02)} ${f(hy)} ${f(hr * 0.08)} ${f(hy + hr * 0.8)}M${f(hr * 0.46)} ${f(hy - hr * 0.5)}Q${f(hr * 0.56)} ${f(hy + hr * 0.1)} ${f(hr * 0.42)} ${f(hy + hr * 0.66)}`;
  return (
    <TodAnchor at={[0, -h * 0.5]}>
      <XG m={mat.translate(0, bob)}>
        <Fill d={legsD} color={legs} offset={false} mode="none" seed={`${seed}/legs`} />
        <Fill d={shoesD} color={shoes} offset={false} mode="none" seed={`${seed}/shoes`} />
        <Ink d={legInk} width={W * 0.9} seed={`${seed}/legI`} />
        <Fill d={neckD} color={palette.sand} offset={false} mode="none" seed={`${seed}/neck`} />
        {detail ? <Ink d={neckInk} width={W * 0.7} taper={false} seed={`${seed}/neckI`} /> : null}
        <Fill d={ears} color={palette.sand} offset={false} mode="none" seed={`${seed}/ear`} />
        <Ink d={earInk} width={W * 0.85} order="all" seed={`${seed}/earI`} />
        <Fill d={torsoD} color={coat} seed={`${seed}/torso`} />
        <Ink d={torsoD} width={W} seed={`${seed}/torsoI`} />
        <Fill d={collarD} color={darker(coat)} offset={false} mode="none" seed={`${seed}/collar`} />
        <Ink d={collarInk} width={W * 0.8} taper={false} seed={`${seed}/collarI`} />
        <Fill d={headD} color={hair} seed={`${seed}/headF`} />
        <Ink d={headInk} width={W} open={0.1} seed={`${seed}/headI`} />
        {cap ? (
          <>
            <Fill d={crownD} color={cap} offset={false} mode="none" seed={`${seed}/crown`} />
            <Fill d={brimD} color={cap} offset={false} mode="none" seed={`${seed}/brim`} />
            <Ink d={crownInk + bandInk} width={W * 0.85} seed={`${seed}/capI`} />
            <Ink d={brimD} width={W * 0.75} taper={false} seed={`${seed}/brimI`} />
            {detail ? <Ink d={circle(0, hy - R2 + hr * 0.04, hr * 0.12, {seed: `${seed}/btn`})} width={W * 0.7} seed={`${seed}/btn`} /> : null}
          </>
        ) : detail ? (
          <Ink d={strands} width={W * 0.7} order="all" seed={`${seed}/strands`} />
        ) : null}
      </XG>
    </TodAnchor>
  );
};

// ---------------------------------------------------------------- Keeper (S10)

export type KeeperProps = FigBase & {
  /** Arm reaches forward/up to receive or hold something (0.3 s); `holding` renders at the hand (person-local units). */
  reachAt?: number;
  lowerAt?: number;
  holding?: React.ReactNode;
  /** Installing: the raised hand works in small quick strokes from installAt for installDur. */
  installAt?: number;
  installDur?: number;
  /** Climb a zig-zag stair: steps of (run, rise) world px, one per stepDur, starting at climb.at. */
  climb?: {at: number; steps: number; run: number; rise: number; stepDur?: number};
  /** Cap colour (default teal) or false for bare hair; hair colour (default ochre). */
  cap?: string | false;
  hair?: string;
};

/** Site keeper (NOT a maker): sand coat with a tan collar, teal cap, teal trousers, ochre tool belt (hammer, pouch). */
export const Keeper: React.FC<KeeperProps> = (p) => {
  const t = useTime();
  const seed = p.seed ?? 'keeper';
  // climbing moves the feet point in steps
  let b: FigBase = p;
  if (p.climb && t >= p.climb.at) {
    const sd = p.climb.stepDur ?? 0.35;
    const k = Math.min(p.climb.steps, (t - p.climb.at) / sd);
    const whole = Math.floor(k);
    const frac = E.inOutSine(k - whole);
    const n = Math.min(p.climb.steps, whole + frac);
    const hop = k < p.climb.steps ? Math.sin(frac * Math.PI) * p.climb.rise * 0.4 : 0;
    b = {...p, x: p.x + n * p.climb.run, y: p.y - n * p.climb.rise - hop};
  }
  if (p.h < 30) return <Citizen {...b} silhouette color={palette.sand} />;
  const g = personGeo(seed);
  const s = p.h / backFigH(g);
  const W = inkFor(p.h, p.depth) / s;
  const q = raiseQ(t, p.reachAt, p.lowerAt);
  const work = p.installAt !== undefined && t >= p.installAt && t < p.installAt + (p.installDur ?? 0.6) ? Math.sin((t - p.installAt) * 40) * 4 : 0;
  const sh: Pt = [g.w * 0.34, -g.h * 0.8];
  const hand: Pt = [lerp(g.w * 0.5, g.w * 0.66, q) + work, lerp(-g.h * 0.05, -g.h * 1.18, q)];
  const hw = g.w / 2;
  const by = -g.h * 0.2;
  const walking = walkPos(t, b).walking || (!!p.climb && t >= p.climb.at && t < p.climb.at + p.climb.steps * (p.climb.stepDur ?? 0.35));
  return (
    <FigFrame b={b} s={s}>
      <BackBody g={g} seed={seed} coat={palette.sand} legs={palette.teal} cap={p.cap ?? palette.teal} hair={p.hair} W={W} walk={walking ? p.walk?.hz ?? 2.2 : undefined} detail={p.h >= 60} />
      <Fill d={rectPath(-hw * 1.04, by, hw * 2.08, 12)} color={palette.brown} offset={false} mode="none" seed={`${seed}/belt`} />
      <Fill d={roundRect(-hw * 0.7, by + 8, 20, 22, 4)} color={palette.tan} offset={false} mode="none" seed={`${seed}/pouch`} />
      <Ink d={`M${-hw * 1.04} ${by}H${hw * 1.04}M${-hw * 1.04} ${by + 12}H${hw * 1.04}` + `M${-hw * 0.7} ${by + 8}h20v22h-20Z` + `M${hw * 0.55} ${by + 6}l6 34M${hw * 0.45} ${by + 38}h22`} width={W * 0.8} taper={false} seed={`${seed}/beltI`} />
      {q > 0.02 ? (
        <>
          <Arm sh={sh} hand={hand} coat={palette.sand} W={W * 0.85} seed={`${seed}/arm`} />
          {p.holding ? <XG m={mat.translate(hand[0], hand[1] - 6)}>{p.holding}</XG> : null}
        </>
      ) : null}
    </FigFrame>
  );
};

// ---------------------------------------------------------------- Caretaker (S13)

export type CaretakerProps = FigBase & {
  raiseKeysAt?: number;
  lowerAt?: number;
  jingleAt?: number | number[];
  glintAt?: number;
  ring?: number;
  /** Cap colour (default sage) or false; hair colour (default ochre). */
  cap?: string | false;
  hair?: string;
};

/** The hosting company's caretaker: teal coat with a dark collar, sage cap, a big key ring (r 22) with sand keys. */
export const Caretaker: React.FC<CaretakerProps> = (p) => {
  const t = useTime();
  const seed = p.seed ?? 'care';
  const g = personGeo(seed);
  const s = p.h / backFigH(g);
  const W = inkFor(p.h, p.depth) / s;
  const q = raiseQ(t, p.raiseKeysAt, p.lowerAt);
  const sh: Pt = [g.w * 0.34, -g.h * 0.8];
  const hand: Pt = [lerp(g.w * 0.5, g.w * 0.68, q), lerp(-g.h * 0.05, backHeadY(g) - g.hr * 1.2, q)];
  const R = (p.ring ?? 22) / s;
  const jingles = p.jingleAt === undefined ? [] : Array.isArray(p.jingleAt) ? p.jingleAt : [p.jingleAt];
  let jig = osc(t, 1.1, 1) * 4;
  for (const j of jingles) if (t >= j && t < j + 0.6) jig += 16 * Math.exp(-(t - j) * 6) * Math.sin((t - j) * 34);
  const glint = p.glintAt !== undefined && t >= p.glintAt && t < p.glintAt + 0.22;
  const walking = walkPos(t, p).walking;
  const keys = [-35, 10, 55].map((a, i) => {
    const ang = ((90 + a + jig * (i % 2 ? -0.6 : 1)) * Math.PI) / 180;
    const kx = Math.cos(ang) * R;
    const ky = Math.sin(ang) * R;
    const L = R * 1.15;
    const dx = Math.cos(ang) * L;
    const dy = Math.sin(ang) * L;
    return {kx, ky, dx, dy, ang};
  });
  return (
    <FigFrame b={p} s={s}>
      <BackBody g={g} seed={seed} coat={palette.teal} legs={palette.brown} cap={p.cap ?? palette.sage} hair={p.hair} W={W} walk={walking ? p.walk?.hz ?? 1.8 : undefined} detail={p.h >= 60} />
      {q > 0.02 ? (
        <>
          <Arm sh={sh} hand={hand} coat={palette.teal} W={W * 0.85} seed={`${seed}/arm`} />
          <XG m={mat.translate(hand[0], hand[1] - R * 0.9)}>
            {keys.map((k, i) => (
              <g key={i}>
                <Fill d={polyPath([[k.kx - 3, k.ky], [k.kx + 3, k.ky], [k.kx + k.dx * 0.9 + 3, k.ky + k.dy * 0.9], [k.kx + k.dx * 0.9 - 3, k.ky + k.dy * 0.9]]) + blob(k.kx + k.dx * 0.18, k.ky + k.dy * 0.18, 7, 7, {seed: `${seed}/kb${i}`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/k${i}`} />
                <Ink d={`M${k.kx} ${k.ky}l${(k.dx * 0.95).toFixed(1)} ${(k.dy * 0.95).toFixed(1)}` + circle(k.kx + k.dx * 0.18, k.ky + k.dy * 0.18, 7, {seed: `${seed}/kc${i}`})} width={W * 0.6} seed={`${seed}/ki${i}`} />
              </g>
            ))}
            <Ink d={circle(0, 0, R, {seed: `${seed}/ring`, overlap: 20})} width={W * 1.1} seed={`${seed}/ring`} />
            {glint ? <Ink d={`M${-R * 0.5} ${R * 0.9}l${R * 0.5} ${-R * 0.7}M${-R * 0.2} ${R * 1.2}l${R * 0.4} ${-R * 0.55}`} width={W * 0.9} color={palette.white} taper={false} seed={`${seed}/gl`} /> : null}
          </XG>
        </>
      ) : null}
    </FigFrame>
  );
};

