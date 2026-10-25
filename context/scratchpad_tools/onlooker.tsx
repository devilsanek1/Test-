// ---------------------------------------------------------------- EdgeOnlooker (tier A)

export type EdgeOnlookerProps = {
  /** Head centre. */
  x: number;
  y: number;
  /** Head diameter in world px (ref 2: 85-130 at the frame sides). */
  head?: number;
  seed?: Seed;
  hair?: Hair;
  /** Accessories of the kit Person ('backpack' is dropped: it scales with the cropped torso; 'phone' = holding it up). */
  acc?: Acc[];
  body?: string;
  riseAt?: number;
  bob?: number;
  /** The phone arm swings up from the hanging arm (0.3 s, slight overshoot) with a shoulder jolt. */
  raisePhoneAt?: number;
  /** The phone arm swings back down (0.25 s). */
  lowerPhoneAt?: number;
  /** Which arm holds the phone. Default: the side facing the frame centre. */
  phoneSide?: 'left' | 'right';
  /** Hanging arms (sleeve seam, cuff, hand): both (default), only the side facing the frame centre, or none. */
  arms?: 'both' | 'near' | false;
  depth?: Depth;
  /** White rim strip on this side of the torso (fixed length from the shoulder). Default 'left'. */
  rim?: 'left' | 'right' | false;
  /** Parent y the coat must run past. Default: the frame bottom + 40 px read from the camera transform every frame
   *  (never less than world.h + world.bleed in parent units), so the torso always runs off the bottom edge. */
  frameBottom?: number;
};

/** Big back-view head + shoulders at a frame side in a long coat that runs off the bottom of the frame (no hem, no legs:
 *  it can never end inside the frame), arms hanging at the sides (sleeve seam, cuff, sand hand), a white rim strip. */
export const EdgeOnlooker: React.FC<EdgeOnlookerProps> = ({x, y, head = 110, seed = 'onl', hair, acc, body, riseAt, bob = 1.5, raisePhoneAt, lowerPhoneAt, phoneSide, arms = 'both', depth = 'front', rim = 'left', frameBottom}) => {
  const t = useTime();
  const m = useXf();
  const g0 = personGeo(seed);
  const s = head / (g0.hr * 2);
  // where the frame bottom is in parent units (camera zoom / pull-back / sheet cell all included)
  let yb = frameBottom;
  if (yb === undefined) {
    const iv = mat.inv(m);
    const Y = canvas.height + 40;
    yb = Math.max(world.h + world.bleed, iv[3] * Y + iv[5], iv[1] * canvas.width + iv[3] * Y + iv[5]);
  }
  // torso length so the hip line (coat bottom) sits below it; quantised so the path is not rebuilt every frame
  const need = (yb + 30 - y) / s - g0.hr * 0.86;
  const torsoH = Math.min(8000, Math.max(220, Math.ceil(need / 64) * 64));
  const g = personGeo(seed, torsoH);
  const coat = body ?? personCoat(seed, hair !== undefined);
  const holdPhone = !!acc?.includes('phone');
  const q = holdPhone ? 1 : raiseQ(t, raisePhoneAt, lowerPhoneAt);
  const jolt = raisePhoneAt !== undefined && t >= raisePhoneAt && t < raisePhoneAt + 0.2 ? -Math.sin(((t - raisePhoneAt) / 0.2) * Math.PI) * 6 : 0;
  const hipY = y - g.hy * s + jolt + (bob ? osc(t, 0.5, rand(seed, 'b') * 6) * bob : 0);
  const accs: Acc[] = (acc ?? []).filter((a) => a !== 'phone' && a !== 'backpack');
  const rise = riseAt !== undefined ? (1 - MOTION.rise.ease(prog(t, riseAt, MOTION.rise.dur))) * head * 2.2 : 0;
  if (riseAt !== undefined && t < riseAt) return null;

  // ---- arms (person-local units: hip line at 0, torso top at -h)
  const W = DEPTH_INK[depth] / s;
  const px = 1 / Math.max(1e-4, s * Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])));
  const sx = m[0] * x + m[2] * y + m[4];
  const near: 1 | -1 = sx < canvas.width / 2 ? 1 : -1;
  const pside: 1 | -1 = phoneSide ? (phoneSide === 'right' ? 1 : -1) : near;
  const {hw, R, xAt} = torsoSides(g);
  const d = g.w * 0.18;
  const yTop = -g.h + R - Math.sqrt(Math.max(0, R * R - (R - d) * (R - d))) + g.w * 0.03;
  const yCuff = -g.h + g.w * 1.05;
  const xc = xAt(yCuff);
  const parts: React.ReactNode[] = [];
  const sides: (1 | -1)[] = arms === false ? [] : arms === 'near' ? [near] : [-1, 1];
  for (const sd of sides) {
    if (sd === pside && q > 0.02) continue; // that arm is up
    const seam = `M${(sd * (hw - d)).toFixed(2)} ${yTop.toFixed(2)}Q${(sd * (hw - d + g.w * 0.012)).toFixed(2)} ${((yTop + yCuff) / 2).toFixed(2)} ${(sd * (xc - d)).toFixed(2)} ${yCuff.toFixed(2)}`;
    const cuff = `M${(sd * (xc - 0.5)).toFixed(2)} ${yCuff.toFixed(2)}L${(sd * (xc - d)).toFixed(2)} ${(yCuff + 0.6).toFixed(2)}`;
    const hand = blob(sd * (xc - d * 0.5), yCuff + g.w * 0.085, g.w * 0.075, g.w * 0.1, {seed: `${seed}/h${sd}`});
    parts.push(
      <g key={`arm${sd}`}>
        <Ink d={seam + cuff} width={W * 0.85} taper={false} seed={`${seed}/seam${sd}`} />
        <Fill d={hand} color={palette.sand} offset={false} mode="none" seed={`${seed}/hf${sd}`} />
        <Ink d={hand} width={W * 0.8} taper={false} seed={`${seed}/hi${sd}`} />
      </g>,
    );
  }
  if (q > 0.02) {
    // the phone arm swings about the shoulder from hanging to raised (mirrored for the left arm)
    const sh: Pt = [hw - d * 0.5, -g.h + R * 0.55];
    const hd: Pt = [xc - d * 0.5, yCuff + g.w * 0.06];
    const hu: Pt = [g.w * 0.62, g.hy - g.hr * 1.25];
    const a0 = Math.atan2(hd[1] - sh[1], hd[0] - sh[0]);
    const a1 = Math.atan2(hu[1] - sh[1], hu[0] - sh[0]);
    const L = lerp(Math.hypot(hd[0] - sh[0], hd[1] - sh[1]), Math.hypot(hu[0] - sh[0], hu[1] - sh[1]), Math.min(1, q));
    const a = a0 + (a1 - a0) * q;
    const hand: Pt = [pside * (sh[0] + Math.cos(a) * L), sh[1] + Math.sin(a) * L];
    const rot = (pside * (a - a1) * 180) / Math.PI;
    parts.push(
      <g key="phoneArm">
        <Arm sh={[pside * sh[0], sh[1]]} hand={hand} w={d * 1.05} coat={coat} W={W * 0.9} seed={`${seed}/parm`} />
        <XG m={mat.compose(mat.translate(hand[0], hand[1]), mat.rotate(rot))}>
          <Fill d={roundRect(-13.5, -50, 27, 46, 5)} color={palette.card} offset={false} mode="none" seed={`${seed}/ph`} />
          <Ink d={roundRect(-13.5, -50, 27, 46, 5, {seed: `${seed}/phi`}) + `M-6 -40H6`} width={W * 0.85} taper={false} seed={`${seed}/phi`} />
        </XG>
      </g>,
    );
  }
  const rimD = rim ? rimStripD(g, rim === 'left' ? -1 : 1, W, px, g.w * 2.2) : '';
  return (
    <XG m={mat.translate(0, rise)}>
      <Person x={x} y={hipY} s={s} seed={seed} hair={hair} acc={accs} body={coat} torsoH={torsoH} ink={DEPTH_INK[depth]} hero={false} rim={false} />
      <XG m={mat.compose(mat.translate(x, hipY), mat.scale(s))}>
        {rimD ? <Fill d={rimD} color={palette.white} offset={false} mode="none" seed={`${seed}/rim`} /> : null}
        {parts}
      </XG>
    </XG>
  );
};
