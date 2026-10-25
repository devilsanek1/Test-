p='src/scenes/scene03/plan.tsx'
s=open(p).read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt, (old, s.count(old))
    s=s.replace(old,new)
rep('''// right depth): the far plain + horizon skyline that the bare plan runs to before the city springs up, the ten inked
// FOOTPRINTS (cream lots, solid ink, door swings, lot marks), S02's teal frame band on the plan sheet + the dog-ear
// fold, the side rows re-coloured (S03 replaces the set's 'sides' layer with the same rows: mint / peach facades,
// no tiny plaques, no PHP lock on the three non-PHP doors), the per-building COUNT SIGNS (fix round 2: blade signs on
// iron brackets projecting into the street, facing the viewer, 58-69 px on screen, the plate pops and swings on its
// beat with an orange ping ring), awnings, flower boxes, the browser-screen states (unlit sage glass; the seven PHP
// screens light on 'websites' with a big ink elephant on their page; the three non-PHP screens stay DARK to the cut),
// the count pings, the bird wire, S03's roof vent (moved off the sun's edge) and its puffs.''',
'''// right depth): the far plain (paper, the plan's grid running to a bare horizon) that the bare plan runs to before the
// city springs up, the ten inked FOOTPRINTS (lots, solid ink, door swings, lot marks), S02's teal frame band on the
// plan sheet + the dog-ear fold, the side rows re-coloured (S03 replaces the set's 'sides' layer with the same rows:
// mint / peach facades, no tiny plaques, no PHP lock on the three non-PHP doors), awnings, flower boxes, the
// browser-screen states, which ARE the street's count (polish round 1: one encoding, no blade signs): unlit sage glass
// until 'seven', when the six side PHP screens light near -> far with the elephant page and an orange ping (the press
// house counts first with its plaque); blank cream pages pop on the three non-PHP screens on 'ten'; the PHP pages
// re-pulse on 'websites'), the bird wire, S03's roof vent (moved off the sun's edge) and its puffs.''')
rep('''/** S03's three non-PHP sites (fix round 2: R1, entirely under the right UI rail, swapped with the set's R4, so all seven
 *  PHP count signs sit left of x 950 on screen). */
export const S03_BLANK: SideId[] = ['L3', 'L5', 'R1'];''',
'''/** S03's three non-PHP sites. Polish round 1 (the screens are the count): L1's screen is cut by the left frame edge
 *  (x -7..57 on screen) and R1's sits in the right UI rail (x 1012-1076), so the two nearest sites are non-PHP, with L5
 *  (the storyboard's blank) the third; every PHP screen (L2 L3 L4, R2 R3 R4) is inside x 89-980 on screen. */
export const S03_BLANK: SideId[] = ['L1', 'R1', 'L5'];''')
rep('''/** Fix round 1 palette: the set's rows were ~70 % one brown family. Same rows, re-coloured: L2 / R2 mintPale, L4 peach,
 *  L3 tan (was mint, next to L2), R3 cream; the bleed slivers and L1 / L5 / R1 / R4 keep the set's colours. The tiny
 *  side plaques are dropped (`plaque: false`): the count badges over the doors carry the count instead. */''',
'''/** Fix round 1 palette: the set's rows were ~70 % one brown family. Same rows, re-coloured: L2 / R2 mintPale, L4 peach,
 *  L3 tan (was mint, next to L2), R3 cream; the bleed slivers and L1 / L5 / R1 / R4 keep the set's colours. The tiny
 *  side plaques are dropped (`plaque: false`): the screens carry the count instead. */''')
# PressScreen: pulses list
rep('''/** The press house's screen (BrowserChrome screen rect under its bar): unlit, peach pop, the set's page; re-pulses
 *  (peach, 2 frames) at `pulseAt`. */
export const PressScreen: React.FC<{lightAt: number; pulseAt?: number}> = ({lightAt, pulseAt}) => {
  const t = useTime();
  const [wx, wy, ww, wh] = BLUEPRINT.window;
  const s = chromeScreen(wx, wy, ww, wh);
  const d = `M${s.x} ${s.y}H${s.x + s.w}V${s.y + s.h}H${s.x}Z`;
  const pulse = pulseAt !== undefined && t >= pulseAt && t < pulseAt + GLOW;''',
'''/** The press house's screen (BrowserChrome screen rect under its bar): unlit, peach pop, the set's page; re-pulses
 *  (peach, 2 frames) at each `pulseAt` (its count tick on 'seven', 'websites'). */
export const PressScreen: React.FC<{lightAt: number; pulseAt?: number[]}> = ({lightAt, pulseAt = []}) => {
  const t = useTime();
  const [wx, wy, ww, wh] = BLUEPRINT.window;
  const s = chromeScreen(wx, wy, ww, wh);
  const d = `M${s.x} ${s.y}H${s.x + s.w}V${s.y + s.h}H${s.x}Z`;
  const pulse = pulseAt.some((p) => t >= p && t < p + GLOW);''')
# roof sign angle
rep('''export const ROOF_SIGN = {pole: [438, 832] as Pt, top: 704, hook: [392, 712] as Pt, x: 392, y: 762, r: 32};
''','''export const ROOF_SIGN = {pole: [438, 832] as Pt, top: 704, hook: [392, 712] as Pt, x: 392, y: 762, r: 32};

/** The pen-nib sign's swing about its hook at `swingAt` (end(loves)). Polish round 1 (finding: the old -16 e^-5t cos 12.5t
 *  jumped to -14 deg in one frame and was back to ~0 in 0.1 s: a twitch): it starts at 0 with a velocity kick (sine),
 *  peaks at about -11 deg at +0.18 s and swings visibly for ~0.9 s (period ~0.74 s); Bit (BitOnSign) rides it. */
export const signAngle = (t: number, swingAt: number) => (t >= swingAt ? -14 * Math.exp(-2.6 * (t - swingAt)) * Math.sin((t - swingAt) * 8.5) : 0);
''')
rep('''  const a = swingAt !== undefined && t >= swingAt ? -16 * Math.exp(-5 * (t - swingAt)) * Math.cos((t - swingAt) * 12.5) : 0;''',
'''  const a = swingAt !== undefined ? signAngle(t, swingAt) : 0;''')
open(p,'w').write(s)
