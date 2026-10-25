p='src/scenes/scene03/cast.tsx'
s=open(p).read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt, (old, s.count(old))
    s=s.replace(old,new)
rep("import {ROOF_SIGN} from './plan';","import {ROOF_SIGN, signAngle} from './plan';")
rep('''/** The pen-nib sign's swing (same formula as the set's NibSign: -16 deg, decaying) about its hook. */
export const signAngle = (t: number, swingAt: number) => (t >= swingAt ? -16 * Math.exp(-5 * (t - swingAt)) * Math.cos((t - swingAt) * 12.5) : 0);

''','''export {signAngle};

''')
rep('''    // 'loves': the proud puff: chest out (a 1.10 -> 1.0 stretch over 0.3 s on top of the pose pop) and chin up (a
    // -7 deg lean back, out-back in, held to proudOff, then back)''','''    // 'loves': the proud puff, straight-faced (polish round 1: sit-front, closed happy smile; trunk-up's open mouth and
    // trumpet marks read as a cheer): chest out (a 1.10 -> 1.0 stretch over 0.3 s on top of the pose pop) and chin up (a
    // -7 deg lean back, out-back in, held to proudOff, then back)''')
rep('''    // 'loves': pride, straight-faced: the trunk curls UP (a toot: trunk-up with its two tiny puff marks), happy
    {t: b.loves, pose: 'trunk-up', expression: 'happy', look: 0},
    {t: b.proudOff, pose: 'sit-front', expression: 'happy', look: 0},''','''    // 'loves': pride, straight-faced: sit-front, happy (closed eyes-smile + closed smile), the lean back + chest stretch
    {t: b.loves, pose: 'sit-front', expression: 'happy', look: 0},
    {t: b.proudOff, pose: 'sit-front', expression: 'happy', look: 0.3},''')
rep('''  const flip = t < b.pipLand; // faces left while dropping in; faces right for the hop toward the stoop''',
'''  // faces left while dropping in; polish round 1: faces LEFT again from the hop-off pop, the way S04 carries him (S04's
  // settle-hop travels left, screen x ~425 -> ~374): PIP_CUT_FLIP is the contract (S04 keeps flip = true to its landing)
  const flip = t < b.pipLand || (PIP_CUT_FLIP && t >= b.pipHop);''')
rep('''export const PIP_AT: Pt = [420, 1405];''','''export const PIP_AT: Pt = [420, 1405];
/** Pip faces LEFT (flip) in his hop-off crouch at the cut (polish round 1): S04 must keep `flip` true through its
 *  settle-hop so he never flips across the cut (import this). */
export const PIP_CUT_FLIP = true;''')
# near walkers
rep('''/** The two near walkers: big back-view figures cropped by the frame edges, sliding in on 'everyone' (0.3 s, out cubic),
 *  turning toward the press house at w42+0.30 (a small lean toward the centre) and bobbing on 'run'.''','''/** The two near walkers: big back-view figures cropped by the frame edges, sliding in on 'everyone' (0.3 s, out cubic),
 *  turning their heads toward the press house at w42+0.30 and bobbing on 'run'.
 *  Polish round 1: raised (L 112, R 84 world px) so the heads sit at screen y ~1400 / ~1360 (they were ~85 % in the
 *  bottom UI zone), still clear of the stamp (L x < 150) and the card (R x > 930); the 'look' tilts each figure 6 deg
 *  about its NECK (head toward the centre, shoulders out), not a 3 deg sway about a pivot under the feet (it slid).''')
rep('''  const turn = (side: number) => -side * 3.2 * E.outBack(1.4)(prog(t, b.heads, 0.3));''','''  const turn = (side: number) => -side * 6 * E.outBack(1.4)(prog(t, b.heads, 0.3));''')
rep('''  const L: Pt = [64, 1532];
  const R: Pt = [1036, 1472];
  return (
    <>
      <XG m={mat.compose(mat.translate(slide(-1, 0), bobY(0)), mat.about(mat.rotate(turn(-1)), L[0], L[1] + 400))}>
        <EdgeOnlooker x={L[0]} y={L[1]} head={104} hair="short" acc={['hood', 'strap']} body={palette.teal} rim="right" arms="near" seed="s03/nearL" />
      </XG>
      <XG m={mat.compose(mat.translate(slide(1, 0.04), bobY(0.04)), mat.about(mat.rotate(turn(1)), R[0], R[1] + 400))}>''','''  const L: Pt = [58, 1420];
  const R: Pt = [1040, 1388];
  const neck = (p: Pt, head: number): [number, number] => [p[0], p[1] + head * 0.62];
  return (
    <>
      <XG m={mat.compose(mat.translate(slide(-1, 0), bobY(0)), mat.about(mat.rotate(turn(-1)), ...neck(L, 104)))}>
        <EdgeOnlooker x={L[0]} y={L[1]} head={104} hair="short" acc={['hood', 'strap']} body={palette.teal} rim="right" arms="near" seed="s03/nearL" />
      </XG>
      <XG m={mat.compose(mat.translate(slide(1, 0.04), bobY(0.04)), mat.about(mat.rotate(turn(1)), ...neck(R, 112)))}>''')
open(p,'w').write(s)
