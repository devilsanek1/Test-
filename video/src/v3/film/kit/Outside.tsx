// kit/Outside.tsx: the cold outside at blue hour, first snow (kit/README.md "Time of day"): the dusk-blue sky, falling
// snow, the town band (snow-capped houses with warm lit windows), THE AI data center (one model, five variants) and our
// roof ledge (warm brick: our side is warm, theirs is cold).

import React from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, circle, hline, line, poly, polyPath, rect as rectInk, vline} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {EMBER} from '../palette';
import {At, b, fillAt, Pt, Show, Txt, TCircle, TRect} from './util';
import {tiered} from '../../../lib/tier';

// ---------------------------------------------------------------- sky + snow

/** The flat dusk-blue sky over a rect (default: the whole frame plus bleed), with an optional lighter band (one flat
 *  step, no gradient) from `bandY` down to the horizon. */
const NightSkyBody: React.FC<{x?: number; y?: number; w?: number; h?: number; bandY?: number; horizon?: number; at?: At}> = ({x = -200, y = -200, w = 1480, h = 2320, bandY, horizon, at}) => (
  <>
    <Fill rect={[x, y, w, h]} color={EMBER.sky} at={at} mode="snap" offset={false} />
    {bandY !== undefined && horizon !== undefined && horizon > bandY ? <Fill rect={[x, bandY, w, horizon - bandY]} color={EMBER.skyLow} at={at} mode="snap" offset={false} /> : null}
  </>
);
export const NightSky = tiered('environment', {bg: EMBER.sky}, NightSkyBody);

/** Steady falling snow inside a rect: seeded flakes that drift down and wrap (deterministic in t). */
const SnowfallBody: React.FC<{x: number; y: number; w: number; h: number; n?: number; size?: number; speed?: number; seed?: string; at?: At; color?: string}> = ({x, y, w, h, n = 26, size = 1, speed = 1, seed = 'snow', at, color = EMBER.snow}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const r = rng(`flakes/${seed}`);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x0 = r.range(x + 6, x + w - 6);
    const y0 = r.range(y, y + h);
    const sp = r.range(26, 44) * speed;
    const rad = r.range(2.6, 4.6) * size;
    const fy = y + ((((y0 - y + sp * t) % h) + h) % h);
    const fx = x0 + Math.sin(t * 0.9 + i) * 4;
    out.push(<TCircle key={i} cx={fx} cy={fy} r={rad} fill={color} />);
  }
  return <>{out}</>;
};
export const Snowfall = tiered('environment', {bg: EMBER.sky}, SnowfallBody);

// ---------------------------------------------------------------- the town band

/** One house: left x, width, body height (default 0.62 w), a lit window, a chimney, and its own ground line `y`
 *  (default: the band's; a hill town steps up house by house). */
export type HouseSpec = {x: number; w: number; h?: number; lit?: boolean; chimney?: boolean; y?: number};

/** Snow-capped pitched-roof houses standing on the ground line `y` (two by default, as on the board's horizon).
 *  `far`: fill only (behind a window or far in a wide); otherwise thin ink. */
const TownBandBody: React.FC<{y: number; houses?: HouseSpec[]; x0?: number; x1?: number; n?: number; houseW?: number; far?: boolean; at?: At; seed?: string; ground?: string | false; groundH?: number}> = ({
  y,
  houses,
  x0 = 180,
  x1 = 900,
  n = 2,
  houseW = 70,
  far = true,
  at,
  seed = 'town',
  ground = false,
  groundH = 400,
}) => {
  const r = rng(`town/${seed}`);
  const list: HouseSpec[] =
    houses ??
    Array.from({length: n}, (_, i) => {
      const u = n === 1 ? 0.5 : i / (n - 1);
      const w = houseW * r.range(0.86, 1.14);
      return {x: x0 + u * (x1 - x0 - w), w, lit: r.chance(0.7), chimney: r.chance(0.5)};
    });
  return (
    <>
      {ground ? <Fill rect={[-200, y, 1480, groundH]} color={ground} at={at} mode="snap" offset={false} /> : null}
      {list.map((hs, i) => (
        <House key={i} {...hs} y={hs.y ?? y} far={far} at={b(at, i * 0.04)} seed={`${seed}/${i}`} />
      ))}
    </>
  );
};
export const TownBand = tiered('environment', {tone: EMBER.roofs, bg: EMBER.sky}, TownBandBody);

const House: React.FC<HouseSpec & {y: number; far: boolean; at?: At; seed: string}> = ({x, w, h, lit = true, chimney, y, far, at, seed}) => {
  const bodyH = h ?? w * 0.62;
  const eave = y - bodyH;
  const peak = eave - w * 0.42;
  const pk = x + w / 2;
  const body: Pt[] = [[x, y + 2], [x, eave], [x - w * 0.08, eave + 3], [pk, peak], [x + w * 1.08, eave + 3], [x + w, eave], [x + w, y + 2]];
  const cap: Pt[] = [[x - w * 0.11, eave + 4], [pk, peak - w * 0.07], [x + w * 1.11, eave + 4], [x + w * 1.03, eave + w * 0.09], [pk, peak + w * 0.06], [x - w * 0.03, eave + w * 0.09]];
  const ch: Pt[] = [[x + w * 0.66, peak + w * 0.12], [x + w * 0.66, peak - w * 0.04], [x + w * 0.8, peak - w * 0.04], [x + w * 0.8, peak + w * 0.26]];
  const win = {x: x + w * 0.38, y: eave + bodyH * 0.28, w: w * 0.22, h: bodyH * 0.34};
  return (
    <>
      {chimney ? <Fill d={polyPath(ch)} color={EMBER.roofs} at={fillAt(at)} offset={false} /> : null}
      <Fill d={polyPath(body)} color={EMBER.roofs} at={fillAt(at)} offset={false} seed={`${seed}/b`} />
      <Fill d={polyPath(cap)} color={EMBER.snow} at={fillAt(at, 0.03)} offset={false} seed={`${seed}/c`} />
      {lit ? <Fill rect={[win.x, win.y, win.w, win.h]} color={EMBER.houseLit} at={fillAt(at, 0.06)} offset={false} /> : null}
      {far ? null : <Ink d={poly(body.slice(1, 6), {seed: `${seed}/i`, over: [1, 3]}) + vline(x, eave, y, {over: [0, 0], seed: `${seed}/l`}) + vline(x + w, eave, y, {over: [0, 0], seed: `${seed}/r`})} at={at} width={2.2} />}
    </>
  );
};

// ---------------------------------------------------------------- THE AI data center

export type DataCenterVariant = 'normal' | 'dark' | 'far' | 'hall' | 'mini';

export type DataCenterProps = {
  /** Base centre (canvas px): the building stands on y. */
  x: number;
  y: number;
  /** Width (px). Board sizes: 436 in the window (O1, S15), 370 far (S13), 1290 hall, 330 (S10), 340 dark (S9 end). */
  w: number;
  /** Height (default by variant: 0.7 w; hall 0.4 w; mini 0.62 w). */
  h?: number;
  /** 'normal' | 'dark' (gone dark: the subject; O1 after 4.04, S15) | 'far' (fill-only silhouette, S13) |
   *  'hall' (wide hall, cut by both side edges, S9) | 'mini' (the drawing on the tag's back, S16). */
  variant?: DataCenterVariant;
  /** Sign text (default "AI DATA CENTER"; '' = a blank sign panel, the opening's frame 0; null = no sign). */
  sign?: string | null;
  /** The sign's letters pop in at this time (O1: 0.25). */
  signAt?: At;
  /** From this time on the building is the 'dark' variant (a 1-frame switch, O1: 4.04). */
  darkAt?: number;
  /** The emphasis that replaces the board's red circle: from this time the sign panel is LIT (cold light, ink letters). */
  signLitAt?: number;
  /** Roof units (default 3). */
  units?: number;
  /** Server lights blink (a few at a time). Default true. */
  blink?: boolean;
  at?: At;
  seed?: string;
  /** Screen ink weight (default 3.4; far = none). */
  ink?: number;
  /** Sign panel height (px; default by variant). A small building far in a wide (S9's 340 px hall at the end of the
   *  pull-back) takes a taller panel so its letters stay ~40 px. */
  signH?: number;
  /** The server lights' colour (default EMBER.led). Additive (v3 rework): a softer value keeps the rows of lights a
   *  quiet texture when the building is not the beat's subject. */
  ledColor?: string;
  /** 'ticks' (default: rows of small blinking server lights) | 'bands' (additive, the clean pen's version: each row is
   *  three long lit bands, no dash rows: CRAFT §c "no specks, ticks ... dash rows"). */
  ledStyle?: 'ticks' | 'bands';
  /** OPT-IN (v3 rework, 'bands' only): once the building goes dark (`darkAt`), its server rows are OFF and light up
   *  one row at a time from `at` over `dur` s (each row's bands a quick left-to-right sweep, 2 frames apart), in
   *  `color` (default ledColor): the subject's own motion on its beat ("AI data centers"). */
  rowsOn?: {at: number; dur: number; color?: string};
  /** OPT-IN (v3 rework): centre the sign plate on the lit FRONT face (shifted right by half the shaded side face), so
   *  the letters (always centred on that face) sit in the middle of their plate; default: the plate centred on the
   *  whole building and the letters a few px right of its middle. */
  signOnFace?: boolean;
  /** OPT-IN (v3 rework): the colour of its snow (the parapet's line, the roof units' lids); default the palette's lit
   *  EMBER.snow. H2's outside passes the street rig's sky-facing cap (L* 89, CRAFT §d.2). */
  snow?: string;
};

/** How far `signOnFace` moves the sign plate right (px): half the shaded side face (w x 0.06 / 2). */
export const signFaceShift = (w: number) => w * 0.03;

export function dataCenterGeo(x: number, y: number, w: number, h?: number, variant: DataCenterVariant = 'normal', signH?: number) {
  const H = h ?? (variant === 'hall' ? w * 0.4 : variant === 'mini' ? w * 0.62 : w * 0.7);
  const top = y - H;
  // the mini (the tag's back) carries a short sign ("AI") on a taller panel so it reads at phone size
  const sH = signH ?? (variant === 'hall' ? H * 0.17 : variant === 'mini' ? H * 0.28 : H * 0.2);
  const sign = {x: x - w * 0.43, y: top + H * 0.1, w: w * 0.86, h: sH};
  return {H, top, sign, x0: x - w / 2, x1: x + w / 2};
}

const DataCenterBody: React.FC<DataCenterProps> = ({x, y, w, h, variant: v0 = 'normal', sign = 'AI DATA CENTER', signAt, darkAt, signLitAt, units = 3, blink = true, at, seed = 'dc', ink = 3.4, signH, ledColor = EMBER.led, ledStyle = 'ticks', rowsOn, signOnFace, snow = EMBER.snow}) => {
  const t = useTime();
  const variant: DataCenterVariant = darkAt !== undefined && t >= darkAt ? 'dark' : v0;
  const g0 = dataCenterGeo(x, y, w, h, v0, signH);
  const g = signOnFace ? {...g0, sign: {...g0.sign, x: g0.sign.x + signFaceShift(w)}} : g0;
  const far = variant === 'far';
  const mini = variant === 'mini';
  const dark = variant === 'dark';
  const body = dark ? EMBER.dcDark : EMBER.dc;
  const side = dark ? '#1C2036' : EMBER.dcSide;
  const lit = signLitAt !== undefined && t >= signLitAt;
  const iw = mini ? Math.min(ink, 2.2) : ink;
  // side face (the left, in shade) and the roof parapet
  const sideW = w * 0.06;
  const parH = Math.max(4, g.H * 0.05);
  // roof units: boxes with a fan disc, spread along the roof
  const r = rng(`dcu/${seed}`);
  const unitW = Math.min(w * 0.13, g.H * 0.22);
  const unitH = unitW * 0.62;
  const unitsX = Array.from({length: units}, (_, i) => x - w * 0.34 + ((i + 0.5) / units) * w * 0.68 + r.jitter(w * 0.03) - unitW / 2);
  // server rows: dark strips with small light ticks (rows between the sign and the base)
  const rowsTop = g.sign.y + g.sign.h + g.H * 0.08;
  const nRows = mini ? 2 : variant === 'hall' ? 3 : 4;
  const rowGap = (y - g.H * 0.08 - rowsTop) / nRows;
  const rowH = Math.max(3, rowGap * 0.42);
  const tickW = Math.max(3, w * (variant === 'hall' ? 0.012 : 0.02));
  const step = tickW * 2;
  const lr = rng(`dcl/${seed}`);
  const ticks: React.ReactNode[] = [];
  const strips: React.ReactNode[] = [];
  for (let i = 0; i < nRows; i++) {
    const ry = rowsTop + i * rowGap;
    strips.push(<TRect key={`s${i}`} x={g.x0 + sideW + w * 0.04} y={ry} width={w - sideW - w * 0.08} height={rowH} fill={side} />);
    if (far && !mini) continue;
    if (ledStyle === 'bands') {
      // three long lit bands per row (a hall's lit slots), steady: the building's light without a dash texture
      const bx0 = g.x0 + sideW + w * 0.07;
      const span = g.x1 - w * 0.06 - bx0;
      const gap = w * 0.035;
      const bw = (span - gap * 2) / 3;
      // rowsOn (opt-in): dark from darkAt, then row by row on (each row a 2-frame-per-band sweep)
      const powered = rowsOn !== undefined && darkAt !== undefined && t >= darkAt;
      for (let j = 0; j < 3; j++) {
        if (powered && t < rowsOn.at + (i * rowsOn.dur) / nRows + j / 30) continue;
        ticks.push(<TRect key={`t${i}_${j}`} x={bx0 + j * (bw + gap)} y={ry + rowH * 0.3} width={bw} height={Math.max(2.5, rowH * 0.4)} fill={powered ? rowsOn.color ?? ledColor : ledColor} />);
      }
      continue;
    }
    for (let tx = g.x0 + sideW + w * 0.06, j = 0; tx + tickW < g.x1 - w * 0.05; tx += step, j++) {
      if (lr.chance(0.12)) continue;
      const ph = lr.range(0, 100);
      const rate = lr.range(0.6, 1.6);
      const off = blink && Math.sin(t * rate * 2.3 + ph) > 0.93;
      if (off) continue;
      ticks.push(<TRect key={`t${i}_${j}`} x={tx} y={ry + rowH * 0.3} width={tickW} height={Math.max(2.5, rowH * 0.4)} fill={ledColor} />);
    }
  }
  const outline: Pt[] = [[g.x0, y], [g.x0, g.top], [g.x1, g.top], [g.x1, y]];
  const signText = sign === null ? null : sign;
  const signSize = Math.min(g.sign.h * 0.78, w * (mini ? 0.2 : signH !== undefined ? 0.16 : 0.13));
  return (
    <>
      {/* roof units (behind the parapet line) */}
      {unitsX.map((ux, i) => (
        <React.Fragment key={i}>
          <Fill rect={[ux, g.top - unitH, unitW, unitH + 2]} color={side} at={fillAt(at, 0.05)} offset={far ? false : undefined} seed={`${seed}/u${i}`} />
          <Fill rect={[ux - 2, g.top - unitH - 3, unitW + 4, 5]} color={snow} at={fillAt(at, 0.08)} offset={false} />
          {far ? null : (
            <>
              <Fill d={blob(ux + unitW / 2, g.top - unitH * 0.5, unitW * 0.26, unitH * 0.3, {seed: `${seed}/fan${i}`})} color={body} at={fillAt(at, 0.08)} offset={false} />
              <Ink d={rectInk(ux, g.top - unitH, unitW, unitH, {seed: `${seed}/uI${i}`, over: [0, 2], edges: 'tlr'}) + circle(ux + unitW / 2, g.top - unitH * 0.5, unitW * 0.26, {seed: `${seed}/fI${i}`})} at={b(at, 0.1 + i * 0.03)} width={Math.max(1.6, iw * 0.65)} />
            </>
          )}
        </React.Fragment>
      ))}
      {/* body, shade side, parapet with its snow line */}
      <Fill d={polyPath(outline)} color={body} at={fillAt(at)} offset={far ? false : undefined} seed={`${seed}/body`} />
      <Fill rect={[g.x0, g.top, sideW, g.H]} color={side} at={fillAt(at, 0.02)} offset={false} />
      <Fill rect={[g.x0, g.top, w, parH]} color={side} at={fillAt(at, 0.02)} offset={false} />
      <Fill rect={[g.x0 - 2, g.top - 4, w + 4, 5]} color={snow} at={fillAt(at, 0.06)} offset={false} />
      <Show at={fillAt(at, 0.06)}>
        {strips}
        {ticks}
      </Show>
      {/* the sign: a panel on the facade; letters in cold light (or ink on a lit panel) */}
      {signText !== null ? (
        <>
          <Fill rect={[g.sign.x, g.sign.y, g.sign.w, g.sign.h]} color={lit ? EMBER.led : side} at={fillAt(at, 0.04)} offset={false} seed={`${seed}/sign`} />
          {signText ? (
            <Show at={signAt ?? fillAt(at, 0.06)}>
              <Txt x={x + sideW / 2} y={g.sign.y + g.sign.h * 0.74} size={signSize} fill={lit ? EMBER.ink : EMBER.led} fit={g.sign.w * 0.92}>
                {signText}
              </Txt>
            </Show>
          ) : null}
          {far ? null : <Ink d={rectInk(g.sign.x, g.sign.y, g.sign.w, g.sign.h, {seed: `${seed}/sI`, over: [0, 3]})} at={b(at, 0.08)} width={lit ? iw : Math.max(1.6, iw * 0.6)} />}
        </>
      ) : null}
      {/* ink: outline, parapet line, side edge (none on the far silhouette) */}
      {far ? null : (
        <Ink
          d={poly(outline, {seed: `${seed}/o`, over: [2, 6]}) + hline(g.x0, g.x1, g.top + parH, {seed: `${seed}/p`, over: [0, 0]}) + vline(g.x0 + sideW, g.top + parH, y, {seed: `${seed}/sd`, over: [0, 0]})}
          at={at}
          width={iw}
        />
      )}
    </>
  );
};
export const DataCenter = tiered((p) => (p.variant === 'far' ? 'environment' : p.variant === 'mini' ? 'subject' : 'support'), {tone: (p) => (p.variant === 'dark' || p.darkAt !== undefined ? EMBER.dcDark : EMBER.dc), bg: EMBER.sky, lines: true}, DataCenterBody);

// ---------------------------------------------------------------- our roof: the ledge (parapet) and a vent

export type RoofLedgeProps = {
  /** Top of the coping lip (canvas px). The mass runs down past the frame bottom. */
  y: number;
  x0?: number;
  x1?: number;
  /** Mass height below the lip (default 1400: always past the bottom). S9's parapet seen from behind: its face. */
  h?: number;
  /** The vent's centre x (null = none). */
  ventX?: number | null;
  /** Snow coping lip height (default 36). */
  lipH?: number;
  /** Brick ticks on the face (default 9). */
  bricks?: number;
  /** Fills exactly on the linework (no misregistration): for a ledge drawn small and shown big (a pull-back plane). */
  exact?: boolean;
  at?: At;
  seed?: string;
  ink?: number;
};

/** Our building's roof parapet: warm brick (our side is warm), a light snow coping lip, one vent with a snow cap; cut
 *  by both side edges. Front ink (4.8). */
const RoofLedgeBody: React.FC<RoofLedgeProps> = ({y, x0 = -60, x1 = 1140, h = 1400, ventX = 220, lipH = 36, bricks: nBricks = 9, exact, at, seed = 'ledge', ink = 4.8}) => {
  const r = rng(`ledge/${seed}`);
  const off = exact ? false : undefined;
  // a few brick ticks on the parapet face (short marks, not a pattern), kept inside the face
  let bricks = '';
  for (let i = 0; i < nBricks; i++) {
    const bx = r.range(x0 + 60, x1 - 60);
    const by = y + lipH + r.range(Math.min(30, h * 0.3), Math.min(220, h * 0.6));
    bricks += line(bx, by, bx + r.range(26, 44), by, {over: [0, 0], seed: `${seed}/bk${i}`});
    if (r.chance(0.5)) bricks += line(bx + 14, by, bx + 14, by + Math.min(18, h * 0.3), {over: [0, 0], seed: `${seed}/bv${i}`});
  }
  return (
    <>
      {ventX === null ? null : <RoofVent x={ventX} y={y} at={at} seed={seed} ink={ink * 0.8} exact={exact} />}
      <Fill rect={[x0, y + lipH, x1 - x0, h]} color={EMBER.brick} at={fillAt(at)} offset={off} seed={`${seed}/mass`} />
      <Fill rect={[x0, y, x1 - x0, lipH]} color={EMBER.snow} at={fillAt(at, 0.03)} offset={off} seed={`${seed}/lip`} />
      <Fill rect={[x0, y + lipH, x1 - x0, Math.min(14, h * 0.25)]} color={EMBER.brickShade} at={fillAt(at, 0.05)} offset={false} />
      <Ink d={hline(x0, x1, y, {seed: `${seed}/t`, over: 'structural'}) + hline(x0, x1, y + lipH, {seed: `${seed}/b`, over: 'medium'})} at={at} width={ink} />
      <Ink d={bricks} at={b(at, 0.12)} width={2.2} />
    </>
  );
};
export const RoofLedge = tiered('environment', {tone: EMBER.brick, bg: EMBER.sky}, RoofLedgeBody);

export type RoofVentProps = {
  /** Body centre x and the roof line it stands on (canvas px). */
  x: number;
  y: number;
  /** Body width (64) and height (70); the cap is 1.5 w wide and `capH` (0.34 w) tall. */
  w?: number;
  h?: number;
  capH?: number;
  /** Fills exactly on the linework (see RoofLedge). */
  exact?: boolean;
  at?: At;
  seed?: string;
  /** Screen ink weight (3.8 on the ledge). */
  ink?: number;
};

/** OUR roof's vent: a warm brick-shade body under a dark cowl with a snow cap (RoofLedge's vent; S9's near clutter). */
const RoofVentBody: React.FC<RoofVentProps> = ({x: vx, y, w: vw = 64, h: vh = 70, capH = vw * 0.344, exact, at, seed = 'ledge', ink = 3.84}) => {
  const vy = y - vh;
  const off = exact ? false : undefined;
  const cap: Pt[] = [[vx - vw * 0.75, vy], [vx + vw * 0.75, vy], [vx + vw * 0.55, vy - capH], [vx - vw * 0.55, vy - capH]];
  return (
    <>
      <Fill rect={[vx - vw / 2, vy, vw, vh + 4]} color={EMBER.brickShade} at={fillAt(at, 0.04)} offset={off} seed={`${seed}/v`} />
      <Fill d={polyPath(cap)} color={EMBER.anchor} at={fillAt(at, 0.06)} offset={off} seed={`${seed}/vc`} />
      <Fill d={blob(vx, vy - capH - 2 * (capH / 22), vw * 0.5, capH * 0.41, {seed: `${seed}/vs`})} color={EMBER.snow} at={fillAt(at, 0.08)} offset={false} />
      <Ink d={vline(vx - vw / 2, vy, y, {over: [0, 0], seed: `${seed}/v1`}) + vline(vx + vw / 2, vy, y, {over: [0, 0], seed: `${seed}/v2`}) + poly(cap, {closed: true, seed: `${seed}/vcI`, over: [1, 4]})} at={b(at, 0.04)} width={ink} />
    </>
  );
};
export const RoofVent = tiered('environment', {tone: EMBER.brickShade, bg: EMBER.sky}, RoofVentBody);
