# People direction C (MODERN GRAPHIC): six new faces

**Status: an ITERATION (2026-10-30), stills only, for the owner to judge.** It is a look doc for direction C
(`dir_graphic.md`), below the playbook, `DIRECTION.md` and `CRAFT.md`, and it changes no other doc. The sheet is
`faces_graphic.png` (next to this file, 2400 x 3872).

**The owner, verbatim (2026-10-30):** "I actually kind of like the last one modern graphic except the face that looks
messed up". Earlier the same day: "faces we need to find a way to draw in a more generic way"; people must be
"beautiful and pleasant".

**The sheet:** one row per option, with the current mark first as the reference. Each row shows:
- her head as drawn on a 640 px figure, shown 2x: in 3/4 (yaw -34), in profile, and at a slight turn (yaw -16);
- the cast (her, the man, the woman) at film size, 1:1, at 200 px and 140 px;
- her walking in the v6 doorway at ~156 px, shown 2x (the compare sheet's crop, trimmed to her height).

Everything except the face is direction C unchanged: the same figures, light and colours, two flat tones, crisp
rounded polygons, no outlines.

**The code** is `src/look/people_dirs/graphic_faces/`. It holds copies of `graphic/`'s head, hair, headwear and cast
with the face as a variant parameter (`FaceOpt` in `head.ts`); the rest is imported from `graphic/`, which is
untouched. Render the sheet from `video/` with
`node scripts/render-frames.mjs FcSheet <dir> 0 --entry=src/entry-look-people-graphic-faces.tsx --concurrency=1 --props='{"rec":"lash"}'`.
The 3/4 head now also holds at a slight turn: below |yaw| 22 the far contour runs down the far cheek and jaw instead
of the nose and lips, because the original contour notched there.

## The options (+ strength, - risk)

- **now, the reference: the brow ridge's shade running into the nose.** - It reads as a "7": a brow with no eye under
  it and a heavy nose stroke (the realism mismatch that reads eerie). At a slight turn it becomes a bracket.
- **1 EDGE: the far contour is the face, with nothing inside.** + It is the purest generic face, and it is right in 3/4
  and in profile, where the nose, lips and chin are the edge. - At a slight turn it is a blank oval, the mannequin
  that `design_research.md` §11.1 warns about, so it needs the rule "never nearer the front than ~25 degrees".
- **2 LASH: closed-eye lash lines and a short, soft nose hook.** + It is the only option that reads as a finished,
  beautiful face at every angle: serene lowered lids and a slim nose, with no eye colour, brows or mouth. At film size
  it falls back to EDGE by itself. - It draws eyes (two lines in 3/4 and at a slight turn, against
  `paint_recipes/people.md` §c's one line). If everyone's eyes are lowered it reads as a mood, so a film needs a
  reason: a phone, a cup, the street. In profile the hair has to be tucked behind the eye.
- **3 GLOW: ONE warm tone (the skin turned toward rose) on a plane along the cheekbone and on the lips.** + It adds
  warmth and life without a line: the "faceless portrait" look. - It reads as make-up on a doll. At a slight turn the
  planes look like blush marks, they vanish at film size, and it is the least "cool NYC/LA" of the six.
- **4 SHADES: oversized sunglasses as the default face, with one streak and the nose hook below.** + It is the
  coolest and the most robust option: the only face that still reads at 140 px, and the current street accessory.
  - It becomes a costume when everyone wears them (research: about 1 in 3 people outdoors, in daylight), and it is
  wrong at night and indoors (the v6 doorway is an evening).
- **5 BRIM: a cap whose crisp brim shadow falls over the eyes, with the nose hook below.** + It is a strong silhouette
  change that reads at film size, it hides the eyes naturally, and a cap with the long coat is a current look. - It is
  an outfit choice, not a face (a cap on everyone), and at a slight turn the shadow band can read as a visor.
- **6 TURN: the face turned away.** In the lost profile the nose's tip and one lash flick peek past the cheek; in
  profile the hair comes forward over the eye. + It is the most elegant and fully generic option, the hair carries the
  person, and it is already the playbook's staging for the "you". - It is a staging rule rather than a face: no
  reactions, and the camera stays behind her. The man's and the woman's back views are not built yet (the sheet
  shows them as EDGE).

**Sizes.** On a 640 px figure the lash is about 10 x 2 px and the nose hook 5 x 11 px. At 200 px they are 3 x 0.6 px
and 1.5 x 3 px: only a hint. At 140 px the face shows nothing but the contour, the sunglasses or the cap. Below
~200 px, EDGE, LASH and GLOW are the same figure.

## Recommendation: 2 LASH, as one part of a system

- **LASH is the face whenever a face is seen:** 3/4, a slight turn, and close shots. It is the only option that reads
  beautiful rather than blank or odd at every angle on the sheet.
- **The level of detail:** below a ~200 px figure (a skull under ~26 px) the lash and the nose hook drop out, and the
  face is EDGE.
- **SHADES and BRIM are accessories, never a default:** about 1 in 3 people outdoors in daylight, and a cap where the
  look has one.
- **TURN stays the default staging for the "you"** (playbook), with the lash flick in the lost profile.
- **GLOW is not used.**
- **Next, if picked:**
  - check the open-lash variant (straighter, the same flick) for "looking ahead";
  - check the in-between yaws in motion;
  - build the man's and the woman's back views.

**What this would ask (proposals, the owner's call):**
- `paint_recipes/people.md` §c allows one closed-eye line; LASH draws two lines in 3/4 and at a slight turn.
- `dir_graphic.md` §5: LASH and the nose hook replace the mark.
