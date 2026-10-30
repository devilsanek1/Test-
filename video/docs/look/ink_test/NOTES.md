> **History of a look iteration.** Its comparison with video 1's line is the owner's own limit ("too rough"), kept
> as a measurement only: never a picture to look at or copy (owner, 2026-10-30: "don't reference video 1 - i think
> this would put agents in a box again"). When a treatment is picked, its recipe goes into the look docs without it.

# Ink lines, a bit rough but clean: notes (iteration, 2026-10-30)

**The ask** (`BRIEF.md`; the owner: "so i like a bit of rougher ink style but our video 1 was too rough not looking
clean or premium. If you can come up with a clean way to incorporate a bit of messiness in the lines combined with all
the painting and styles and texture we added with it looking coherent - sure lets try"). An ITERATION: one agent, stills
only, no panels. Until the owner picks a treatment, "no outlines" (DIRECTION rule 4) stands: nothing here changes a rule.

| File | What |
|---|---|
| `compare.png` | THE SHEET. Row 1 at phone size (360 px wide): video 1's frame, the control (v7a, no lines), A, B, C. Rows 2-4 at 1:1: the doorway (her, the lamp), the boat and Pip, the near table and chair |
| `control_v7a.png`, `control_v7a_360.png` | the control: v7a exactly as committed (`paint_still_v7a.png`, the same bytes) |
| `ink_A.png`, `ink_B.png`, `ink_C.png` (+ `_360.png`) | the three treatments at full size (1080 x 1920) and at 360 px wide |

Code (new, `src/look/ink_test/`; v7's code is called, never edited): `run.sh` (end to end, about 2.5 min, seeded: the
same bytes on a rerun), `trace.py` (WHERE the lines go), `ink.py` (HOW they are drawn: the three treatments),
`sheet.py`, `inkcommon.py`. From `video/`: `bash src/look/ink_test/run.sh <scratch>` (`--from=trace|ink` to resume).
It renders v7's `V7S1` (look `v7a`) with and without captions plus every lined segment alone on a black and a white
slab (v7's `render_many.mjs`, one render at a time); the ink goes between the paint and the captions. Needs
`opencv-python-headless` (the light proof's `common.py` imports cv2 too).

## 1. Sources (brief research) and what each taught
- **Inking line weight** (Proko, "How to Draw with Line Weight" and its light-and-shadow demo, proko.com; Sessions
  College, "Line Control 3: Using Line to Communicate Lighting"; Chris Wilson Studio, "How to Draw Line Weight"): thin
  on the lit side, fuller on the shadow side and undersides; "a super thin, or non-existent line on the light side
  gives the impression of a glow" (the lost edge where light hits); a little more weight where one form overlaps
  another; weight carries form, not decoration. -> our light logic: thin and broken where the paint is lit, x0.78 on
  top edges up to x1.22 on undersides.
- **Ernest & Celestine** (Animation Obsessive, "The Look of 'Ernest & Celestine'"; Cartoon Brew's feature preview;
  Academy of Art's making-of): the backgrounds were inked over a blue-pencil sketch, then watercoloured; the characters'
  lines left "open" and spontaneous, yet the director wanted "very clean lines, minimalist yet accurate", emotion "in
  just a few lines", the look resting "on the dynamics of the line and the balance of the forms". -> our economy: about
  half of v1's strokes; the life is in each stroke's taper and breaks, never in more strokes.
- **Wolfwalkers** (Cartoon Saloon; interviews and reviews: Film Stories, M&E's "The Myriad Animation Styles Within
  Wolfwalkers"): two cleanups in one film: the town "chunkier and blockier", the forest and the wolves "rougher", their
  construction lines and brush strokes left visible, while the human cast stays "mostly cleanly rendered". -> rough
  is a dose you place, not a filter: the subject stays clean; construction marks only as a few kept guides (C).
- **Coloured lines** (Clip Studio Tips, "Making Self-Coloring Line Art"; Graphixly, "Creating Colored Line Art"; the
  anime colour trace): a line in a darker, less saturated version of the colour it bounds sits IN the painting; one
  black line sits ON it. -> A's colour trace; B and C's one warm ink GLAZED by the paint (multiplied, as a wash laid over
  an ink line does), so the line takes each object's own hue and is never near-black.
- **Puss in Boots: The Last Wish** (AWN; VFX Voice): hand-drawn 2D marks laid over the CG lighting "brought back the hand
  of the artist", a hard 2D edge beside the soft volume. -> the line is the hand-made layer over a calm painted light,
  and it respects that light.
- **Video 1, what was too rough** (`style_bible.md` §3-4, measured): near-black `#2B1B0A` ink on everything at 3.4 px
  (4.8 bold), overshoot 3-15 px at corners and 30-62 px past the panel, doubled strokes 14-17 px apart plus re-strokes
  3-8 px off, 20-40 % of every contour left open, fills misregistered 2-5 px, weight by depth, specks and ticks, 140-232
  strokes per Mpx. **Kept out of every treatment:** near-black, overshoot over 6 px, doubled strokes (a rule removes any
  stroke within 6 px of one already kept), misregistration (the ink sits on the paint's own edges), specks (no stroke
  under 10-30 px), hatching and ticks.
- **The owner's references** (`refs_human_scale/`, `refs_paint/`, `poster_refs/`): painted, mostly lineless; the posters
  draw fine lines only where a thing IS a line (railings, eaves, bars). The ink has to join that calm painted world, not
  replace it: no line in the sky, the clouds, the water, the light's shapes or the caption band, in any treatment.

## 2. Where the lines go (`trace.py`, the same for all three; the treatments then select)
From each segment's flat design (keyed, unlit): **sil** the silhouette where nothing later covers it; **bar** a thin dark
feature (window bars, posts, frames: up to ~5 px across) traced ONCE along its centre; **int** an interior colour step
(dE >= 10-14 by segment). Thinned, cut at junctions, smoothed (no pixel stairs), split at corners over 42 deg (an inker
lifts the pen at a corner), resampled at 1.5 px. 493 strokes traced (238 per Mpx: v1's count), never in the sky, clouds,
water, shadows or the caption band. Each treatment keeps a share of them (economy below), then `no_doubles` (bars first,
then silhouettes, then steps, longest first). Selection: the fallen leaves get no line (no specks); our quay only its
coping edge (it stays one quiet mass); the wing's interior steps only on its frontal structure (within 14 deg of the
axes) or near the focal (the lit doorway); the far city and bridge in C only, faint.

## 3. The three treatments, recipe in numbers (`ink.py` `TREATMENTS`; px at 1080 wide)
| | **A: fine liner, colour trace** | **B: brush pen, glazed ink** | **C: sketch ink, construction marks** |
|---|---|---|---|
| The idea | the cleanest: a fine line in each object's own deep colour | a real ink line with weight and breaks, glazed by the paint | B with more hand: drift, longer tapers, kept guides |
| Strokes / Mpx (short < 40 px) | 86 (21) | 117 (42) | 118 (42) + 12 construction marks |
| Line length / Mpx | 8.3 k px | 9.3 k px | 9.4 k px |
| Ink pixels (coverage > 0.5) | 1.7 % | 2.3 % | 2.4 % |
| Where | silhouettes >= 24 px, bars >= 40 px, structure steps >= 60 px; small details only within 120-160 px of the focal; planes 0-3 | silhouettes >= 16 px, bars >= 22 px, the wing's structure >= 26 px, other steps >= 18 px, details within 200 px of the focal; planes 0-3 | B + the bridge and far towers (silhouettes >= 60 px) at 30 % opacity |
| Core width, near / bank / subject plane / canal plane | 2.8 / 2.4 / 2.2 / 1.5 | 4.2 / 3.6 / 3.2 / 2.0 | 4.4 / 3.8 / 3.4 / 2.1 (far 1.4) |
| By kind (sil / bar / int) | x1.0 / 0.85 / 0.7 | x1.0 / 0.8 / 0.62 | x1.0 / 0.8 / 0.62 |
| Pressure | touch-down 55 % over 5 px, lift to 8 % over 12 px, +-6 % (wl 80 px) | touch-down 50 % over 6 px, lift over 22 px, +-20 % (wl 60) | touch-down 45 % over 5 px, lift over 26 px, +-28 % (wl 48) |
| Hand drift (never jitter) | 0.35 px, wl 95 px | 0.6 px, wl 70 px | 0.95 px, wl 55 px |
| Light | thins to 50 % from L* 80 (bright side), lost (a gap) above L* 88 | thins to 60 % from L* 82, lost above 90 | thins to 55 % from L* 82, lost above 89 |
| Undersides vs tops | x1.22 / x0.78 (all three) | | |
| Breaks on long lines (> 90 px) | none (only where the light eats the edge) | 1 per 260 px, 5-14 px | 1 per 170 px, 4-18 px |
| Corners | stop short 0.5-2 px on half; never past | overshoot 1-3 px on 30 %, stop short 1-3 px on 25 % | overshoot 2-6 px on 45 %, stop short on 20 % |
| Colour | colour trace: the darker side's colour, L* -24 (>= 12), chroma x1.3, opacity 0.92 | one warm plum-sepia ink Lab(44, 17, 4) multiplied by the paint, opacity 0.92 (on the facade, L* 42 -> ~14; on the lit lobby, 92 -> ~41) | ink Lab(42, 18, 6), multiplied, 0.94 |
| Far planes (opacity, width) | canal plane x0.55, x0.75 | x0.5, x0.7 | x0.5, x0.7; far city x0.3, x0.5 |
| Dry edge (coverage against the paper's tooth) | 0.12 | 0.35 | 0.6 |
| Construction marks | none | none | 12: the longest straight structural strokes carried 20-60 px past an end, 1.0 px, opacity 0.26, +-1.4 deg off-angle |

## 4. How they look (my eye, at 360 px first, then 1:1, beside video 1 and the references)
- **At phone size** A reads only as a crisper drawing (most people would not name a line); B and C read as an ink-and-wash
  illustration: the facade's frames, the lamps, the door, the boat and the table drawn by a hand. B and C are close at
  360 px: C's extra drift, breaks and guides are mostly a 1:1 difference.
- **At 1:1** A is clean and premium, closest to the posters' fine lines; B has the "bit of messiness" the owner asked for
  (tapers, a few lifts, tiny corner misses) and stays clean; C starts to look sketchy at the windows (the guides and
  the drift read as unfinished up close), the nearest of the three to video 1, though still far from it.
- **None looks like video 1:** a third of its stroke count or less per Mpx, no near-black, no overshoot over 6 px, no
  doubled strokes, no open contours, no misregistration. The paint, the light and the captions are untouched.
- **What the low key does:** in v7a's T3 key most edges sit in shade, where any dark line is dark on dark. The ink
  reads where the paint is lighter (the lit doorway, the boat, the sky line, the near table) and goes quiet in the
  shade masses: lost and found from the light itself. A higher-key frame would show more of the line.

## 5. Recommendation: B, the brush pen glazed by the paint
B is the only one that answers both halves of the ask at the size the owner judges: the ink is visible at phone size (A's
is not), and its messiness lives in each stroke's taper, lifts and tiny corner misses, never in the stroke count, the
overshoot or doubled lines (C's construction marks and drift tip toward video 1 up close). The glaze keeps it coherent
with the paint: one ink multiplied by the paint takes each object's own hue (plum on the facade, warm on the gold door),
as a wash laid over an ink line does, so the line belongs to the painting rather than sitting on top of it. Two ideas to
carry from the others: A's finer weight for the subject plane's interior details if B feels heavy on the windows, and C's
construction marks only in the opening's draw-on (the guides drawn, then the ink, then the colour washing over them,
never left in the held frame).

**If the owner picks a treatment, these change (nothing changed now):** DIRECTION rule 4 ("No outlines on any tier"),
CRAFT §c ("Edges, not outlines", the line budget), the retired "line weight by depth" (B's planes thin with distance),
rule 9 (the frame-0 line stays under the colour instead of going under its fill), the playbook's INK LINES bullet.

**For production (not done here):** the strokes are vectors (polylines with a width per point), so an `<InkLayer>` can
draw them as SVG paths inside each plane's float group (locked to the layer, riding the parallax) and draw them on
stroke by stroke in frame 0. Better still, ink each film's shapes from the design's own paths, with an inker's choices,
instead of tracing a raster: tracing gives the right first read but a few stubs (window contents, glass glint edges).
Twinkle (CRAFT §c): B's cores are 2.0-4.2 px; only the tapered ends go under 2 px. The dry-edge tooth must be locked per
layer, never to the screen. A's 1.5 px canal-plane line would need 2.0 px on a floating plane.

**Weak spots (honest):** traced from the raster design, so some short strokes sit on window contents and the edges of
glass glints; her outline at the focal makes her a touch more cartoon than people direction C's crisp, lineless figure
(an open call); the far city stays lineless except in C; stills only, nothing checked in motion (twinkle, boil, the
draw-on); v7a's paper (step 5) is not in v7a, so the ink's tooth stands in for the paper here.
