// Video 2 (restart, "One Small Window") KIT CONTRACT (TREATMENT.md section 9: "every piece at every size used, on ONE
// contract sheet beside v1 and ref 1 at 216 px, judged, frozen before lanes"). The palette import MUST stay first.
//
// Compositions (60 fps):
//   KitContract            the sheet, 1080 x SHEET_H: every K4 cast piece, K5 Pip pose, K6 canal and K7 Arlington piece
//                          at every size the shot list uses (src/v2r/world/map.ts), drawn 1:1, each labelled with its
//                          drawn bbox (live SVG geometry, stroke excluded) and the rule it must meet; 1:1 windows into
//                          the assembled sets; then the four assembled sample frames at 0.5 with the map's key shapes.
//   KitContractFrame-V2S1 / -V2S2 / -V2S4 / -V2S8
//                          one assembled sample frame, 1080 x 1920, FILM seconds (frame = round(T x 60)): the kit's set
//                          at the map's positions with K4's people, K5's Pip, the life layer and K3 stand-ins, under
//                          the film's own captions (captions.json; no frame-0 block: REVIEW_1 MUST 1). Samples: V2S1 2.50,
//                          V2S2 10.00, V2S4 17.00, V2S8 37.00.
// Render (always GL=angle, 4 shared CPUs):
//   GL=angle node scripts/render-frames.mjs KitContract <dir> 0 --entry=src/entry-v2r-contract.tsx --scale=0.5
//   GL=angle node scripts/render-frames.mjs KitContractFrame-V2S1 <dir> 2.5,2.75 --entry=src/entry-v2r-contract.tsx --scale=0.5
// K3 (StatementBoard, PaperTag, Fingerpost, NewsBox, Plaque) is lane L5's and not built yet: every board, tag, post, box
// and plaque here is a STAND-IN drawn with K3's own WorldText + texts.ts (its type scale and the exact words), marked
// "K3 stand-in" on the sheet. People sizes follow the owner's rule as the orchestrator measured it: near head-backs at
// most ~140 px wide, no figure wider than ~1/6 of the frame (180 px); where the kit or the map says more, the sheet
// shows the kit's size too, flagged.
import './v2r/palette';
import React, {useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, Composition, continueRender, delayRender, registerRoot} from 'remotion';
import {CM, INK_PX, skyBands} from './v2r/palette';
import * as M from './v2r/world/map';
import {World} from './lib/World';
import {Film} from './lib/Film';
import type {FilmScene} from './lib/Film';
import type {CaptionBeat} from './lib/Captions';
import {TimeShift, useTime, clamp, ease} from './lib/time';
import {XG, mat} from './lib/xf';
import {Fill} from './lib/Fill';
import {Ink} from './lib/Ink';
import {Look} from './lib/exit';
import {useCaptionFont} from './lib/font';
import scenesJson from './v2r/film/scenes.json';
import captionsJson from './v2r/film/captions.json';
import {Her, HerWindow, Ghost, BareOutline, GhostRow, S8Ghosts, S1Seated, Person, Seated, NearBack, WindowPerson, StaffWindow, Staffer, Reporter, Stranger, CafeOwner, FarCrowd, scatterCrowd, strideFor, castRow, pin} from './v2r/kit/cast';
import type {HairKind} from './v2r/kit/cast';
import {Pip, PipTrack} from './v2r/kit/pip';
import type {PipKey} from './v2r/kit/pip';
import {S1Set, S2Set, S4Set, S8Set, SunDisc, CanalCast, CastSlot, Movers, Water, Narrowboat, TerraceRow, WingS7, Bollard, Birds, Pigeons, Ducks, Heron, Puffs, FallingLeaves, FloatingLeaves, StringLights, Cloud, BoatWiper} from './v2r/kit/canal';
import type {HouseSpec} from './v2r/kit/canal';
import {k4Person, k5Pip} from './v2r/kit/canal/k4k5';
import {S2_BENCH_SEAT} from './v2r/kit/canal/sets';
import {CraneSet, GateSet, HighBars, DECK, deckPt, deckPxPerM, castShadowD, TT, TERRACE, GATE, CRANE_T} from './v2r/kit/dc';
import {WorldText, TYPE, textW} from './v2r/kit/boards/WorldText';
import {TXT_TOLD_THE_BBC, TXT_NAME_TAG, TXT_PLATES, TXT_NEWS_BOX, TXT_PLAQUE, TXT_DEAL, TXT_HER} from './v2r/kit/boards/texts';

// =====================================================================================================================
// 0. Sheet basics: labels, the live bbox measure, the rules
// =====================================================================================================================

const SW = 1080;
const FPS = 60;
const LF = "'Liberation Sans', 'DejaVu Sans', Arial, sans-serif";
const C = {
  page: '#FBF3E6',
  strip: '#FFFCF6',
  ink: '#1E1712',
  mute: '#64574E',
  ok: '#17753A',
  fail: '#C4291C',
  note: '#9A6400',
  head: '#36223A',
  rule: '#D0362A',
  map: '#C2185B',
};

const Tx: React.FC<{x: number; y: number; s?: number; c?: string; a?: 'start' | 'middle' | 'end'; b?: boolean; children?: React.ReactNode}> = ({x, y, s = 18, c = C.ink, a = 'start', b, children}) => (
  <text x={x} y={y} fontSize={s} fill={c} fontFamily={LF} fontWeight={b ? 700 : 400} textAnchor={a}>
    {children}
  </text>
);

type Box = {x: number; y: number; w: number; h: number};
/** What a measured piece must meet (TREATMENT section 3 + K2 LEGIBILITY + the owner's people rule). */
type Kind = 'carrier' | 'group' | 'person' | 'near' | 'staffer' | 'pip' | 'pipEnd' | 'none';

function verdict(kind: Kind, b: Box, size?: number): {txt: string; c: string} {
  const w = Math.round(b.w);
  const h = Math.round(b.h);
  switch (kind) {
    case 'carrier':
      return h >= M.LEGIBILITY.carrierFigureMinH ? {txt: `h ${h} >= 130`, c: C.ok} : {txt: `h ${h} < 130 FAIL`, c: C.fail};
    case 'group':
      return {txt: 'group', c: C.note};
    case 'person':
      if (w > 180) return {txt: `w ${w} > 180 FAIL`, c: C.fail};
      if (h > 250) return {txt: `h ${h}: not small`, c: C.note};
      return {txt: `w ${w} <= 180`, c: C.ok};
    case 'near':
      if (w > 140) return {txt: `w ${w} > 140 FAIL`, c: C.fail};
      return {txt: `w ${w} <= 140`, c: C.ok};
    case 'staffer':
      return h >= M.LEGIBILITY.benchStafferSeatedMinH ? {txt: `h ${h} >= 180`, c: C.ok} : {txt: `h ${h} < 180 FAIL`, c: C.fail};
    case 'pip': {
      const s = size ?? 0;
      return s >= M.LEGIBILITY.pipMinH && s <= M.LEGIBILITY.pipMaxH ? {txt: `size ${s} in 86-120`, c: C.ok} : {txt: `size ${s} FAIL`, c: C.fail};
    }
    case 'pipEnd': {
      const s = size ?? 0;
      return s >= M.LEGIBILITY.pipS5EndMinH ? {txt: `size ${s.toFixed(1)} >= 44`, c: C.ok} : {txt: `size ${s.toFixed(1)} < 44 FAIL`, c: C.fail};
    }
    default:
      return {txt: '', c: C.mute};
  }
}

/** One measured piece: its drawing (row coords) + three label lines (name / spec + bbox / rule) at `ly`. */
const Item: React.FC<{x: number; ly: number; name: string; spec?: string; kind?: Kind; size?: number; children?: React.ReactNode}> = ({x, ly, name, spec, kind = 'none', size, children}) => {
  const ref = useRef<SVGGElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [handle] = useState(() => delayRender(`kit contract: measure ${name}`));
  useLayoutEffect(() => {
    if (box || !ref.current) return;
    const r = ref.current.getBBox();
    setBox({x: r.x, y: r.y, w: r.width, h: r.height});
  }, [box]);
  useEffect(() => {
    if (box) continueRender(handle);
  }, [box, handle]);
  const v = box ? verdict(kind, box, size) : null;
  const dims = box ? `${Math.round(box.w)}×${Math.round(box.h)}` : '';
  return (
    <>
      <g ref={ref}>{children}</g>
      <Tx x={x} y={ly} s={17} a="middle" b>
        {name}
      </Tx>
      <Tx x={x} y={ly + 20} s={16} a="middle" c={C.mute}>
        {spec ? `${spec} · ${dims}` : dims}
      </Tx>
      {v && v.txt ? (
        <Tx x={x} y={ly + 40} s={16} a="middle" c={v.c} b>
          {v.txt}
        </Tx>
      ) : null}
    </>
  );
};

/** A full-width SVG row at sheet y: background, a ground line + label strip from `ground`, a title. */
const Row: React.FC<{y: number; h: number; title?: string; bg?: string; ground?: number; bands?: [number, number, string][]; children?: React.ReactNode}> = ({y, h, title, bg = CM.bandGold, ground, bands, children}) => (
  <svg style={{position: 'absolute', left: 0, top: y}} width={SW} height={h} viewBox={`0 0 ${SW} ${h}`}>
    <rect x={0} y={0} width={SW} height={h} fill={bg} />
    {(bands ?? []).map(([x0, x1, col], i) => (
      <rect key={i} x={x0} y={0} width={x1 - x0} height={h} fill={col} />
    ))}
    {ground !== undefined ? (
      <>
        <rect x={0} y={ground} width={SW} height={h - ground} fill={C.strip} />
        <line x1={0} y1={ground} x2={SW} y2={ground} stroke={CM.line} strokeWidth={2} />
      </>
    ) : null}
    {children}
    {title ? (
      <Tx x={14} y={24} s={19} b c={C.head}>
        {title}
      </Tx>
    ) : null}
    <line x1={0} y1={h - 1} x2={SW} y2={h - 1} stroke={C.mute} strokeWidth={2} />
  </svg>
);

/** A dashed rule line across a row (the 130 px carrier floor above a ground line). */
const Floor: React.FC<{y: number; label: string; x0?: number; x1?: number}> = ({y, label, x0 = 0, x1 = SW}) => (
  <>
    <line x1={x0} y1={y} x2={x1} y2={y} stroke={C.rule} strokeWidth={1.6} strokeDasharray="10 7" />
    <Tx x={x1 - 4} y={y - 5} s={13} a="end" c={C.rule} b>
      {label}
    </Tx>
  </>
);

/** A section head bar. */
const SEC_H = 64;
const SecHead: React.FC<{y: number; n: string; title: string; sub?: string}> = ({y, n, title, sub}) => (
  <svg style={{position: 'absolute', left: 0, top: y}} width={SW} height={SEC_H}>
    <rect width={SW} height={SEC_H} fill={C.head} />
    <Tx x={18} y={sub ? 30 : 41} s={26} b c={CM.paper}>
      {`${n} · ${title}`}
    </Tx>
    {sub ? (
      <Tx x={18} y={54} s={16} c={CM.bandGold}>
        {sub}
      </Tx>
    ) : null}
  </svg>
);

/** A window into a 1080 x 1920 scene (source rect src = [x, y, w, h], drawn at `scale`), a caption bar above it. */
const WIN_BAR = 30;
const Window: React.FC<{y: number; x?: number; src: [number, number, number, number]; scale?: number; label: string; children?: React.ReactNode; overlay?: React.ReactNode}> = ({y, x = 0, src, scale = 1, label, children, overlay}) => {
  const [sx, sy, sw, sh] = src;
  const w = sw * scale;
  const h = sh * scale;
  return (
    <>
      <svg style={{position: 'absolute', left: x, top: y}} width={w} height={WIN_BAR}>
        <rect width={w} height={WIN_BAR} fill={CM.anchor} />
        <Tx x={8} y={21} s={16} c={CM.paper} b>
          {label}
        </Tx>
      </svg>
      <div style={{position: 'absolute', left: x, top: y + WIN_BAR, width: w, height: h, overflow: 'hidden', background: CM.sky}}>
        <div style={{position: 'absolute', left: -sx * scale, top: -sy * scale, width: 1080, height: 1920, transform: scale === 1 ? undefined : `scale(${scale})`, transformOrigin: '0 0'}}>
          {children}
          {overlay ? (
            <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920} viewBox="0 0 1080 1920">
              {overlay}
            </svg>
          ) : null}
        </div>
      </div>
    </>
  );
};
const winH = (src: [number, number, number, number], scale = 1) => WIN_BAR + src[3] * scale;

/** Render a scene at film second T (its shot starts at `start`): the scene's useTime() reads T - start. */
const At: React.FC<{T: number; start: number; children?: React.ReactNode}> = ({T, start, children}) => <TimeShift by={start - T}>{children}</TimeShift>;

const rectD = (x: number, y: number, w: number, h: number) => `M${x} ${y}L${x + w} ${y}L${x + w} ${y + h}L${x} ${y + h}Z`;
const ellD = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;

// =====================================================================================================================
// 1. K3 STAND-INS (lane L5 builds the real ones): K3's WorldText, TYPE scale and texts.ts, one A-board face
// =====================================================================================================================

/** The A-board face: plum stiles + rails outside the face rect (L5's plan: stiles ~30 px, rails ~18 px), a paper face
 *  with an inset keyline, two legs to `legsY`. */
const BoardFace: React.FC<{r: M.Rect; legsY?: number; seed: string; stile?: number; rail?: number}> = ({r, legsY, seed, stile = 30, rail = 18}) => {
  const w = r.x1 - r.x0;
  const h = r.y1 - r.y0;
  return (
    <g>
      {legsY !== undefined ? (
        <>
          <Fill rect={[r.x0 + w * 0.1, r.y1, 16, legsY - r.y1]} color={CM.anchor} offset={false} seed={`${seed}/l1`} />
          <Fill rect={[r.x1 - w * 0.1 - 16, r.y1, 16, legsY - r.y1]} color={CM.anchor} offset={false} seed={`${seed}/l2`} />
        </>
      ) : null}
      <Fill rect={[r.x0 - stile, r.y0 - rail, w + stile * 2, h + rail * 2]} color={CM.anchor} offset={false} seed={`${seed}/frame`} />
      <Fill rect={[r.x0, r.y0, w, h]} color={CM.paper} offset={false} seed={`${seed}/face`} />
      <Ink d={rectD(r.x0 + 9, r.y0 + 9, w - 18, h - 18)} width={1.6} color={CM.anchor} taper={false} seed={`${seed}/key`} />
      <Ink d={rectD(r.x0 - stile, r.y0 - rail, w + stile * 2, h + rail * 2)} width={INK_PX.mid} taper={false} seed={`${seed}/out`} />
    </g>
  );
};

/** S2: the newsstand A-board TOLD THE BBC at map S2.aBoard (face 400 x 200), out from 8.44 (scene s here). */
const StandInToldBBC: React.FC<{outAt: number}> = ({outAt}) => {
  const t = useTime();
  if (t < outAt) return null;
  const r = M.S2.aBoard;
  const cx = (r.x0 + r.x1) / 2;
  const T = TXT_TOLD_THE_BBC;
  return (
    <g>
      <BoardFace r={r} legsY={r.y1 + 36} seed="kc/bbc" stile={16} rail={12} />
      <WorldText x={cx} y={r.y0 + 64} size={TYPE.key} text={T.header} anchor="middle" weight={0.9} maxW={372} seed="kc/bbc/h" />
      <WorldText x={cx} y={r.y0 + 106} size={TYPE.bodySmall} text={T.body[0]} anchor="middle" maxW={372} seed="kc/bbc/b0" />
      <WorldText x={cx} y={r.y0 + 140} size={TYPE.bodySmall} text={T.body[1]} anchor="middle" maxW={372} seed="kc/bbc/b1" />
      <WorldText x={cx} y={r.y0 + 180} size={TYPE.creditLarge} text={T.credit} anchor="middle" maxW={372} seed="kc/bbc/c" />
    </g>
  );
};

/** S8: her board (the cafe boat's quote-of-the-day A-board) at B: SHE SAYS; wiped 35.72; the quote pens on 36.54. */
const StandInHerBoard: React.FC<{wipeAt: number; quoteAt: number}> = ({wipeAt, quoteAt}) => {
  const t = useTime();
  const r = M.B;
  const cx = (r.x0 + r.x1) / 2;
  const T = TXT_HER;
  // before the wipe: a half-wiped menu (smudges, no legible words)
  const smudge = t < wipeAt;
  return (
    <g>
      <BoardFace r={r} legsY={M.B_LEGS_Y1} seed="kc/her" />
      <WorldText x={cx} y={r.y0 + 92} size={TYPE.header} text={T.header} anchor="middle" weight={1} seed="kc/her/h" />
      {smudge ? (
        <Ink d={`M${r.x0 + 60} 880Q${cx} 860 ${r.x1 - 70} 890M${r.x0 + 80} 960Q${cx} 990 ${r.x1 - 90} 950M${r.x0 + 70} 1040L${r.x1 - 120} 1046`} width={14} color={CM.stoneShade} taper={false} seed="kc/her/sm" />
      ) : null}
      <WorldText x={cx} y={r.y0 + 236} size={TYPE.key} text={T.quote[0]} anchor="middle" weight={0.9} at={quoteAt} dur={0.34} maxW={444} seed="kc/her/q0" />
      <WorldText x={cx} y={r.y0 + 306} size={TYPE.key} text={T.quote[1]} anchor="middle" weight={0.9} at={quoteAt + 0.36} dur={0.3} maxW={444} seed="kc/her/q1" />
      <WorldText x={cx} y={r.y1 - 70} size={TYPE.creditLarge} text={T.credit[0]} anchor="middle" at={quoteAt} mode="pop" seed="kc/her/c0" />
      <WorldText x={cx} y={r.y1 - 42} size={TYPE.creditLarge} text={T.credit[1]} anchor="middle" at={quoteAt} mode="pop" seed="kc/her/c1" />
    </g>
  );
};

/** S6: the deal board, face 480 x 520 inside the 560 x 560 contract rect (L5's plan), mid plane (GateSet drifts it).
 *  Clause first (up at the cut), the purpose line pops on "any" (0.03), the F12 line on "veto" (2.40). No "Google". */
const StandInDealBoard: React.FC = () => {
  const b = M.S6.board0;
  const r: M.Rect = {x0: b.x0 + 40, y0: b.y0 + 20, x1: b.x1 - 40, y1: b.y1 - 20};
  const x = r.x0 + 22;
  const T = TXT_DEAL;
  return (
    <g>
      <BoardFace r={r} legsY={b.y1 + 12} seed="kc/deal" />
      <WorldText x={x} y={r.y0 + 44} size={TYPE.body} text={T.tag} seed="kc/deal/tag" />
      <WorldText x={x} y={r.y0 + 118} size={TYPE.key} text={T.purpose[0]} weight={0.9} at={M.S6.purposeLineAt - 24} mode="pop" maxW={436} seed="kc/deal/p0" />
      <WorldText x={x} y={r.y0 + 178} size={TYPE.key} text={T.purpose[1]} weight={0.9} at={M.S6.purposeLineAt - 24} mode="pop" maxW={436} seed="kc/deal/p1" />
      {T.clause.map((l, i) => (
        <WorldText key={i} x={x} y={M.S6.clauseTopMinY + 27 + i * 40} size={TYPE.body} text={l} maxW={436} seed={`kc/deal/c${i}`} />
      ))}
      <Ink d={`M${x} ${r.y1 - 96}L${r.x1 - 22} ${r.y1 - 94}`} width={1.6} color={CM.anchor} taper={false} seed="kc/deal/rule" />
      <WorldText x={x} y={r.y1 - 58} size={TYPE.body} text={T.f12} at={M.S6.f12LineAt - 24} mode="pop" maxW={436} seed="kc/deal/f12" />
      <WorldText x={x} y={r.y1 - 22} size={TYPE.credit} text={T.credit} maxW={436} seed="kc/deal/cr" />
    </g>
  );
};

/** S4: her name tag, screen-locked above her (map S4.nameTag x 600-880, y 600-800: TOO SHORT for the 7 rows, drawn here
 *  600-862), two builds (15.07 / 16.60), off 18.80 (scene s via `t0`). */
const TAG = {x0: 600, y0: 600, x1: 880, y1: 862};
const StandInNameTag: React.FC<{t0: number}> = ({t0}) => {
  const t = useTime();
  const T = t + t0;
  const [b1, b2] = M.S4.nameTagBuilds;
  if (T < b1 || T >= M.S4.nameTagOffAt) return null;
  const r = TAG;
  const x = r.x0 + 18;
  const N = TXT_NAME_TAG;
  return (
    <g>
      <Ink d={`M${r.x0 + 150} ${r.y1}L${M.S4.her.x + 2} ${M.S4.her.feetY - M.S4.her.h - 6}`} width={1.6} taper={false} seed="kc/tag/lead" />
      <Fill rect={[r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0]} color={CM.paper} offset={false} seed="kc/tag/f" />
      <Ink d={rectD(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0)} width={INK_PX.far} taper={false} seed="kc/tag/i" />
      <WorldText x={x} y={r.y0 + 50} size={44} text={N.name} weight={0.8} at={b1 - t0} mode="pop" maxW={244} seed="kc/tag/n" />
      {N.role.map((l, i) => (
        <WorldText key={i} x={x} y={r.y0 + 88 + i * 33} size={TYPE.bodySmall} text={l} at={b1 - t0 + 0.05} mode="pop" maxW={244} seed={`kc/tag/r${i}`} />
      ))}
      {T >= b2
        ? N.more.map((l, i) => <WorldText key={i} x={x} y={r.y0 + 196 + i * 33} size={TYPE.bodySmall} text={l} at={b2 - t0} maxW={244} seed={`kc/tag/m${i}`} />)
        : null}
      {T >= b2 ? <WorldText x={x} y={r.y1 - 14} size={TYPE.credit} text={N.credit} at={b2 - t0} mode="pop" maxW={244} seed="kc/tag/c" /> : null}
    </g>
  );
};

/** S4: the fingerpost (ONE post, two plates pointing WEST, fill-first pen reveal: DEC 2025 18.92, APR 2026 19.45-19.80). */
const StandInPost: React.FC<{t0: number}> = ({t0}) => {
  const t = useTime();
  const T = t + t0;
  const p = M.S4.post;
  const plate = (r: M.Rect, key: string, body: string, credit: string, at: number, seed: string) =>
    T < at ? null : (
      <g>
        <Fill d={`M${r.x0 + 34} ${r.y0}L${r.x1} ${r.y0}L${r.x1} ${r.y1}L${r.x0 + 34} ${r.y1}L${r.x0} ${(r.y0 + r.y1) / 2}Z`} color={CM.paper} offset={false} at={at - t0} seed={`${seed}/f`} />
        <Ink d={`M${r.x0 + 34} ${r.y0}L${r.x1} ${r.y0}L${r.x1} ${r.y1}L${r.x0 + 34} ${r.y1}L${r.x0} ${(r.y0 + r.y1) / 2}Z`} width={INK_PX.mid} taper={false} at={at - t0} seed={`${seed}/i`} />
        <WorldText x={r.x0 + 50} y={r.y0 + 56} size={TYPE.key} text={key} weight={0.9} at={at - t0 + 0.06} dur={0.22} seed={`${seed}/k`} />
        <WorldText x={r.x0 + 50 + textW(key, TYPE.key) + 16} y={r.y0 + 54} size={31} text={body} at={at - t0 + 0.18} dur={0.2} maxW={r.x1 - r.x0 - textW(key, TYPE.key) - 80} seed={`${seed}/b`} />
        <WorldText x={r.x0 + 50} y={r.y1 - 14} size={TYPE.credit} text={credit} at={at - t0 + 0.24} mode="pop" maxW={r.x1 - r.x0 - 64} seed={`${seed}/c`} />
      </g>
    );
  return (
    <g>
      <Fill rect={[p.x - 7, p.topY, 14, p.footY - p.topY]} color={CM.line} offset={false} seed="kc/post/f" />
      <Fill d={ellD(p.x, p.topY - 6, 11, 9)} color={CM.anchor} offset={false} seed="kc/post/cap" />
      <Ink d={`M${p.x - 7} ${p.topY}L${p.x - 7} ${p.footY}M${p.x + 7} ${p.topY}L${p.x + 7} ${p.footY}`} width={INK_PX.far} taper={false} seed="kc/post/i" />
      {plate(M.S4.plateDec2025, TXT_PLATES.dec.key, TXT_PLATES.dec.body, TXT_PLATES.dec.credit, M.S4.decPlateAt, 'kc/post/dec')}
      {plate(M.S4.plateApr2026, TXT_PLATES.apr.key, TXT_PLATES.apr.body, TXT_PLATES.apr.credit, M.S4.aprPlatePen[0], 'kc/post/apr')}
    </g>
  );
};

/** S5 (start coords): the US newspaper box, no masthead (map S5.start.newsBox x 470-780, y 880-1230). */
const StandInNewsBox: React.FC = () => {
  const b = M.S5.start.newsBox;
  const w = b.x1 - b.x0;
  const cx = b.x0 + w / 2;
  return (
    <g>
      <Fill rect={[b.x0 + 34, b.y1 - 64, w - 68, 64]} color={CM.anchor} offset={false} seed="kc/nb/leg" />
      <Fill rect={[b.x0, b.y0, w, b.y1 - b.y0 - 56]} color={CM.coatSlate} offset={false} seed="kc/nb/body" />
      <Fill rect={[b.x0 + 18, b.y0 + 20, w - 36, 196]} color={CM.paper} offset={false} seed="kc/nb/win" />
      <Ink d={rectD(b.x0, b.y0, w, b.y1 - b.y0 - 56) + rectD(b.x0 + 18, b.y0 + 20, w - 36, 196)} width={INK_PX.mid} taper={false} seed="kc/nb/i" />
      {TXT_NEWS_BOX.headline.map((l, i) => (
        <WorldText key={i} x={cx} y={b.y0 + 66 + i * 44} size={40} text={l} anchor="middle" weight={0.7} maxW={w - 52} seed={`kc/nb/h${i}`} />
      ))}
      {TXT_NEWS_BOX.credit.map((l, i) => (
        <WorldText key={i} x={cx} y={b.y0 + 184 + i * 21} size={TYPE.credit} text={l} anchor="middle" maxW={w - 52} seed={`kc/nb/c${i}`} />
      ))}
      <Fill rect={[b.x0 + 40, b.y0 + 240, w - 80, 14]} color={CM.anchor} offset={false} seed="kc/nb/slot" />
    </g>
  );
};

/** S5 (end coords): the plaque on the balustrade (K7 TERRACE.plaqueMount 200 x 106), pops on "Pentagon" (1.88). */
const StandInPlaque: React.FC = () => {
  const t = useTime();
  if (t < 22.43 - 20.55) return null;
  const r = TERRACE.plaqueMount;
  const w = r.x1 - r.x0;
  const cx = r.x0 + w / 2;
  return (
    <g>
      <Fill rect={[r.x0, r.y0, w, r.y1 - r.y0]} color={CM.paper} offset={false} at={1.88} mode="snap" seed="kc/plq/f" />
      <Ink d={rectD(r.x0, r.y0, w, r.y1 - r.y0)} width={INK_PX.mid} taper={false} seed="kc/plq/i" />
      <WorldText x={cx} y={r.y0 + 52} size={TYPE.key} text={TXT_PLAQUE.key} anchor="middle" weight={0.8} at={1.88} mode="pop" maxW={w - 20} seed="kc/plq/k" />
      <WorldText x={cx} y={r.y0 + 88} size={TYPE.bodySmall} text={TXT_PLAQUE.body} anchor="middle" at={1.92} mode="pop" maxW={w - 20} seed="kc/plq/b" />
    </g>
  );
};

// =====================================================================================================================
// 2. THE ASSEMBLED SAMPLES (screen px at the map's poses; scene seconds = film seconds - the shot's start)
// =====================================================================================================================

type SeatSpot = {x: number; h: number; side?: 1 | -1; read?: boolean; phone?: [number, number]; cup?: [number, number][]; turns?: [number, number][]};
const keyed = (t: number, keys?: [number, number][], dur = 0.25): number => {
  let v = 0;
  let from = 0;
  for (const [at, to] of keys ?? []) {
    if (t < at) break;
    v = from + (to - from) * ease.inOutCubic(clamp((t - at) / dur));
    from = to;
  }
  return v;
};
const cupAt = (t: number, pairs?: [number, number][]): number | undefined => {
  if (!pairs) return undefined;
  let k = 0;
  for (const [up, down] of pairs) {
    if (t >= up && t < down) k = ease.inOutCubic(clamp((t - up) / 0.35));
    else if (t >= down && t < down + 0.35) k = 1 - ease.inOutCubic(clamp((t - down) / 0.35));
  }
  return k;
};
/** A row of seated backs (no two neighbours alike), each with its own small life (turns, a cup, a phone). */
const SeatRow: React.FC<{name: string; y: number; spots: SeatSpot[]; ink: number}> = ({name, y, spots, ink}) => {
  const t = useTime();
  const tr = castRow(`kc/${name}`, spots.length);
  return (
    <>
      {spots.map((s, i) => (
        <Seated key={i} x={s.x} y={y} h={s.h} seed={`kc/${name}/${i}`} traits={pin(tr[i])} turn={keyed(t, s.turns)} cup={cupAt(t, s.cup)} read={s.read} phone={s.phone ? t >= s.phone[0] && t < s.phone[1] : false} side={s.side} ink={ink} />
      ))}
    </>
  );
};
type NearSpot = {x: number; hv: number; hair: HairKind; scarf?: boolean; turns?: [number, number][]};
/** A row of near head-backs cut by the frame bottom (contract: at most ~140 px wide each, like reference 1's front row). */
const NearRow: React.FC<{name: string; spots: NearSpot[]; y?: number}> = ({name, spots, y = 1920}) => {
  const t = useTime();
  const tr = castRow(`kc/${name}`, spots.length, {hair: spots.map((s) => s.hair)});
  return (
    <>
      {spots.map((s, i) => (
        <NearBack key={i} x={s.x} y={y} hv={s.hv} seed={`kc/${name}/${i}`} traits={{...pin(tr[i]), hair: s.hair}} model={s.scarf ? {scarf: CM.coatMustard} : undefined} turn={keyed(t, s.turns)} ink={INK_PX.mid} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------- V2S1 (film 0.00-6.10; the sample at 2.50)

const S1C = M.S1_CLOCK;
const S1_STRIDE = strideFor(27, 170, 'rear34');
/** Her step count (the whole row walks in lockstep): two slow steps behind the glass, ~1.5 steps/s out to the stop,
 *  ONE step on "life". */
const s1Step = (t: number): number => {
  const inside = 0.5 + 1.2 * clamp((t - 0.55) / 0.42);
  if (t < S1C.steppingOut) return inside;
  const walk = 1.5 * (Math.min(t, S1C.stop.t0) - S1C.steppingOut);
  const life = t >= S1C.life ? Math.min(1, (t - S1C.life) / 0.27) : 0;
  return inside + walk + life;
};
const s1HerX = (t: number): number => (t < S1C.steppingOut ? 692 - 12 * clamp((t - 0.55) / 0.42) : M.s1HerX(t));
const s1HerHead = (t: number): [number, number] => {
  const p = M.s1RowAt(Math.max(t, 0))[0];
  return [s1HerX(t), p.feetY - p.h * 0.9];
};

const S1Row: React.FC = () => {
  const t = useTime();
  if (t < S1C.steppingOut) return null;
  const pose = M.s1RowAt(Math.max(t, 0))[0];
  const step = s1Step(t);
  const look = t >= M.S1_HER_LOOK_BACK_AT ? clamp((t - M.S1_HER_LOOK_BACK_AT) / 0.22) : 0;
  return (
    <>
      {t >= S1C.ghostPops[0] ? <GhostRow step={step} stride={S1_STRIDE} /> : null}
      <Her x={s1HerX(t)} y={pose.feetY} h={pose.h} pose={look > 0 ? 'lookBack' : 'walk'} look={look} view="rear34" step={step} stride={S1_STRIDE} plant coatAt={S1C.flood.t1} />
    </>
  );
};
const S1Door: React.FC = () => {
  const t = useTime();
  if (t >= S1C.steppingOut) return null;
  return <Her x={s1HerX(t)} y={M.S1_HER_STEP_OUT.feetFrom} h={M.S1_SHEET.herHAtFacade} pose="walk" view="rear34" step={s1Step(t)} stride={S1_STRIDE} plant coatAt={S1C.flood.t1} />;
};

/** S1's steps public at the contract sizes (K6 S1_STEPS treads: landing 1234-1302, nosings 1302 / 1392 / 1508 / 1660 /
 *  1850); Pip's bollard keeps x 620-780 clear on the landing. */
const S1_LOW: SeatSpot[] = [
  {x: 64, h: 58, turns: [[2.36, -0.5]]},
  {x: 170, h: 61},
  {x: 268, h: 56, read: true},
  {x: 392, h: 60, turns: [[0.85, 0.5], [3.9, 0]]},
  {x: 506, h: 57},
  {x: 864, h: 61, turns: [[5.02, 0.5]]},
  {x: 982, h: 59, cup: [[1.9, 2.8]]},
];
const S1_MID1: SeatSpot[] = [
  {x: 106, h: 88, cup: [[0.62, 1.55], [3.32, 4.05]], side: 1},
  {x: 296, h: 84, turns: [[1.18, 0.6], [2.9, 0]]},
  {x: 470, h: 90, phone: [2.2, 4.4]},
  {x: 640, h: 86, turns: [[4.32, -0.55]]},
  {x: 900, h: 88, read: true},
];
const S1_MID2: SeatSpot[] = [
  {x: 188, h: 118, turns: [[3.6, 0.5]]},
  {x: 420, h: 114, cup: [[1.3, 2.1], [4.6, 5.4]]},
  {x: 612, h: 116},
  {x: 808, h: 120, turns: [[2.05, -0.45], [5.1, 0]]},
];
const S1_NEAR: NearSpot[] = [
  {x: 70, hv: 148, hair: 'hood'},
  {x: 225, hv: 140, hair: 'beanie', turns: [[3.02, 0.45], [4.7, 0]]},
  {x: 380, hv: 154, hair: 'lowBun', scarf: true},
  {x: 535, hv: 144, hair: 'curls', turns: [[1.6, -0.35]]},
  {x: 690, hv: 152, hair: 'cap'},
  {x: 845, hv: 146, hair: 'short', turns: [[0.4, 0.4], [2.6, -0.2]]},
  {x: 1000, hv: 150, hair: 'crop'},
];
const S1People: React.FC = () => (
  <>
    <SeatRow name="s1low" y={1300} spots={S1_LOW} ink={INK_PX.hair} />
    <SeatRow name="s1mid1" y={1452} spots={S1_MID1} ink={INK_PX.far} />
    <SeatRow name="s1mid2" y={1610} spots={S1_MID2} ink={INK_PX.far} />
    <NearRow name="s1near" spots={S1_NEAR} />
  </>
);
const PipS1: React.FC = () => (
  <PipTrack
    x={M.S1_BOLLARD.x}
    y={M.S1_BOLLARD.y}
    size={100}
    facing="back"
    seed="kc/pipS1"
    keys={[
      {t: S1C.pipHeadFollows, target: s1HerHead},
      {t: S1C.life, pose: 'earsCover', dur: 0.1},
      {t: 5.55, pose: 'sit', dur: 0.25},
      {t: S1C.pipHopsUpLeft, target: null, hop: {to: [560, 1010], height: 120, dur: 0.5}},
    ]}
  />
);
const SampleS1Inner: React.FC<{kitSeated?: boolean}> = ({kitSeated}) => {
  const t = useTime();
  const z = M.s1Zoom(Math.max(t, 0));
  return (
    <World sky={skyBands('golden')} horizon={1000}>
      <XG m={mat.about(mat.scale(z), M.W.x, M.W.y)}>
        <CanalCast person={k4Person} pip={k5Pip}>
          <S1Set towpath={<S1Row />} behindDoor={<S1Door />} seated={kitSeated ? <S1Seated /> : <S1People />} pip={<PipS1 />} />
        </CanalCast>
      </XG>
    </World>
  );
};
const SampleS1: React.FC = () => <SampleS1Inner />;
/** The same frame with K4's S1Seated as shipped (near row hv 262-326): the size the owner's rule replaces. */
const SampleS1Kit: React.FC = () => <SampleS1Inner kitSeated />;

// ---------------------------------------------------------------- V2S2 (film 6.10-12.98; the sample at 10.00)

const S2_T0 = 6.1;
const s2Overlay = (w: M.Spot & {id: string}): React.ReactNode => {
  if (w.id === 'HER') return null;
  const i = M.S2.staffWindows.findIndex((s) => s.id === w.id);
  const keys = [{t: M.S2.blindsAt - S2_T0 + i * M.S2.blindsStagger, k: 0.5}];
  if (w.id === 'W2') keys.push({t: M.S2.w2BlindDownAt - S2_T0, k: 1});
  return <StaffWindow x={w.x} y={w.y} w={w.w} h={w.h} seed={w.id} pane={false} lightAt={M.S2.staffOnAt - S2_T0 + i * M.S2.staffOnStagger} backAt={M.S2.blindsAt - S2_T0 + i * M.S2.blindsStagger} blind={keys} />;
};
const S2Bench: React.FC = () => (
  <>
    <Reporter x={M.S2.reporter.x} y={S2_BENCH_SEAT} h={M.S2.reporter.h} openAt={M.S2.notebookOpenAt - S2_T0} shutAt={M.S2.notebookShutAt - S2_T0} />
    <Staffer x={M.S2.staffer.x} y={S2_BENCH_SEAT} h={M.S2.staffer.h} turnAt={M.S2.notebookOpenAt - S2_T0} hoodAt={M.S2.hoodAt - S2_T0} />
  </>
);
const PipS2: React.FC = () => (
  <PipTrack
    x={M.S2.pipSeat.x}
    y={M.S2.pipSeat.y}
    size={96}
    facing="back"
    seed="kc/pipS2"
    keys={[
      {t: 0, target: [660, 1010]},
      {t: 8.3 - S2_T0, target: [M.W2.x, M.W2.y], dur: 0.3},
    ]}
  />
);
const HerRing: React.FC = () => {
  const w = M.S2.herDarkWindow;
  return <Ink d={ellD(w.x, w.y, w.w * 0.68, w.h * 0.64)} at={M.S2.ringAt - S2_T0} width={INK_PX.mid} color={CM.ink} seed="kc/s2ring" />;
};
const S2Near: React.FC = () => {
  const t = useTime();
  return (
    <>
      <Movers idPrefix="kcs2near" movers={[{pose: 'walk', from: [-80, 1530], to: [1160, 1546], h: 196, speed: 58, phase: 0.62, seed: 'kcs2w', acc: 'tote'}]} />
      <CastSlot s={{id: 'kcs2dog', x: 590 - ((t * 9) % 40), y: 1430, h: 64, pose: 'dog', seed: 's2dog', dir: -1, gait: t}} />
      <NearRow name="s2near" spots={[{x: 380, hv: 150, hair: 'beanie'}, {x: 650, hv: 144, hair: 'cap', turns: [[2.6, 0.4]]}]} />
    </>
  );
};
const SampleS2Inner: React.FC<{pose?: boolean}> = ({pose}) => {
  const t = useTime();
  const T = t + S2_T0;
  const zb = M.zoomAt(M.S2.camera.pullBack, T);
  const zp = M.zoomAt(M.S2.camera.push, T);
  const cam = pose ? mat.I : mat.mul(mat.about(mat.scale(zp), M.W2.x, M.W2.y), mat.about(mat.scale(zb), M.S2.camera.pullBack.anchor.x, M.S2.camera.pullBack.anchor.y));
  return (
    <World sky={skyBands('golden')} horizon={1000}>
      <XG m={cam}>
        <CanalCast person={k4Person} pip={k5Pip}>
          <S2Set staffCoolAt={M.S2.staffOnAt - S2_T0} storyOverlay={s2Overlay} aBoard={<StandInToldBBC outAt={M.S2.aBoardOutAt - S2_T0} />} bench={<S2Bench />} pip={<PipS2 />} people={false} boatAt={11.0 - S2_T0} />
          <HerRing />
          <S2Near />
        </CanalCast>
      </XG>
    </World>
  );
};
const SampleS2: React.FC = () => <SampleS2Inner />;
const SampleS2Pose: React.FC = () => <SampleS2Inner pose />;

// ---------------------------------------------------------------- V2S3 (film 12.98-14.86; no sample frame: the pieces)

const S3_T0 = 12.98;
const S3_HOUSES: HouseSpec[] = [
  {w: 300, first: 'two'},
  {w: 360, first: 'french'},
  {w: 330, first: 'french', lights: true, neighbour: 'first'},
  {w: 330, first: 'two', stucco: true},
];
const SampleS3: React.FC = () => {
  const t = useTime();
  const z = M.zoomAt(M.S3.camera.easeBack, t + S3_T0);
  return (
    <World sky={skyBands('sunset')} horizon={1000}>
      <XG m={mat.about(mat.scale(z), M.W2.x, M.W2.y)}>
        <CanalCast person={k4Person} pip={k5Pip}>
          <TerraceRow
            x0={-120}
            levels={{ground: 1100, first: 878, cornice: 664, mansardTop: 602}}
            houses={S3_HOUSES}
            her={{index: 1, french: M.W2_CUT, inside: <HerWindow x0={M.S3.pacingX[0]} x1={M.S3.pacingX[1]} y={M.S3.silhouette.feetY} h={137} gestureAt={M.S3.handMovesAt - S3_T0} />}}
            seed="kc/s3row"
            litFrac={0.6}
            lightsOn
          />
          <Water y0={1100} y1={1300} seed="kc/s3water" reflections={[{x0: 0, x1: 1080, color: CM.brickLight}, {x0: 270, x1: 400, color: CM.lamp}]} />
          <Narrowboat x={-220} water={1626} len={1520} h={250} dir={1} seed="kc/s3boat" cabin={CM.sage} topView={70} hullK={0.11} roofItems panel fenders />
          <Pip x={M.S3.pipSeat.x} y={M.S3.pipSeat.y} size={96} facing="back" look={-0.6} seed="kc/pipS3" />
        </CanalCast>
      </XG>
    </World>
  );
};

// ---------------------------------------------------------------- V2S4 (film 14.86-20.55; the sample at 17.00)

const S4_T0 = 14.86;
/** Her pace (px/s): S4 steps of 34 px at 1.5 steps/s; the camera trucks west with her, so the path plane slides right. */
const S4_V = 51;
/** px the path plane still has to slide before it lands on the map's pose (stop on "objected": 0.6 s ease-out to 17.96). */
const s4Rem = (T: number): number => {
  const {t0, t1} = M.S4.camera.stop;
  if (T < t0) return S4_V * (t0 - T) + S4_V * (t1 - t0) * 0.5;
  if (T < t1) {
    const u = (T - t0) / (t1 - t0);
    return S4_V * (t1 - t0) * 0.5 * (1 - u) * (1 - u);
  }
  return 0;
};
const S4Tow: React.FC<{dx: number}> = ({dx}) => {
  const t = useTime();
  const T = t + S4_T0;
  const h = M.S4.her;
  return (
    <>
      <StandInPost t0={S4_T0} />
      {T >= M.S4.stopAt ? <Her x={h.x - dx} y={h.feetY} h={h.h} pose="stopLook" /> : <Her x={h.x - dx} y={h.feetY} h={h.h} pose="walk" view="profile" walk={{rate: 1.5}} stride={strideFor(34, 170)} />}
      <Movers idPrefix="kcs4w" movers={[{pose: 'walk', from: [1180, 1066], to: [-120, 1066], h: 158, speed: 46, phase: 0.55, seed: 'kcs4wW', acc: 'scarf'}]} />
      <FallingLeaves box={[0, 860, 1080, 1090]} n={6} size={14} seed="kcs4leaves" wind={-24} />
    </>
  );
};
const PipS4: React.FC = () => (
  <PipTrack
    x={M.S4.pipSeat.x}
    y={M.S4.pipSeat.y}
    size={100}
    facing="back"
    seed="kc/pipS4"
    keys={[
      {t: 0, ride: {amp: 1.6}},
      {t: 0.1, target: [M.S4.her.x, M.S4.her.feetY - M.S4.her.h * 0.9]},
      {t: 19.55 - S4_T0, facing: 'left', target: null},
    ]}
  />
);
const SampleS4: React.FC = () => {
  const t = useTime();
  const T = t + S4_T0;
  const dx = -s4Rem(T);
  const z = M.zoomAt(M.S4.camera.push, T);
  return (
    <World sky={skyBands('lowSun')} horizon={1000}>
      <XG m={mat.about(mat.scale(z), M.SUN1.x, M.SUN1.y)}>
        <CanalCast person={k4Person} pip={k5Pip}>
          <S4Set dxFar={dx * 0.3} dxBacks={dx * 0.6} dxPath={dx} towpath={<S4Tow dx={dx} />} pip={<PipS4 />} birdsAt={M.S4.birdsWestAt - S4_T0} />
        </CanalCast>
      </XG>
      <StandInNameTag t0={S4_T0} />
    </World>
  );
};

// ---------------------------------------------------------------- V2S7 (no sample frame: the wing piece + B + Pip)

const SampleS7: React.FC = () => (
  <World sky={skyBands('sunset')} horizon={1000}>
    <SunDisc x={M.SUN2.x} y={M.SUN2.y} r={M.SUN2.r} />
    <WingS7 />
    <rect x={M.B.x0} y={M.B.y0} width={M.B.x1 - M.B.x0} height={M.B.y1 - M.B.y0} fill="none" stroke={C.map} strokeWidth={3} strokeDasharray="14 9" />
    <Bollard x={M.BOARD_BOLLARD.x} y={M.BOARD_BOLLARD.y + 44} h={44} seed="kc/s7bol" />
    <Pip x={M.BOARD_BOLLARD.x} y={M.BOARD_BOLLARD.y} size={96} facing="back" idle={{flick: false}} seed="kc/pipS7" />
  </World>
);

// ---------------------------------------------------------------- V2S8 (film 32.93-39.08; the sample at 37.00)

const S8_T0 = 32.93;
const S8Lane: React.FC<{dxG: number}> = ({dxG}) => (
  <>
    <Movers
      idPrefix="kcs8w"
      movers={[
        {pose: 'walk', from: [560, 1064], to: [1120, 1180], h: [92, 150], speed: 40, phase: 0.3, seed: 's8w1', acc: 'scarf'},
        {pose: 'walk', from: [1130, 1150], to: [580, 1062], h: [140, 94], speed: 34, phase: 0.78, seed: 'kcs8w2', acc: 'tote'},
        {pose: 'cycle', from: [1150, 1250], to: [560, 1066], h: [170, 96], speed: 110, phase: 0.62, pause: 2, seed: 's8cyc'},
      ]}
    />
    <S8Ghosts at={M.S8.ghostsPopAt - S8_T0} dx={dxG} />
  </>
);
const PipS8: React.FC = () => (
  <PipTrack
    x={M.BOARD_BOLLARD.x}
    y={M.BOARD_BOLLARD.y}
    size={96}
    facing="back"
    seed="kc/pipS8"
    keys={[
      {t: 0, target: [390, 960]},
      {t: M.S8.ghostsPopAt - S8_T0, pose: 'earsDown', dur: 0.16},
      {t: 1.7, pose: 'sit', dur: 0.4},
      {t: M.S8.pipLooksUpAt - S8_T0, target: [M.W.x, M.W.y], dur: 0.3},
    ]}
  />
);
/** Her silhouette in W once it lights (the picture S3 showed): S8Set exposes no `inside` slot, so it is drawn over the set
 *  inside W's glass (K6 defect, listed). */
const HerInW: React.FC<{dxH: number; wAt: number}> = ({dxH, wAt}) => {
  const t = useTime();
  const id = 'kcHerInW' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (t < wAt) return null;
  const w = M.W;
  const x0 = w.x - w.w / 2 + 10 + dxH;
  const y0 = w.y - w.h / 2 + 10;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={x0} y={y0} width={w.w - 20} height={w.h - 20} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <HerWindow x0={w.x - 30 + dxH} x1={w.x + 30 + dxH} y={w.y + w.h / 2 - 8} h={136} phase={0.4} />
      </g>
    </g>
  );
};
const SampleS8: React.FC = () => {
  const t = useTime();
  const T = t + S8_T0;
  const u = M.s8TruckU(T);
  const tr = M.S8.truck;
  const dxB = -tr.boardPlaneDx * (1 - u);
  const dxG = -tr.ghostPlaneDx * (1 - u);
  const dxH = -tr.housePlaneDx * (1 - u);
  return (
    <World sky={skyBands('sunset')} horizon={1000}>
      <CanalCast person={k4Person} pip={k5Pip}>
        <S8Set
          dxHouse={dxH}
          dxNear={dxB}
          wAt={M.S8.wLights - S8_T0}
          lampRunAt={M.S8.lampRunAt - S8_T0}
          walkers={false}
          lane={<S8Lane dxG={dxG} />}
          board={
            <XG m={mat.translate(dxB, 0)}>
              <StandInHerBoard wipeAt={M.S8.wipeBoardAt - S8_T0} quoteAt={M.S8.quotePenAt - S8_T0} />
            </XG>
          }
          pip={
            <XG m={mat.translate(dxB, 0)}>
              <Bollard x={M.BOARD_BOLLARD.x} y={M.BOARD_BOLLARD.y + 44} h={44} seed="kc/s8bol" />
              <PipS8 />
            </XG>
          }
        />
        <HerInW dxH={dxH} wAt={M.S8.wLights - S8_T0} />
      </CanalCast>
    </World>
  );
};

// ---------------------------------------------------------------- V2S5 (film 20.55-24.00, K7 CraneSet) + V2S6 (24.00-28.06, K7 GateSet)

/** The start figures (start coords): the stranger seated, reading (contract Fig 150 = seated 100 + legs), Pip 108 (so
 *  the deck plane's 1 / 2.42 lands it at 44.6 px, >= 44; K7's own sample uses 104 -> 43). */
const S5_PIP = 108;
const S5FigStart: React.FC = () => {
  const t = useTime();
  const s = M.S5.start.stranger;
  const look = t > CRANE_T.april - 0.05 && t < CRANE_T.flip[1] + 0.2 ? 1 : 0;
  return (
    <>
      <Stranger x={s.x} y={s.feetY - 50} h={s.h - 50} />
      <Pip x={M.S5.start.pipSeat.x} y={M.S5.start.pipSeat.y} size={S5_PIP} facing="back" target={[M.SUN1.x, M.SUN1.y]} targetWeight={look} seed="kc/pipS5" />
    </>
  );
};
const deckEnd = (q: [number, number]): [number, number] => {
  const off = DECK.off ?? [0, 0];
  return [DECK.o[0] + (q[0] - DECK.o[0] - off[0]) / DECK.k, DECK.o[1] + (q[1] - DECK.o[1] - off[1]) / DECK.k];
};
const S5FigEnd: React.FC = () => {
  const s = M.S5.start.stranger;
  const sEnd = deckEnd([s.x, s.feetY - 50]);
  const p = deckEnd([M.S5.start.pipSeat.x, M.S5.start.pipSeat.y]);
  return (
    <>
      <Stranger x={sEnd[0]} y={sEnd[1]} h={(s.h - 50) / DECK.k} />
      <Pip x={p[0]} y={p[1]} size={S5_PIP / DECK.k} facing="back" seed="kc/pipS5" />
    </>
  );
};
/** The terrace public in END coords (deck camera: 60-140 px backs), flat shadows toward us-left. */
const S5TerracePeople: React.FC = () => {
  const t = useTime();
  const at = (lx: number, d: number, hM: number) => {
    const [x, y] = deckPt(lx, d);
    return {x, y, h: hM * deckPxPerM(y)};
  };
  const ppl = [
    {...at(4.8, 21.0, 1.72), seed: 'kc/s5/rail1', coat: CM.coatMustard},
    {...at(5.6, 21.0, 1.6), seed: 'kc/s5/rail2', coat: CM.coatOat},
    {...at(11.4, 21.0, 1.75), seed: 'kc/s5/rail3', coat: CM.brick},
    {...at(8.4, 13.4, 1.7), seed: 'kc/s5/parent', coat: CM.coatPlum},
    {...at(4.4, 17.6, 1.68), seed: 'kc/s5/pair1', coat: CM.sage},
    {...at(4.95, 17.8, 1.6), seed: 'kc/s5/pair2', coat: CM.brickLight},
    {...at(8.6, 20.6, 1.7), seed: 'kc/s5/rail4', coat: CM.coatSlate},
    {...at(9.2, 13.8, 1.2), seed: 'kc/s5/child', coat: CM.coatMustard},
  ];
  const jog = at(12.5 - ((t * 2.6) % 9), 18.0, 1.7);
  const sh = ppl.map((q) => castShadowD(q.x, q.y, q.h * 0.42)).join('') + castShadowD(jog.x, jog.y, jog.h * 0.42);
  const b2 = at(3.8, 14.6, 0.85);
  return (
    <>
      <path d={sh} fill={TT.shadowFloor} />
      {ppl.map((q) => (
        <Person key={q.seed} x={q.x} y={q.y} h={q.h} seed={q.seed} traits={{coat: q.coat}} />
      ))}
      <Person x={jog.x} y={jog.y} h={jog.h} seed="kc/s5/jog" pose="jog" view="profile" walk={{rate: 2.8}} />
      <Seated x={b2.x} y={deckPt(3.8, 14.6, 0.45)[1]} h={b2.h} seed="kc/s5/bench2" phone />
    </>
  );
};
const SampleS5: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: CM.sky}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <CraneSet figuresStart={<S5FigStart />} figuresEnd={<S5FigEnd />} deckStart={<StandInNewsBox />} deckEnd={<><S5TerracePeople /><StandInPlaque /></>} />
    </svg>
  </AbsoluteFill>
);

const S6_T0 = 24.0;
const S6DoorPeople: React.FC = () => {
  const t = useTime();
  const D = GATE.door;
  const inX = D.x0 + 40 - Math.max(0, Math.min(1, (0.95 - t) / 0.95)) * 70;
  const x2 = D.x0 + 60 - Math.min(1, Math.max(0, (t - 2.4) / 0.6)) * 60 + Math.min(1, Math.max(0, (t - 2.9) / 0.45)) * 60;
  return (
    <>
      {t < 1.0 ? <Person x={inX} y={D.y1} h={74} seed="kc/s6/staff1" walk={{rate: 1.8}} traits={{coat: CM.coatSlate}} /> : null}
      {t > 2.35 && t < 3.4 ? <Person x={x2} y={D.y1} h={72} seed="kc/s6/staff2" walk={{rate: 1.8}} traits={{coat: CM.coatOat}} /> : null}
    </>
  );
};
const S6Lawn: React.FC = () => {
  const t = useTime();
  const x = 1200 - ((t * 120) % 1500);
  const xw = -80 + ((t * 34 + 300) % 1300);
  return (
    <>
      <Person x={x} y={884} h={104} seed="kc/s6/jog" pose="jog" view="profile" walk={{rate: 2.9}} />
      <Person x={xw} y={880} h={96} seed="kc/s6/walk" view="profile" flip walk={{rate: 1.6}} traits={{acc: 'tote'}} />
    </>
  );
};
const PipS6: React.FC = () => (
  <PipTrack x={GATE.post.x} y={GATE.post.cap} size={98} facing="back" seed="kc/pipS6" idle={{flick: false}} keys={[{t: 0, target: [960, 790]}, {t: M.S6.pipEarFlickAt - S6_T0, flick: 'A'}]} />
);
const SampleS6: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: CM.sky}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <GateSet
        bars={<HighBars seed="kc/s6bars" drift={5} />}
        doorPeople={<S6DoorPeople />}
        lawn={<S6Lawn />}
        board={<StandInDealBoard />}
        pip={<PipS6 />}
        near={<NearRow name="s6near" spots={[{x: 150, hv: 150, hair: 'short'}, {x: 400, hv: 144, hair: 'bun'}, {x: 650, hv: 152, hair: 'beanie'}]} />}
      />
    </svg>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- the frames with the film's captions (lib/Film)

const SCENES = scenesJson as unknown as FilmScene[];
const CAPTIONS = captionsJson as unknown as CaptionBeat[];
const SAMPLES: Record<string, React.FC> = {V2S1: SampleS1, V2S2: SampleS2, V2S4: SampleS4, V2S8: SampleS8};
const SAMPLE_T: {id: M.ShotId; T: number}[] = [
  {id: 'V2S1', T: 2.5},
  {id: 'V2S2', T: 10.0},
  {id: 'V2S4', T: 17.0},
  {id: 'V2S8', T: 37.0},
];
/** One assembled shot under the film's captions at film second `at` (+ the composition's frame / 60); `bare` = no
 *  captions (the caption-band check: nothing of the kit may be drawn in y 317-556). */
const ContractFrame: React.FC<{id: string; at?: number; bare?: boolean}> = ({id, at = 0, bare}) => (
  <Film scenes={SCENES} components={SAMPLES} captions={CAPTIONS} only={id} offset={at} audio={false} showCaptions={!bare} captionMotion="pop" edges={false} />
);

/** The map's key shapes of a shot at T (map.ts shotShapes), as thin outlines for the sheet's sample frames. */
const MapOverlay: React.FC<{id: M.ShotId; T: number}> = ({id, T}) => {
  const shapes = M.shotShapes(id, T).filter((s) => s.role !== 'mass' && s.role !== 'line');
  return (
    <g fill="none" stroke={C.map} strokeWidth={3} strokeDasharray="12 8">
      <rect x={0} y={M.UI.captionBand.y0} width={1080} height={M.UI.captionBand.y1 - M.UI.captionBand.y0} stroke={C.rule} strokeDasharray="4 10" />
      {shapes.map((s, i) => {
        const r = M.shapeRect(s);
        if (s.kind === 'disc') return <circle key={i} cx={s.d.x} cy={s.d.y} r={s.d.r} />;
        return <rect key={i} x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} />;
      })}
    </g>
  );
};

// =====================================================================================================================
// 3. THE SHEET
// =====================================================================================================================

type Sec = {h: number; C: React.FC<{y: number}>};
const secHead = (n: string, title: string, sub?: string): Sec => ({h: SEC_H, C: ({y}) => <SecHead y={y} n={n} title={title} sub={sub} />});

// ---------------------------------------------------------------- header

const HEAD_H = 300;
const Header: React.FC<{y: number}> = ({y}) => {
  const lines: [string, string][] = [
    ['Every K4 / K5 / K6 / K7 piece at every size the shot list uses (map.ts), drawn 1:1 at 1080 px.', CM.paper],
    ['Frozen before the lanes. Labels: name · spec · drawn bbox w×h · the rule it must meet:', CM.bandGold],
    ['green = pass, red = FAIL, amber = note. Rules: carrier >= 130 px tall · story change >= 80 px', CM.bandGold],
    ['near head-backs <= 140 px wide · no figure wider than 180 px (1/6 frame) · Pip 86-120 (S5 end >= 44)', CM.bandGold],
    ['K3 boards / tag / post / box / plaque = STAND-INS (WorldText + texts.ts); L5 builds the real ones.', CM.blossom],
    ['1 her · 2 ghosts · 3 public · 4 seated + near · 5 S2 windows · 6 Pip · 7 clearances · 8 canal · 9 Arlington · 10 samples', CM.paper],
  ];
  return (
    <svg style={{position: 'absolute', left: 0, top: y}} width={SW} height={HEAD_H}>
      <rect width={SW} height={HEAD_H} fill={C.head} />
      <Tx x={26} y={54} s={38} b c={CM.paper}>
        KIT CONTRACT · video 2 &quot;One Small Window&quot;
      </Tx>
      <Tx x={26} y={88} s={20} c={CM.sky}>
        10 Canal Mint · K4 cast · K5 Pip · K6 canal · K7 Arlington · 2026-10-27 · src/entry-v2r-contract.tsx
      </Tx>
      {lines.map(([l, c], i) => (
        <Tx key={i} x={26} y={128 + i * 28} s={19} c={c}>
          {l}
        </Tx>
      ))}
    </svg>
  );
};

// ---------------------------------------------------------------- 1. her

const H1 = 360;
const Her1: React.FC<{y: number}> = ({y}) => {
  const g = 280;
  const ly = g + 22;
  return (
    <Row y={y} h={H1} title="S1 (golden) · the S1 scale sheet: her 153 behind the glass (90 px/m), 170 on her line (100 px/m)" ground={g}>
      <Floor y={g - 130} label="130" />
      <rect x={6} y={g - 234} width={178} height={234} fill={CM.glass} />
      <Item x={95} ly={ly} name="S1 f0 behind door" spec="153" kind="carrier">
        <Her x={95} y={g} h={153} view="rear34" step={0.5} stride={S1_STRIDE} plant />
      </Item>
      <path d={`M6 ${g - 234}L184 ${g - 234}L184 ${g}M95 ${g - 234}L95 ${g}M6 ${g - 234}L6 ${g}`} stroke={CM.ink} strokeWidth={2.2} fill="none" />
      <Item x={250} ly={ly} name="S1 walk r3/4" spec="170 + plant" kind="carrier">
        <Her x={250} y={g} h={170} view="rear34" step={0} stride={S1_STRIDE} plant />
      </Item>
      <Item x={390} ly={ly} name="S1 walk (2)" spec="170" kind="carrier">
        <Her x={390} y={g} h={170} view="rear34" step={0.5} stride={S1_STRIDE} plant />
      </Item>
      <Item x={530} ly={ly} name="S1 coat paper" spec="f1-f17" kind="carrier">
        <TimeShift by={-0.2}>
          <Her x={530} y={g} h={170} view="rear34" step={0.25} stride={S1_STRIDE} plant coatAt={0.3} />
        </TimeShift>
      </Item>
      <Item x={670} ly={ly} name="S1 look back" spec="5.59" kind="carrier">
        <Her x={670} y={g} h={170} pose="lookBack" look={1} view="rear34" step={0.75} stride={S1_STRIDE} plant />
      </Item>
      <Item x={810} ly={ly} name="S1 stop 4.54" spec="mid-stride" kind="carrier">
        <Her x={810} y={g} h={170} view="rear34" step={0.75} stride={S1_STRIDE} plant />
      </Item>
      <Item x={960} ly={ly} name="the floor" spec="130" kind="carrier">
        <Her x={960} y={g} h={130} view="rear34" step={0.25} stride={S1_STRIDE} />
      </Item>
    </Row>
  );
};

const H2 = 340;
const Her2: React.FC<{y: number}> = ({y}) => {
  const g = 260;
  const ly = g + 22;
  const st4 = strideFor(34, 170, 'profile');
  return (
    <Row y={y} h={H2} title="S4 (low sun) · walking home in profile 170 · S8 (sunset) · walking home, back 150, her door" ground={g} bands={[[460, SW, CM.bandSunset]]}>
      <Floor y={g - 130} label="130" />
      <Item x={90} ly={ly} name="S4 profile" spec="170" kind="carrier">
        <Her x={90} y={g} h={170} view="profile" step={0} stride={st4} />
      </Item>
      <Item x={230} ly={ly} name="S4 profile (2)" spec="170" kind="carrier">
        <Her x={230} y={g} h={170} view="profile" step={0.5} stride={st4} />
      </Item>
      <Item x={370} ly={ly} name="S4 stopLook" spec="17.96" kind="carrier">
        <Her x={370} y={g} h={170} pose="stopLook" />
      </Item>
      <Item x={540} ly={ly} name="S8 back walk" spec="150" kind="carrier">
        <Her x={540} y={g} h={150} view="back" step={0} />
      </Item>
      <Item x={680} ly={ly} name="S8 back (2)" spec="150" kind="carrier">
        <Her x={680} y={g} h={150} view="back" step={0.5} />
      </Item>
      <rect x={770} y={g - 14} width={90} height={14} fill={CM.limestone} stroke={CM.ink} strokeWidth={1.6} />
      <Item x={820} ly={ly} name="S8 goIn" spec="34.55" kind="carrier">
        <Her x={820} y={g} h={150} pose="goIn" />
      </Item>
      <Item x={970} ly={ly} name="S8 stand" spec="150" kind="carrier">
        <Her x={970} y={g} h={150} pose="stand" view="back" />
      </Item>
    </Row>
  );
};

/** S3 in an SVG panel: the TerraceRow window region at 1:1 (and through the 0.95 ease-back). */
const S3Panel: React.FC<{x: number; y: number; z: number; id: string}> = ({x, y, z, id}) => {
  const src = {x: 185, y: 640, w: 300, h: 270};
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={x} y={y} width={src.w} height={src.h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={src.w} height={src.h} fill={CM.bandSunset} />
        <XG m={mat.compose(mat.translate(x - src.x, y - src.y), mat.about(mat.scale(z), M.W2.x, M.W2.y))}>
          <TerraceRow
            x0={-120}
            levels={{ground: 1100, first: 878, cornice: 664, mansardTop: 602}}
            houses={S3_HOUSES}
            her={{index: 1, french: M.W2_CUT, inside: <HerWindow x0={M.S3.pacingX[0]} x1={M.S3.pacingX[1]} y={M.S3.silhouette.feetY} h={137} phase={0.6} />}}
            seed="kc/s3row"
            litFrac={0.6}
            lightsOn
          />
          <Pip x={M.S3.pipSeat.x} y={M.S3.pipSeat.y} size={96} facing="back" look={-0.6} seed="kc/pipS3" />
        </XG>
      </g>
      <rect x={x} y={y} width={src.w} height={src.h} fill="none" stroke={CM.ink} strokeWidth={2} />
    </g>
  );
};
const H3 = 380;
const Her3: React.FC<{y: number}> = ({y}) => {
  const g = 300;
  return (
    <Row y={y} h={H3} title="S3 (sunset) · her French window at W2_CUT 133×164: silhouette 137 at the match, 130 after the ease-back" bg={CM.bandSunset} ground={g}>
      <S3Panel x={14} y={34} z={1} id="kcS3a" />
      <S3Panel x={330} y={34} z={0.95} id="kcS3b" />
      <Tx x={164} y={g + 26} s={16} a="middle" b>
        12.98 match (zoom 1.00)
      </Tx>
      <Tx x={480} y={g + 26} s={16} a="middle" b>
        13.60 ease-back 0.95
      </Tx>
      <Floor y={g - 130} label="130" x0={650} />
      <rect x={690} y={g - 164} width={133} height={164} fill={CM.lamp} />
      <Item x={756} ly={g + 22} name="S3 silhouette" spec="137 (match)" kind="carrier">
        <HerWindow x0={756} x1={757} y={g - 2} h={137} phase={0.6} />
      </Item>
      <rect x={880} y={g - 164} width={133} height={164} fill={CM.lamp} />
      <Item x={946} ly={g + 22} name="after ease-back" spec="130" kind="carrier">
        <HerWindow x0={946} x1={947} y={g - 2} h={130} phase={0.6} />
      </Item>
    </Row>
  );
};

// ---------------------------------------------------------------- 2. ghosts

const G1H = 350;
const Ghost1: React.FC<{y: number}> = ({y}) => {
  const row = M.s1RowAt(M.S1_CLOCK.cover);
  const src: [number, number, number, number] = [0, 860, 660, 290];
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: y}} width={SW} height={G1H}>
        <rect width={SW} height={G1H} fill={C.strip} />
        <Tx x={680} y={52} s={18} b c={C.head}>
          s1RowAt(5.30), the cover (zoom 1.00):
        </Tx>
        {M.S1_ROW.map((m, i) => (
          <Tx key={m.id} x={690} y={80 + i * 26} s={16} c={m.kind === 'outline' ? C.note : C.ink}>
            {`${m.id.padEnd(3, ' ')}  x ${row[i].x.toFixed(0)}  feet ${row[i].feetY.toFixed(0)}  h ${row[i].h.toFixed(1)}  ${m.popT === null ? '' : 'pop ' + m.popT.toFixed(2)}`}
          </Tx>
        ))}
        <line x1={0} y1={G1H - 1} x2={SW} y2={G1H - 1} stroke={C.mute} strokeWidth={2} />
      </svg>
      <Window y={y + 6} x={6} src={src} label="S1 5.30 at 1:1: her + G1-G6 + O1-O3 on the far towpath (the assembled sample)">
        <At T={M.S1_CLOCK.cover} start={0}>
          <SampleS1 />
        </At>
      </Window>
    </>
  );
};

const G2H = 330;
const Ghost2: React.FC<{y: number}> = ({y}) => {
  const g = 250;
  const T = M.S1_CLOCK.cover;
  const row = M.s1RowAt(T);
  const step = s1Step(T);
  return (
    <Row y={y} h={G2H} title="the row at its cover heights, measured (spaced 106 px; paper fill, 2.2 px ink, age = head value)" ground={g}>
      <Floor y={g - 130} label="130" />
      {M.S1_ROW.map((m, i) => {
        const x = 56 + i * 106;
        const h = row[i].h;
        const kind: Kind = m.kind === 'outline' ? 'group' : 'carrier';
        return (
          <Item key={m.id} x={x} ly={g + 22} name={m.id} spec={h.toFixed(0)} kind={kind}>
            {m.kind === 'her' ? (
              <Her x={x} y={g} h={h} view="rear34" step={step} stride={S1_STRIDE} plant />
            ) : m.kind === 'ghost' ? (
              <Ghost x={x} y={g} h={h} age={i} step={step} stride={S1_STRIDE} seed={`kc/s1/${m.id}`} />
            ) : (
              <BareOutline x={x} y={g} h={h} step={step} stride={S1_STRIDE} seed={`kc/s1/${m.id}`} />
            )}
          </Item>
        );
      })}
    </Row>
  );
};

const G3H = 320;
const Ghost3: React.FC<{y: number}> = ({y}) => {
  const g = 240;
  return (
    <Row y={y} h={G3H} title="the pop: outline 0.10 s, paper fill 2 f later, 4-frame settle (G3 at 151) · bare outline O1 (130)" ground={g}>
      {[0, 2, 4, 6, 8, 14].map((f, i) => (
        <TimeShift key={f} by={-(f / 60)}>
          <Item x={70 + i * 112} ly={g + 22} name={`G3 +${f} f`} spec="151">
            <Ghost x={70 + i * 112} y={g} h={151} age={3} at={0} seed={`kc/pop/${i}`} />
          </Item>
        </TimeShift>
      ))}
      {[0, 3, 6].map((f, i) => (
        <TimeShift key={f} by={-(f / 60)}>
          <Item x={770 + i * 112} ly={g + 22} name={`O1 +${f} f`} spec="130">
            <BareOutline x={770 + i * 112} y={g} h={130} at={0} seed={`kc/opop/${i}`} />
          </Item>
        </TimeShift>
      ))}
    </Row>
  );
};

const G4H = 330;
const Ghost4: React.FC<{y: number}> = ({y}) => {
  const g = 250;
  return (
    <Row y={y} h={G4H} title="S8 callback (sunset): G4-G6 cues at map S8.ghosts 140 / 135 / 130, back view · her 150 · Pip 96" bg={CM.bandSunset} ground={g}>
      <Floor y={g - 130} label="130" />
      {M.S8.ghosts.map((s, i) => (
        <Item key={s.id} x={120 + i * 150} ly={g + 22} name={s.id} spec={`${s.h}`} kind="carrier">
          <Ghost x={120 + i * 150} y={g} h={s.h} age={4 + i} view="back" seed={`kc/s8/${s.id}`} />
        </Item>
      ))}
      <Item x={620} ly={g + 22} name="her, home" spec="150" kind="carrier">
        <Her x={620} y={g} h={150} view="back" step={0.3} />
      </Item>
      <rect x={790} y={g - 44} width={40} height={44} rx={8} fill={CM.anchor} />
      <Item x={810} ly={g + 22} name="Pip (scale)" spec="size 96" kind="pip" size={96}>
        <Pip x={810} y={g - 44} size={96} facing="back" seed="kc/g4pip" />
      </Item>
    </Row>
  );
};

// ---------------------------------------------------------------- 3. the public

const P1H = 330;
const Pub1: React.FC<{y: number}> = ({y}) => {
  const g = 250;
  const ly = g + 22;
  return (
    <Row y={y} h={P1H} title="S1 (golden) · the far towpath at her line (100 px/m): walkers, joggers, a cyclist 150-170" ground={g}>
      <Item x={90} ly={ly} name="S1 walker" spec="168 tote" kind="person">
        <Person x={90} y={g} h={168} seed="kc/p/w1" pose="walk" view="profile" flip walk={{rate: 1.6}} traits={{acc: 'tote'}} />
      </Item>
      <Item x={260} ly={ly} name="S1 jogger" spec="170 cap" kind="person">
        <Person x={260} y={g} h={170} seed="kc/p/j1" pose="jog" view="profile" walk={{rate: 2.8}} traits={{hair: 'cap'}} />
      </Item>
      <Item x={450} ly={ly} name="S1 cyclist" spec="168" kind="person">
        <Person x={450} y={g} h={168} seed="kc/p/c1" pose="cycle" view="profile" flip />
      </Item>
      <Item x={640} ly={ly} name="S1 jogger (2)" spec="150 beanie" kind="person">
        <Person x={640} y={g} h={150} seed="kc/p/j2" pose="jog" view="profile" flip walk={{rate: 2.8, phase: 0.4}} traits={{hair: 'beanie'}} />
      </Item>
      <Item x={800} ly={ly} name="back walker" spec="160" kind="person">
        <Person x={800} y={g} h={160} seed="kc/p/b1" pose="walk" view="back" walk={{rate: 1.7}} traits={{acc: 'backpack'}} />
      </Item>
      <Item x={960} ly={ly} name="r3/4 stand" spec="150" kind="person">
        <Person x={960} y={g} h={150} seed="kc/p/s1" pose="stand" view="rear34" traits={{hair: 'long'}} />
      </Item>
    </Row>
  );
};

const P2H = 300;
const Pub2: React.FC<{y: number}> = ({y}) => {
  const g = 220;
  const ly = g + 22;
  return (
    <Row y={y} h={P2H} title="S2 far towpath 120 → 40 · S4 her towpath: walker 160, cyclist 165, dog 44 · S1 boater (tiller)" ground={g}>
      <Item x={52} ly={ly} name="S2 120" kind="person">
        <Person x={52} y={g} h={120} seed="kc/p/s2a" pose="walk" view="profile" walk={{rate: 1.7}} traits={{acc: 'tote'}} />
      </Item>
      <Item x={158} ly={ly} name="S2 80" kind="person">
        <Person x={158} y={g} h={80} seed="kc/p/s2b" pose="walk" view="profile" flip walk={{rate: 1.7}} />
      </Item>
      <Item x={256} ly={ly} name="S2 40" kind="person">
        <Person x={256} y={g} h={40} seed="kc/p/s2c" pose="walk" view="profile" walk={{rate: 1.7}} />
      </Item>
      <Item x={356} ly={ly} name="S2 jog" spec="100" kind="person">
        <Person x={356} y={g} h={100} seed="kc/p/s2d" pose="jog" view="profile" walk={{rate: 2.8}} traits={{hair: 'cap'}} />
      </Item>
      <Item x={480} ly={ly} name="S4 walker" spec="160" kind="person">
        <Person x={480} y={g} h={160} seed="kc/p/s4w" pose="walk" view="profile" flip walk={{rate: 1.6}} traits={{acc: 'backpack'}} />
      </Item>
      <Item x={640} ly={ly} name="S4 cyclist" spec="165" kind="person">
        <Person x={640} y={g} h={165} seed="kc/p/s4c" pose="cycle" view="profile" />
      </Item>
      <Item x={810} ly={ly} name="S4 dog (K6 slot)" spec="44" kind="none">
        <CastSlot s={{id: 'kcdog', x: 810, y: g, h: 44, pose: 'dog', seed: 's4dog', dir: 1, gait: 0.2}} />
      </Item>
      <Item x={975} ly={ly} name="S1 boater" spec="tiller 120" kind="person">
        <Person x={975} y={g} h={120} seed="kc/p/tiller" pose="tiller" view="profile" flip traits={{hair: 'beanie'}} />
      </Item>
    </Row>
  );
};

const P3H = 470;
const Pub3: React.FC<{y: number}> = ({y}) => {
  const g = 390;
  const ly = g + 22;
  return (
    <Row y={y} h={P3H} title="S8 (sunset) · the lane 150 → 92 · cyclist: contract 170 vs S8Set's default 300 · a neighbour reading" bg={CM.bandSunset} ground={g}>
      <Item x={70} ly={ly} name="S8 walker" spec="150" kind="person">
        <Person x={70} y={g} h={150} seed="kc/p/s8a" pose="walk" view="back" walk={{rate: 1.6}} traits={{acc: 'scarf'}} />
      </Item>
      <Item x={190} ly={ly} name="S8 120" kind="person">
        <Person x={190} y={g} h={120} seed="kc/p/s8b" pose="walk" view="rear34" walk={{rate: 1.6}} />
      </Item>
      <Item x={300} ly={ly} name="S8 92" kind="person">
        <Person x={300} y={g} h={92} seed="kc/p/s8c" pose="walk" view="back" walk={{rate: 1.6}} />
      </Item>
      <Item x={450} ly={ly} name="S8 cyclist" spec="170 (contract)" kind="person">
        <Person x={450} y={g} h={170} seed="kc/p/s8cy" pose="cycle" view="profile" />
      </Item>
      <Item x={700} ly={ly} name="S8Set cyclist" spec="300 (kit)" kind="person">
        <Person x={700} y={g} h={300} seed="kc/p/s8big" pose="cycle" view="profile" />
      </Item>
      <Item x={960} ly={ly} name="S8 neighbour" spec="reads 150" kind="person">
        <Person x={960} y={g} h={150} seed="kc/p/s8n" pose="stand" view="back" traits={{acc: 'tote'}} />
      </Item>
    </Row>
  );
};

const P4H = 300;
const Pub4: React.FC<{y: number}> = ({y}) => {
  const acts = ['idle', 'water', 'read', 'phone', 'water'] as const;
  return (
    <Row y={y} h={P4H} title="window people 12-60 (never still) · far crowds 6-45 px (fill only, batched)" bg={CM.brickLight}>
      {[14, 22, 30, 40, 52].map((hb, i) => (
        <g key={hb}>
          <rect x={20 + i * 118} y={60} width={100} height={130} fill={CM.lamp} />
          <WindowPerson x={70 + i * 118} y={190} hb={hb} seed={`kc/win/${i}`} act={acts[i]} tip={0.6} />
          <rect x={14 + i * 118} y={190} width={112} height={10} fill={CM.limestone} stroke={CM.ink} strokeWidth={1.6} />
          <Tx x={70 + i * 118} y={226} s={16} a="middle" b>
            {`hb ${hb} · ${acts[i]}`}
          </Tx>
        </g>
      ))}
      <rect x={620} y={50} width={450} height={190} fill={CM.paving} />
      <FarCrowd spots={scatterCrowd({seed: 'kc/far', n: 70, x0: 630, x1: 1060, yFar: 80, yNear: 236, hFar: 6, hNear: 45, walkers: 0.45})} />
      <Tx x={845} y={270} s={16} a="middle" b>
        FarCrowd 6 → 45 px
      </Tx>
    </Row>
  );
};

// ---------------------------------------------------------------- 4. seated + near

const N1H = 300;
const Seat1: React.FC<{y: number}> = ({y}) => {
  const g = 220;
  const ly = g + 22;
  const L: [number, number, Partial<{cup: number; turn: number; read: boolean; phone: boolean}>][] = [
    [52, 58, {}],
    [150, 61, {turn: -0.5}],
    [248, 56, {read: true}],
    [346, 60, {cup: 1}],
    [456, 84, {cup: 0.5}],
    [562, 88, {turn: 0.6}],
    [668, 90, {phone: true}],
    [786, 112, {read: true}],
    [904, 116, {cup: 1}],
    [1024, 120, {}],
  ];
  return (
    <Row y={y} h={N1H} title="S1 steps · seated backs: low row 56-62, middle rows 84-90 and 112-120 (cup, turn, read, phone)" bg={CM.limestone} ground={g}>
      {L.map(([x, h, o], i) => (
        <Item key={i} x={x} ly={ly} name={i < 4 ? 'low' : i < 7 ? 'mid' : 'mid 2'} spec={`${h}`} kind="person">
          <Seated x={x} y={g} h={h} seed={`kc/seat/${i}`} cup={o.cup} turn={o.turn} read={o.read} phone={o.phone} ink={h < 70 ? INK_PX.hair : INK_PX.far} />
        </Item>
      ))}
    </Row>
  );
};

const NEAR_HAIRS: [HairKind, string][] = [
  ['hood', 'hood'],
  ['beanie', 'beanie'],
  ['lowBun', 'low bun + scarf'],
  ['curls', 'curls'],
  ['cap', 'cap'],
  ['short', 'short'],
];
const N2H = 330;
const Near2: React.FC<{y: number}> = ({y}) => (
  <Row y={y} h={N2H} title="near head-backs cut by the frame bottom, CONTRACT size hv 150 (~125-140 px wide, ref 1's front row)" bg={CM.limestone}>
    {NEAR_HAIRS.map(([hair, name], i) => (
      <Item key={hair} x={90 + i * 180} ly={56} name={name} spec="hv 150" kind="near">
        <NearBack x={90 + i * 180} y={N2H} hv={150} seed={`kc/near/${hair}`} traits={{hair}} model={hair === 'lowBun' ? {scarf: CM.coatMustard} : undefined} ink={INK_PX.mid} />
      </Item>
    ))}
  </Row>
);

const N3H = 440;
const Near3: React.FC<{y: number}> = ({y}) => (
  <Row y={y} h={N3H} title="near sizes still in map.ts / the kit (S1 250-330 · S2 260-320 · S6 240-300 · S7 200-260): over the cap" bg={CM.stucco}>
    {(
      [
        [200, 'S7 map min', 'curls'],
        [262, 'S1 kit near2', 'beanie'],
        [300, 'S2 / S6 map', 'hood'],
        [326, 'S1 kit max', 'cap'],
      ] as [number, string, HairKind][]
    ).map(([hv, name, hair], i) => (
      <Item key={hv} x={135 + i * 270} ly={50} name={name} spec={`hv ${hv}`} kind="near">
        <NearBack x={135 + i * 270} y={N3H} hv={hv} seed={`kc/nearbig/${i}`} traits={{hair}} />
      </Item>
    ))}
  </Row>
);

const N4H = 380;
const Bench4: React.FC<{y: number}> = ({y}) => {
  const g = 280;
  const Ts = [9.0, 9.7, 10.6, 13.0];
  const lab = ['9.00 before', '9.70 turned + notebook', '10.60 hood up', '13.00 shut'];
  return (
    <Row y={y} h={N4H} title="S2 bench (film times): the reporter 165 (satchel, notebook) + the staffer >= 180 seated (the hood)" ground={g}>
      {Ts.map((T, i) => {
        const x0 = 12 + i * 268;
        return (
          <g key={T}>
            <rect x={x0} y={g - 52} width={250} height={14} fill={CM.line} />
            <rect x={x0 + 16} y={g - 40} width={10} height={40} fill={CM.anchor} />
            <rect x={x0 + 224} y={g - 40} width={10} height={40} fill={CM.anchor} />
            <TimeShift by={-T}>
              <Item x={x0 + 70} ly={g + 22} name="reporter" spec="165" kind="person">
                <Reporter x={x0 + 70} y={g - 52} h={165} />
              </Item>
              <Item x={x0 + 180} ly={g + 22} name="staffer" spec="180" kind="staffer">
                <Staffer x={x0 + 180} y={g - 52} h={180} />
              </Item>
            </TimeShift>
            <Tx x={x0 + 125} y={g + 88} s={15} a="middle" c={C.head} b>
              {lab[i]}
            </Tx>
          </g>
        );
      })}
    </Row>
  );
};

const BT_SRC: [number, number, number, number] = [0, 1220, 1080, 700];
const BT_H = winH(BT_SRC, 0.5) + 12;
const BottomS1: React.FC<{y: number}> = ({y}) => (
  <>
    <Window y={y + 4} x={0} src={BT_SRC} scale={0.5} label="S1 bottom third AS SHIPPED: K4 S1Seated (near hv 262-326)">
      <At T={2.5} start={0}>
        <SampleS1Kit />
      </At>
    </Window>
    <Window y={y + 4} x={540} src={BT_SRC} scale={0.5} label="the CONTRACT rows: 4 seated rows + near hv 140-154">
      <At T={2.5} start={0}>
        <SampleS1 />
      </At>
    </Window>
  </>
);

const N5H = 400;
const Extras5: React.FC<{y: number}> = ({y}) => {
  const g = 320;
  const ly = g + 22;
  return (
    <Row y={y} h={N5H} title="S5 the stranger (start seated 100 = Fig 150, end 41) · S8 the café owner wiping (k 0 / 0.5 / 1) 170, 300" ground={g}>
      <Item x={90} ly={ly} name="S5 stranger" spec="seated 100" kind="person">
        <Stranger x={90} y={g - 50} h={100} />
      </Item>
      <rect x={30} y={g - 50} width={120} height={10} fill={CM.line} />
      <Item x={230} ly={ly} name="S5 end" spec={`${(100 / DECK.k).toFixed(0)}`} kind="person">
        <Stranger x={230} y={g - 20} h={100 / DECK.k} />
      </Item>
      {[0, 0.5, 1].map((k, i) => (
        <TimeShift key={k} by={-(1 + k * 0.45)}>
          <Item x={400 + i * 150} ly={ly} name={`café owner k ${k}`} spec="170" kind="person">
            <CafeOwner x={400 + i * 150} y={g} h={170} wipeAt={1} />
          </Item>
        </TimeShift>
      ))}
      <Item x={930} ly={ly} name="café owner 300" spec="the kit's max" kind="person">
        <CafeOwner x={930} y={g} h={300} />
      </Item>
    </Row>
  );
};

// ---------------------------------------------------------------- 5. S2 staff windows (the set at its pose, 1:1)

const STAFF_SRC: [number, number, number, number] = [120, 690, 440, 350];
const STAFF_T = [8.9, 9.2, 10.7, 12.5];
const STAFF_L = ['8.90 before "staff": warm panes, her window plum', '9.20 cooler white + a standing back in each', '10.70 "scared": half blinds, the backs step back', '12.50 "contracts": W2 fully down'];
const ST_H = 2 * (winH(STAFF_SRC) + 16) + 56;
const Staff5: React.FC<{y: number}> = ({y}) => (
  <>
    <svg style={{position: 'absolute', left: 0, top: y}} width={SW} height={ST_H}>
      <rect width={SW} height={ST_H} fill={C.strip} />
      <Tx x={20} y={ST_H - 22} s={16} c={C.head} b>
        {`map S2: ${M.S2.staffWindows.map((w) => `${w.id} ${w.w}×${w.h}`).join(' · ')} (>= 90) · hers 140×170`}
      </Tx>
    </svg>
    {STAFF_T.map((T, i) => (
      <Window key={T} y={y + 10 + Math.floor(i / 2) * (winH(STAFF_SRC) + 16)} x={60 + (i % 2) * 520} src={STAFF_SRC} label={STAFF_L[i]}>
        <At T={T} start={S2_T0}>
          <SampleS2Pose />
        </At>
      </Window>
    ))}
  </>
);

// ---------------------------------------------------------------- 6. Pip

type PipCell = {name: string; spec: string; size: number; kind?: Kind; bg: string; perch?: 'bollard' | 'post' | 'box' | 'roof' | 'bench' | 'cap' | 'none'; el: (x: number, y: number) => React.ReactNode};
const PIP_H = 300;
const PIP_SEAT = 172;
const Perch: React.FC<{x: number; y: number; kind: PipCell['perch']}> = ({x, y, kind}) => {
  if (kind === 'none' || !kind) return null;
  if (kind === 'bollard') return <path d={`M${x - 24} ${y + 50}L${x - 18} ${y + 8}Q${x} ${y - 4} ${x + 18} ${y + 8}L${x + 24} ${y + 50}Z`} fill={CM.anchor} stroke={CM.ink} strokeWidth={2.2} />;
  if (kind === 'post') return <rect x={x - 12} y={y} width={24} height={54} fill={CM.anchor} stroke={CM.ink} strokeWidth={2.2} />;
  if (kind === 'box') return <rect x={x - 70} y={y} width={140} height={30} fill={CM.brickDeep} stroke={CM.ink} strokeWidth={2.2} />;
  if (kind === 'roof') return <rect x={x - 85} y={y} width={170} height={22} fill={CM.sage} stroke={CM.ink} strokeWidth={2.2} />;
  if (kind === 'bench') return <rect x={x - 80} y={y} width={160} height={14} fill={CM.line} stroke={CM.ink} strokeWidth={2.2} />;
  return <rect x={x - 30} y={y} width={60} height={46} fill={CM.limestone} stroke={CM.ink} strokeWidth={2.2} />;
};
const PipRow: React.FC<{y: number; title: string; cells: PipCell[]}> = ({y, title, cells}) => (
  <Row y={y} h={PIP_H} title={title} bg={C.strip}>
    {cells.map((c, i) => {
      const x = 90 + i * 180;
      return (
        <g key={i}>
          <rect x={x - 88} y={32} width={176} height={PIP_SEAT + 56 - 32} fill={c.bg} />
          <Perch x={x} y={PIP_SEAT} kind={c.perch} />
          <Item x={x} ly={PIP_SEAT + 76} name={c.name} spec={c.spec} kind={c.kind ?? 'pip'} size={c.size}>
            {c.el(x, PIP_SEAT)}
          </Item>
        </g>
      );
    })}
  </Row>
);
const G = CM.bandGold;
const A = CM.skyHigh;
const S = CM.bandSunset;
const PIP_ROWS: {title: string; cells: PipCell[]}[] = [
  {
    title: 'Pip per shot (1:1, on its perch, in its shot light): S1 · S2 · S3 · S4',
    cells: [
      {name: 'S1 bollard', spec: 'watches her', size: 100, bg: G, perch: 'bollard', el: (x, y) => <Pip x={x} y={y} size={100} facing="back" target={[x - 200, y - 140]} seed="kc/pp1" />},
      {name: 'S1 earsCover', spec: '"life" 4.98', size: 100, bg: G, perch: 'bollard', el: (x, y) => <Pip x={x} y={y} size={100} pose="earsCover" facing="back" seed="kc/pp2" />},
      {name: 'S2 post → wall', spec: '"But" 8.30', size: 96, bg: G, perch: 'post', el: (x, y) => <Pip x={x} y={y} size={96} facing="back" target={[x - 260, y - 270]} seed="kc/pp3" />},
      {name: 'S3 window box', spec: 'turns to her', size: 96, bg: S, perch: 'box', el: (x, y) => <Pip x={x} y={y} size={96} facing="back" look={-0.8} seed="kc/pp4" />},
      {name: 'S4 boat roof', spec: 'ride', size: 100, bg: G, perch: 'roof', el: (x, y) => <Pip x={x} y={y} size={100} pose="ride" facing="back" seed="kc/pp5" />},
      {name: 'S4 turns west', spec: '"heading"', size: 100, bg: G, perch: 'roof', el: (x, y) => <Pip x={x} y={y} size={100} pose="ride" facing="left" seed="kc/pp6" />},
    ],
  },
  {
    title: 'S5 (start 108 → end 44.6 through the deck plane; K7 uses 104 → 43) · S6 corner post + ear flick · S7 board bollard (neutral)',
    cells: [
      {name: 'S5 lookUp', spec: 'start, sun', size: S5_PIP, bg: A, perch: 'bench', el: (x, y) => <Pip x={x} y={y} size={S5_PIP} pose="lookUp" facing="back" target={[x - 160, y - 260]} seed="kc/pp7" />},
      {name: 'S5 end', spec: '108 / 2.42', size: S5_PIP / DECK.k, kind: 'pipEnd', bg: A, perch: 'none', el: (x, y) => <Pip x={x} y={y} size={S5_PIP / DECK.k} facing="back" seed="kc/pp8" />},
      {name: 'S5 end (K7 104)', spec: '104 / 2.42', size: 104 / DECK.k, kind: 'pipEnd', bg: A, perch: 'none', el: (x, y) => <Pip x={x} y={y} size={104 / DECK.k} facing="back" seed="kc/pp9" />},
      {name: 'S6 corner post', spec: 'watches door', size: 98, bg: A, perch: 'cap', el: (x, y) => <Pip x={x} y={y} size={98} facing="back" target={[x + 220, y + 60]} idle={{flick: false}} seed="kc/pp10" />},
      {
        name: 'S6 ear flick',
        spec: '"veto" 26.50',
        size: 98,
        bg: A,
        perch: 'cap',
        el: (x, y) => (
          <TimeShift by={-0.12}>
            <PipTrack x={x} y={y} size={98} facing="back" idle={{flick: false}} seed="kc/pp11" keys={[{t: 0, flick: 'A'}] as PipKey[]} />
          </TimeShift>
        ),
      },
      {name: 'S7 board bollard', spec: 'no reaction', size: 96, bg: S, perch: 'bollard', el: (x, y) => <Pip x={x} y={y} size={96} facing="back" idle={{flick: false}} seed="kc/pp12" />},
    ],
  },
  {
    title: 'S8 ears down ("can\'t") · looks up at W ("not") · the hop and the leap: crouch · tuck · leap · land',
    cells: [
      {name: 'S8 earsDown', spec: '33.78', size: 96, bg: S, perch: 'bollard', el: (x, y) => <Pip x={x} y={y} size={96} pose="earsDown" facing="back" seed="kc/pp13" />},
      {name: 'S8 lookUp W', spec: '37.70', size: 96, bg: S, perch: 'bollard', el: (x, y) => <Pip x={x} y={y} size={96} pose="lookUp" facing="back" target={[x + 160, y - 280]} seed="kc/pp14" />},
      {name: 'crouch', spec: 'take-off', size: 100, bg: C.page, perch: 'cap', el: (x, y) => <Pip x={x} y={y} size={100} pose="crouch" facing="back" seed="kc/pp15" />},
      {name: 'tuck (hop)', spec: 'airborne', size: 100, bg: C.page, perch: 'none', el: (x, y) => <Pip x={x} y={y - 30} size={100} pose="tuck" facing="left" seed="kc/pp16" />},
      {name: 'leap', spec: 'airborne', size: 100, bg: C.page, perch: 'none', el: (x, y) => <Pip x={x} y={y - 30} size={100} pose="leap" facing="left" seed="kc/pp17" />},
      {name: 'land', spec: 'squash', size: 100, bg: C.page, perch: 'cap', el: (x, y) => <Pip x={x} y={y} size={100} pose="land" facing="back" squash={0.12} seed="kc/pp18" />},
    ],
  },
  {
    title: 'motion: alert · mid-hop at the S2 → S3 match (12.98) · S3 leap out left · S4 hop to the sun · S5 leap · S8 hop home',
    cells: [
      {name: 'alert', spec: 'ears up', size: 100, bg: C.page, perch: 'bollard', el: (x, y) => <Pip x={x} y={y} size={100} pose="alert" facing="back" seed="kc/pp25" />},
      {name: 'S2→S3 mid-hop', spec: '12.98 match', size: 96, bg: G, perch: 'none', el: (x, y) => <Pip x={x} y={y - 24} size={96} pose="tuck" facing="left" seed="kc/pp26" />},
      {name: 'S3 leap left', spec: '14.70', size: 96, bg: S, perch: 'none', el: (x, y) => <Pip x={x} y={y - 30} size={96} pose="leap" facing="left" lookUp={0.3} seed="kc/pp27" />},
      {name: 'S4 hop to sun', spec: '20.25', size: 100, bg: G, perch: 'none', el: (x, y) => <Pip x={x} y={y - 30} size={100} pose="leap" facing="left" lookUp={0.5} seed="kc/pp28" />},
      {name: 'S5 leap up-right', spec: '23.90 (end size)', size: S5_PIP / DECK.k, kind: 'pipEnd', bg: A, perch: 'none', el: (x, y) => <Pip x={x} y={y - 30} size={S5_PIP / DECK.k} pose="leap" facing="right" seed="kc/pp29" />},
      {name: 'S8 hop home', spec: '38.82 → f0', size: 96, bg: S, perch: 'none', el: (x, y) => <Pip x={x} y={y - 24} size={96} pose="tuck" facing="right" seed="kc/pp30" />},
    ],
  },
  {
    title: 'states: frame 0 (Pip keeps its colour on the bare-ink page) · draw-on · un-build (no opacity) · the size range 86 / 120',
    cells: [
      {
        name: 'f0: colour on paper',
        spec: 'Look paper',
        size: 100,
        bg: CM.paper,
        perch: 'none',
        el: (x, y) => (
          <Look fills="paper">
            <path d={`M${x - 24} ${y + 50}L${x - 18} ${y + 8}Q${x} ${y - 4} ${x + 18} ${y + 8}L${x + 24} ${y + 50}Z`} fill={CM.paper} stroke={CM.ink} strokeWidth={2.2} />
            <Pip x={x} y={y} size={100} facing="back" seed="kc/pp19" />
          </Look>
        ),
      },
      {name: 'draw-on 0.5', spec: 'pen first', size: 100, kind: 'none', bg: CM.sky, perch: 'bollard', el: (x, y) => <Pip x={x} y={y} size={100} facing="back" draw={0.5} seed="kc/pp20" />},
      {name: 'un-build 0.4', spec: 'fills shrink', size: 100, kind: 'none', bg: CM.sky, perch: 'bollard', el: (x, y) => <Pip x={x} y={y} size={100} facing="back" exit={0.4} seed="kc/pp21" />},
      {name: 'size 86', spec: 'min', size: 86, bg: C.page, perch: 'bollard', el: (x, y) => <Pip x={x} y={y} size={86} facing="back" seed="kc/pp22" />},
      {name: 'size 120', spec: 'max', size: 120, bg: C.page, perch: 'bollard', el: (x, y) => <Pip x={x} y={y} size={120} facing="back" seed="kc/pp23" />},
      {
        name: 'map pipBox 120',
        spec: 'overlay box',
        size: 120,
        kind: 'none',
        bg: C.page,
        perch: 'bollard',
        el: (x, y) => {
          const b = M.pipBox({x, y}, 120);
          return (
            <>
              <Pip x={x} y={y} size={120} facing="back" seed="kc/pp24" />
              <rect x={b.x0} y={b.y0} width={b.x1 - b.x0} height={b.y1 - b.y0} fill="none" stroke={C.map} strokeWidth={2} strokeDasharray="6 4" />
            </>
          );
        },
      },
    ],
  },
];

// ---------------------------------------------------------------- 7. canal (1:1 windows into the assembled sets)

type Win = {src: [number, number, number, number]; label: string; el: React.ReactNode; scale?: number; x?: number};
const CANAL_WINS: Win[] = [
  {src: [0, 0, 1080, 316], label: 'S1 2.50 · the sky above the caption band: the plane branch (y 0-240), the hero cloud (y 120-280)', el: <At T={2.5} start={0}><SampleS1 /></At>},
  {src: [0, 580, 1080, 540], label: 'S1 2.50 · the wing (door, canopy "Google", W plum), the west gap (SUN0, far roofs, bridge), the far towpath: her + G1', el: <At T={2.5} start={0}><SampleS1 /></At>},
  {src: [0, 1100, 1080, 320], label: 'S1 2.50 · the water, two moored boats, ducks, the landing with Pip\'s waterline bollard, the low row', el: <At T={2.5} start={0}><SampleS1 /></At>},
  {src: [0, 980, 1080, 350], label: 'S2 10.00 · newsstand, A-board TOLD THE BBC (K3 stand-in), the bench (reporter, staffer), Pip on the railing post', el: <At T={10.0} start={S2_T0}><SampleS2 /></At>},
  {src: [0, 590, 1080, 520], label: 'S3 12.98 · her terrace: the French window at W2_CUT (lamp, blind up, her 137), neighbours, string lights, Pip', el: <At T={12.98} start={S3_T0}><SampleS3 /></At>},
  {src: [0, 1090, 1080, 560], label: 'S3 12.98 · the water + the moored narrowboat (roof 1260-1330, cabin side 1330-1580: sage, plum gunwale)', el: <At T={12.98} start={S3_T0}><SampleS3 /></At>},
  {src: [0, 590, 1080, 520], label: 'S4 17.00 · gasholders, viaduct + train, SUN1, backs; her towpath: her 170, the post (plates 18.92), the tag (K3 stand-in)', el: <At T={17.0} start={S4_T0}><SampleS4 /></At>},
  {src: [0, 1140, 1080, 560], label: 'S4 17.00 · the narrowboat gliding with us: roof dressing, Pip riding, the cabin side, the wake', el: <At T={17.0} start={S4_T0}><SampleS4 /></At>},
  {src: [0, 590, 1080, 670], label: 'S7 · the wing from its forecourt (WingS7), canopy "Google" x 660-900, SUN2; B (dashed) + Pip at the board bollard', el: <SampleS7 />},
  {src: [0, 590, 1080, 520], label: 'S8 37.00 · her house at the bend (W lit + her silhouette, teal door), the ghosts, lamps, the low sun; her board (K3)', el: <At T={37.0} start={S8_T0}><SampleS8 /></At>},
  {src: [0, 1380, 1080, 540], label: 'S8 37.00 · the café boat\'s stern deck, the paving, the planter and the lamp foot (the bottom third)', el: <At T={37.0} start={S8_T0}><SampleS8 /></At>},
];
const CanalWins: React.FC<{y: number}> = ({y}) => {
  let yy = y;
  return (
    <>
      {CANAL_WINS.map((w, i) => {
        const node = (
          <Window key={i} y={yy} x={w.x ?? 0} src={w.src} scale={w.scale ?? 1} label={w.label}>
            {w.el}
          </Window>
        );
        yy += winH(w.src, w.scale ?? 1) + 10;
        return node;
      })}
    </>
  );
};
const CANAL_H = CANAL_WINS.reduce((s, w) => s + winH(w.src, w.scale ?? 1) + 10, 0);

const LIFE_H = 520;
const Life: React.FC<{y: number}> = ({y}) => (
  <Row y={y} h={LIFE_H} title="the life layer at its sizes: birds 9 / 13 / 16 · pigeons · ducks · heron · smoke · lights · leaves" bg={CM.sky}>
    <rect x={0} y={250} width={SW} height={140} fill={CM.water} />
    <rect x={0} y={390} width={SW} height={130} fill={CM.paving} />
    <line x1={20} y1={150} x2={640} y2={150} stroke={CM.anchor} strokeWidth={3} />
    <Birds from={[30, 150]} to={[200, 150]} n={5} size={9} seed="kc/b9" ceil={30} />
    <Birds from={[230, 150]} to={[420, 150]} n={5} size={13} seed="kc/b13" ceil={30} />
    <TimeShift by={-0.45}>
      <Birds from={[450, 150]} to={[640, 150]} n={5} size={16} seed="kc/b16" liftAt={[0]} ceil={40} />
    </TimeShift>
    <rect x={660} y={176} width={260} height={10} fill={CM.limestone} stroke={CM.ink} strokeWidth={1.6} />
    <Pigeons ledge={[670, 910, 176]} n={4} size={17} seed="kc/pig" ceil={40} />
    <Cloud x={760} y={50} w={300} h={80} seed="kc/cloud" speed={0} top={CM.paper} />
    <Ducks ducks={[{x: 70, y: 320, size: 22}, {x: 150, y: 330, size: 26, drake: true}, {x: 260, y: 340, size: 34}]} seed="kc/ducks" />
    <Heron x={420} y={370} h={92} face={-1} seed="kc/heron1" />
    <Heron x={560} y={380} h={130} face={1} seed="kc/heron2" />
    <FloatingLeaves y0={280} y1={370} x0={640} x1={1070} n={9} size={14} seed="kc/fl" />
    <Puffs x={90} y={480} seed="kc/smoke" kind="smoke" scale={1.2} ceil={260} />
    <Puffs x={230} y={490} seed="kc/steam" kind="steam" scale={0.9} ceil={300} />
    <StringLights from={[330, 420]} to={[640, 420]} sag={26} n={12} seed="kc/sl1" r={6} />
    <StringLights from={[680, 420]} to={[1060, 420]} sag={26} n={14} seed="kc/sl2" r={6} on />
    <FallingLeaves box={[320, 430, 1070, 515]} n={8} size={16} seed="kc/fall" />
    {(
      [
        [115, 140, 'birds 9'],
        [325, 140, 'birds 13'],
        [545, 110, 'birds 16 lifting'],
        [790, 166, 'pigeons 17'],
        [910, 44, 'cloud'],
        [150, 270, 'ducks 22 / 26 / 34'],
        [490, 270, 'heron 92 / 130'],
        [860, 270, 'floating leaves'],
        [160, 410, 'smoke · steam'],
        [485, 470, 'string lights off'],
        [870, 470, 'string lights on'],
      ] as [number, number, string][]
    ).map(([x, yy, l]) => (
      <Tx key={l} x={x} y={yy} s={15} a="middle" b c={C.head}>
        {l}
      </Tx>
    ))}
  </Row>
);

const WIPER_SRC: [number, number, number, number] = [0, 0, 1080, 1920];
const WIPER_H = winH(WIPER_SRC, 0.25) + 20;
const Wiper: React.FC<{y: number}> = ({y}) => (
  <>
    <svg style={{position: 'absolute', left: 0, top: y}} width={SW} height={WIPER_H}>
      <rect width={SW} height={WIPER_H} fill={C.strip} />
      <Tx x={300} y={70} s={18} b c={C.head}>
        S7 → S8 foreground wipe: BoatWiper (K6), a narrowboat
      </Tx>
      <Tx x={300} y={96} s={16} c={C.mute}>
        travelling west, opaque over x ± its half-width, full height.
      </Tx>
      <Tx x={300} y={122} s={16} c={C.mute}>
        Shown at 0.25 (270 × 480), p 0.45, dir left. Pip rides it into S8
      </Tx>
      <Tx x={300} y={148} s={16} c={C.mute}>
        (L6's ask: Pip on the wiper roof until 33.00).
      </Tx>
    </svg>
    <Window y={y + 6} x={10} src={WIPER_SRC} scale={0.25} label="BoatWiper 0.25">
      <AbsoluteFill style={{background: CM.sky}}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <BoatWiper x={560} p={0.45} dir="left" />
        </svg>
      </AbsoluteFill>
    </Window>
  </>
);

// ---------------------------------------------------------------- 8. Arlington (K7)

const HALF: [number, number, number, number] = [0, 0, 1080, 1920];
const DC_PAIRS: {a: Win; b: Win}[] = [
  {
    a: {src: HALF, scale: 0.5, label: 'S5 20.90 start: blossom slot, SUN1 calendar, bench, news box', el: <At T={20.9} start={20.55}><SampleS5 /></At>},
    b: {src: HALF, scale: 0.5, label: 'S5 23.75 end: the Pentagon, the obelisk, the bank', el: <At T={23.75} start={20.55}><SampleS5 /></At>},
  },
  {
    a: {src: HALF, scale: 0.5, label: 'S5 22.12 the crane at peak: the lamppost wipe', el: <At T={22.12} start={20.55}><SampleS5 /></At>},
    b: {src: HALF, scale: 0.5, label: 'S6 24.20 the gate: deal board (K3), Pip on the post', el: <At T={24.2} start={S6_T0}><SampleS6 /></At>},
  },
];
const DC_PAIR_H = winH(HALF, 0.5) + 10;
const DcPairs: React.FC<{y: number}> = ({y}) => (
  <>
    {DC_PAIRS.map((p, i) => (
      <React.Fragment key={i}>
        <Window y={y + i * DC_PAIR_H} x={0} src={p.a.src} scale={0.5} label={p.a.label}>
          {p.a.el}
        </Window>
        <Window y={y + i * DC_PAIR_H} x={540} src={p.b.src} scale={0.5} label={p.b.label}>
          {p.b.el}
        </Window>
      </React.Fragment>
    ))}
  </>
);
const DC_WINS: Win[] = [
  {src: [0, 860, 1080, 400], label: 'S5 20.90 1:1 · the bench: the stranger reading (Fig 150), Pip 108 looking up, the news box (K3 stand-in)', el: <At T={20.9} start={20.55}><SampleS5 /></At>},
  {src: [0, 820, 1080, 480], label: 'S5 23.75 1:1 · the Pentagon (true plan), parkway, the balustrade: the tiny stranger + Pip 44.6, the plaque (K3)', el: <At T={23.75} start={20.55}><SampleS5 /></At>},
  {src: [0, 600, 1080, 400], label: 'S6 24.20 1:1 · the facade band, the service door + plate, the corner post with Pip 98, the deal board (K3)', el: <At T={24.2} start={S6_T0}><SampleS6 /></At>},
  {src: [0, 1500, 1080, 420], label: 'S6 24.20 1:1 · the near plane: readers\' head-backs (contract hv 144-152), kerb, tulips', el: <At T={24.2} start={S6_T0}><SampleS6 /></At>},
];
const DcWins: React.FC<{y: number}> = ({y}) => {
  let yy = y;
  return (
    <>
      {DC_WINS.map((w, i) => {
        const node = (
          <Window key={i} y={yy} src={w.src} label={w.label}>
            {w.el}
          </Window>
        );
        yy += winH(w.src) + 10;
        return node;
      })}
    </>
  );
};
const DC_WINS_H = DC_WINS.reduce((s, w) => s + winH(w.src) + 10, 0);

// ---------------------------------------------------------------- 9. the four assembled sample frames

const SAMPLE_H = 2 * (winH(HALF, 0.5) + 10) + 60;
const Samples: React.FC<{y: number}> = ({y}) => (
  <>
    <svg style={{position: 'absolute', left: 0, top: y}} width={SW} height={SAMPLE_H}>
      <rect width={SW} height={SAMPLE_H} fill={C.strip} />
      <Tx x={18} y={SAMPLE_H - 30} s={16} c={C.head} b>
        Dashed magenta = map.ts shotShapes at that time (key reads, texts, her, ghosts, Pip, suns); dotted red = the caption band.
      </Tx>
      <Tx x={18} y={SAMPLE_H - 10} s={16} c={C.mute}>
        The clean frames: KitContractFrame-V2S1 / -V2S2 / -V2S4 / -V2S8 (film seconds), the 216 px montage beside v1 and reference 1.
      </Tx>
    </svg>
    {SAMPLE_T.map((s, i) => (
      <Window key={s.id} y={y + Math.floor(i / 2) * (winH(HALF, 0.5) + 10)} x={(i % 2) * 540} src={HALF} scale={0.5} label={`${s.id} ${s.T.toFixed(2)} · assembled (people, Pip, life, K3 stand-ins) + captions`} overlay={<MapOverlay id={s.id} T={s.T} />}>
        <ContractFrame id={s.id} at={s.T} />
      </Window>
    ))}
  </>
);

// ---------------------------------------------------------------- 7. clearances: the map's seats vs the kit's real drawings

type ClashCell = {name: string; shot: string; src: [number, number, number, number]; need?: number; bg: string; a: React.ReactNode; b: React.ReactNode; ctx?: React.ReactNode};
const CL_W = 262;
const CL_IMG = 236;
const CL_H = CL_IMG + 96;
/** Two pieces at their map positions (frame px), each measured (live SVG bbox): their overlap or gap against `need`
 *  (0 = must not overlap; S6 = 200 px from the clause). The picture is the region `src`, fitted into the cell. */
const Clash: React.FC<{x: number; cell: ClashCell; id: string}> = ({x, cell, id}) => {
  const ra = useRef<SVGGElement>(null);
  const rb = useRef<SVGGElement>(null);
  const [res, setRes] = useState<{A: Box; B: Box; ix: number; iy: number; gap: number} | null>(null);
  const [handle] = useState(() => delayRender(`kit contract: clearance ${cell.name}`));
  useLayoutEffect(() => {
    if (res || !ra.current || !rb.current) return;
    const a = ra.current.getBBox();
    const b = rb.current.getBBox();
    const A = {x: a.x, y: a.y, w: a.width, h: a.height};
    const B = {x: b.x, y: b.y, w: b.width, h: b.height};
    const ix = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x);
    const iy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
    const dx = Math.max(0, B.x - (A.x + A.w), A.x - (B.x + B.w));
    const dy = Math.max(0, B.y - (A.y + A.h), A.y - (B.y + B.h));
    setRes({A, B, ix, iy, gap: ix > 0 && iy > 0 ? 0 : Math.hypot(dx, dy)});
  }, [res]);
  useEffect(() => {
    if (res) continueRender(handle);
  }, [res, handle]);
  const [sx, sy, sw, sh] = cell.src;
  const k = Math.min(CL_W / sw, CL_IMG / sh);
  const need = cell.need ?? 0;
  let v: {txt: string; c: string} | null = null;
  if (res) {
    const over = res.ix > 0 && res.iy > 0;
    if (over) v = {txt: `OVERLAP ${Math.round(res.ix)}×${Math.round(res.iy)} px FAIL`, c: C.fail};
    else if (res.gap < need) v = {txt: `gap ${Math.round(res.gap)} < ${need} FAIL`, c: C.fail};
    else v = {txt: `gap ${Math.round(res.gap)} px${need ? ` >= ${need}` : ''} OK`, c: C.ok};
  }
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={x} y={34} width={sw * k} height={sh * k} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={34} width={sw * k} height={sh * k} fill={cell.bg} />
        <XG m={mat.compose(mat.translate(x, 34), mat.scale(k), mat.translate(-sx, -sy))}>
          {cell.ctx}
          <g ref={rb}>{cell.b}</g>
          <g ref={ra}>{cell.a}</g>
          {res ? (
            <>
              <rect x={res.B.x} y={res.B.y} width={res.B.w} height={res.B.h} fill="none" stroke={C.rule} strokeWidth={2 / k} strokeDasharray={`${8 / k} ${5 / k}`} />
              <rect x={res.A.x} y={res.A.y} width={res.A.w} height={res.A.h} fill="none" stroke={C.map} strokeWidth={2 / k} strokeDasharray={`${8 / k} ${5 / k}`} />
            </>
          ) : null}
        </XG>
      </g>
      <rect x={x} y={34} width={sw * k} height={sh * k} fill="none" stroke={CM.ink} strokeWidth={1.5} />
      <Tx x={x + 4} y={34 + CL_IMG + 20} s={15} b>
        {cell.name}
      </Tx>
      <Tx x={x + 4} y={34 + CL_IMG + 38} s={13} c={C.mute}>
        {cell.shot}
      </Tx>
      {v ? (
        <Tx x={x + 4} y={34 + CL_IMG + 57} s={14} c={v.c} b>
          {v.txt}
        </Tx>
      ) : null}
    </g>
  );
};
/** L5's planned A-board frame round a face rect (stiles ~30 px, rails ~18 px). */
const frameRect = (r: M.Rect, stile = 30, rail = 18) => <rect x={r.x0 - stile} y={r.y0 - rail} width={r.x1 - r.x0 + stile * 2} height={r.y1 - r.y0 + rail * 2} fill={CM.anchor} />;
const S6_CLAUSE: M.Rect = {x0: M.S6.board0.x0 + 20, y0: M.S6.clauseTopMinY, x1: M.S6.board0.x1 - 20, y1: M.S6.board0.y1 - 70};
const CLASH_ROWS: ClashCell[][] = [
  [
    {
      name: 'S2 Pip vs the reporter',
      shot: 'seat (590,1050) 96 · reporter 165',
      src: [440, 880, 380, 360],
      bg: CM.bandGold,
      ctx: (
        <>
          <Staffer x={M.S2.staffer.x} y={S2_BENCH_SEAT} h={M.S2.staffer.h} turnAt={-1} hoodAt={99} />
          <rect x={M.S2.bench.x0} y={S2_BENCH_SEAT} width={M.S2.bench.x1 - M.S2.bench.x0} height={14} fill={CM.line} />
        </>
      ),
      b: <Reporter x={M.S2.reporter.x} y={S2_BENCH_SEAT} h={M.S2.reporter.h} openAt={-1} shutAt={99} />,
      a: <Pip x={M.S2.pipSeat.x} y={M.S2.pipSeat.y} size={96} facing="back" target={[M.W2.x, M.W2.y]} seed="kc/cl1" />,
    },
    {
      name: 'S2 Pip vs the A-board',
      shot: 'seat 96 · A-board face y 1050',
      src: [400, 900, 300, 260],
      bg: CM.bandGold,
      b: <rect x={M.S2.aBoard.x0 - 16} y={M.S2.aBoard.y0 - 12} width={M.S2.aBoard.x1 - M.S2.aBoard.x0 + 32} height={M.S2.aBoard.y1 - M.S2.aBoard.y0 + 24} fill={CM.anchor} />,
      a: <Pip x={M.S2.pipSeat.x} y={M.S2.pipSeat.y} size={96} facing="back" target={[M.W2.x, M.W2.y]} seed="kc/cl2" />,
    },
    {
      name: 'S3 Pip vs her window',
      shot: 'seat (462,878) 96 · W2_CUT',
      src: [240, 680, 330, 250],
      bg: CM.bandSunset,
      b: <rect x={M.W2_CUT.x - M.W2_CUT.w / 2} y={M.W2_CUT.y - M.W2_CUT.h / 2} width={M.W2_CUT.w} height={M.W2_CUT.h} fill={CM.lamp} stroke={CM.hero} strokeWidth={5} />,
      a: <Pip x={M.S3.pipSeat.x} y={M.S3.pipSeat.y} size={96} facing="back" look={-0.6} seed="kc/cl3" />,
    },
    {
      name: 'S4 Pip vs her',
      shot: 'seat (470,1218) 100 · her 170',
      src: [380, 860, 420, 400],
      bg: CM.bandGold,
      b: <Her x={M.S4.her.x} y={M.S4.her.feetY} h={M.S4.her.h} view="profile" step={0.3} stride={strideFor(34, 170)} />,
      a: <Pip x={M.S4.pipSeat.x} y={M.S4.pipSeat.y} size={100} pose="ride" facing="back" seed="kc/cl4" />,
    },
  ],
  [
    {
      name: 'S5 Pip vs the news box',
      shot: 'seat (415,1120) 108 · box x 470',
      src: [320, 880, 400, 360],
      bg: CM.skyHigh,
      b: <rect x={M.S5.start.newsBox.x0} y={M.S5.start.newsBox.y0} width={M.S5.start.newsBox.x1 - M.S5.start.newsBox.x0} height={M.S5.start.newsBox.y1 - M.S5.start.newsBox.y0 - 56} fill={CM.coatSlate} />,
      a: <Pip x={M.S5.start.pipSeat.x} y={M.S5.start.pipSeat.y} size={S5_PIP} facing="back" seed="kc/cl5" />,
    },
    {
      name: 'S6 Pip vs the F11 clause',
      shot: 'post (770,720) 98 · clause y 920',
      src: [100, 600, 760, 640],
      need: M.LEGIBILITY.pipClauseClearPx,
      bg: CM.skyHigh,
      b: <rect x={S6_CLAUSE.x0} y={S6_CLAUSE.y0} width={S6_CLAUSE.x1 - S6_CLAUSE.x0} height={S6_CLAUSE.y1 - S6_CLAUSE.y0} fill={CM.stucco} />,
      a: <Pip x={M.S6.pipSeat0.x} y={M.S6.pipSeat0.y} size={98} facing="back" target={[960, 790]} seed="kc/cl6" />,
    },
    {
      name: 'S7 / S8 Pip vs the board',
      shot: 'bollard (700,1205) 96 · B + 30',
      src: [560, 1020, 260, 250],
      bg: CM.bandSunset,
      ctx: <Bollard x={M.BOARD_BOLLARD.x} y={M.BOARD_BOLLARD.y + 44} h={44} seed="kc/cl7b" />,
      b: frameRect(M.B),
      a: <Pip x={M.BOARD_BOLLARD.x} y={M.BOARD_BOLLARD.y} size={96} facing="back" seed="kc/cl7" />,
    },
    {
      name: 'S8 ghosts vs the board',
      shot: 'S8.ghosts x 658-734 · B + 30',
      src: [560, 880, 260, 240],
      bg: CM.bandSunset,
      b: frameRect(M.B),
      a: <S8Ghosts at={-10} />,
    },
  ],
];
const CLASH_ROW_H = CL_H + 8;
const ClashRows: React.FC<{y: number}> = ({y}) => (
  <>
    {CLASH_ROWS.map((row, r) => (
      <Row key={r} y={y + r * CLASH_ROW_H} h={CLASH_ROW_H} title={r === 0 ? 'clearances 1: magenta = A (Pip, ghosts), red = B; both measured live' : 'clearances 2: (S6: >= 200 px from every clause line, TREATMENT section 3)'} bg={C.strip}>
        {row.map((c, i) => (
          <Clash key={c.name} x={6 + i * 268} cell={c} id={`kcClash${r}${i}`} />
        ))}
      </Row>
    ))}
  </>
);

// ---------------------------------------------------------------- the layout

const SECTIONS: Sec[] = [
  {h: HEAD_H, C: Header},
  secHead('1', 'HER', 'K4 Her / HerWindow at every size: S1 153 + 170, S4 170 profile, S8 150 back, S3 silhouette 137 → 130'),
  {h: H1, C: Her1},
  {h: H2, C: Her2},
  {h: H3, C: Her3},
  secHead('2', 'THE GHOSTS', 'K4 Ghost / BareOutline / GhostRow / S8Ghosts at the map sizes (S1 170 → 135, outlines 130 → 120; S8 140 / 135 / 130)'),
  {h: G1H, C: Ghost1},
  {h: G2H, C: Ghost2},
  {h: G3H, C: Ghost3},
  {h: G4H, C: Ghost4},
  secHead('3', 'THE PUBLIC', 'K4 Person / WindowPerson / FarCrowd at the shot sizes; never teal, one accessory each'),
  {h: P1H, C: Pub1},
  {h: P2H, C: Pub2},
  {h: P3H, C: Pub3},
  {h: P4H, C: Pub4},
  secHead('4', 'SEATED + NEAR', 'K4 Seated / NearBack / Staffer / Reporter / Stranger / CafeOwner (owner rule: near head-backs <= ~140 px wide)'),
  {h: N1H, C: Seat1},
  {h: N2H, C: Near2},
  {h: N3H, C: Near3},
  {h: BT_H, C: BottomS1},
  {h: N4H, C: Bench4},
  {h: N5H, C: Extras5},
  secHead('5', 'S2 STAFF WINDOWS', 'K6 WingS2 at its pose (zoom 1.00) + K4 StaffWindow (silhouette, step back, Blind) through storyOverlay, 1:1'),
  {h: ST_H, C: Staff5},
  secHead('6', 'PIP', 'K5 towpath Pip: every pose of the shot list at its size and perch; drawn bbox includes the ears (span) and the tail'),
  ...PIP_ROWS.map((r) => ({h: PIP_H, C: ({y}: {y: number}) => <PipRow y={y} title={r.title} cells={r.cells} />})),
  secHead('7', 'CLEARANCES', 'map.ts seats and rects vs the kit\'s real drawings (live bbox): no overlap, S6 >= 200 px from the clause'),
  {h: 2 * CLASH_ROW_H, C: ClashRows},
  secHead('8', 'CANAL · 1:1', 'K6 sets at the map poses with K4 + K5 plugged in (the sample assemblies), windows at true size'),
  {h: CANAL_H, C: CanalWins},
  {h: LIFE_H, C: Life},
  {h: WIPER_H, C: Wiper},
  secHead('9', 'ARLINGTON (K7)', 'CraneSet (S5: start, peak, end) and GateSet (S6) with K4 + K5 + K3 stand-ins; 0.5 frames, then 1:1 windows'),
  {h: 2 * DC_PAIR_H, C: DcPairs},
  {h: DC_WINS_H, C: DcWins},
  secHead('10', 'THE FOUR ASSEMBLED SAMPLE FRAMES', 'V2S1 2.50 · V2S2 10.00 · V2S4 17.00 · V2S8 37.00, at 0.5, under the film\'s captions'),
  {h: SAMPLE_H, C: Samples},
];
const SHEET_H = SECTIONS.reduce((s, x) => s + x.h, 0);

const KitContract: React.FC = () => {
  useCaptionFont();
  let y = 0;
  return (
    <AbsoluteFill style={{background: C.page}}>
      {SECTIONS.map((s, i) => {
        const node = <s.C key={i} y={y} />;
        y += s.h;
        return node;
      })}
    </AbsoluteFill>
  );
};

// =====================================================================================================================
// 4. Compositions
// =====================================================================================================================

const FILM_F = M.DURATION_F;
const FRAME_COMPS: Record<string, React.FC> = {
  V2S1: () => <ContractFrame id="V2S1" />,
  V2S2: () => <ContractFrame id="V2S2" />,
  V2S4: () => <ContractFrame id="V2S4" />,
  V2S8: () => <ContractFrame id="V2S8" />,
};
const BARE_COMPS: Record<string, React.FC> = {
  V2S1: () => <ContractFrame id="V2S1" bare />,
  V2S2: () => <ContractFrame id="V2S2" bare />,
  V2S4: () => <ContractFrame id="V2S4" bare />,
  V2S8: () => <ContractFrame id="V2S8" bare />,
};
const ContractRoot: React.FC = () => (
  <>
    <Composition id="KitContract" component={KitContract} fps={FPS} width={SW} height={SHEET_H} durationInFrames={1} />
    {SAMPLE_T.map((s) => (
      <React.Fragment key={s.id}>
        <Composition id={`KitContractFrame-${s.id}`} component={FRAME_COMPS[s.id]} fps={FPS} width={1080} height={1920} durationInFrames={FILM_F} />
        <Composition id={`KitContractBare-${s.id}`} component={BARE_COMPS[s.id]} fps={FPS} width={1080} height={1920} durationInFrames={FILM_F} />
      </React.Fragment>
    ))}
    <Composition id="KitContractS5" component={SampleS5} fps={FPS} width={1080} height={1920} durationInFrames={M.frameOf(24.0 - 20.55)} />
    <Composition id="KitContractS6" component={SampleS6} fps={FPS} width={1080} height={1920} durationInFrames={M.frameOf(28.06 - 24.0)} />
  </>
);

registerRoot(ContractRoot);
export {SHEET_H, SECTIONS, SAMPLE_T};
