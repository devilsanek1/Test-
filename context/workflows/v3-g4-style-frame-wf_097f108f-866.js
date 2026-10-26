export const meta = {
  name: 'v3-g4-style-frame',
  description: 'v3 G4: build the frame-0 desk-nook style frame in our kit with a palette switch, render it in 3 candidate palettes for the owner to pick',
  phases: [{ title: 'Build', detail: 'one builder, palette-parameterised dev comp, 3 stills' }],
}
const ROOT = '/home/user/Test-/video'
const SP = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad'
phase('Build')
const r = await agent(
  `You are a scene builder for our Remotion film kit (React + TypeScript, 1080x1920). Build ONE finished style frame for video 3's frame 0 (G4 look check), in our v1 house style, so the owner can pick the palette.

The shot (frame 0, the hook): a cozy desk nook at night, seen from the viewer's POV. Read the shot in ${ROOT}/docs/v3/archive/g3_v1/storyboard_g3_v1.md (S1) and ${ROOT}/public/v3/animatic.json (its first shot, if present), plus the rules in ${ROOT}/docs/look/COZY_AND_SCALE.md (section 2-3: enclosure framing, cozy rules: walls/shelves on 2 edges, one window as the opening 15-30 % of the frame, warm lamp pool, the cold outside in the window) and ${ROOT}/docs/look/CINEMATIC_GUIDE.md. Elements: a bookshelf cut by the frame on one side, a frosty window holding the AI data center (a tall stack of server floors with rows of small lights) outside at night, a desk with an old laptop (a strip of tape on its hinge) in a warm lamp pool, a phone in the foreground (cut by the bottom) showing a new laptop with a price tag and an "Add to cart" button, a mug. Captions band y 317-556 must be a flat field (wall or window sky). No people's faces (a thumb/hand at the phone is fine).

Style: match our v1 film exactly (look at frames: ffmpeg -loglevel error -ss <s> -i ${ROOT}/deliverables/v1/php2shell_final.mp4 -frames:v 1 -vf scale=540:-1 ${SP}/v1f_<s>.jpg for s in 8 25 31 47): flat colour, hand-drawn ink lines from our kit (read ${ROOT}/docs/ENGINE.md, ${ROOT}/src/lib/sketch.ts, ${ROOT}/src/lib/kit/index.ts and reuse kit pieces such as Window, Building, Icons where they fit), no gradients, no paper edge at the top.

Palettes: read ${ROOT}/docs/look/PALETTE.md and ${ROOT}/docs/look/palettes.json. Make the comp take a palette prop and render three candidates: (A) "Mint & Clay 1.1", (B) "Sage Study" for the room with "Dusk" in the window (the sister-palette shift the PALETTE doc describes), (C) "Autumn Ochre". In each: one hero, one dark anchor, at most one pop (the price tag / Add to cart), following the colour jobs in PALETTE.md.

Implementation: create ${ROOT}/src/v3/StyleNook.tsx (a component with a palette prop) and register a composition "StyleNook" in ${ROOT}/src/entry-v3.tsx (1 frame, or a few seconds if you add the lamp flicker-free idle; fps 60), with defaultProps for palette A; render stills with props: cd ${ROOT} && npx remotion still src/entry-v3.tsx StyleNook ${SP}/nook_<A|B|C>.png --props='{"palette":"<name>"}' --scale=0.5. Look at them, iterate (at most 10 renders in total), and when happy render the three finals at full scale to ${ROOT}/review/look/v3_g4/nook_A.png, nook_B.png, nook_C.png. Run "npx tsc --noEmit -p ." and make sure your files add no errors. Don't commit. Return at most 8 lines: what you built, file paths, and anything you'd flag.`,
  { label: 'builder:style-nook', phase: 'Build' })
return r
