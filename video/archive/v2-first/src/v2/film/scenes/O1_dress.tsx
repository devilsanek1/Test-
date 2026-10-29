// O1_dress (lane L1-desk): the extra dressing and life of HER desk insert (O1 + P12), on top of the kit's desk (kit/Desk:
// DeskBack + the front pieces), so the approved style frame (desk_A.png) becomes a full, lived-in, LIVING corner:
//   WallDress     above the caption band: a framed print and a wall clock (its second hand ticks)
//   FairyLights   swagged under the wall shelf; ShelfTendril: a long trailing stem off the shelf's pot that sways
//                 (both drawn by O1_set raised with the shelf, so P12's credit tab sits on bare wall)
//   TownLines     the town's bare ink lines in the window strip on frame 0 (the kit town is fills only: a far plane),
//                 gone the frame the window's colour lands
//   UnderBox      what the box stood on / behind: a closed folder with a label, papers sticking out, a sticky note,
//                 a paperclip, a coffee ring; a succulent (revealed when the box goes)
//   DeskBits      the desk's front-left: her reading glasses; the back-right: a pencil cup
//   Phone         her phone (front-left): it buzzes and lights up with a notification (O1 between two years, P12 on
//                 "Google.")
//   UnderDesk     the knee space: a tote bag, her slippers, a stack of magazines, a power strip, its cables, a
//                 charger LED that blinks
//   Moth          a pale moth circling under the lamp (ambient life, always on, sized to read on a phone)
// Canvas px at camera rest (the style frame's numbers). Kit Ink / Fill: inside O1's BuildWave they build by position.
import React from 'react';
import {blob, ellipse, hline, line, poly, polyPath, rect, roundRect, smooth} from '../../../lib/sketch';
import {prog, useTime} from '../../../lib/time';
import {CC, DESK, Fill, FramedPicture, Ink, leafD, Live, loopT, Placed, PotPlant, type Pt, stepT, Sway, useWaveColour, W, WallClock} from '../kit';

// ---------------------------------------------------------------- the wall above the caption band

export const WallDress: React.FC = () => (
  <>
    <FramedPicture x={462} y={44} w={136} h={168} kind="sea" seed="o1/print" />
    <WallClock cx={748} cy={124} r={58} seed="o1/clock" />
  </>
);

/** Fairy lights swagged under the wall shelf (above the caption band): warm bulbs that twinkle on their own clocks
 *  (flat colour steps, never a fade): the left side of the frame lives too. */
export const FairyLights: React.FC = () => {
  const t = useTime();
  const swags: [Pt, Pt, number][] = [
    [[100, 196], [236, 198], 42],
    [[236, 198], [402, 194], 48],
  ];
  const at = (a: Pt, z: Pt, sag: number, u: number): Pt => [a[0] + (z[0] - a[0]) * u, a[1] + (z[1] - a[1]) * u + 4 * sag * u * (1 - u)];
  let wire = '';
  const bulbs: {p: Pt; k: string}[] = [];
  swags.forEach(([a, z, sag], i) => {
    const pts: Pt[] = Array.from({length: 9}, (_, j) => at(a, z, sag, j / 8));
    wire += smooth(pts);
    [0.14, 0.32, 0.5, 0.68, 0.86].forEach((u, j) => bulbs.push({p: at(a, z, sag, u), k: `${i}${j}`}));
  });
  return (
    <>
      <Ink d={wire} width={W.hair} />
      {bulbs.map(({p, k}, i) => {
        const on = loopT(stepT(t, 8), 1.7 + (i % 4) * 0.45, i * 0.83) > 0.5;
        return (
          <React.Fragment key={k}>
            <Fill d={blob(p[0], p[1] + 9, 7.5, 9.5, {seed: `o1/fl${k}`})} color={on ? CC.core : CC.glow} offset={false} />
            <Ink d={blob(p[0], p[1] + 9, 7.5, 9.5, {seed: `o1/fl${k}`}) + `M${p[0]} ${p[1]}L${p[0]} ${p[1] + 2}`} width={W.hair} />
          </React.Fragment>
        );
      })}
    </>
  );
};

/** A long trailing stem off the wall shelf's pot (style-frame px, drawn raised with the shelf): it sways visibly
 *  (~6 deg, 0.33 Hz), its leaves stepping with it; it ends above y ~225 once raised (the credit tab starts at 236). */
export const ShelfTendril: React.FC = () => {
  const stem: Pt[] = [[334, 172], [348, 196], [344, 226], [360, 250], [356, 272]];
  const leaves: [number, number, number][] = [[346, 192, 10], [345, 214, 170], [350, 236, 20], [358, 254, 160], [356, 270, 70]];
  return (
    <Sway x={334} y={172} amp={6} hz={0.33} seed="o1/tendril">
      <Ink d={smooth(stem)} width={W.far} />
      {leaves.map(([x, y, deg], i) => (
        <Fill key={i} d={leafD(x, y, 22, deg)} color={i % 2 ? CC.leafDark : CC.leaf} offset={false} />
      ))}
      <Ink d={leaves.map(([x, y, deg]) => leafD(x, y, 22, deg)).join('')} width={W.hair} open={0.3} />
    </Sway>
  );
};

// ---------------------------------------------------------------- the town's bare lines (frame 0 only)

const G = DESK.window;
/** The town in the window strip as bare ink (frame 0's drawing): moon, a cloud, roofs, a far tower; the frame the
 *  window's colour lands it is gone (the kit town has no ink: everything seen through a window gets none). */
export const TownLines: React.FC = () => {
  const lit = useWaveColour([G.glassX + 100, 330], CC.sky);
  if (lit === CC.sky) return null;
  const x0 = G.glassX;
  const roofs: Pt[] = [
    [x0 + 2, 566],
    [x0 + 22, 566],
    [x0 + 22, 532],
    [x0 + 52, 506],
    [x0 + 82, 532],
    [x0 + 82, 548],
    [x0 + 120, 548],
  ];
  const tower: Pt[] = [
    [x0 + 34, 520],
    [x0 + 34, 440],
    [x0 + 46, 420],
    [x0 + 58, 440],
    [x0 + 58, 512],
  ];
  return (
    <>
      <Ink d={ellipse(1034, 146, 30, 30, {seed: 'o1/tl/moon'})} width={W.far} />
      <Ink d={smooth([[x0 + 6, 262], [x0 + 30, 240], [x0 + 62, 246], [x0 + 92, 232], [x0 + 118, 250]])} width={W.far} />
      <Ink d={poly(roofs, {seed: 'o1/tl/roofs', over: [0, 0]}) + poly(tower, {seed: 'o1/tl/tower', over: [0, 0]})} width={W.far} />
      <Ink d={rect(x0 + 92, 572, 16, 22, {seed: 'o1/tl/win', over: [0, 0]})} width={W.hair} />
    </>
  );
};

// ---------------------------------------------------------------- what the box stood on / behind

/** The closed folder the box stood on (its front strip shows under the box; all of it once the box is gone) and a
 *  succulent behind the box (its leaves show over the back flap). Draw BEFORE the box. */
export const UnderBox: React.FC = () => {
  const folder: Pt[] = [
    [10, 842],
    [322, 828],
    [330, 1036],
    [4, 1050],
  ];
  const tab: Pt[] = [
    [40, 842],
    [44, 822],
    [128, 818],
    [132, 838],
  ];
  const label: Pt[] = [
    [70, 948],
    [196, 943],
    [198, 983],
    [72, 988],
  ];
  const sheets: Pt[][] = [
    [[318, 852], [344, 856], [346, 944], [322, 940]],
    [[320, 952], [338, 954], [340, 1010], [324, 1008]],
    [[40, 1046], [196, 1040], [198, 1056], [42, 1062]],
  ];
  const noteC: Pt = [262, 902];
  const rotq = (p: Pt, deg: number): Pt => {
    const a = (deg * Math.PI) / 180;
    return [noteC[0] + (p[0] - noteC[0]) * Math.cos(a) - (p[1] - noteC[1]) * Math.sin(a), noteC[1] + (p[0] - noteC[0]) * Math.sin(a) + (p[1] - noteC[1]) * Math.cos(a)];
  };
  const note: Pt[] = ([[noteC[0] - 36, noteC[1] - 34], [noteC[0] + 36, noteC[1] - 34], [noteC[0] + 36, noteC[1] + 22], [noteC[0] + 24, noteC[1] + 34], [noteC[0] - 36, noteC[1] + 34]] as Pt[]).map((p) => rotq(p, 7));
  const noteCurl: Pt[] = ([[noteC[0] + 36, noteC[1] + 22], [noteC[0] + 24, noteC[1] + 34], [noteC[0] + 22, noteC[1] + 20]] as Pt[]).map((p) => rotq(p, 7));
  const clip = `M58 834L58 866Q58 874 66 874Q74 874 74 866L74 830Q74 822 67 822Q61 822 61 830L61 860`;
  return (
    <>
      <Fill d={polyPath([[18, 852], [332, 838], [340, 1046], [12, 1060]])} color={CC.deskShade} offset={false} />
      <Fill d={polyPath(tab)} color={CC.box} seed="o1/ftab" />
      <Ink d={poly(tab, {closed: true, seed: 'o1/ftabI', over: 'small'})} width={W.far} />
      <Fill d={polyPath(folder)} color={CC.box} seed="o1/folder" />
      <Fill d={polyPath([[10, 1040], [330, 1026], [330, 1036], [4, 1050]])} color={CC.boxSide} offset={false} />
      <Ink d={poly(folder, {closed: true, seed: 'o1/folderI', over: 'small'})} width={W.mid} />
      <Fill d={polyPath(label)} color={CC.paper} offset={false} />
      <Ink d={poly(label, {closed: true, seed: 'o1/labelI', over: [0, 0]}) + line(84, 961, 170, 958, {seed: 'o1/lab1', over: [0, 0]}) + line(84, 974, 140, 972, {seed: 'o1/lab2', over: [0, 0]})} width={W.hair} />
      {/* papers sticking out of it (right side and bottom), a coffee ring, a paperclip on its top edge, a sticky note */}
      {sheets.map((q, i) => (
        <React.Fragment key={i}>
          <Fill d={polyPath(q)} color={CC.paper} offset={false} />
          <Ink d={poly(q.slice(1, 3), {seed: `o1/fsh${i}`, over: [0, 0]})} width={W.far} />
        </React.Fragment>
      ))}
      <Ink d={ellipse(236, 1004, 36, 13, {seed: 'o1/ring', wobble: 0.04})} width={3.2} color={CC.boxIn} open={0.22} taper={false} />
      <Ink d={clip} width={W.far} color={CC.anchor} taper={false} />
      <Fill d={polyPath(note)} color={CC.cheek} seed="o1/note" />
      <Fill d={polyPath(noteCurl)} color={CC.catEar} offset={false} />
      <Ink d={poly(note, {closed: true, seed: 'o1/noteI', over: [0, 0]}) + line(noteC[0] - 22, noteC[1] - 8, noteC[0] + 18, noteC[1] - 4, {seed: 'o1/n1', over: [0, 0]}) + line(noteC[0] - 20, noteC[1] + 8, noteC[0] + 8, noteC[1] + 11, {seed: 'o1/n2', over: [0, 0]})} width={W.hair} />
      <PotPlant x={210} y={706} w={58} h={48} kind="succulent" seed="o1/succ" />
    </>
  );
};

// ---------------------------------------------------------------- the desk's other things

/** Her reading glasses (front-left), the pencil cup (back-right, by the lamp). */
export const DeskBits: React.FC = () => {
  // glasses: two lenses, the bridge, the folded temples (lying on the desk, seen from above at 3/4)
  const L1: Pt = [118, 1168];
  const L2: Pt = [214, 1176];
  const lens = (c: Pt, k: string) => (
    <>
      <Fill d={blob(c[0], c[1], 40, 28, {seed: `o1/gl${k}`})} color={CC.core} offset={false} />
      <Ink d={ellipse(c[0], c[1], 40, 28, {seed: `o1/glI${k}`})} width={W.mid} color={CC.anchor} />
    </>
  );
  // pencil cup by the lamp (back-right): a cylinder, pencils, a ruler, scissors' rings
  const cx = 800;
  const top = 646;
  const bot = 706;
  return (
    <>
      <Fill d={blob(170, 1196, 96, 22, {seed: 'o1/glsh'})} color={CC.deskShade} offset={false} />
      {lens(L1, 'a')}
      {lens(L2, 'b')}
      <Ink d={smooth([[L1[0] + 38, L1[1] - 6], [166, L1[1] - 14], [L2[0] - 38, L2[1] - 8]])} width={W.mid} color={CC.anchor} />
      <Ink d={line(L1[0] - 38, L1[1] - 10, L1[0] + 30, L1[1] - 30, {seed: 'o1/tmp1', over: [0, 0]}) + line(L2[0] + 38, L2[1] - 8, L2[0] - 26, L2[1] - 30, {seed: 'o1/tmp2', over: [0, 0]})} width={W.mid} color={CC.anchor} />
      <Ink d={glintPath(L1[0] - 12, L1[1] - 8) + glintPath(L2[0] - 12, L2[1] - 8)} width={W.hair} color={CC.paper} />
      {/* the pencil cup */}
      <Fill d={blob(cx + 36, bot + 4, 44, 9, {seed: 'o1/pcsh'})} color={CC.deskShade} offset={false} />
      {[
        [cx - 18, 604, CC.books[3]],
        [cx - 2, 590, CC.anchor],
        [cx + 14, 610, CC.books[4]],
      ].map(([x, y, c], i) => (
        <React.Fragment key={i}>
          <Fill d={polyPath([[x as number, y as number], [(x as number) + 9, (y as number) + 2], [(x as number) + 7, top + 6], [(x as number) - 2, top + 6]])} color={c as string} offset={false} />
          <Ink d={poly([[x as number, y as number], [(x as number) + 9, (y as number) + 2], [(x as number) + 7, top + 6]], {seed: `o1/pen${i}`, over: [0, 0]})} width={W.hair} />
        </React.Fragment>
      ))}
      <Fill d={polyPath([[cx + 22, 598], [cx + 34, 600], [cx + 30, top + 6], [cx + 20, top + 6]])} color={CC.paperEdge} offset={false} />
      <Ink d={poly([[cx + 22, 598], [cx + 34, 600], [cx + 30, top + 6], [cx + 20, top + 6]], {closed: true, seed: 'o1/ruler', over: [0, 0]})} width={W.hair} />
      <Fill d={`M${cx - 26} ${top}L${cx - 22} ${bot - 6}Q${cx - 20} ${bot} ${cx - 12} ${bot}L${cx + 30} ${bot}Q${cx + 38} ${bot} ${cx + 38} ${bot - 6}L${cx + 42} ${top}Z`} color={CC.pot} seed="o1/cup" />
      <Fill d={blob(cx + 8, top, 34, 7, {seed: 'o1/cupR'})} color={CC.boxIn} offset={false} />
      <Ink d={`M${cx - 26} ${top}L${cx - 22} ${bot - 6}Q${cx - 20} ${bot} ${cx - 12} ${bot}L${cx + 30} ${bot}Q${cx + 38} ${bot} ${cx + 38} ${bot - 6}L${cx + 42} ${top}` + ellipse(cx + 8, top, 34, 7, {seed: 'o1/cupRI'})} width={W.far} />
      <Ink d={hline(cx - 22, cx + 40, top + 22, {seed: 'o1/cupB', over: [0, 0]})} width={W.hair} />
    </>
  );
};

/** Her phone lying at an angle (front-left): a dark slab, its screen one step lighter. At `buzzAt` it buzzes (0.42 s of
 *  stepped jitter with buzz ticks either side) and lights up for 1.5 s with a notification card (no logos). */
export const Phone: React.FC<{buzzAt: number}> = ({buzzAt}) => {
  const t = useTime();
  const d = t - buzzAt;
  const buzzing = d >= 0 && d < 0.42;
  const lit = d >= 0 && d < 1.5;
  const jig = buzzing ? (Math.floor(d * 30) % 2 ? 3 : -3) : 0;
  const card = lit ? prog(d, 0.04, 0.12) : 0;
  return (
    <Placed x={22 + jig} y={1232} s={0.78} rot={-6}>
      <Fill d={roundRect(-6, 8, 104, 176, 18)} color={CC.deskShade} offset={false} />
      <Fill d={roundRect(-12, 0, 104, 176, 18)} color={CC.anchor} seed="o1/phone" />
      <Fill d={roundRect(-4, 12, 88, 152, 10)} color={lit ? CC.screen : CC.laptopDeck} offset={false} />
      {card > 0 ? (
        <>
          <Fill d={roundRect(2, 34, 76 * card, 44, 8)} color={CC.paper} offset={false} />
          {card >= 1 ? (
            <>
              <Fill d={blob(14, 48, 6, 6, {seed: 'o1/phapp'})} color={CC.trim} offset={false} />
              <Ink d={line(26, 48, 66, 48, {seed: 'o1/phl1', over: [0, 0]}) + line(12, 64, 56, 64, {seed: 'o1/phl2', over: [0, 0]})} width={W.far} taper={false} />
            </>
          ) : null}
        </>
      ) : null}
      <Ink d={roundRect(-12, 0, 104, 176, 18, {seed: 'o1/phoneI'})} width={W.mid} />
      <Fill d={blob(40, 6, 4, 3, {seed: 'o1/phcam'})} color={CC.ink} offset={false} />
      {buzzing ? <Ink d={`M106 40Q116 52 106 64M116 32Q130 52 116 72M-26 104Q-36 116 -26 128M-36 96Q-50 116 -36 136`} width={W.mid} taper={false} /> : null}
    </Placed>
  );
};

/** A strap of width w along a smooth path (closed outline: fill + ink, so frame 0 shows only its lines). */
const handleD = (pts: Pt[], w: number) => {
  const L: Pt[] = [];
  const R: Pt[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const c = pts[Math.min(pts.length - 1, i + 1)];
    const dx = c[0] - a[0];
    const dy = c[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    L.push([p[0] - (dy / l) * (w / 2), p[1] + (dx / l) * (w / 2)]);
    R.push([p[0] + (dy / l) * (w / 2), p[1] - (dx / l) * (w / 2)]);
  });
  return smooth([...L, ...R.reverse()], {closed: true});
};

const glintPath = (x: number, y: number) => `M${x} ${y + 8}Q${x + 2} ${y} ${x + 10} ${y - 4}`;

// ---------------------------------------------------------------- the knee space

/** A tote bag leaning in the knee space (left), a power strip on the floor with its cables, a charger's LED. */
export const UnderDesk: React.FC = () => {
  const t = useTime();
  const bag: Pt[] = [
    [34, 1596],
    [236, 1584],
    [252, 1772],
    [20, 1780],
  ];
  const strip: Pt[] = [
    [196, 1754],
    [330, 1749],
    [332, 1771],
    [198, 1777],
  ];
  // the charger's LED: blinks (on 0.5 s / off 0.5 s, flat steps, never a fade)
  const led = loopT(t, 1.0, 0.3) < 0.5 ? CC.lit : CC.anchor;
  // her slippers (the knee space, left of where the paper will hang) and a stack of magazines (right)
  const slipper = (cx: number, cy: number, rot: number, k: string) => {
    const a = (rot * Math.PI) / 180;
    const R = (p: Pt): Pt => [cx + p[0] * Math.cos(a) - p[1] * Math.sin(a), cy + p[0] * Math.sin(a) + p[1] * Math.cos(a)];
    const sole = smooth(([[-52, 4], [-48, -12], [-10, -18], [40, -16], [56, -4], [44, 10], [-8, 14], [-46, 12]] as Pt[]).map(R), {closed: true});
    const upper = smooth(([[4, -14], [18, -30], [44, -26], [56, -8], [44, 6], [10, 4]] as Pt[]).map(R), {closed: true});
    const lining = smooth(([[-40, 0], [-34, -8], [-8, -10], [2, -2], [-12, 6], [-36, 6]] as Pt[]).map(R), {closed: true});
    return (
      <React.Fragment key={k}>
        <Fill d={sole} color={CC.rugEdge} seed={`o1/slS${k}`} />
        <Fill d={lining} color={CC.rugBand} offset={false} />
        <Fill d={upper} color={CC.rug} seed={`o1/slU${k}`} />
        <Ink d={sole + upper} width={W.far} />
      </React.Fragment>
    );
  };
  const mags: [number, number, number, string][] = [
    [586, 1752, 150, CC.books[1]],
    [596, 1732, 136, CC.paperEdge],
    [580, 1714, 146, CC.books[4]],
    [594, 1696, 128, CC.books[0]],
  ];
  return (
    <>
      {slipper(410, 1750, -4, 'a')}
      {slipper(500, 1762, 6, 'b')}
      {mags.map(([x, y, w, c], i) => (
        <React.Fragment key={`m${i}`}>
          <Fill rect={[x, y, w, 18]} color={c} seed={`o1/mag${i}`} />
          <Ink d={rect(x, y, w, 18, {seed: `o1/magI${i}`, over: 'small'}) + line(x + 8, y + 9, x + w * 0.5, y + 9, {seed: `o1/magL${i}`, over: [0, 0]})} width={W.hair} />
        </React.Fragment>
      ))}
      <Ink d={smooth([[200, 1766], [176, 1786], [110, 1796], [40, 1790], [-20, 1796]]) + smooth([[318, 1752], [300, 1728], [262, 1716], [236, 1700]])} width={5} color={CC.cable} taper={false} />
      <Fill d={polyPath([[28, 1780], [254, 1772], [262, 1790], [24, 1798]])} color={CC.wallDeep} offset={false} />
      {[
        [[70, 1600], [92, 1508], [150, 1500], [168, 1596]],
        [[118, 1596], [140, 1514], [196, 1512], [214, 1590]],
      ].map((pts, i) => (
        <React.Fragment key={i}>
          <Fill d={handleD(pts as Pt[], 9)} color={CC.trim} offset={false} />
          <Ink d={handleD(pts as Pt[], 9)} width={W.hair} />
        </React.Fragment>
      ))}
      <Fill d={polyPath(bag)} color={CC.curtain} seed="o1/bag" />
      <Fill d={polyPath([[30, 1650], [240, 1640], [242, 1668], [28, 1678]])} color={CC.trim} offset={false} />
      <Ink d={poly(bag, {closed: true, seed: 'o1/bagI', over: 'small'})} width={W.mid} />
      <Ink d={line(130, 1600, 136, 1774, {seed: 'o1/bagF', over: [0, 0]})} width={W.hair} />
      <Fill d={polyPath(strip)} color={CC.radiator} seed="o1/strip" />
      <Ink d={poly(strip, {closed: true, seed: 'o1/stripI', over: [0, 0]})} width={W.far} />
      {[222, 268].map((x, i) => (
        <Fill key={i} rect={[x, 1745, 18, 14]} color={CC.anchor} offset={false} />
      ))}
      <Live c={[314, 1760]}>
        <circle cx={314} cy={1760} r={7} fill={led} stroke={CC.ink} strokeWidth={1.6} />
      </Live>
    </>
  );
};

// ---------------------------------------------------------------- the moth under the lamp

/** A pale moth circling in the lamp's light under the shade (always on): a looping path, wings stepped at 14 / s. */
export const Moth: React.FC<{seed?: string}> = ({seed = 'o1/moth'}) => {
  const t = useTime();
  const T = 2.1;
  const a = (2 * Math.PI * loopT(t, T)) / T;
  const cx = 872 + 74 * Math.cos(a) + 14 * Math.sin(2 * a);
  const cy = 904 + 30 * Math.sin(a) + 10 * Math.sin(3 * a + 1);
  const flap = Math.floor(stepT(t, 14) * 14) % 2 === 0;
  const wing = (sd: number) => {
    const span = flap ? 15 : 8;
    const tip: Pt = [cx + sd * span, cy - (flap ? 5 : 10)];
    const back: Pt = [cx + sd * span * 0.7, cy + 8];
    return `M${cx} ${cy - 3}Q${tip[0]} ${tip[1] - 6} ${tip[0]} ${tip[1]}Q${back[0] + sd * 4} ${back[1]} ${cx} ${cy + 4}Z`;
  };
  return (
    <Live c={[872, 904]}>
      <path d={wing(-1) + wing(1)} fill={CC.paper} stroke={CC.ink} strokeWidth={1.8} strokeLinejoin="round" />
      <ellipse cx={cx} cy={cy + 1} rx={3.2} ry={7} fill={CC.ink} />
    </Live>
  );
};
