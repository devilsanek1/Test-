p='src/scenes/Scene03.tsx'
s=open(p).read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt, (old, s.count(old))
    s=s.replace(old,new)
rep('''// swings with Bit on it. The count: ten spokes on the sun ('about'), seven count badges tick over the doors ('seven'),
// the card flips to the W3Techs footnote L4, three blank plates + three cream slices ('ten': the 7/10 pie), the seven
// PHP screens light with an elephant on their page ('websites'). 'it.': the pie pops back to solid and the sun takes off
// on its low glide-hop to S04 (mid-air at screen (810, 680) on the cut); Pip crouches to hop to the stoop.''',
'''// swings with Bit on it. The count (polish round 1: ONE street encoding, the screens): ten spokes on the sun ('about');
// 'seven': the press plaque pings, then the six side PHP screens light near -> far with an elephant page and an orange
// ping; the card flips to the W3Techs footnote L4; 'ten': blank cream pages on the three non-PHP screens + three cream
// sun slices (the 7/10 pie); 'websites': the seven PHP pages re-pulse. 'it.': the pie pops back to solid and the sun
// takes off on its low glide-hop to S04 (mid-air at screen (810, 680) on the cut); Pip crouches to hop to the stoop.''')
rep("import {BirdWire, CountPing, CountSigns, EdgeTree, FarPlain,","import {BirdWire, CountPing, EdgeTree, FarPlain,")
rep('''/** The seven PHP sites in count order (near -> far, alternating; fix round 2: R1 -> R4 swap, see plan.tsx S03_BLANK). */
const COUNT: BlueprintId[] = ['P', 'L1', 'R2', 'L2', 'R3', 'L4', 'R4'];
const BLANK: SideId[] = S03_BLANK; // L3, L5, R1: blank plates on 'ten', screens dark to the cut''',
'''/** The seven PHP sites in count order (the press house, then near -> far, alternating; polish round 1: L1 / R1, cut by
 *  the frame edge / under the right UI rail, are non-PHP, see plan.tsx S03_BLANK). */
const COUNT: BlueprintId[] = ['P', 'L2', 'R2', 'L3', 'R3', 'L4', 'R4'];
const BLANK: SideId[] = S03_BLANK; // L1, R1, L5: blank cream pages on 'ten' (near -> far)''')
rep('''  // the count: P re-pulses (ping), the 6 side PHP signs' plates pop on 'seven' 0.08 s apart; the 3 blank plates on 'ten'
  const countAt = {} as Record<BlueprintId, number>;
  COUNT.forEach((id, i) => (countAt[id] = +(b.count + i * 0.08).toFixed(4)));
  const signAt: Partial<Record<SideId, number>> = {};
  COUNT.forEach((id) => {
    if (id !== 'P') signAt[id as SideId] = countAt[id];
  });
  BLANK.forEach((id, i) => (signAt[id] = +(b.ten + i * 0.05).toFixed(4)));
  // screens: the 7 PHP sites light in a wave on 'websites' (0.02 s; the press house first lit on 'the' re-pulses);
  // the 3 non-PHP sites stay unlit sage glass to the cut (7 lit, 3 dark = the pie)
  const lightAt: Partial<Record<SideId, number>> = {};
  COUNT.forEach((id, i) => {
    if (id !== 'P') lightAt[id as SideId] = +(b.websites + i * 0.02).toFixed(4);
  });
  return {pressAt, popAt, countAt, signAt, lightAt};''',
'''  // the count (polish round 1: the screens ARE the street's count): 'seven', 0.08 s apart: P (its plaque pings, its lit
  // screen re-pulses), then the six side PHP screens light with the elephant page + an orange ping; 'ten': blank cream
  // pages pop on the three non-PHP screens (0.05 s apart); 'websites': the seven PHP pages re-pulse in a wave (0.02 s)
  const countAt = {} as Record<BlueprintId, number>;
  COUNT.forEach((id, i) => (countAt[id] = +(b.count + i * 0.08).toFixed(4)));
  const onAt: Partial<Record<SideId, number>> = {};
  const pulseAt: Partial<Record<SideId, number>> = {};
  COUNT.forEach((id, i) => {
    if (id === 'P') return;
    onAt[id as SideId] = countAt[id];
    pulseAt[id as SideId] = +(b.websites + i * 0.02).toFixed(4);
  });
  BLANK.forEach((id, i) => (onAt[id] = +(b.ten + i * 0.05).toFixed(4)));
  return {pressAt, popAt, countAt, onAt, pulseAt};''')
rep('''  // Fix round 2: drawn ABOVE the side rows (nothing overlaps its slot; on the hop it passes in front of the R-row
  // roofs instead of slipping behind them, so the match object is whole at the cut).''',
'''  // Polish round 1: drawn BEHIND the side rows (ref-2 baseline: the sun sits behind the far layer; the far R row's roof
  // corner overlaps its lower right) until its take-off squash (sunHop - 0.1), then IN FRONT for the hop (the squash
  // hides the layer swap; on the hop it passes in front of the R-row roofs, so the match object is whole at the cut).''')
rep('''  // the pie: the three cream slices are three single-slice SunPies (each pops on its own, 0.03 s apart from ten-0.05:
  // whole by ~12.70), the ten spokes draw on 'about'; at b.solid (13.78) the whole pie pops back to solid in ONE frame
  // (f161 full pie, f162 a clean solid disc: no half-state), one frame before 'it.' and before the take-off squash''',
'''  // the pie: the three cream slices are three single-slice SunPies (each pops on its own, 0.03 s apart from ten-0.05:
  // whole by ~12.70), the ten spokes draw on 'about'; at b.solid (13.81) the whole pie pops back to solid in ONE frame
  // (f162 full pie, f163 (13.826) a clean solid disc: no half-state), on 'it.' (13.855, f164: within 0.03 s) and one
  // frame before the take-off squash (13.845)''')
rep('''        <GroundS03 gridAt={b.grid} />''','''        <GroundS03 gridAt={b.grid} streetAt={T.pressAt} />''')
rep('''          <PressScreen lightAt={b.pressScreen} pulseAt={b.websites} />''','''          <PressScreen lightAt={b.pressScreen} pulseAt={[T.countAt.P, b.websites]} />''')
rep('''        <VentPuffs times={[b.pipSettle, b.swing]} />''','''        <VentPuffs times={[b.pipSettle, b.swing]} n={3} />''')
rep('''      // S03 draws the set's two side rows itself (same layout, seeds, pop-ups and ink; re-coloured, no tiny plaques,
      // no PHP lock on the 3 non-PHP doors), plus the per-building overlays (screens, pages, awnings, window boxes), the
      // count signs, the tree, the bird wire and the sun
      const rows = <SideRows popAt={T.popAt} />;
      const allUp = T.popAt.L5 + 0.15;
      return (
        <>''','''      // S03 draws the set's two side rows itself (same layout, seeds, pop-ups and ink; re-coloured, no tiny plaques,
      // no PHP lock on the 3 non-PHP doors), plus the per-building overlays (screens = the count, pages, awnings, window
      // boxes), the tree, the bird wire and the sun (behind the rows until its take-off squash, then in front)
      const rows = <SideRows popAt={T.popAt} />;
      const allUp = T.popAt.L5 + 0.15;
      const sunFront = t >= b.sunHop - 0.1;
      return (
        <>
          {sunFront ? null : sun}''')
rep('''          <SideOverlays popAt={T.popAt} lightAt={T.lightAt} />
          <CountSigns popAt={T.popAt} signAt={T.signAt} />
          <EdgeTree at={T.popAt.L1} />
          {t >= allUp ? <BirdWire drawAt={allUp} turnAt={b.heads} /> : null}
          {sun}''','''          <SideOverlays popAt={T.popAt} onAt={T.onAt} pulseAt={T.pulseAt} />
          <EdgeTree at={T.popAt.L1} />
          {t >= allUp ? <BirdWire drawAt={allUp} turnAt={b.heads} hopAt={b.birdHop} /> : null}
          {sunFront ? sun : null}''')
open(p,'w').write(s)

p='src/scenes/scene03/beats.ts'
s=open(p).read()
rep('''  pressScreen: 10.135, //       w32 'the': the press house's browser window lights''','''  birdHop: 10.2, //             w32+0.07 'the': a bird on the new wire hops and turns round (polish round 1: life in the
  //                            calm after the pop-up; the frame otherwise holds for the bait)
  pressScreen: 10.135, //       w32 'the': the press house's browser window lights''')
rep('''  count: 11.955, //             w38 'seven': the 7 PHP count signs pop, near -> far: P (re-pulse), L1, R2, L2, R3, L4, R4,
  //                            0.08 s apart (fix round 2: R1, under the right UI rail, swapped with R4: R1 is a blank)''',
'''  count: 11.955, //             w38 'seven': the count, near -> far, 0.08 s apart: P (plaque ping + screen re-pulse), then
  //                            the PHP screens L2, R2, L3, R3, L4, R4 light (elephant page + orange ping) (polish round 1:
  //                            the screens are the street's count; L1 / R1 at the frame edges are non-PHP with L5)''')
rep('''  ten: 12.55, //                w41-0.10 'ten': three blank plates L3, L5, R1 (0.05 s apart) + 3 cream sun slices
  websites: 12.905, //          w42 'websites': the seven PHP screens light up in a wave (0.02 s)''','''  ten: 12.55, //                w41-0.10 'ten': blank cream pages on L1, R1, L5 (0.05 s apart) + 3 cream sun slices
  websites: 12.905, //          w42 'websites': the seven PHP pages re-pulse in a wave (0.02 s)''')
rep('''  solid: 13.78, //              w45-0.075 'it.': the pie pops back to solid in ONE frame (slices + spokes gone together):
  //                            f161 (13.760) full pie, f162 (13.793) solid, one frame before 'it.\'''','''  solid: 13.81, //              w45-0.045 'it.': the pie pops back to solid in ONE frame (slices + spokes gone together):
  //                            f162 (13.793) full pie, f163 (13.826) solid: 0.03 s before 'it.' (13.855, f164; ENGINE rule 5
  //                            +-0.05) and one frame before the take-off squash (sunHop - 0.1 = 13.845) (polish round 1:
  //                            was 13.78, 0.062 s early)''')
open(p,'w').write(s)
