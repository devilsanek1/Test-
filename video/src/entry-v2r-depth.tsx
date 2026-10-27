// DEPTH DEMO (engine: lib/depth.ts + lib/particles.tsx; rules docs/look/CRAFT.md §f; how-to src/lib/DEPTH.md): ONE simple
// canal set at golden hour, drawn twice from the same shapes, in the tiered clean pen (src/v2r/pen.ts; the palette module
// is imported FIRST). Compositions (1080 x 1920, 60 fps, 6 s):
//   DepthDemo2R   props {mode}: 'flat' = v2's G4 look-clip faults on purpose (the far city in the near colours, the
//                 subject's lit corner on a field of its own value, our bank as level bands, things of one size);
//                 'depth' = the same set with lib/depth: the far rows one air step per plane (hue kept), simpler with
//                 distance (fewer values, tone-on-tone windows), a calm backing field behind the lit corner, ONE camera
//                 for the ground (joints run to the vanishing point, slab rows foreshorten, things sized by the camera,
//                 steps down to the water, the near ground a value step darker) and the particle presets (motes in the
//                 sun's light, dust in the near air, glints in the glitter path, a falling leaf, far birds);
//                 'trails' = 'depth' with each particle's last second as shrinking copies (a still shows the motion).
//   DepthLint2R   the palette lint (depthProblems, sizeProblems, particleProblems) of both modes as text.
// Render (GL=angle; 4 shared CPUs; stills at 0.4) and the check (scripts/qa/check_depth.py with its sheet):
//   GL=angle node scripts/render-frames.mjs DepthDemo2R <dir> 3 --entry=src/entry-v2r-depth.tsx --scale=0.4 --props='{"mode":"depth"}'
//   python3 -I scripts/qa/check_depth.py <dir>/f00180.png --sheet scripts/qa/depth_sheets/demo_canal.json
import './v2r/palette';
import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {CM} from './v2r/palette';
import {World} from './lib/World';
import {Fill} from './lib/Fill';
import {Ink} from './lib/Ink';
import {Tier} from './lib/tier';
import {TimeShift} from './lib/time';
import {tierFill} from './lib/pen';
import {ellipseD, Lit, polyD, rectD} from './lib/light';
import {RIG_CANAL} from './v2r/world/rigs';
import {rng} from './lib/rng';
import {backing, band, depthProblems, flight, groundCam, groundPoly, makeAtmosphere, nearStep, planeLod, recede, rowsZ, seamTone, sideFace, sizeProblems, toneOnTone, type GroundCam} from './lib/depth';
import {glitterPath, particleProblems, Particles, type ParticlesProps} from './lib/particles';
import type {Pt} from './lib/sketch';

const W = 1080;
const H = 1920;
const FPS = 60;
type Mode = 'flat' | 'depth' | 'trails';

// ---------------------------------------------------------------- the set's one camera and one atmosphere

/** ONE camera for everything below the horizon (CRAFT §f.5): eye 1.6 m over our quay (= the far towpath's level),
 *  horizon y 980 (hidden by the far bank), f 1400 px. Her line on the far towpath, 18 m away: 77 px/m (132 px tall). */
const CAM: GroundCam = groundCam({horizon: 980, vpx: 560, f: 1400, height: 1.6});
/** The air behind every plane: the sky's lowest step, the gold band (never the mint caption sky above it). */
const ATM = makeAtmosphere({name: 'demo canal, golden hour', air: CM.bandGold});

const SKY_STEPS = ['#CCDDCD', '#DDDCC6', CM.bandGold]; // mint (World) -> three flat steps -> the gold band at the horizon
const SKY_Y = [600, 700, 800, 1000];
const SUN = {x: 196, y: 800, r: 52};
const Z_HER = 18;
const Z_WING = 20;
const Z_FAR_COPING = 17;
const Z_COPING = 7.5;
const WING = {x0: 330, x1: W + 40, top: 637, parapet: 662, storey: 860, base: CAM.y(Z_WING)};
const FIN = {x0: 330, x1: 372, top: 610};
const HER = {x: 600, feet: CAM.y(Z_HER), h: 1.7 * CAM.pxPerM(CAM.y(Z_HER))};

// ---------------------------------------------------------------- the far city (planes +2, +3, +4)

type Bld = {x: number; w: number; top: number; c: string; plane: number; win: Pt[]};
const FAR_SRC = [CM.brickLight, CM.brick, CM.stucco, CM.limestone];
/** Seeded rows, the farther the smaller and the higher (Scale cues 2-3): +4 an infinity strip, +3 the back rows, +2 the
 *  front row. Same shapes in both modes; only the colours and the detail change. */
function farRows(): Bld[] {
  const out: Bld[] = [];
  const rows: {plane: number; w: [number, number]; top: [number, number]; win: number}[] = [
    {plane: 4, w: [14, 26], top: [908, 930], win: 0},
    {plane: 3, w: [24, 44], top: [850, 896], win: 5},
    {plane: 2, w: [44, 82], top: [796, 858], win: 8},
  ];
  for (const row of rows) {
    const r = rng(`demo/far/${row.plane}`);
    let x = -20;
    while (x < 372) {
      const w = r.range(row.w[0], row.w[1]);
      const top = r.range(row.top[0], row.top[1]);
      const win: Pt[] = [];
      if (row.win) for (let wy = top + row.win * 1.6; wy < 1080 - row.win * 2; wy += row.win * 2.6) for (let wx = x + row.win; wx < x + w - row.win * 1.4; wx += row.win * 2.2) win.push([wx, wy]);
      out.push({x, w, top, c: r.pick(FAR_SRC), plane: row.plane, win});
      x += w * r.range(0.82, 1.0);
    }
  }
  return out;
}
const FAR = farRows();

const FarCity: React.FC<{mode: Mode}> = ({mode}) => {
  const flat = mode === 'flat';
  return (
    <Tier tier="environment" bg={CM.sky}>
      {FAR.map((b, i) => {
        const lod = planeLod(b.plane);
        // flat: the near role colours everywhere, lamp-yellow and iron windows (the G4 clip's far city)
        const wall = flat ? b.c : recede(b.c, b.plane, ATM);
        const wins = flat ? b.win : lod.windows === 'none' ? [] : b.win.filter(() => true);
        const ws = b.plane === 2 ? 8 : 5;
        const keep = flat || ws >= lod.minFeature;
        return (
          <React.Fragment key={i}>
            <Fill d={rectD(b.x, b.top, b.w, 1100 - b.top)} color={wall} offset={false} />
            {keep
              ? wins.map((p, j) => (
                  <Fill key={j} d={rectD(p[0], p[1], ws, ws * 1.3)} color={flat ? (j % 3 ? CM.lamp : CM.paneUnlit) : toneOnTone(wall, {lit: j % 3 !== 0, dE: 4})} offset={false} />
                ))
              : null}
          </React.Fragment>
        );
      })}
    </Tier>
  );
};

// ---------------------------------------------------------------- the subject's plane: the wing, the towpath, her

const WIN1 = Array.from({length: 6}, (_, i) => [420 + i * 112, 690] as Pt);
const Wing: React.FC<{mode: Mode}> = ({mode}) => {
  const flat = mode === 'flat';
  // the calm backing field behind the lit fin (CRAFT §f.3): a far gasholder rising behind the wing's west corner, its
  // value set to part from the fin by >= 15 L* AS SHOWN (the fin and the gasholder are both tier C here)
  const finShown = tierFill(CM.stucco, 'environment', CM.sky);
  const gas = backing(finShown, SKY_STEPS[1], {tier: 'environment', bg: CM.sky});
  return (
    <Tier tier="environment" bg={CM.sky}>
      {flat ? null : (
        <>
          <Fill d={rectD(232, 598, 150, 520)} color={gas} offset={false} />
          <Fill d={rectD(226, 590, 162, 12)} color={gas} offset={false} />
        </>
      )}
      <Fill d={rectD(FIN.x1, WING.top, WING.x1 - FIN.x1, WING.base - WING.top)} color={CM.brickLight} offset={false} />
      <Fill d={rectD(FIN.x1, WING.top, WING.x1 - FIN.x1, WING.parapet - WING.top)} color={CM.limestone} offset={false} />
      <Fill d={rectD(FIN.x1, WING.storey, WING.x1 - FIN.x1, WING.base - WING.storey)} color={CM.stucco} offset={false} />
      {WIN1.map((p, i) => (
        <Fill key={i} d={rectD(p[0], p[1], 84, 128)} color={i === 4 ? CM.anchor : i % 2 ? CM.lamp : CM.glass} offset={false} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Fill key={i} d={rectD(400 + i * 170, WING.storey + 40, 130, WING.base - WING.storey - 40)} color={i === 1 ? CM.glass : CM.paneUnlit} offset={false} />
      ))}
      {/* the cream fin at the west corner: the lit edge the owner saw melt into the sky */}
      <Fill d={rectD(FIN.x0, FIN.top, FIN.x1 - FIN.x0, WING.base - FIN.top)} color={CM.stucco} offset={false} />
    </Tier>
  );
};

const Her: React.FC = () => {
  const {x, feet, h} = HER;
  const body = polyD([
    [x - h * 0.13, feet - h * 0.08],
    [x - h * 0.11, feet - h * 0.78],
    [x + h * 0.11, feet - h * 0.78],
    [x + h * 0.13, feet - h * 0.08],
  ]);
  const head = ellipseD({cx: x, cy: feet - h * 0.87, rx: h * 0.075, ry: h * 0.085});
  return (
    <Tier tier="subject">
      <Fill d={rectD(x - h * 0.08, feet - h * 0.12, h * 0.05, h * 0.12)} color={CM.anchor} offset={false} />
      <Fill d={rectD(x + h * 0.03, feet - h * 0.12, h * 0.05, h * 0.12)} color={CM.anchor} offset={false} />
      <Fill d={body} color={CM.hero} offset={false} />
      <Fill d={head} color={CM.anchor} offset={false} />
      <Ink d={body} width={3.4} />
    </Tier>
  );
};

// ---------------------------------------------------------------- the water

const Water: React.FC<{mode: Mode}> = ({mode}) => {
  const yFar = CAM.y(Z_FAR_COPING);
  const yNear = CAM.y(Z_COPING);
  if (mode === 'flat')
    return (
      <Tier tier="environment" bg={CM.sky}>
        <Fill d={rectD(-40, yFar, W + 80, yNear - yFar)} color={CM.water} offset={false} backdrop />
        {[0.3, 0.55, 0.8].map((k, i) => (
          <Fill key={i} d={rectD(80 + i * 140, yFar + (yNear - yFar) * k, 700, 4)} color={CM.waterDeep} offset={false} />
        ))}
      </Tier>
    );
  // two depth steps: the far water takes its air step, the near water a step darker (no ripple dash rows)
  const yMid = CAM.y(11);
  return (
    <Tier tier="environment" bg={CM.sky}>
      <Fill d={rectD(-40, yFar, W + 80, yMid - yFar)} color={recede(CM.water, 1.5, ATM)} offset={false} backdrop />
      <Fill d={rectD(-40, yMid, W + 80, yNear - yMid)} color={CM.water} offset={false} backdrop />
    </Tier>
  );
};

// ---------------------------------------------------------------- our quay: level bands (flat) vs ONE camera (depth)

const Thing: React.FC<{d: string; color: string}> = ({d, color}) => <Fill d={d} color={color} offset={false} />;

/** A box standing at (x, z) (metres) on `base` (m), w x dz x h, drawn from the camera: its front and its top. */
const boxAt = (cam: GroundCam, x: number, z: number, w: number, dz: number, h: number, base = 0) => ({
  front: polyD([cam.pt(x - w / 2, z, base), cam.pt(x + w / 2, z, base), cam.pt(x + w / 2, z, base + h), cam.pt(x - w / 2, z, base + h)]),
  top: polyD([cam.pt(x - w / 2, z, base + h), cam.pt(x + w / 2, z, base + h), cam.pt(x + w / 2, z + dz, base + h), cam.pt(x - w / 2, z + dz, base + h)]),
});

const Quay: React.FC<{mode: Mode}> = ({mode}) => {
  const yCop = CAM.y(Z_COPING);
  if (mode === 'flat') {
    // the G4 clip's bank: full-width level bands in two stones 3.8 L* apart, things of ONE size on every band
    const n = 5;
    const step = (H - yCop) / n;
    return (
      <Tier tier="environment" bg={CM.sky}>
        <Fill d={rectD(-40, yCop - 8, W + 80, H - yCop + 48)} color={CM.paving} offset={false} backdrop />
        {Array.from({length: n}, (_, i) => (
          <React.Fragment key={i}>
            <Fill d={rectD(-40, yCop + i * step, W + 80, step * 0.52)} color={CM.stucco} offset={false} />
            <Fill d={rectD(-40, yCop + i * step, W + 80, 3)} color={'#E6CDB8'} offset={false} />
          </React.Fragment>
        ))}
        <Thing d={rectD(140, yCop + step * 1.2, 70, 56)} color={CM.sage} />
        <Thing d={rectD(700, yCop + step * 1.5, 120, 40)} color={CM.line} />
        <Thing d={rectD(470, yCop + step * 2.4, 46, 40)} color={CM.coatMustard} />
        <Thing d={rectD(880, yCop + step * 3.3, 60, 52)} color={CM.sage} />
        <Thing d={rectD(300, yCop + step * 4.1, 40, 54)} color={CM.coatPlum} />
      </Tier>
    );
  }
  // DEPTH: ONE camera (CAM). Slabs 1.2 x 0.6 m laid flat on level 0 and projected: the joints along z run to the
  // vanishing point, the rows foreshorten toward the water, the joints narrow with distance (bands of 4-5 cm), and the
  // ground is a value step darker toward us (planes 0 / -0.5 / -1)
  const zNear = CAM.z(H + 20);
  const xs = Array.from({length: 29}, (_, i) => -8.4 + i * 0.6);
  const zs = rowsZ(Z_COPING - 0.3, zNear, Math.round((Z_COPING - 0.3 - zNear) / 0.6));
  const g0 = CM.paving;
  const g1 = nearStep(CM.paving, -0.5, ATM);
  const g2 = nearStep(CM.paving, -1, ATM);
  const seam = (c: string) => seamTone(c, 7);
  // a flight of steps cut into the quay at the left, down to the water: drawn first (the pit), then the quay with the
  // hole (evenodd), then the joints clipped to the quay; its left wall (the cheek, facing the camera) recedes
  const STEPS = {x0: -2.0, x1: -0.6, z0: 5.6};
  const steps = flight(CAM, {x0: STEPS.x0, x1: STEPS.x1, z0: STEPS.z0, tread: 0.62, rise: 0.17, n: 3, level0: -0.17, dir: 'down'});
  // a quay band z0..z1 minus the part of the flight's hole inside it (evenodd: the hole must lie inside the band)
  const quayArea = (z0: number, z1: number) => {
    const h0 = Math.max(z0, STEPS.z0);
    const h1 = Math.min(z1, Z_COPING);
    return polyD(groundPoly(CAM, -12, 12, z0, z1)) + (h1 > h0 ? polyD(groundPoly(CAM, STEPS.x0, STEPS.x1, h0, h1, 0)) : '');
  };
  const bench = boxAt(CAM, 0.95, 4.2, 1.8, 0.45, 0.45);
  const benchBack = polyD([CAM.pt(0.05, 4.65, 0.45), CAM.pt(1.85, 4.65, 0.45), CAM.pt(1.85, 4.65, 0.85), CAM.pt(0.05, 4.65, 0.85)]);
  const planter = boxAt(CAM, -1.15, 3.1, 0.7, 0.7, 0.5);
  const bollards = [-1.6, 1.9].map((x) => boxAt(CAM, x, Z_COPING - 0.45, 0.24, 0.24, 0.62));
  const tote = boxAt(CAM, 0.6, 4.25, 0.36, 0.12, 0.42, 0.45);
  const cups = [0.4, 0.52].map((x) => boxAt(CAM, x, Z_COPING - 0.3, 0.08, 0.08, 0.12));
  return (
    <Tier tier="environment" bg={CM.sky}>
      <defs>
        <clipPath id="depthDemoQuay" clipPathUnits="userSpaceOnUse">
          <path d={quayArea(zNear - 1, Z_COPING)} clipRule="evenodd" />
        </clipPath>
      </defs>
      {/* the pit: the water at its foot, the treads far first (each nosing hides the tread below), the cheek */}
      <Fill d={polyD(groundPoly(CAM, STEPS.x0, STEPS.x1, STEPS.z0, Z_COPING + 0.4, -0.6))} color={CM.waterDeep} offset={false} />
      {steps.map((st, i) => (
        <React.Fragment key={`s${i}`}>
          <Fill d={polyD(st.tread)} color={i % 2 ? CM.stucco : CM.limestone} offset={false} />
          <Fill d={polyD(band(CAM, [STEPS.x0, st.z], [STEPS.x1, st.z], 0.05, st.level))} color={seam(CM.stucco)} offset={false} />
        </React.Fragment>
      ))}
      <Fill d={polyD(sideFace(CAM, STEPS.x0, STEPS.z0, Z_COPING, -0.6, 0))} color={nearStep(CM.paving, -1.6, ATM)} offset={false} />
      {/* the quay in three value steps toward us, the coping by the water, all with the flight's hole */}
      <Fill d={quayArea(4.5, Z_COPING)} color={g0} offset={false} backdrop rule="evenodd" />
      <Fill d={quayArea(3.2, 4.5)} color={g1} offset={false} backdrop rule="evenodd" />
      <Fill d={quayArea(zNear - 1, 3.2)} color={g2} offset={false} backdrop rule="evenodd" />
      <Fill d={quayArea(Z_COPING - 0.3, Z_COPING)} color={CM.limestone} offset={false} rule="evenodd" />
      {/* joints: along z (receding to the VP) and across (cross joints), flat tone bands narrowing with distance */}
      <g clipPath="url(#depthDemoQuay)">
        {xs.map((x, i) => (
          <Fill key={`x${i}`} d={polyD(band(CAM, [x, zNear - 1], [x, Z_COPING - 0.3], 0.05))} color={seam(g0)} offset={false} />
        ))}
        {zs.slice(1).map((z, i) => (
          <Fill key={`z${i}`} d={polyD(band(CAM, [-12, z], [12, z], 0.04))} color={seam(z < 3.2 ? g2 : z < 4.5 ? g1 : g0)} offset={false} />
        ))}
      </g>
      {/* things sized by the camera: the near ones bigger per metre, never smaller */}
      {bollards.map((b, i) => (
        <React.Fragment key={`b${i}`}>
          <Thing d={b.front} color={CM.anchor} />
          <Thing d={b.top} color={CM.coatPlum} />
        </React.Fragment>
      ))}
      {cups.map((c, i) => (
        <Thing key={`c${i}`} d={c.front} color={CM.paper} />
      ))}
      <Thing d={planter.front} color={CM.line} />
      <Thing d={planter.top} color={CM.sage} />
      <Thing d={benchBack} color={CM.line} />
      <Thing d={bench.front} color={CM.brickDeep} />
      <Thing d={bench.top} color={CM.line} />
      <Thing d={tote.front} color={CM.coatMustard} />
    </Tier>
  );
};

// ---------------------------------------------------------------- particles (the presets, one field each)

const GLITTER = glitterPath({x: SUN.x, yFar: CAM.y(Z_FAR_COPING) + 4, yNear: CAM.y(Z_COPING) - 6, wFar: 18, wNear: 64});
const JOINS = [5.5]; // the demo's one join (an example): no entrance within 0.2 s of it
export const DEMO_FIELDS: ParticlesProps[] = [
  {kind: 'motes', seed: 'demo/motes', region: {poly: [[12, 760], [320, 700], [320, 1060], [12, 1060]]}, on: recede(CM.brick, 2, ATM), count: 6, sun: [SUN.x, SUN.y], joins: JOINS, avoid: [[95, 290, 850, 310], [WING.x0 - 10, WING.top, W, H]]},
  {kind: 'dust', seed: 'demo/dust', region: {rect: [560, 1350, 460, 380]}, on: CM.paving, count: 3, sun: [SUN.x, SUN.y], joins: JOINS},
  {kind: 'glints', seed: 'demo/glints', region: {poly: GLITTER}, on: CM.water, horizon: CAM.horizon, count: 4, joins: JOINS},
  {kind: 'leaves', seed: 'demo/leaf', region: {rect: [8, 40, 40, 110]}, on: CM.sky, floor: 1880, colors: [CM.leafGold, CM.leafRust], joins: JOINS, margin: 12},
  {kind: 'birds', seed: 'demo/birds', region: {rect: [0, 150, W, 120]}, on: CM.sky, plane: 3, atm: ATM, count: 3, joins: JOINS, dir: 1},
];

const ParticleLayer: React.FC<{trails: boolean}> = ({trails}) => (
  <>
    {DEMO_FIELDS.map((f) =>
      trails ? (
        <React.Fragment key={f.seed}>
          {[0.75, 0.5, 0.25].map((k) => (
            <TimeShift key={k} by={k}>
              <Particles {...f} />
            </TimeShift>
          ))}
          <Particles {...f} />
        </React.Fragment>
      ) : (
        <Particles key={f.seed} {...f} />
      ),
    )}
  </>
);

// ---------------------------------------------------------------- the composition

const DepthDemo2R: React.FC<{mode?: Mode}> = ({mode = 'depth'}) => (
  <World sky={CM.sky} horizon={1000}>
    <Lit rig={RIG_CANAL}>
      {SKY_STEPS.map((c, i) => (
        <Fill key={i} d={rectD(-40, SKY_Y[i], W + 80, SKY_Y[i + 1] - SKY_Y[i])} color={c} offset={false} backdrop />
      ))}
      <Fill d={ellipseD({cx: SUN.x, cy: SUN.y, rx: SUN.r, ry: SUN.r})} color={CM.sun} offset={false} backdrop />
      <FarCity mode={mode} />
      <Wing mode={mode} />
      {/* the far towpath and its coping (plane 0), her on it */}
      <Tier tier="environment" bg={CM.sky}>
        <Fill d={rectD(-40, WING.base, W + 80, CAM.y(Z_FAR_COPING) - WING.base)} color={CM.paving} offset={false} />
      </Tier>
      <Her />
      <Water mode={mode} />
      <Quay mode={mode} />
      {mode === 'flat' ? null : <ParticleLayer trails={mode === 'trails'} />}
    </Lit>
    <svg style={{position: 'absolute', left: 0, top: 0}} width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <text x={40} y={1880} fontSize={30} fontFamily="'DejaVu Sans', sans-serif" fill={CM.ink}>
        {mode === 'flat' ? 'FLAT (the G4 faults)' : mode === 'trails' ? 'DEPTH + particle trails (1 s)' : 'DEPTH (lib/depth + lib/particles)'}
      </text>
    </svg>
  </World>
);

// ---------------------------------------------------------------- the lint, as text

const DepthLint2R: React.FC = () => {
  const far = (mode: Mode, plane: number) => FAR.filter((b) => b.plane === plane).map((b) => (mode === 'flat' ? b.c : recede(b.c, b.plane, ATM)));
  const subject = [CM.brickLight, CM.stucco, CM.limestone];
  const things = [
    {name: 'her (far towpath)', y: HER.feet, px: HER.h, m: 1.7},
    {name: 'bollard at the coping', y: CAM.y(Z_COPING - 0.45), px: 0.62 * CAM.scale(Z_COPING - 0.45), m: 0.62},
    {name: 'planter', y: CAM.y(3.1), px: 0.5 * CAM.scale(3.1), m: 0.5},
  ];
  const lines: string[] = [];
  for (const mode of ['flat', 'depth'] as Mode[]) {
    const p = depthProblems(ATM, [
      {plane: 0, colors: subject},
      {plane: 2, colors: far(mode, 2)},
      {plane: 3, colors: far(mode, 3)},
      {plane: 4, colors: far(mode, 4)},
    ]);
    lines.push(`${mode}: ${p.length} plane problems`, ...p.map((s) => '  ' + s));
  }
  const s = sizeProblems(things, {horizon: CAM.horizon});
  lines.push(`one camera: ${s.length} size problems`, ...s.map((x) => '  ' + x));
  const pp = particleProblems(DEMO_FIELDS, {joins: JOINS});
  lines.push(`particles: ${pp.length} problems (the demo shows all five presets; a shot picks 2-3)`, ...pp.map((x) => '  ' + x));
  return (
    <AbsoluteFill style={{background: CM.paper}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {lines.map((l, i) => (
          <text key={i} x={30} y={60 + i * 34} fontSize={20} fontFamily="'DejaVu Sans', sans-serif" fill={CM.ink}>
            {l}
          </text>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const V2RDepthRoot: React.FC = () => (
  <>
    <Composition id="DepthDemo2R" component={DepthDemo2R} defaultProps={{mode: 'depth' as Mode}} durationInFrames={6 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="DepthLint2R" component={DepthLint2R} durationInFrames={1} fps={FPS} width={W} height={H} />
  </>
);

registerRoot(V2RDepthRoot);
