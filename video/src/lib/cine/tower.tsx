// cine/tower.tsx — Tower: a monumental building seen from below in 3-point perspective. Two faces meet at a near
// corner; verticals converge to a zenith vanishing point high above, so the top recedes into the sky. Window grids
// are mapped through each face's homography (upper floors foreshorten), batched; one face lit, one in shade, a
// rim strip on the lit edge, bold ink on the near corner, a setback crown and a spire.
//
//   <Tower x={540} y={1700} wl={420} wr={360} top={-900} vpy={-5200} tod="dusk"
//     windows={{initial: 0.3, events: [{at: 1, dur: 3, to: 'on', pattern: 'rows'}]}} />
//   towerFaces({...}) -> {left, right} quads, to attach things to the facade.
// Build (`at`, `buildDur`): the faces rise from the street toward the zenith (out-cubic); floor lines ink on and window
// rows appear as the top edge passes them; crown and spire pop last. Un-build: windows off, the tower sinks into its
// foot, ink drops. Look: paper = white faces + ink.

import React, {useMemo} from 'react';
import {palette, stroke} from '../theme';
import {useTime} from '../time';
import {Seed} from '../rng';
import {line, Pt} from '../sketch';
import {ambient, TodLike, TodPalette, todPal, useTodPal} from './atmosphere';
import {darker} from './city';
import {lerpPt, Quad, quadMap} from './persp';
import {gridCells, SwitchEvent, switchTimes, windowPaths} from './windows';
import {PathBuf} from './util';
import {exitScale, inkOn, isPaper, lookPaint, useCineState} from './state';
import {ease as E, prog} from '../time';

export type TowerGeoOpts = {
  /** Near corner foot (screen). */
  x: number;
  y: number;
  /** Width of the left / right face at the base (screen px). */
  wl?: number;
  wr?: number;
  /** How much the far base corners rise (receding ground edges). */
  rise?: number;
  /** Top of the tower (screen y of the near corner's top). */
  top: number;
  /** Zenith vanishing point y (far above); x defaults to the corner x. */
  vpy?: number;
  vpx?: number;
};

/** Screen quads [TL, TR, BR, BL] of the two faces. */
export function towerFaces(o: TowerGeoOpts): {left: Quad; right: Quad; vp: Pt} {
  const wl = o.wl ?? 400;
  const wr = o.wr ?? 360;
  const rise = o.rise ?? 60;
  const vp: Pt = [o.vpx ?? o.x, o.vpy ?? o.top - 4000];
  const N0: Pt = [o.x, o.y];
  const L0: Pt = [o.x - wl, o.y - rise];
  const R0: Pt = [o.x + wr, o.y - rise * 0.8];
  const up = (p: Pt): Pt => lerpPt(p, vp, (p[1] - o.top) / (p[1] - vp[1]));
  const Nt = up(N0);
  // tops of the far edges sit a bit lower than the near top (the roof edges also recede)
  const Lt = lerpPt(L0, vp, (L0[1] - o.top - rise * 0.6) / (L0[1] - vp[1]));
  const Rt = lerpPt(R0, vp, (R0[1] - o.top - rise * 0.5) / (R0[1] - vp[1]));
  return {left: [Lt, Nt, N0, L0], right: [Nt, Rt, R0, N0], vp};
}

export type TowerProps = TowerGeoOpts & {
  tod?: TodLike | TodPalette;
  /** Face colours (lit / shade). */
  lit?: string;
  shade?: string;
  /** Floors / columns of windows per face. */
  floors?: number;
  colsL?: number;
  colsR?: number;
  windows?: {initial?: number; events?: SwitchEvent[]};
  /** Which face takes the light. */
  light?: 'left' | 'right';
  /** Crown + spire on top. */
  crown?: boolean;
  seed?: Seed;
  inkW?: number;
  /** Build: the tower rises from its foot over buildDur (default 1.6 s). Omit = standing. */
  at?: number;
  buildDur?: number;
};

export const Tower: React.FC<TowerProps> = ({tod, lit, shade, floors = 60, colsL = 10, colsR = 9, windows, light = 'right', crown = true, seed = 'tower', inkW = stroke.inkBold, at, buildDur = 1.6, ...g}) => {
  const S = useCineState();
  const t = S.t;
  const p = useTodPal(tod);
  const F = towerFaces(g);
  const litC = lit ?? ambient(palette.cream, p);
  const shadeC = shade ?? ambient(darker(darker(palette.cream)), p);
  const cL = light === 'left' ? litC : shadeC;
  const cR = light === 'right' ? litC : shadeC;
  const cells = useMemo(
    () => [...gridCells({rows: floors, cols: colsL, fw: 0.5, fh: 0.55, jitter: 0}, `${seed}/L`, F.left), ...gridCells({rows: floors, cols: colsR, fw: 0.5, fh: 0.55, jitter: 0}, `${seed}/R`, F.right)],
    [JSON.stringify(F), floors, colsL, colsR, seed],
  );
  const ev = windows?.events ?? [];
  const times = useMemo(() => switchTimes(cells, ev, `${seed}/w`), [cells, JSON.stringify(ev), seed]);
  // build progress: fraction of the height standing (screen-linear along the converging edges)
  const kb = at === undefined ? 1 : E.outCubic(prog(t, at, buildDur));
  const N0y = F.left[2][1];
  const Nty = F.left[1][1];
  const topY = N0y + (Nty - N0y) * kb; // the rising top line (near corner)
  const standing = (y: number) => kb >= 1 || y >= topY - 1;
  const W = windowPaths(cells, ev, times, t, {initial: windows?.initial ?? (p.stars > 0.3 ? 0.5 : 0.04), lit: p.windowLit, pop: 0.3}, 1, {
    keep: kb >= 1 ? undefined : (i: number) => standing(cells[i].quad ? cells[i].quad![0][1] : 0),
    dark: S.e > 0.05 ? () => true : undefined,
  });
  const geo = useMemo(() => {
    const mL = quadMap(F.left);
    const mR = quadMap(F.right);
    const ink = new PathBuf();
    const thin = new PathBuf();
    const rim = new PathBuf();
    const [Lt, Nt, N0, L0] = F.left;
    const [, Rt, R0] = F.right;
    ink.raw(line(N0[0], N0[1], Nt[0], Nt[1], {seed: `${seed}/n`, over: [0, 40]}));
    ink.raw(line(L0[0], L0[1], Lt[0], Lt[1], {seed: `${seed}/l`, over: [0, 30]}));
    ink.raw(line(R0[0], R0[1], Rt[0], Rt[1], {seed: `${seed}/r`, over: [0, 30]}));
    ink.raw(line(Lt[0], Lt[1], Nt[0], Nt[1], {seed: `${seed}/tl`, over: [16, 10]}));
    ink.raw(line(Nt[0], Nt[1], Rt[0], Rt[1], {seed: `${seed}/tr`, over: [10, 16]}));
    // floor bands every few floors (thin, run past the near corner a little); kept per floor for the build
    const bands: {y: number; d: string}[] = [];
    for (let f = 4; f < floors; f += 4) {
      const v = f / floors;
      const a = mL(0, v);
      const b = mL(1, v);
      const c = mR(1, v);
      bands.push({y: b[1], d: line(a[0], a[1], b[0], b[1], {seed: `${seed}/fl${f}`, over: [0, 6], breaks: false}) + line(b[0], b[1], c[0], c[1], {seed: `${seed}/fr${f}`, over: [6, 0], breaks: false})});
    }
    thin.raw(bands.map((x) => x.d).join(''));
    // rim light strip down the lit face's outer edge
    const m = light === 'right' ? mR : mL;
    const u0 = light === 'right' ? 0.965 : 0;
    const u1 = light === 'right' ? 1 : 0.035;
    rim.quad(m(u0, 0), m(u1, 0), m(u1, 1), m(u0, 1));
    // crown: a setback box + spire toward the zenith VP
    let crownFill = '';
    let crownInk = '';
    if (crown) {
      const cl = lerpPt(Lt, Nt, 0.3);
      const cr = lerpPt(Nt, Rt, 0.7);
      const h = (N0[1] - Nt[1]) * 0.06;
      const up = (q: Pt, k: number): Pt => lerpPt(q, F.vp, (k * h) / Math.max(1, q[1] - F.vp[1]));
      const box: Pt[] = [cl, Nt, cr, up(cr, 1), up(Nt, 1.05), up(cl, 1)];
      crownFill = new PathBuf().poly(box).d;
      const st = up(Nt, 1.05);
      const spire: Pt = up(Nt, 3.2);
      crownFill += new PathBuf().poly([lerpPt(st, up(cl, 1), 0.12), spire, lerpPt(st, up(cr, 1), 0.12)]).d;
      crownInk = line(cl[0], cl[1], box[5][0], box[5][1], {seed: `${seed}/c1`, over: [0, 4]}) + line(box[5][0], box[5][1], st[0], st[1], {seed: `${seed}/c2`}) + line(st[0], st[1], box[3][0], box[3][1], {seed: `${seed}/c3`}) + line(st[0], st[1], spire[0], spire[1], {seed: `${seed}/sp`, over: [0, 20]});
    }
    return {ink: ink.d, thin: thin.d, rim: rim.d, crownFill, crownInk, bands, mL, mR};
  }, [JSON.stringify(F), floors, light, crown, seed]);
  const ek = exitScale(S.e, 0.35, 0.6);
  if (ek <= 0 || kb <= 0) return null;
  const mid: Pt = [g.x, (g.y + g.top) / 2];
  const paper = isPaper(S, mid);
  const color = !paper && S.look.fills === 'color';
  const showInk = inkOn(S, 0.35);
  // partial faces while building: the top edge slides up the converging edges
  const cut = (q: Quad): Quad => (kb >= 1 ? q : [lerpPt(q[3], q[0], kb), lerpPt(q[2], q[1], kb), q[2], q[3]]);
  const fL = cut(F.left);
  const fR = cut(F.right);
  const pL = lookPaint(S, cL, mid);
  const pR = lookPaint(S, cR, mid);
  const done = kb >= 1;
  const body = (
    <>
      {pL !== 'none' ? <path d={new PathBuf().quad(...fL).d} fill={pL} /> : null}
      {pR !== 'none' ? <path d={new PathBuf().quad(...fR).d} fill={pR} /> : null}
      {done && geo.crownFill && pL !== 'none' ? <path d={geo.crownFill} fill={color ? shadeC : palette.white} /> : null}
      {color && done ? <path d={geo.rim} fill={p.rim} /> : null}
      {color && W.dark ? <path d={W.dark} fill={p.stars > 0.3 ? p.windowDark : ambient(palette.sage, p)} /> : null}
      {color ? W.lit.map((d, i) => (d ? <path key={i} d={d} fill={p.windowLit[i % p.windowLit.length]} /> : null)) : null}
      {showInk ? <path d={done ? geo.thin : geo.bands.filter((b) => standing(b.y)).map((b) => b.d).join('')} fill="none" stroke={palette.ink} strokeWidth={stroke.inkThin} strokeLinecap="round" /> : null}
      {showInk && done ? <path d={geo.ink + geo.crownInk} fill="none" stroke={palette.ink} strokeWidth={inkW} strokeLinecap="round" /> : null}
      {showInk && !done ? <path d={new PathBuf().poly([fL[0], fL[1], fR[1]], false).d + new PathBuf().poly([fL[0], fL[3]], false).d + new PathBuf().poly([fL[1], fL[2]], false).d + new PathBuf().poly([fR[1], fR[2]], false).d} fill="none" stroke={palette.ink} strokeWidth={inkW} strokeLinecap="round" /> : null}
    </>
  );
  if (ek >= 1) return body;
  return <g transform={`translate(0 ${g.y}) scale(1 ${ek.toFixed(4)}) translate(0 ${-g.y})`}>{body}</g>;
};
