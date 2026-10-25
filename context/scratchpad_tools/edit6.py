p='src/scenes/scene03/cast.tsx'
s=open(p).read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt, (old, s.count(old))
    s=s.replace(old,new)
rep('''  const L: Pt = [58, 1420];
  const R: Pt = [1040, 1388];
  const neck = (p: Pt, head: number): [number, number] => [p[0], p[1] + head * 0.62];
  return (
    <>
      <XG m={mat.compose(mat.translate(slide(-1, 0), bobY(0)), mat.about(mat.rotate(turn(-1)), ...neck(L, 104)))}>
        <EdgeOnlooker x={L[0]} y={L[1]} head={104} hair="short" acc={['hood', 'strap']} body={palette.teal} rim="right" arms="near" seed="s03/nearL" />
      </XG>
      <XG m={mat.compose(mat.translate(slide(1, 0.04), bobY(0.04)), mat.about(mat.rotate(turn(1)), ...neck(R, 112)))}>
        <EdgeOnlooker x={R[0]} y={R[1]} head={112} hair="bun" acc={['collar']} body={palette.tan} rim="left" arms="near" seed="s03/nearR" />
      </XG>
    </>
  );''','''  const L: Pt = [58, 1420];
  const R: Pt = [1040, 1388];
  const neck = (p: Pt, head: number): [number, number] => [p[0], p[1] + head * 0.62];
  // the kit's idle hip bob (1.5 px), applied here to the figure AND its cuff overlay so they move together
  const idle = (ph: number) => 1.5 * Math.sin(Math.PI * 2 * 0.5 * t + ph);
  return (
    <>
      <XG m={mat.compose(mat.translate(slide(-1, 0), bobY(0) + idle(0.4)), mat.about(mat.rotate(turn(-1)), ...neck(L, 104)))}>
        <EdgeOnlooker x={L[0]} y={L[1]} head={104} hair="short" acc={['hood', 'strap']} body={palette.teal} rim="right" arms="near" bob={0} seed="s03/nearL" />
        <SleeveCuff x={L[0]} y={L[1]} band={NEAR_CUFF.L} color={palette.tealDark} seed="s03/cuffL" />
      </XG>
      <XG m={mat.compose(mat.translate(slide(1, 0.04), bobY(0.04) + idle(2.1)), mat.about(mat.rotate(turn(1)), ...neck(R, 112)))}>
        <EdgeOnlooker x={R[0]} y={R[1]} head={112} hair="bun" acc={['collar']} body={palette.tan} rim="left" arms="near" bob={0} seed="s03/nearR" />
        <SleeveCuff x={R[0]} y={R[1]} band={NEAR_CUFF.R} color={palette.brown} seed="s03/cuffR" />
      </XG>
    </>
  );''')
rep('''/** The two near walkers: big back-view figures''','''/** The near walkers' sleeve ends (polish round 1: the kit's hanging hand read as a bare circle under a hairline cuff at
 *  this size): a cuff band one step darker than the coat across the sleeve, just above the hand (the hand comes out of
 *  it). Offsets from the head centre, from the kit EdgeOnlooker geometry for these seeds / head sizes (personGeo:
 *  's03/nearL' w 90.1, s 2.323, the near (right) sleeve x +67..+105, sleeve end +264.6; 's03/nearR' w 99.4, s 2.191, the
 *  near (left) sleeve x -109..-70, sleeve end +276.7). If the seed, head size or kit geometry changes, re-measure. */
const NEAR_CUFF = {L: {x0: 66, x1: 107, y: 264.6}, R: {x0: -110, x1: -69, y: 276.7}};
const SleeveCuff: React.FC<{x: number; y: number; band: {x0: number; x1: number; y: number}; color: string; seed: string}> = ({x, y, band, color, seed}) => {
  const x0 = x + band.x0;
  const x1 = x + band.x1;
  const yb = y + band.y + 2;
  const yt = yb - 15;
  const d = `M${x0} ${yt}L${x1} ${yt + 1}L${x1 - 1} ${yb}Q${(x0 + x1) / 2} ${yb + 3} ${x0 + 1} ${yb}Z`;
  return (
    <>
      <Fill d={d} color={color} offset={false} mode="none" seed={`${seed}/f`} />
      <Ink d={`M${x0 + 1} ${yb}Q${(x0 + x1) / 2} ${yb + 3} ${x1 - 1} ${yb}M${x0 + 2} ${yt}L${x1 - 2} ${yt + 1}`} width={3.2} taper={false} seed={`${seed}/i`} />
    </>
  );
};

/** The two near walkers: big back-view figures''')
open(p,'w').write(s)
