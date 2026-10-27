// P5 helper (lane L3-people): P5's set, a LOCAL copy of kit Nook.tsx NookDeskClose (same home, same pieces, same seeds:
// the window right onto the living dusk town, the high shelf, the hanging plant, the corkboard, the print, the lamp and
// its golden pool, the motes, the paper, the pen, the notebook, the sticky notes, the books) with the art director's P5
// fixes the kit API can't take yet (fold back into NookDeskClose: REQUESTS line in the lane report):
//   - the MUG moves off the lamp's line to the front right of the pool (it stood under the lamp, its two thick navy steam
//     strokes ran up into the lamp's base and the lamp cable crossed its handle: a straw and a cord). Its steam now
//     starts above the rim in thin wisps (4.5 px) in a warm mid-tone, clear of the lamp; the lamp's cable runs from its
//     base to the right, nowhere near the mug.
//   - the NEAR DESK is dressed with things that overlap and share contact shadows (it was the flattest panel, a wide
//     terracotta field with a few things floating apart): a printout of the network diagram (it echoes the screen)
//     tucked under the notebook's corner, a pencil cup, a mug ring, the desk's front lip and a drawer along the bottom.
//   - her PHONE lies face up (a warm screen; a notification lights it once): the kit's navy slab read as a black box.
// Everything new stays below the laptop, so the AI screen stays the brightest, busiest point.
import React from 'react';
import {blob, ellipse, hline, line, poly, polyPath, roundRect, smooth, textLines, vline} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {
  BookPile,
  CC,
  Corkboard,
  DuskTown,
  DustMotes,
  FramedPicture,
  HighShelf,
  Live,
  PotPlant,
  Steam,
  Sway,
  TableLamp,
  b,
  Fill,
  fillAt,
  Ink,
  W,
  type At,
  type DuskTownProps,
  type Pt,
} from '../kit';

/** The mug (top-left x, top y, width): front right of the pool, right of her cat, clear of the lamp. */
export const P5_MUG = {x: 878, top: 1302, w: 66};

/** A mug with thin warm steam (kit NookMug's body; the steam starts above the rim). */
const P5Mug: React.FC<{x: number; top: number; w: number; at?: At}> = ({x, top, w, at}) => {
  const x1 = x + w;
  const hgt = w * 1.06;
  const bot = top + hgt;
  const r = w * 0.18;
  const body = `M${x} ${top}L${x} ${bot - r}Q${x} ${bot} ${x + r} ${bot}L${x1 - r} ${bot}Q${x1} ${bot} ${x1} ${bot - r}L${x1} ${top}Z`;
  const handle = `M${x1 - 1} ${top + w * 0.2}C${x1 + w * 0.42} ${top + w * 0.18} ${x1 + w * 0.42} ${top + w * 0.78} ${x1 - 1} ${top + w * 0.74}`;
  return (
    <>
      <Fill d={blob(x + w / 2 + 8, bot + 2, w * 0.62, 9, {seed: 'p5mugsh'})} color={CC.deskShade} offset={false} at={fillAt(at)} />
      <Ink d={handle} width={Math.max(4, w * 0.15)} color={CC.ink} taper={false} at={at} />
      <Ink d={handle} width={Math.max(2, w * 0.08)} color={CC.mug} taper={false} at={at} />
      <Fill d={body} color={CC.mug} seed="p5mug/b" at={fillAt(at)} />
      <Fill rect={[x, top + hgt * 0.38, w, hgt * 0.17]} color={CC.mugBand} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={body} width={W.far} at={at} />
      <Fill d={blob(x + w / 2, top, w / 2, Math.max(4, w * 0.12), {seed: 'p5mug/rim'})} color={CC.under} offset={false} at={fillAt(at, 0.03)} />
      <Steam x={x + w / 2} y={top - 14} h={86} amp={8} n={2} width={4.5} color={CC.deskFront} seed="p5mug/st" at={at} />
    </>
  );
};

/** Her phone face up (top-left x, y; 100 x 180): a warm screen; a notification lights it in [on0, on1). */
const P5Phone: React.FC<{x: number; y: number; on: [number, number]; at?: At}> = ({x, y, on, at}) => {
  const t = useTime();
  const lit = t >= on[0] && t < on[1];
  return (
    <>
      <Fill d={roundRect(x + 8, y + 10, 100, 180, 18)} color={CC.deskShade} offset={false} at={fillAt(at)} />
      <Fill d={roundRect(x, y, 100, 180, 18)} color={CC.anchor} seed="p5phoneB" at={fillAt(at)} />
      <Ink d={roundRect(x, y, 100, 180, 18, {seed: 'p5phoneI'})} width={W.mid} at={at} />
      <Live at={at} c={[x + 50, y + 90]}>
        <rect x={x + 9} y={y + 14} width={82} height={152} rx={9} fill={lit ? CC.core : CC.paperEdge} />
        {lit ? (
          <>
            <rect x={x + 16} y={y + 40} width={68} height={36} rx={6} fill={CC.paper} />
            <rect x={x + 22} y={y + 49} width={40} height={6} fill={CC.ink} />
            <rect x={x + 22} y={y + 62} width={28} height={6} fill={CC.ink} />
            <circle cx={x + 74} cy={y + 54} r={5} fill={CC.rug} />
          </>
        ) : (
          <rect x={x + 34} y={y + 146} width={32} height={5} rx={2} fill={CC.wallShade} />
        )}
      </Live>
    </>
  );
};

/** A printout of the network diagram (the screen's echo), lying on the desk (a quad), its nodes and links in ink. */
const NetPrint: React.FC<{q: [Pt, Pt, Pt, Pt]; at?: At}> = ({q, at}) => {
  const P = (u: number, v: number): Pt => {
    const top: Pt = [q[0][0] + (q[1][0] - q[0][0]) * u, q[0][1] + (q[1][1] - q[0][1]) * u];
    const bot: Pt = [q[3][0] + (q[2][0] - q[3][0]) * u, q[3][1] + (q[2][1] - q[3][1]) * u];
    return [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v];
  };
  const hub = P(0.5, 0.42);
  const ring: Pt[] = [[0.22, 0.2], [0.5, 0.12], [0.78, 0.22], [0.8, 0.62], [0.5, 0.72], [0.2, 0.6]].map(([u, v]) => P(u, v));
  let links = '';
  ring.forEach((p, i) => {
    const n = ring[(i + 1) % ring.length];
    links += line(hub[0], hub[1], p[0], p[1], {over: [0, 0], seed: `p5np/s${i}`}) + line(p[0], p[1], n[0], n[1], {over: [0, 0], seed: `p5np/r${i}`});
  });
  const shadow = q.map(([x, y]): Pt => [x + 6, y + 8]);
  return (
    <>
      <Fill d={polyPath(shadow)} color={CC.deskShade} offset={false} at={fillAt(at)} />
      <Fill d={polyPath(q)} color={CC.paper} seed="p5np" at={fillAt(at)} />
      <Ink d={poly(q, {closed: true, seed: 'p5npI', over: 'small'})} width={W.far} at={at} />
      <Ink d={links} width={W.hair + 0.4} at={b(at, 0.06)} />
      {ring.map(([x, y], i) => (
        <Fill key={i} d={blob(x, y, 9, 8, {seed: `p5np/n${i}`})} color={i % 2 ? CC.ring : CC.mugBand} offset={false} at={fillAt(at, 0.04)} />
      ))}
      <Fill d={blob(hub[0], hub[1], 17, 15, {seed: 'p5np/hub'})} color={CC.mugBand} offset={false} at={fillAt(at, 0.04)} />
      <Ink d={ring.map(([x, y], i) => ellipse(x, y, 9, 8, {seed: `p5np/nI${i}`})).join('') + ellipse(hub[0], hub[1], 17, 15, {seed: 'p5np/hubI'})} width={W.hair + 0.4} at={b(at, 0.08)} />
      <Ink d={textLines(q[3][0] + 18, q[3][1] - 34, 120, {n: 2, gap: 14, seed: 'p5np/t', heading: false})} width={W.hair} at={b(at, 0.1)} />
    </>
  );
};

/** A pencil cup (bottom centre x, y) with pencils and a ruler. */
const PencilCup: React.FC<{x: number; y: number; at?: At}> = ({x, y, at}) => {
  const w = 62;
  const h = 84;
  const sticks: [number, number, string][] = [[-16, -150, CC.pictures[0]], [-2, -164, CC.anchor], [12, -140, CC.pictures[3]], [20, -128, CC.pictures[1]]];
  return (
    <>
      <Fill d={blob(x + 10, y + 2, w * 0.6, 8, {seed: 'p5cupsh'})} color={CC.deskShade} offset={false} at={fillAt(at)} />
      {sticks.map(([dx, top, c], i) => (
        <Ink key={i} d={line(x + dx * 0.6, y - h + 10, x + dx, y + top, {over: [0, 0], seed: `p5cup/s${i}`})} width={9} color={c} taper={false} at={at} />
      ))}
      <Fill d={roundRect(x - w / 2, y - h, w, h, 8)} color={CC.rug} seed="p5cup" at={fillAt(at)} />
      <Fill rect={[x - w / 2, y - h * 0.62, w, h * 0.16]} color={CC.rugBand} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={roundRect(x - w / 2, y - h, w, h, 8, {seed: 'p5cupI'}) + ellipse(x, y - h, w / 2, 7, {seed: 'p5cupR'})} width={W.far} at={at} />
    </>
  );
};

export const P5Set: React.FC<{town?: Partial<DuskTownProps>; slab?: boolean; at?: At; phoneOn?: [number, number]; children?: React.ReactNode}> = ({town, slab = true, at, phoneOn = [0.55, 1.1], children}) => (
  <>
    {slab ? <Fill rect={[-200, -200, 1480, 2320]} color={CC.wall} offset={false} mode="snap" at={at} /> : null}
    {/* the window right, cut by the right edge; the blind down to 640 (the caption band stays wall) */}
    <Fill rect={[684, 560, 500, 400]} color={CC.wallShade} offset={false} at={fillAt(at)} />
    <Fill rect={[700, 600, 480, 344]} color={CC.trim} offset={false} at={fillAt(at)} />
    <DuskTown x={712} y={612} w={460} h={320} horizon={800} k={1.25} moon={[1010, 690]} stars={4} clouds={2} seed="p5town" {...town} at={at} />
    <Fill rect={[706, 604, 480, 52]} color={CC.blind} offset={false} at={fillAt(at, 0.02)} />
    <Fill rect={[704, 650, 480, 10]} color={CC.trim} offset={false} at={fillAt(at, 0.03)} />
    <Fill rect={[936, 660, 14, 272]} color={CC.trim} offset={false} at={fillAt(at, 0.02)} />
    <Ink d={vline(684, 560, 944, {over: [0, 0], seed: 'p5r'}) + vline(712, 612, 932, {over: [0, 0], seed: 'p5g'}) + vline(936, 660, 932, {over: [0, 0], seed: 'p5m1'}) + vline(950, 660, 932, {over: [0, 0], seed: 'p5m2'}) + hline(704, 1184, 660, {over: [0, 0], seed: 'p5b'})} width={W.mid} at={at} />
    <Fill rect={[672, 932, 520, 14]} color={CC.sill} offset={false} at={fillAt(at)} />
    <Fill rect={[672, 946, 520, 14]} color={CC.wallShade} offset={false} at={fillAt(at)} />
    <Ink d={hline(672, 1190, 932, {over: [4, 0], seed: 'p5s1'}) + hline(672, 1190, 960, {over: [0, 0], seed: 'p5s2'})} width={W.mid} at={at} />
    <PotPlant x={1000} y={892} w={50} h={40} kind="succulent" seed="p5sill" at={at} />
    {/* the top edge: the home's high shelf (above the caption band), a trailing plant hanging right */}
    <HighShelf x0={-40} x1={660} y={250} seed="p5hs" at={at} />
    <Sway x={880} y={-20} amp={1.6} hz={0.17} seed="p5hang">
      <Ink d={line(880, -20, 864, 200, {over: [0, 0], seed: 'p5h1'}) + line(880, -20, 896, 200, {over: [0, 0], seed: 'p5h2'})} width={W.hair} at={at} />
      <PotPlant x={854} y={200} w={54} h={36} kind="trailing" seed="p5hangpot" at={at} />
    </Sway>
    {/* the wall left and centre: corkboard (behind her head), a print over the laptop */}
    <Corkboard x={34} y={640} w={300} h={230} seed="p5cork" at={at} />
    <FramedPicture x={432} y={622} w={150} h={116} kind="shapes" seed="p5pic" at={at} />
    {/* the desk top seen from behind her: back edge 980, the lamp's pool */}
    <Fill rect={[-200, 980, 1480, 1200]} color={CC.desk} offset={false} at={fillAt(at)} />
    <Ink d={hline(-60, 1140, 980, {seed: 'p5dk', over: [0, 0]})} width={W.mid} at={at} />
    <Fill d={blob(560, 1190, 400, 170, {seed: 'p5pool1', wobble: 0.02})} color={CC.ring} offset={false} at={fillAt(at)} />
    <Fill d={blob(552, 1186, 256, 108, {seed: 'p5pool2', wobble: 0.025})} color={CC.core} offset={false} at={fillAt(at)} />
    <Ink d={line(40, 1420, 260, 1426, {over: [0, 0], seed: 'p5g1'}) + line(780, 1500, 1000, 1506, {over: [0, 0], seed: 'p5g2'}) + line(860, 1080, 1060, 1083, {over: [0, 0], seed: 'p5g3'})} width={W.hair} at={at} />
    {/* the lamp's cable: from its base to the right, behind the desk's back edge (never near the mug) */}
    <Ink d={smooth([[930, 998], [990, 1008], [1060, 1000], [1120, 992]])} width={5} color={CC.cable} taper={false} at={b(at, 0.06)} />
    <TableLamp x={900} y={1000} h={190} glow={false} pool={0} seed="p5lamp" at={at} />
    <DustMotes cx={600} cy={1090} rx={320} ry={150} n={10} seed="p5motes" at={at} />
    <Fill d={polyPath([[600, 1240], [860, 1226], [880, 1330], [612, 1346]])} color={CC.paper} at={fillAt(at)} seed="p5paper" />
    <Ink d={poly([[600, 1240], [860, 1226], [880, 1330], [612, 1346]], {closed: true, seed: 'p5paperI', over: 'small'}) + textLines(630, 1262, 200, {n: 3, gap: 22, seed: 'p5pl', heading: false})} width={W.far} at={at} />
    <Ink d={line(250, 1300, 420, 1340, {over: [0, 0], seed: 'p5pen'})} width={14} color={CC.anchor} taper={false} at={at} />
    {/* the near desk: grain, a mug ring, the network printout under the notebook's corner, the notebook, sticky notes,
        her phone face up, a pencil cup, books; the desk's front lip and a drawer along the bottom */}
    <Ink d={[1060, 1130, 1210, 1290, 1380, 1480, 1640, 1760].map((y, i) => smooth([[-40 + i * 30, y], [300, y + 6 * Math.sin(i)], [700, y - 4], [1120, y + 5]])).join('')} width={W.hair} color={CC.deskShade} at={at} />
    <Ink d={ellipse(700, 1392, 34, 13, {seed: 'p5ring'})} width={4} color={CC.deskShade} taper={false} at={at} />
    <NetPrint q={[[540, 1586], [790, 1572], [806, 1786], [552, 1800]]} at={at} />
    <Fill d={polyPath([[338, 1438], [618, 1438], [614, 1616], [342, 1620]])} color={CC.deskShade} offset={false} at={fillAt(at)} />
    <Fill d={polyPath([[330, 1430], [470, 1424], [478, 1600], [334, 1606]])} color={CC.paper} at={fillAt(at)} seed="p5nb1" />
    <Fill d={polyPath([[470, 1424], [612, 1430], [606, 1606], [478, 1600]])} color={CC.paper} at={fillAt(at)} seed="p5nb2" />
    <Ink d={poly([[330, 1430], [470, 1424], [478, 1600], [334, 1606]], {closed: true, seed: 'p5nbI1', over: 'small'}) + poly([[470, 1424], [612, 1430], [606, 1606], [478, 1600]], {closed: true, seed: 'p5nbI2', over: 'small'}) + textLines(350, 1458, 110, {n: 5, gap: 26, seed: 'p5nbt1', heading: false}) + textLines(492, 1458, 100, {n: 4, gap: 26, seed: 'p5nbt2', heading: false})} width={W.far} at={at} />
    <Fill d={polyPath([[652, 1444], [740, 1436], [746, 1518], [658, 1526]])} color={CC.note3} at={fillAt(at)} seed="p5st1" />
    <Fill d={polyPath([[700, 1500], [784, 1506], [778, 1586], [694, 1580]])} color={CC.note2} at={fillAt(at)} seed="p5st2" />
    <Ink d={poly([[652, 1444], [740, 1436], [746, 1518], [658, 1526]], {closed: true, seed: 'p5stI1', over: [0, 0]}) + poly([[700, 1500], [784, 1506], [778, 1586], [694, 1580]], {closed: true, seed: 'p5stI2', over: [0, 0]}) + textLines(668, 1470, 60, {n: 2, gap: 20, seed: 'p5stt', heading: false})} width={W.far} at={at} />
    <P5Phone x={800} y={1600} on={phoneOn} at={at} />
    <PencilCup x={900} y={1556} at={at} />
    <Fill rect={[938, 1766, 170, 10]} color={CC.deskShade} offset={false} at={fillAt(at)} />
    <BookPile x={930} y={1760} w={170} n={3} seed="p5books" at={at} />
    <Fill rect={[-200, 1852, 1480, 120]} color={CC.deskFront} offset={false} at={fillAt(at)} />
    <Fill rect={[-200, 1852, 1480, 12]} color={CC.deskShade} offset={false} at={fillAt(at)} />
    <Ink d={hline(-60, 1140, 1852, {seed: 'p5lip', over: [0, 0]}) + hline(-60, 1140, 1864, {seed: 'p5lip2', over: [0, 0]}) + roundRect(400, 1878, 380, 60, 6, {seed: 'p5drw'})} width={W.mid} at={at} />
    <Fill d={roundRect(560, 1896, 60, 12, 6)} color={CC.anchor} offset={false} at={fillAt(at)} />
    <P5Mug x={P5_MUG.x} top={P5_MUG.top} w={P5_MUG.w} at={at} />
    {children}
  </>
);
