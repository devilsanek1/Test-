# People v4, bodies: poses, hands, clothes, proportions (the stills, 2026-10-30)

**Status: DONE for this iteration** (stills and one motion strip, no video file; the orchestrator looks before the
owner). Brief: `../BRIEF.md`; research, plan and log: `../NOTES.md`. The v4 hair and faces are untouched (the heads sit
on the new body's head frame exactly as before). One glance at all four: `contact_sheet.jpg`.

## The stills (what to look at)
| Still | What it shows | Look at |
|---|---|---|
| `01_her_before_after.png` (2880 x 1390) | Her evening look three ways: direction C now (LASH), the v4 stand-in body (the hair round's tee and slim trousers), the NEW body; each in front 3/4, walking profile and from behind at 640 px, then at film size (200 and 156 px) | The same look (the long open coat, the light column, the copper hair), now with weight, fall and hands? The coat in two panels hanging straight from sloping shoulders, the column showing in its open front? |
| `02_cast.png` (2400 x 1800) | The six people in their clothes at one scale (3.55 px a cm, 150 / 170 / 190 cm marked), each in a pose: her (the coat, contrapposto, a hand in the pocket), W1 (a chocolate knit, straight indigo jeans, slim sneakers; walking), W6 (the big cloud shirt tucked into washed wide jeans, the sleeves pushed up, pink flats), W4 (a burgundy tee tucked into butter wide trousers, both hands in the pockets), M1 (the caramel suede jacket open over a cream tee, navy trousers, Chelsea boots), M2 (a sage knit, dark jeans); six hands close (the figures drawn 1500 px tall); each person at film size in three views | Would a regular viewer call them slim, modern, well-dressed adults? Hands that are hands (a thumb, a finger mass with separations, the wrist's taper), never paddles? Her waist and hips (W6, W4), his V (M1), sloping shoulders, slender necks? |
| `03_poses.png` (2400 x 1990) | The pose library beside the owner's references: standing (ref 03's girl), walking (ref 02), leaning back on a quay rail with the ankles crossed (no reference), seated on a ledge (ref 05), seated on the ground hugging the knees, from behind (ref 01) | Each pose natural, with weight and gesture, never stiff? The seated and the ground poses near the references' posture (we take the posture, never the character)? |
| `04_walk_strip.png` (2400 x 1290) | Her walk in profile, eight frames of one cycle (contact, down, passing, up, each side; 1.10 s a cycle at 60 fps, ~0.87 m/s, the camera tracking), and the same frames at film size | Weight in the walk (the down, the push-off)? The arms loose, swinging against the legs? The coat's front panels swinging with the knees and the hair trailing, never a stiff column? |
| `contact_sheet.jpg` | The four stills at a glance | |

## What the round built (code: `video/src/look/people_dirs/people_v4/` and `hair_v4/asm_*`)
- **Poses with weight** (`skel5.ts`). The torso is authored upright (the recipe's rings) and mapped into the pose: lowered
  (seated), leaned about the hip joints, its upper back rounded about the waist; the contrapposto lives in the pelvis
  and chest frames (the weight hip up 6 degrees, the shoulders 4 the other way, the pit of the neck over the weight
  foot, the free knee eased forward and turned out: A2's gentle end, never the hip-out stance); the limbs by two-bone
  IK with poles. The walk is a real cycle (stance 62 %, swing 38 %; heel strike, flat, heel off on the ball, the swing;
  two bobs a cycle; the hips turn and drop, the shoulders counter-turn; the arms swing +-16 degrees against the legs
  with the forearm lagging). The shoulder joint now sits an arm's radius inside the shoulders' width, so a sleeve
  meets the shoulder line instead of standing out past it.
- **Hands** (`hand5.ts`). Six authored drawings (back, palm, thumb side, little-finger side, grip, resting edge-on),
  picked by the hand's 3D frame as the camera sees it and placed along the hand's foreshortened axis: a palm, one
  finger mass with two separations (index | middle, ring | little) and the thumb's inner edge as tapered slivers (from
  ~26 px a hand), the thumb its own lobe with a notch at the web, the wrist narrower than the knuckles, the fingers in a
  relaxed curl; lit on the key side with a crisp shade plane, the curl a touch deeper.
- **Clothes with fit, fall and folds** (`body5.ts`, fashion.md §3-4). The long coat in two panels, each drawn only where
  it faces the camera (so the open front always shows the column between them), lapels to the break, hanging straight
  from the shoulders, each front panel kicked forward by its own knee in a stride (the back stays one cloth); the hip
  jacket the same way; the knit (relaxed, the rib at the neck, the cuffs and an untucked hem), the tee (fitted, a short
  sleeve), the big shirt (roomy, the open collar's V and wings, the sleeves pushed up and bunched); tucks under a
  waistband with the blousing above it; wide trousers falling from the hip (the knee only nudges them), straight
  trousers, straight jeans (the fade down the thigh, the stack at the hem); shoes as designed side profiles (the toe
  box, the vamp, the collar's dip, the rounded heel; the sneaker's light sole band): pointed flats, loafers, slim
  sneakers, Chelsea boots. Folds are value slivers at tension points by size (C7): the coat's drop fold and the shoulder
  blades' drops, the inner elbow, the tuck, the stride's pull to the forward knee, the hem's break, the knee behind a
  seated leg.
- **The light that joins it** (`asm_bodies.ts` person6): the hair's and the head's soft casts as before, plus the body's
  own (the near arm on the torso, the open coat on the column inside it, the top on the trousers, the hair on the coat's
  back from behind), the rim on the shoulders' top edges, contact shadows under the feet and the seat; props for the
  poses (a stone ledge, a quay rail in 3D, a hilltop).

## My look, beside the references, at full and phone size
- **Natural, with weight:** yes for the walk (it reads at once as a calm, elegant walk, in the strip and at film size),
  the lean (the cleanest new pose: the seat on the rail, the crossed ankles, the arm back on the rail) and the two seated
  poses (ref 05's rounded back and hanging legs; ref 01's compact hug of the knees, read from behind by posture alone).
  The standing contrapposto is real in the skeleton but quiet in the picture: the coat and the wide trousers hide the
  hips, so her stance reads calm rather than shifted (like ref 03's girl); W6, W4 and M2 show the weight shift more.
- **Hands:** they read as hands at 640 px and in the 1500 px close-ups (a thumb, the separations, the curl, the wrist),
  and as a wrist, a mass and a thumb lobe at film size; never paddles. The rail grip is the weakest drawing (a fist
  shape).
- **Clothes:** the six looks are distinct and current at one scale and at phone size (a 1080 frame seen 360 wide: the
  coat's column, the tucked shirt, the jacket over the tee, the butter wide trousers all still read). The torso
  garments are still smooth lofts (direction C's two flat tones), so the folds are few and quiet by design.
- **Proportions:** slim, long-legged adults; her waist reads wherever a top is tucked (W6, W4, her column), his V in the
  jacket (M1); sloping shoulders that round into the sleeves; the neck slender and tapering, the head upright on it.

## Still rough (honest) and the owner's calls
- The coat's far front panel in the standing 3/4 is a narrow band (the geometry of a body-shaped coat at 3/4); at -44
  degrees it reads as the coat's far side, at -58 it would read as a stick, so the standing 3/4 is drawn at -44 (the
  head turned to the face's designed 3/4).
- The shoes are designed profiles only from the side; a foot pointing at the camera falls back to a hull (rare in our
  views). The white sneakers seen hanging (the ledge) are the brightest thing in that panel.
- No accessories yet: her teal bag (direction C's accent) is not drawn on the new body; the next round's (the strap and
  the bag under the arm are a prop on the same skeleton).
- The 3/4 heads keep the faces round's one drawing at -36 (a turn swaps drawings), as before.
- **Your calls:** (1) the six looks (fashion.md picks: is each one a look you would cast?); (2) the seated-on-the-ground
  pose as a hug of the knees (ref 01) or the earlier open one (a hand flat on the ground behind); (3) her standing 3/4
  calm (as now) or with a stronger, visible weight shift.

## Rebuild (from `video/`, one at a time)
`node scripts/render-frames.mjs B6Before <dir> 0 --entry=src/entry-look-people-bodies4.tsx --concurrency=1` (also
`B6Cast`, `B6Poses`, `B6Walk`; `B6Dev` is the design desk); the frame lands as `<dir>/f00000.png`, copied here under the
names above. The reference crops: `python3 docs/look/people_design/bodies_v4/stills/refs_crops_bodies.py` (writes
`src/look/people_dirs/people_v4/refs5.ts`). Code: `people_v4/skel5.ts` (poses), `hand5.ts` (hands), `body5.ts` (the dressed
body), `hair_v4/asm_bodies.ts` (the person, the cast's outfits, the light, the props), `hair_v4/asm_sheets_bodies.tsx`
(the stills). The earlier stills (`../../hair_v4/final/`) rebuild unchanged: `body.ts`, `assemble.ts` and `asm_people.ts`
are untouched.
