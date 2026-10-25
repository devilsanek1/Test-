p='src/scenes/scene03/ground.tsx'
s=open(p).read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt, (old, s.count(old))
    s=s.replace(old,new)
rep('''/** S03's plan (replaces the set's 'ground' node): street, sheet, edges, margin, far + mid grid, kerb dimensions, the
 *  title-block frame and the furniture from the cut; the near grid rows draw on from `gridAt` (far -> near). */
export const GroundS03: React.FC<{gridAt: number; seed?: string}> = ({gridAt, seed = 'bp'}) => {
  useCaptionFont();
  const t = useTime();
  const F = FURNITURE;
  const nearOn = t >= gridAt;
  return (
    <>
      <Fill rect={[-160, 1180, 1400, 900]} color={palette.sand} offset={false} mode="snap" seed={`${seed}/street`} />''',
'''/** S03's plan (replaces the set's 'ground' node): street, sheet, edges, margin, far + mid grid, kerb dimensions, the
 *  title-block frame and the furniture from the cut; the near grid rows draw on from `gridAt` (far -> near).
 *  Polish round 1: the sand street exists only from `streetAt` (the pop-up: the pavement springs up with the city);
 *  before it the bare plan is all paper (FarPlain's cream + grid show round the sheet, to the horizon). The grid weights
 *  thin with depth from 2.2 (near) through 1.9 (mid) to inkHair 1.6 (far), continuing into the far plain's 1.6. */
export const GroundS03: React.FC<{gridAt: number; streetAt?: number; seed?: string}> = ({gridAt, streetAt, seed = 'bp'}) => {
  useCaptionFont();
  const t = useTime();
  const F = FURNITURE;
  const nearOn = t >= gridAt;
  return (
    <>
      {streetAt === undefined || t >= streetAt ? <Fill rect={[-160, 1180, 1400, 900]} color={palette.sand} offset={false} mode="snap" seed={`${seed}/street`} /> : null}''')
rep('''      <Ink d={G.gridFar} width={SI.hair * 0.6} taper={false} seed={`${seed}/gF`} />
      <Ink d={G.gridMid} width={SI.hair * 0.9} taper={false} seed={`${seed}/gM`} />
      {nearOn ? <Ink d={G.gridNear} width={SI.hair * 1.25} at={gridAt} dur={0.3} order="all" taper={false} seed={`${seed}/gN`} /> : null}''',
'''      <Ink d={G.gridFar} width={SI.hair} taper={false} seed={`${seed}/gF`} />
      <Ink d={G.gridMid} width={1.9} taper={false} seed={`${seed}/gM`} />
      {nearOn ? <Ink d={G.gridNear} width={SI.far} at={gridAt} dur={0.3} order="all" taper={false} seed={`${seed}/gN`} /> : null}''')
open(p,'w').write(s)

p='src/scenes/scene03/plan.tsx'
s=open(p).read()
rep('''/** A wire from L3's cornice to the pen-nib sign's pole top (sagging over the sky left of the sun, screen y ~700-725),
 *  two small birds on it; the second one turns round at `turnAt`. */''','''/** A wire from L3's cornice to the pen-nib sign's pole top (sagging over the sky left of the sun, screen y ~700-725),
 *  two small birds on it; the first one hops and turns round at `hopAt` (polish round 1: life in the calm after the
 *  pop-up), the second one turns round at `turnAt`. */''')
rep('''export const BirdWire: React.FC<{drawAt?: number; turnAt?: number}> = ({drawAt, turnAt}) => {
  const t = useTime();
  const {a, b, sag} = WIRE;
  const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 2 * sag];
  const wire = `M${a[0]} ${a[1]}Q${mid[0]} ${mid[1]} ${b[0]} ${b[1]}`;
  const p1 = wireAt(0.52);
  const p2 = wireAt(0.6);
  const turned = turnAt !== undefined && t >= turnAt;
  return (
    <>
      <Ink d={wire} at={drawAt} width={1.4} taper={false} seed="s03/wire" />
      {drawAt === undefined || t >= drawAt + 0.12 ? <Fill d={bird(p1[0], p1[1], 1) + bird(p2[0], p2[1], turned ? 1 : -1)} color={palette.ink} offset={false} mode="none" seed="s03/birds" /> : null}''',
'''export const BirdWire: React.FC<{drawAt?: number; turnAt?: number; hopAt?: number}> = ({drawAt, turnAt, hopAt}) => {
  const t = useTime();
  const {a, b, sag} = WIRE;
  const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 2 * sag];
  const wire = `M${a[0]} ${a[1]}Q${mid[0]} ${mid[1]} ${b[0]} ${b[1]}`;
  const p1 = wireAt(0.52);
  const p2 = wireAt(0.6);
  const turned = turnAt !== undefined && t >= turnAt;
  // the hop: 0.2 s, 9 px up, turning round at its top
  const hp = hopAt !== undefined && t >= hopAt ? Math.min(1, (t - hopAt) / 0.2) : 0;
  const lift = 9 * 4 * hp * (1 - hp);
  const dir1 = hp >= 0.5 ? -1 : 1;
  return (
    <>
      <Ink d={wire} at={drawAt} width={1.4} taper={false} seed="s03/wire" />
      {drawAt === undefined || t >= drawAt + 0.12 ? <Fill d={bird(p1[0], p1[1] - lift, dir1) + bird(p2[0], p2[1], turned ? 1 : -1)} color={palette.ink} offset={false} mode="none" seed="s03/birds" /> : null}''')
open(p,'w').write(s)
