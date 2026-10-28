// kit/Fleet.tsx (the WINDOW lane's kit requests, docs/v3/flow_v2.md §7): the street's vehicles and the queue's paper,
// drawn for the clean pen as flat shapes with soft corners (CRAFT §c), so one file holds them all:
//   FleetVan     variant 'van' (THE laptop van: cream box, the laptop decal), 'dc' (the data center's truck: x1.4 the
//                van, dcSide box, a mini data center with its lit "AI" sign on the side) and 'better' (the NEW laptop
//                decal with "BETTER" over it). `line` = the subject's one closed outline (3.0 px, inside the fill, in
//                the body's own deep shade); off it, no line at all (B / C). `lift` = warm light on it (the gate's
//                pool: "lit at last"), 0..1.
//   NoticeFlip   a notice on two posts with a calendar binding: each face swings DOWN over the last from the binding
//                (squash on, outBack; no fade), as the Calendar flip does up. Faces are nodes in face-local px.
//   CrateFlight  ONE small crate of gold sticks on an arc, shrinking into its target (StickFlight's grammar for a
//                crate): `crateFlightPose()` is pure, so a lane can aim the tag's tick at its landing.
//   CrateBox     the small crate itself (the van's one crate; the workers' loads).
// Geometry in canvas px at camera rest; times in the caller's seconds (pass them on film time for shared pieces).
import React, {useId} from 'react';
import {clamp, ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {fromLch, lch, mixHex, RIGS} from './Light';
import {Laptop} from './Laptop';
import {Txt, type Pt} from './util';
import {Tier, type Tier as TierT} from '../../../lib/tier';

const f1 = (v: number) => (Math.round(v * 10) / 10).toString();
/** The snow on the vans' roofs and the notice's binding: the street rig's sky-facing cap (CRAFT §d.2: L* 87-89, thin,
 *  never above the pool core), never the palette's lit EMBER.snow (L* 93): the brightest thing outside is never the snow. */
const SNOW = RIGS.street.snowCap;

/** The subject's line colour: the fill's own deep shade (L* -35, hue kept, never under L* 16; CRAFT §c). */
export const deepOf = (hex: string) => {
  const c = lch(hex);
  return fromLch(Math.max(16, c.L - 35), Math.min(c.C * 1.05, 60), c.h);
};

/** A closed polygon with round corners (r clamped to half of each neighbouring edge): made objects get soft corners. */
export function roundPoly(pts: Pt[], r: number | number[]): string {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const ri = Array.isArray(r) ? r[i] ?? 0 : r;
    const l1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const l2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const rr = Math.min(ri, l1 / 2, l2 / 2);
    const a: Pt = [p1[0] + ((p0[0] - p1[0]) / (l1 || 1)) * rr, p1[1] + ((p0[1] - p1[1]) / (l1 || 1)) * rr];
    const b: Pt = [p1[0] + ((p2[0] - p1[0]) / (l2 || 1)) * rr, p1[1] + ((p2[1] - p1[1]) / (l2 || 1)) * rr];
    d += `${i ? 'L' : 'M'}${f1(a[0])} ${f1(a[1])}Q${f1(p1[0])} ${f1(p1[1])} ${f1(b[0])} ${f1(b[1])}`;
  }
  return d + 'Z';
}
export const rrect = (x: number, y: number, w: number, h: number, r: number) => roundPoly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], r);
export const ellD = (cx: number, cy: number, rx: number, ry: number) => `M${f1(cx - rx)} ${f1(cy)}A${f1(rx)} ${f1(ry)} 0 1 0 ${f1(cx + rx)} ${f1(cy)}A${f1(rx)} ${f1(ry)} 0 1 0 ${f1(cx - rx)} ${f1(cy)}Z`;

/** A flat shape, and (when `line`) its one closed outline drawn INSIDE the fill (stroke 2w clipped to the shape: the
 *  silhouette stays the fill's clean edge). */
export const Shape: React.FC<{d: string; fill: string; line?: number | false; lineColor?: string}> = ({d, fill, line, lineColor}) => {
  const id = 'shp' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <path d={d} fill={fill} />
      {line ? (
        <>
          <defs>
            <clipPath id={id} clipPathUnits="userSpaceOnUse">
              <path d={d} />
            </clipPath>
          </defs>
          <path d={d} fill="none" stroke={lineColor ?? deepOf(fill)} strokeWidth={line * 2} strokeLinejoin="round" clipPath={`url(#${id})`} />
        </>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- the vans

export type FleetVariant = 'van' | 'dc' | 'better';

export type FleetVanProps = {
  /** Wheels' ground line: centre x and y. */
  x: number;
  y: number;
  /** Length (px). The van's standard; 'dc' is drawn x1.4 of the w you pass when `scaleDc` (default true). */
  w: number;
  variant?: FleetVariant;
  /** 1 = faces right (cab right), -1 = faces left. */
  dir?: 1 | -1;
  /** The subject's outline (3.0 px inside the fill). */
  line?: boolean;
  /** Warm light on it (the gate's pool), 0..1: the box and cab lift one warm step. */
  lift?: number;
  /** Headlights on. */
  lights?: boolean;
  /** Wheel turn (radians; a lane drives it from the distance travelled). */
  roll?: number;
  /** Multiply 'dc' by 1.4 (default true). */
  scaleDc?: boolean;
  /** The decal's own tier (default: the van's: subject when `line`, else environment). */
  decalTier?: TierT;
};

/** The geometry of a FleetVan (canvas px): its outline path (for shadows and rims), its back door (where a crate goes
 *  in / comes out), its size. */
export function fleetVanGeo(p: Pick<FleetVanProps, 'x' | 'y' | 'w' | 'variant' | 'dir' | 'scaleDc'>) {
  const dir = p.dir ?? 1;
  const w = p.variant === 'dc' && p.scaleDc !== false ? p.w * 1.4 : p.w;
  const h = w * (p.variant === 'dc' ? 0.46 : 0.5);
  const wheelR = w * 0.085;
  const x0 = p.x - w / 2;
  const top = p.y - h;
  const boxW = w * (p.variant === 'dc' ? 0.72 : 0.66);
  const floor = p.y - wheelR * 0.55;
  // drawn facing right, mirrored about x for dir -1
  const mx = (x: number) => (dir === 1 ? x : 2 * p.x - x);
  const body: Pt[] = [
    [x0, floor],
    [x0, top],
    [x0 + boxW, top],
    [x0 + boxW, top + h * 0.2],
    [x0 + w * 0.88, top + h * 0.24],
    [x0 + w, top + h * 0.56],
    [x0 + w, floor],
  ].map(([x, y]) => [mx(x), y] as Pt);
  const back: Pt = [mx(x0 + 4), top + h * 0.5];
  return {w, h, wheelR, top, floor, boxW, x0, mx, body, back, box: {x: Math.min(mx(x0), mx(x0 + boxW)), y: top, w: boxW, h: floor - top}};
}

const VAN_COLORS: Record<FleetVariant, {box: string; boxShade: string; cab: string; band: string}> = {
  van: {box: '#F3E2D3', boxShade: '#E5CDBF', cab: '#F3E2D3', band: '#C9A895'},
  better: {box: '#F6E7DA', boxShade: '#E8D2C4', cab: '#F6E7DA', band: '#C9A895'},
  dc: {box: EMBER.dc, boxShade: EMBER.dcSide, cab: '#3B4570', band: '#262B47'},
};

/** A van or a truck on the street (see the header). */
export const FleetVan: React.FC<FleetVanProps> = ({x, y, w: w0, variant = 'van', dir = 1, line = false, lift = 0, lights = false, roll = 0, scaleDc = true, decalTier}) => {
  const g = fleetVanGeo({x, y, w: w0, variant, dir, scaleDc});
  const {w, h, wheelR, top, floor, boxW, x0, mx} = g;
  const L = line ? 3 : false;
  const C0 = VAN_COLORS[variant];
  const warm = (c: string) => (lift > 0 ? mixHex(c, '#FFE2BC', 0.22 * clamp(lift)) : c);
  const C = {box: warm(C0.box), boxShade: warm(C0.boxShade), cab: warm(C0.cab), band: C0.band};
  const P = (pts: Pt[]) => pts.map(([px, py]) => [mx(px), py] as Pt);
  const bodyD = roundPoly(g.body, [3, 8, 6, 4, 10, 8, 3]);
  // the cab's window (sky-dark glass), the bumper band, the wheels
  const cabWin = roundPoly(P([[x0 + boxW + w * 0.03, top + h * 0.3], [x0 + w * 0.85, top + h * 0.32], [x0 + w * 0.94, top + h * 0.54], [x0 + boxW + w * 0.03, top + h * 0.54]]), 3);
  const band = roundPoly(P([[x0, floor - h * 0.12], [x0 + w, floor - h * 0.12], [x0 + w, floor], [x0, floor]]), 2);
  const wheels = [x0 + w * 0.2, x0 + w * 0.79].map(mx);
  const roofSnow = rrect(Math.min(mx(x0), mx(x0 + boxW)) - 2, top - 5, boxW + 4, 7, 3.5);
  const head = ellD(mx(x0 + w * 0.975), top + h * 0.66, w * 0.018, w * 0.026);
  const tail = rrect(Math.min(mx(x0 - 1), mx(x0 + 5)), top + h * 0.56, 6, h * 0.12, 2);
  // the decal on the box's side (its centre)
  const bx = mx(x0 + boxW * 0.5);
  const tier: TierT = decalTier ?? (line ? 'subject' : 'environment');
  let decal: React.ReactNode = null;
  if (variant === 'dc') {
    // a mini data center: a dark block, a lit sign strip with "AI", rows of tiny cold lights; a roof unit
    const dw = boxW * 0.56;
    const dh = h * 0.5;
    const dx = bx - dw / 2;
    const dy = top + h * 0.2;
    let leds = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) leds += rrect(dx + dw * (0.1 + c * 0.14), dy + dh * (0.5 + r * 0.15), dw * 0.07, dh * 0.06, 1);
    decal = (
      <>
        <path d={rrect(dx + dw * 0.18, dy - dh * 0.1, dw * 0.18, dh * 0.12, 2) + rrect(dx + dw * 0.62, dy - dh * 0.1, dw * 0.18, dh * 0.12, 2)} fill={EMBER.dcDark} />
        <path d={rrect(dx, dy, dw, dh, 3)} fill={EMBER.dcDark} />
        <path d={rrect(dx + dw * 0.1, dy + dh * 0.1, dw * 0.8, dh * 0.28, 2)} fill={EMBER.led} />
        <Txt x={bx} y={dy + dh * 0.32} size={dh * 0.26} fill={EMBER.ink}>
          AI
        </Txt>
        <path d={leds} fill={mixHex(EMBER.led, EMBER.dcDark, 0.35)} />
      </>
    );
  } else {
    const lw = boxW * (variant === 'better' ? 0.46 : 0.5);
    const ly = top + h * (variant === 'better' ? 0.6 : 0.56);
    decal = (
      <>
        <Tier tier={tier}>
          <Laptop x={bx} y={ly} w={lw} variant={variant === 'better' ? 'new' : 'old'} seed={`fleet/${variant}`} ink={2.2} />
        </Tier>
        {variant === 'better' ? (
          <Txt x={bx} y={top + h * 0.2} size={Math.max(16, h * 0.17)} fill={EMBER.beam} fit={boxW * 0.84}>
            BETTER
          </Txt>
        ) : null}
      </>
    );
  }
  return (
    <g>
      <Shape d={bodyD} fill={C.box} line={L} />
      {/* the cab a step apart from the box (one value step: they part by value, no line) */}
      <clipPath id={`fv${f1(x)}${f1(y)}${variant}`}>
        <path d={bodyD} />
      </clipPath>
      <g clipPath={`url(#fv${f1(x)}${f1(y)}${variant})`}>
        <path d={rrect(Math.min(mx(x0 + boxW), mx(x0 + w)), top, w - boxW, floor - top, 0)} fill={C.cab} />
        <path d={band} fill={C.band} />
      </g>
      <path d={cabWin} fill={variant === 'dc' ? '#7D8AB6' : '#8C98C2'} />
      <path d={roofSnow} fill={SNOW} />
      <path d={tail} fill={EMBER.beam} />
      <path d={head} fill={lights ? EMBER.core : mixHex(EMBER.houseLit, C.cab, 0.5)} />
      {decal}
      {line ? <Shape d={bodyD} fill="none" line={3} lineColor={deepOf(C.box)} /> : null}
      {wheels.map((wx, i) => (
        <g key={i}>
          <path d={ellD(wx, y - wheelR, wheelR, wheelR)} fill={EMBER.anchor} />
          <path d={ellD(wx, y - wheelR, wheelR * 0.42, wheelR * 0.42)} fill={EMBER.dcSide} />
          <path d={ellD(wx + Math.cos(roll) * wheelR * 0.22, y - wheelR + Math.sin(roll) * wheelR * 0.22, wheelR * 0.09, wheelR * 0.09)} fill={EMBER.frost} />
        </g>
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- the small crate

/** A small crate of gold sticks (base centre on y): a warm slatted box, three gold sticks with dark chips over its rim.
 *  `line` = the subject's outline. */
export const CrateBox: React.FC<{x: number; y: number; w: number; rot?: number; line?: boolean}> = ({x, y, w, rot = 0, line}) => {
  const h = w * 0.62;
  const x0 = x - w / 2;
  const sw = w * 0.4;
  const sh = sw * 0.31;
  const sticks = [-0.26, 0, 0.26].map((u, i) => {
    const sx = x + u * w - sw / 2;
    const sy = y - h - sh * (i === 1 ? 0.95 : 0.6);
    const chips = [0.14, 0.38, 0.62].map((c) => rrect(sx + sw * c, sy + sh * 0.2, sw * 0.16, sh * 0.48, 0.8)).join('');
    return {d: rrect(sx, sy, sw, sh, 1.5), chips, rot: [-10, 4, 12][i], c: [sx + sw / 2, sy + sh / 2] as Pt};
  });
  const box = rrect(x0, y - h, w, h, Math.max(2, w * 0.05));
  return (
    <g transform={rot ? `rotate(${f1(rot)} ${f1(x)} ${f1(y - h / 2)})` : undefined}>
      {sticks.map((s, i) => (
        <g key={i} transform={`rotate(${s.rot} ${f1(s.c[0])} ${f1(s.c[1])})`}>
          <path d={s.d} fill={EMBER.board} />
          <path d={s.chips} fill={EMBER.chip} />
        </g>
      ))}
      <Shape d={box} fill="#C98A64" line={line ? 2.4 : false} />
      <path d={rrect(x0 + w * 0.06, y - h * 0.56, w * 0.88, Math.max(1.5, h * 0.08), 1)} fill="#B07554" />
    </g>
  );
};

// ---------------------------------------------------------------- the crate flight

export type CrateFlightOpts = {
  from: Pt;
  to: Pt;
  t0: number;
  t1: number;
  /** Arc height above the straight line (px). */
  arc?: number;
  w0: number;
  w1: number;
  rot0?: number;
  rot1?: number;
};

/** The crate's pose at time t (null outside [t0, t1]): an eased arc, shrinking into its target over the last 18 %. */
export function crateFlightPose(t: number, o: CrateFlightOpts): {x: number; y: number; w: number; rot: number} | null {
  if (t < o.t0 || t >= o.t1) return null;
  const u = clamp((t - o.t0) / (o.t1 - o.t0));
  const p = ease.inOutSine(u);
  const arc = o.arc ?? 120;
  const x = o.from[0] + (o.to[0] - o.from[0]) * p;
  const y = o.from[1] + (o.to[1] - o.from[1]) * p - arc * 4 * p * (1 - p);
  const sink = 1 - prog(u, 0.82, 0.18, ease.inCubic);
  const w = (o.w0 + (o.w1 - o.w0) * p) * sink;
  const rot = (o.rot0 ?? -8) + ((o.rot1 ?? 10) - (o.rot0 ?? -8)) * p;
  return w < 2 ? null : {x, y, w, rot};
}

/** One small crate flying on its arc into its target (see crateFlightPose). Reads `useTime()` (pass film times inside
 *  a film-time provider). */
export const CrateFlight: React.FC<CrateFlightOpts & {line?: boolean}> = ({line, ...o}) => {
  const t = useTime();
  const q = crateFlightPose(t, o);
  if (!q) return null;
  return <CrateBox x={q.x} y={q.y + (q.w * 0.62) / 2} w={q.w} rot={q.rot} line={line} />;
};

// ---------------------------------------------------------------- the notice that flips

export type NoticeFace = {
  /** When this face swings on (the first face: from the start). */
  t: number;
  /** Its paper colour (default the warm white card). */
  paper?: string;
  /** Its content, in face-local px (0..w, 0..h). */
  node: React.ReactNode;
};

/** A notice board on two posts with a calendar binding (see the header). (x, y) = the face's top-left, w x h = the
 *  face; `ground` = the posts' foot. `line` = the subject's outline round the face (when it is the beat). `binding` /
 *  `rings` = the header's colours (default the dark anchor and the reveal; a calm board passes softer ones). */
export const NoticeFlip: React.FC<{x: number; y: number; w: number; h: number; ground: number; faces: NoticeFace[]; line?: boolean; dur?: number; binding?: string; rings?: string}> = ({x, y, w, h, ground, faces, line, dur = 0.24, binding = EMBER.anchor, rings = EMBER.reveal}) => {
  const t = useTime();
  const headH = Math.max(14, h * 0.13);
  const fy = y + headH;
  const fh = h - headH;
  const shown = faces.filter((f, i) => i === 0 || t >= f.t);
  const top = shown.length - 1;
  const face = (f: NoticeFace, i: number) => {
    const k = i === 0 || i < top ? 1 : ease.outBack(1.4)(prog(t, f.t, dur));
    if (k <= 0.01) return null;
    return (
      <XG key={i} m={mat.about(mat.scale(1, k), x, fy)}>
        <Shape d={rrect(x, fy, w, fh, 4)} fill={f.paper ?? EMBER.card} line={line && i === top ? 3 : false} />
        <XG m={mat.translate(x, fy)}>{f.node}</XG>
      </XG>
    );
  };
  const postW = Math.max(6, w * 0.035);
  return (
    <g>
      {/* the posts (behind the face), their snow caps, a contact strip is the scene's */}
      <path d={rrect(x + w * 0.12, y + h - 4, postW, ground - (y + h) + 4, 2) + rrect(x + w * 0.88 - postW, y + h - 4, postW, ground - (y + h) + 4, 2)} fill={EMBER.dcSide} />
      {/* the faces: the older ones under, the newest swinging down over them from the binding */}
      {shown.map((f, i) => (i < top - 1 ? null : face(f, i)))}
      {/* the binding: a dark header with two rings, snow on top */}
      <Shape d={rrect(x - 3, y, w + 6, headH, 4)} fill={binding} line={false} />
      {[0.3, 0.7].map((u, i) => (
        <path key={i} d={rrect(x + w * u - 4, y - headH * 0.35, 8, headH * 0.7, 4)} fill={rings} />
      ))}
      <path d={rrect(x - 4, y - 5, w + 8, 7, 3.5)} fill={SNOW} />
    </g>
  );
};
