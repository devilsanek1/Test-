// dc/lens.ts: the Arlington view's geometry, in METRES, projected with real pinhole maths (TREATMENT section 6, K7).
//
// The S5 end frame is authored in END coordinates (= the screen at rest when the crane lands). Its ground-plane
// pieces (the Pentagon, its lawns and roads, the valley floor in front) are modelled in metres and projected through
// ONE pitched pinhole camera `MID` (the "ground-quad" maths: every ground point goes through the same plane-to-screen
// homography, every wall through the same projection), then placed by one 2D fit (scale + translate) so the Pentagon
// lands where the frame wants it. Nothing about the building is drawn by hand: its five rings, the four light wells,
// the ten corridors, the courtyard and the five storeys of windows all come from the real plan below.
//
// THE PENTAGON (true to the real building, rounded): a regular pentagon, outer side 281 m (921 ft) -> apothem
// 193.4 m, circumradius 239.1 m; height 23.5 m (77 ft, five storeys); a pentagonal courtyard of ~2 ha (side 110 m,
// apothem 75.7 m); five concentric rings (E outermost .. A innermost) with four light wells between them; ten
// corridors, two per side, crossing the wells. Seen from the south-west, in 3/4: a corner toward the lens, the long
// facade on the left in shade (the morning sun is beyond the building on the right: 3/4 backlight, roofs lit,
// shadows toward us), the right facade grazing-lit, the courtyard's far wall and floor visible over the near rings.
//
// THE "MID" CAMERA is steeper than the scene's true crane (13 deg instead of a few) so the rings and the courtyard
// read; the far bands (river, city, obelisk) are flat steps above it, so the ground reads as curving away (the
// illustrator's aerial cheat). Everything inside the mid plane is consistent with itself.

import type {Pt} from '../../../lib/sketch';

export type V3 = [number, number, number];

// ---------------------------------------------------------------- the pitched pinhole

export type CamSpec = {
  /** Focal length (px). */
  f: number;
  /** Camera height above the ground (m). */
  h: number;
  /** Horizontal distance back from the local origin along -y (m). The camera looks along +y. */
  back: number;
  /** Pitch down (deg). */
  pitch: number;
  /** Lateral camera offset along x (m). */
  side?: number;
};

export class Pinhole {
  private c: number;
  private s: number;
  constructor(public spec: CamSpec) {
    const p = (spec.pitch * Math.PI) / 180;
    this.c = Math.cos(p);
    this.s = Math.sin(p);
  }
  /** Camera-space [x right, y up, depth] of a world point (local metres, z up). */
  cam(q: V3): V3 {
    const dx = q[0] - (this.spec.side ?? 0);
    const dy = q[1] + this.spec.back;
    const dz = q[2] - this.spec.h;
    const fw = dy * this.c - dz * this.s;
    const up = dy * this.s + dz * this.c;
    return [dx, up, fw];
  }
  /** Raw image coordinates (principal point at 0, 0; y down) and depth. */
  raw(q: V3): [number, number, number] {
    const [x, u, d] = this.cam(q);
    const dd = Math.max(1e-3, d);
    return [(this.spec.f * x) / dd, (-this.spec.f * u) / dd, d];
  }
}

/** A 2D placement of a raw projection: screen = raw * s + [tx, ty]. */
export type Fit = {s: number; tx: number; ty: number};

export class View {
  constructor(public cam: Pinhole, public fit: Fit) {}
  p(q: V3): Pt {
    const [x, y] = this.cam.raw(q);
    return [x * this.fit.s + this.fit.tx, y * this.fit.s + this.fit.ty];
  }
  /** Ground point (z = 0). */
  g(x: number, y: number): Pt {
    return this.p([x, y, 0]);
  }
  depth(q: V3): number {
    return this.cam.cam(q)[2];
  }
  /** Screen px per metre (horizontal) at a ground point. */
  pxPerM(x: number, y: number, z = 0): number {
    const a = this.p([x, y, z]);
    const b = this.p([x + 1, y, z]);
    return Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
}

// ---------------------------------------------------------------- the real plan (metres)

export const PENT = {
  /** Outer side 281 m (921 ft). */
  side: 281,
  apothem: 193.4,
  height: 23.5,
  storeys: 5,
  /** Courtyard apothem (side 110 m, ~2 ha). */
  courtApothem: 75.7,
  /** Rings, outside -> in: [outer apothem, inner apothem] of each roof band (E, D, C, B, A). The gaps are the light
   *  wells (6 m). Sum of bands + wells = 193.4 - 75.7 = 117.7 m. */
  rings: [
    [193.4, 174.4],
    [168.4, 150.4],
    [144.4, 126.4],
    [120.4, 102.4],
    [96.4, 75.7],
  ] as [number, number][],
  /** Corridors: perpendicular to each side, at these offsets from the side's midpoint (m), 8 m wide. 10 in all. */
  corridors: [-38, 38],
  corridorW: 8,
  /** Window pitch along a facade (m) and the storey heights (window bottom, top) above the ground (m). */
  windowPitch: 3.4,
  windowRows: [
    [1.6, 3.4],
    [6.2, 8.0],
    [10.8, 12.6],
    [15.4, 17.2],
    [19.6, 21.2],
  ] as [number, number][],
} as const;

/** Rotation of the plan (deg): 0 = a corner straight at the lens. 12 = the long facade on the left turns toward us. */
export const PENT_ROT = 12;

const COS36 = Math.cos(Math.PI / 5);
/** Circumradius of the pentagon with apothem a. */
export const circ = (a: number) => a / COS36;

/** Vertex i (0..4) of the pentagon with apothem a, centred at the local origin; vertex 0 points at the lens (-y). */
export function vert(a: number, i: number, rot = PENT_ROT): Pt {
  const ang = ((rot + i * 72 - 90) * Math.PI) / 180;
  const r = circ(a);
  return [r * Math.cos(ang), r * Math.sin(ang)];
}
export const pentagon = (a: number, rot = PENT_ROT): Pt[] => [0, 1, 2, 3, 4].map((i) => vert(a, i, rot));

/** Side i runs from vertex i to vertex i+1. Its outward normal and unit direction. */
export function sideFrame(i: number, rot = PENT_ROT): {n: Pt; t: Pt} {
  const ang = ((rot + i * 72 + 36 - 90) * Math.PI) / 180; // the normal points at the side's midpoint
  const n: Pt = [Math.cos(ang), Math.sin(ang)];
  return {n, t: [-n[1], n[0]]};
}
/** A point on side i at apothem a, offset s (m) from the side's midpoint along the side. */
export function sidePt(i: number, a: number, s: number, rot = PENT_ROT): Pt {
  const {n, t} = sideFrame(i, rot);
  return [n[0] * a + t[0] * s, n[1] * a + t[1] * s];
}
/** Half-length of a side at apothem a. */
export const halfSide = (a: number) => a * Math.tan(Math.PI / 5);

// ---------------------------------------------------------------- the MID view (the Pentagon's plane)

/** The mid camera: 13 deg down, a long lens (the plan reads almost axonometric, with a true perspective). */
export const MID_CAM = new Pinhole({f: 3000, h: 1600 * Math.tan((13 * Math.PI) / 180), back: 1600, pitch: 13});

/** Where the Pentagon lands in the END frame: left vertex x, far roofline y, drawn width. The right part runs past the
 *  right edge (two facades + the rings cut by it). */
export const PENT_PLACE = {left: 322, top: 846, width: 960};

function fitMid(): Fit {
  const pts: Pt[] = [];
  for (const q of pentagon(PENT.apothem)) {
    pts.push(MID_CAM.raw([q[0], q[1], 0]).slice(0, 2) as Pt);
    pts.push(MID_CAM.raw([q[0], q[1], PENT.height]).slice(0, 2) as Pt);
  }
  const x0 = Math.min(...pts.map((p) => p[0]));
  const x1 = Math.max(...pts.map((p) => p[0]));
  const y0 = Math.min(...pts.map((p) => p[1]));
  const s = PENT_PLACE.width / (x1 - x0);
  return {s, tx: PENT_PLACE.left - x0 * s, ty: PENT_PLACE.top - y0 * s};
}

export const MID = new View(MID_CAM, fitMid());

/** The Pentagon's screen box in end coordinates (ground + roof corners). */
export const PENT_BOX = (() => {
  const pts: Pt[] = [];
  for (const q of pentagon(PENT.apothem)) {
    pts.push(MID.p([q[0], q[1], 0]));
    pts.push(MID.p([q[0], q[1], PENT.height]));
  }
  return {x0: Math.min(...pts.map((p) => p[0])), y0: Math.min(...pts.map((p) => p[1])), x1: Math.max(...pts.map((p) => p[0])), y1: Math.max(...pts.map((p) => p[1]))};
})();

/** Sun direction for the mid plane's flat shadows: the morning sun is beyond the building, to the right (3/4 back
 *  light), altitude ~24 deg. Ground shadow of a point of height z: offset along -SUN_DIR by z / tan(alt). */
export const SUN_AZ_DEG = 38; // right of the view axis
export const SUN_ALT_DEG = 24;
export function shadowOffset(z: number): Pt {
  const a = (SUN_AZ_DEG * Math.PI) / 180;
  const len = z / Math.tan((SUN_ALT_DEG * Math.PI) / 180);
  // the sun is at +x (right), +y (ahead): shadows fall toward -x, -y (left, toward the lens)
  return [-Math.sin(a) * len, -Math.cos(a) * len];
}

/** Does a wall with outward normal n, through ground point m, face the lens? */
export function facesLens(cam: Pinhole, n: Pt, m: Pt): boolean {
  const cx = cam.spec.side ?? 0;
  const cy = -cam.spec.back;
  return n[0] * (cx - m[0]) + n[1] * (cy - m[1]) > 0;
}

/** Light on a wall whose outward normal is n (ground plane): 1 = facing the sun, < 0 = in shade. */
export function wallLight(n: Pt): number {
  const a = (SUN_AZ_DEG * Math.PI) / 180;
  return n[0] * Math.sin(a) + n[1] * Math.cos(a);
}
