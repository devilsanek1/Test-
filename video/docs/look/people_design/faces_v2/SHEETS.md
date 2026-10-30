# Faces and bodies with appeal: the sheets (faces_v2, 2026-10-30)

**Status: rendered; the owner's verdict is the review (an ITERATION: no critic, no panel).** The recipe the sheets
draw: `RECIPE.md` (a draft); the evidence: `RESEARCH.md`. Drawn in direction C's language (flat two-tone shapes, no
outlines, the closed-eye lash, the hair as a clean cut) as SVG, rendered with Playwright; the sources are in
`sheets_src/` (`faces.py` the profiles as data, `draw.py` the heads, `figure.py` the film-size figures, the two
`sheet_*.py`; rebuild from `sheets_src/`: `python3 sheet_profiles.py fctest_lash_now.png`, then
`node shot.mjs sheet_profiles.html ../sheet_profiles.png 2400 <the height it prints>`; the same for `sheet_bodies.py`
with no argument). The "now" crops are the FcTest render of the current LASH heads (`sheets_src/fctest_lash_now.png`).
The hair on every drawn option is one neutral clean cut (the hair round decides the cuts), so only the face, the ear
and the neck change between panels.

## `sheet_profiles.png` (2400 x 2610)

| panel | what it shows | what the owner should look at |
|---|---|---|
| Her row 1, REF 05 | the blue-cliff woman's head, enlarged (the image is small and soft) | the target feeling: a small face low on a big head, a tiny lifted nose, a short jaw, the ear showing |
| Her row 1, NOW: LASH as built | her profile as the code renders it today (FcTest, 3x) | the long straight nose, the sunken lips, the receding chin, the long low jaw |
| Her row 1, NOW on the sheet's hair | the same face geometry under the hair every option shares | a fair compare: what the face alone does |
| Her row 1, A REFINED | the parts fixed, the placement kept (the lash at 0.50 h) | pleasant and adult, but is it cute enough? |
| Her row 1, B CUTE (recommended) | the features 0.05 h lower, a short lifted button nose, one full lip bump, a small round chin on the line, a short V jaw, the ear | cute and appealing without reading young? Does it carry 05's feeling? |
| Her row 1, C CHIC | low like B, a straighter ski-slope nose with a crisp point, a soft pout, a pointed V chin | cooler, more fashion; does it beat B for our "you"? |
| Her row 2, NOW 3/4 as built | her 3/4 head today (FcTest) | the long lower face in 3/4 |
| Her row 2, A / B / C 3/4 | each option's 3/4 head (yaw -34): lower features, a smaller nose hook, the V jaw, the ear | does the 3/4 keep the option's character? Are the two lashes different (never twins)? |
| Her row 2, film size band | now, A, B, C as 200 px figures, profile and 3/4, 1:1 | at film size the face is only the contour: do the options stay pleasant and distinct enough, with nothing odd? |
| Him row 1, REF 03 | the student's profile from the owner's reference (principle only, never the character) | the young-manly cues: a clear brow, a straight nose, a forward chin, a long jaw with a corner, a long neck |
| Him row 1, NOW: LASH as built | his profile today (FcTest; the current code draws no hair in profile, a gap) | no brow ridge, a weak chin, a jaw with no corner: he reads as her with a longer nose |
| Him row 1, NOW on the sheet's hair | the same face under the shared modern cut (a faded side, a swept top) | a fair compare |
| Him row 1, A CLEAN (recommended) | a brow shelf, a deep bridge, a straight strong nose, a square chin on the line, a low jaw with a corner, a thick neck with an Adam's apple | manly yet friendly? Modern? |
| Him row 1, B SOFT | the gentler, younger read (a softer brow, a slim lifted nose, a long clean jaw, a long neck) | the "idol" handsome: better for some of the cast? |
| Him row 1, C RUGGED | a heavy brow, a longer nose, a wide jaw, a thick neck, a short beard as one flat tone | the mature end; the beard as an occasional casting choice? |
| Him row 2, NOW 3/4 / A / B / C 3/4 | his 3/4 heads (the jaw's angle lower and wider, the chin blunt and wide on A and C) | does A's jaw read square in 3/4 without turning heavy? |
| Him row 2, film size band | now, A, B, C as 200 px figures, profile and 3/4, 1:1 | at film size: the jaw against the neck, the short cut and the beard (C) carry him |

## `sheet_bodies.png` (2400 x 1630)

| panel | what it shows | what the owner should look at |
|---|---|---|
| HER, NOW | her current composition (§5.1 widths), front and side, 900 px tall, in a plain fitted tee and trousers; dashed lines at the shoulders, the waist, the hips | the shoulders wider than the hips (1.14), a mild waist (0.75): a box through clothes |
| HER, RECIPE (marked) | the recipe's composition: narrower sloping shoulders, a smaller waist, slimmer neck, wrists and ankles, smaller hands and feet | feminine and elegant, still tasteful and generic? |
| HIM, NOW | his current composition | a mild V (1.48), the neck meeting the shoulders with no slope |
| HIM, RECIPE (marked) | broader shoulders, a slightly smaller waist and hips (the V 1.61), a thicker neck flaring into the shoulders, a deeper chest, bigger hands and feet | manly without muscle display? |
| Film size band | the four at 200 px, front and side | at phone size: do the recipe figures read more feminine / more manly than now, and nothing odd? |

**Phone check (done):** both film bands looked at 1/3 scale (a 1080 frame on a phone). The figures read as a woman and a
man by the hair and the silhouette; the faces are only the contour, so the four face options are nearly the same at
200 px (expected: the face choice matters in the 145-320 px "you" and in close shots); the beard and the V read. The
figures are stiff planks: a pose matter, not this round.

**Where it is still rough (my own look):** the shared hair is a plain blunt fringe and fall (neutral on purpose; the
hair round's v3 cuts will replace it); the 3/4 options differ less than the profiles; the bodies' side views and legs
are simplified.
