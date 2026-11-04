// FLOW v5, GUST: the body under the garment. Almost none of it is drawn: a slim neck, two slim dark legs ending in
// small dark wedges, and (rarely) one acting arm. What this file gives the garments is a RIG: where the head, the
// neck, the shoulders, the hips and the legs are, per view and per pose, in figure units (H = 1000 from the hair top
// to the sole, x to the screen right, y down). Everything faces the screen left (into the light and the wind).
//   q  front 3/4, turned to the screen left       p  profile, facing the screen left       b  from behind
// The walk is a profile cycle (phase 0..1: the near heel strikes in front at 0), the camera tracking (the pelvis
// stays at x = 0, the planted foot slides back), after people_v4/skel5.ts walk5 in 2D: stance 62 %, swing 38 %, the
// body lowest just after each contact and highest at the passing.
import {type V2, add, sub, mul, len, norm, clamp, lerp, rot, D2R} from './geo';

export type View = 'q' | 'p' | 'b';
export type Sex = 'f' | 'm';

/** The build: proportions in figure units (H = 1000). */
export type Build = {
  sex: Sex;
  /** the head's scale: head units (crown 0 .. chin 100) to figure units */
  head: number;
  /** the neck's width */
  neck: number;
  /** half the shoulders' width (frontal) */
  sh: number;
  /** the hip joints' height (y) standing */
  hipY: number;
  /** the leg's width at the hem line and at the ankle */
  leg: [number, number];
  /** the foot's (boot's) length */
  foot: number;
  /** how far the hips sit apart (half) */
  hipW: number;
};

export type Leg = {hip: V2; knee: V2; ankle: V2; heel: V2; toe: V2; far: boolean; pitch: number};
export type Rig = {
  view: View;
  /** the head's own view (the body in 3/4 may turn its head to the profile, looking out into the wind) */
  hv: View;
  /** the head: the crown (head-local 0,0) in figure units, its scale, its tilt (degrees, + = clockwise on screen) */
  head: {o: V2; k: number; tilt: number};
  neck: {top: V2; base: V2};
  /** the shoulder points, screen left and right */
  sh: [V2, V2];
  /** the upper body's offset this frame (the walk's bob and sway) */
  body: V2;
  /** the body's offset dt seconds ago (free cloth follows the bob late) */
  bodyLag: (dt: number) => V2;
  /** the head's vertical velocity (units/s; the hair's follow-through) */
  vy: number;
  legs: Leg[];
  /** the walk's phase (undefined standing) */
  ph?: number;
  /** the walk's legs dt seconds ago (the hem follows the knees a little late, smoothed) */
  legsAt?: (dt: number) => Leg[];
  /** the walk's ground speed (units/s, the planted foot sliding back) */
  speed?: number;
};

export type Stand = 'weight' | 'still' | 'wide' | 'step';
export type Pose = {kind: 'stand'; stand?: Stand} | {kind: 'walk'; ph: number; period?: number};

// ---------------------------------------------------------------- legs
const ANK = 34; // the ankle's height above the sole (standing)

/** Two-bone IK with a SOFT reach: near full extension the knee would snap (its speed grows without bound as the leg
 *  straightens), so the last 5 % of the reach is eased and the bones stretch a hair (under 2 %) to keep the foot planted:
 *  the knee moves smoothly through every stride (Nicholas's soft IK). */
function ik(hip: V2, ankle: V2, l1: number, l2: number, bendDir: 1 | -1): V2 {
  const d = sub(ankle, hip);
  const L0 = Math.max(len(d), Math.abs(l1 - l2) + 1);
  const Lmax = l1 + l2;
  const ds = Lmax * 0.05;
  const da = Lmax - ds;
  let L = L0;
  let st = 1;
  if (L0 > da) {
    L = da + ds * (1 - Math.exp(-(L0 - da) / ds));
    st = L0 / L;
  }
  const u = norm(d);
  const x = (l1 * l1 - l2 * l2 + L * L) / (2 * L);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  // the knee bends toward bendDir x the normal (screen: -1 = toward the screen left, the facing side)
  const nrm: V2 = [-u[1], u[0]];
  const s = nrm[0] * bendDir >= 0 ? 1 : -1;
  return add(hip, mul(add(mul(u, x), mul(nrm, h * s)), st));
}

/** A standing leg: hip, a slightly eased knee, the ankle; the foot turned per view. */
function standLeg(b: Build, view: View, hipX: number, ankle: V2, kneeEase: number, far: boolean, toeDir: number, pitch = 0): Leg {
  const hip: V2 = [hipX, b.hipY];
  const l1 = (1000 - ANK - b.hipY) * 0.505;
  const l2 = (1000 - ANK - b.hipY) * 0.495;
  const straight = lerp(hip, ankle, l1 / (l1 + l2));
  const knee: V2 = add(straight, [kneeEase, 0]);
  return {hip, knee, ankle, ...foot(b, view, ankle, toeDir, pitch), far, pitch};
}

/** The foot as a heel point and a toe point on the sole (a small wedge is drawn between them and the ankle). toeDir:
 *  screen degrees; pitch: + = the toe down (the push-off), - = the toe up (the heel strike). */
function foot(b: Build, view: View, ankle: V2, toeDir: number, pitch: number): {heel: V2; toe: V2} {
  const L = view === 'b' ? b.foot * 0.3 : view === 'q' ? b.foot * 0.8 : b.foot;
  const right = Math.cos(toeDir * D2R) >= 0;
  const a = toeDir + (right ? pitch : -pitch);
  const u: V2 = [Math.cos(a * D2R), Math.sin(a * D2R)];
  const down: V2 = right ? [-u[1], u[0]] : [u[1], -u[0]];
  const heel = add(ankle, add(mul(u, -L * 0.2), mul(down, ANK * 0.92)));
  const toe = add(heel, mul(u, L));
  return {heel, toe};
}

// ---------------------------------------------------------------- the rig
export function rig(b: Build, view: View, pose: Pose, headTilt = 0, headView?: View): Rig {
  const r = rig0(b, view, pose, headTilt);
  return {...r, hv: headView ?? (view === 'q' ? 'p' : view)};
}
function rig0(b: Build, view: View, pose: Pose, headTilt: number): Omit<Rig, 'hv'> {
  const k = b.head;
  if (pose.kind === 'walk') return walkRig(b, pose.ph, pose.period ?? 1.1);
  const st = pose.stand ?? 'weight';
  const neckBaseY = 1000 * 0.0 + k * 100 + 46;
  if (view === 'q') {
    // front 3/4, the weight on the far leg, the near knee eased forward, its foot turned out
    const headO: V2 = [-12, 8];
    const legs: Leg[] = [
      standLeg(b, 'q', -b.hipW * 0.45, [-34, 1000 - ANK], -3, true, 176, 0),
      st === 'still'
        ? standLeg(b, 'q', b.hipW * 0.45, [20, 1000 - ANK + 2], -2, false, 160, 0)
        : standLeg(b, 'q', b.hipW * 0.45, [36, 1000 - ANK + 3], -8, false, 152, 0),
    ];
    return {
      view,
      head: {o: headO, k, tilt: headTilt - 2},
      neck: {top: [-12, k * 92], base: [-6, neckBaseY]},
      sh: [
        [-b.sh * 0.82 - 4, neckBaseY + 36],
        [b.sh * 0.98, neckBaseY + 34],
      ],
      body: [0, 0],
      bodyLag: () => [0, 0],
      vy: 0,
      legs,
    };
  }
  if (view === 'b') {
    const headO: V2 = [-4, 8];
    const wide = st === 'wide';
    const legs: Leg[] = [
      standLeg(b, 'b', -b.hipW * 0.6, [wide ? -62 : -50, 1000 - ANK], 0, false, 90, 0),
      standLeg(b, 'b', b.hipW * 0.6, [wide ? 90 : 76, 1000 - ANK], 2, false, 90, 0),
    ];
    return {
      view,
      head: {o: headO, k, tilt: headTilt - 3},
      neck: {top: [-2, k * 90], base: [0, neckBaseY]},
      sh: [
        [-b.sh, neckBaseY + 36],
        [b.sh, neckBaseY + 36],
      ],
      body: [0, 0],
      bodyLag: () => [0, 0],
      vy: 0,
      legs,
    };
  }
  // profile, standing
  const headO: V2 = [-10, 8];
  const legs: Leg[] = [
    standLeg(b, 'p', 10, [26, 1000 - ANK], -4, true, 180, 0),
    standLeg(b, 'p', -2, st === 'step' ? [-62, 1000 - ANK] : [-24, 1000 - ANK], -6, false, 180, 0),
  ];
  return {
    view,
    head: {o: headO, k, tilt: headTilt},
    neck: {top: [-6, k * 92], base: [4, neckBaseY]},
    sh: [
      [-18, neckBaseY + 30],
      [30, neckBaseY + 26],
    ],
    body: [0, 0],
    bodyLag: () => [0, 0],
    vy: 0,
    legs,
  };
}

/** The walk in profile at phase ph (period s per cycle): see the header. */
export function walkRig(b: Build, ph: number, period: number): Omit<Rig, 'hv'> {
  const f = ((ph % 1) + 1) % 1;
  const m = b.sex === 'm';
  const ZF = m ? 176 : 166;
  const ZB = m ? 190 : 180;
  const ST = 0.62;
  const TAU = Math.PI * 2;
  const l1 = (1000 - ANK - b.hipY) * 0.505;
  const l2 = (1000 - ANK - b.hipY) * 0.495;
  const lift = (fp: number) => {
    const r = fp * D2R;
    return ANK * (1 - Math.cos(r)) + (fp >= 0 ? 0.62 : 0.2) * b.foot * Math.abs(Math.sin(r));
  };
  // one foot at its own phase s: forward is -x
  const footAt = (s: number): {ankle: V2; fp: number} => {
    let x: number;
    let y = 1000 - ANK;
    let fp = 0;
    if (s < ST) {
      const u = s / ST;
      x = -ZF + (ZF + ZB) * u;
      fp = u < 0.12 ? -14 * (1 - u / 0.12) : u < 0.58 ? 0 : 38 * Math.pow((u - 0.58) / 0.42, 1.4);
      y -= lift(fp);
    } else {
      const u = (s - ST) / (1 - ST);
      // a Hermite swing whose ends move with the ground (the foot leaves and lands moving back a little, as the stance
      // does): no velocity jump at toe-off or at contact
      const vb = 0.6 * ((ZF + ZB) * (1 - ST)) / ST;
      const u2 = u * u;
      const u3 = u2 * u;
      x = (2 * u3 - 3 * u2 + 1) * ZB + (u3 - 2 * u2 + u) * vb + (-2 * u3 + 3 * u2) * -ZF + (u3 - u2) * vb;
      fp = u < 0.35 ? 38 - 32 * (u / 0.35) : 6 - 20 * ((u - 0.35) / 0.65);
      y -= lift(fp) + 44 * Math.sin(Math.PI * Math.min(1, u * 1.2)) * (1 - u * 0.45);
    }
    return {ankle: [x, y], fp};
  };
  const hipDrop = (q: number) => 13 * Math.cos(2 * TAU * (q - 0.3));
  const hipY = b.hipY + 18 - hipDrop(f);
  const sway = 3 * Math.sin(TAU * f);
  const body: V2 = [sway, hipY - b.hipY];
  const bodyLag = (dt: number): V2 => {
    const g = f - dt / period;
    return [3 * Math.sin(TAU * g), 18 - hipDrop(g)];
  };
  const eps = 0.002;
  const vy = ((-hipDrop(f + eps) + hipDrop(f - eps)) / (2 * eps)) / period;
  const leg = (s: number, far: boolean, hx: number): Leg => {
    const {ankle, fp} = footAt(s);
    const hip: V2 = [hx, hipY];
    const knee = ik(hip, ankle, l1, l2, -1);
    const ank = ankle;
    // pitch: + = the toe down (push-off), - = the toe up (heel strike); the foot points to the screen left
    const ft = foot(b, 'p', ank, 180, fp);
    return {hip, knee, ankle: ank, ...ft, far, pitch: fp};
  };
  const legs = [leg((f + 0.5) % 1, true, 6), leg(f, false, -4)];
  const legsAt = (dt: number): Leg[] => {
    const g = f - dt / period;
    const r = walkRig(b, g, period);
    return r.legs.map((l) => ({...l, knee: sub(l.knee, [r.body[0] - body[0], 0]) as V2}));
  };
  return {
    view: 'p',
    head: {o: [-14 + sway, 8 + body[1]], k: b.head, tilt: 1},
    neck: {top: [-8 + sway, b.head * 92 + body[1]], base: [2 + sway, b.head * 100 + 46 + body[1]]},
    sh: [
      [-18 + sway, b.head * 100 + 76 + body[1]],
      [30 + sway, b.head * 100 + 72 + body[1]],
    ],
    body,
    bodyLag,
    vy,
    legs,
    legsAt,
    ph: f,
    speed: (ZF + ZB) / (ST * period),
  };
}
