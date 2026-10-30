# PROPER LIGHT: one story light, done properly (research and engine spec, 2026-10-30) — DRAFT (numbers pending)

The owner (2026-10-30), on our list of the 10 biggest differences between still v6 and the references: "I noticed this
too the light source yes - can we do the proper lights?" The playbook rule this feeds: "PROPER LIGHT: one story light
per scene, done properly" (`docs/OWNER_PLAYBOOK.md`).

## 2. How the pros build light that reads (research; methods only, never a style target)

### 2.1 One story light
- Lighting is a storytelling device before it is physics: its first jobs are to lead the eye to the story and to set
  the mood, then to model form and say the time of day (Pixar's lighting course, SIGGRAPH 96, source 12).
- The 2D feature that took light furthest kept the vocabulary tiny. Klaus's light-and-shadow tool reduced light to
  five terms an artist could paint with: key, bounce, ambient, occlusion and rim, and the artists "paint directly with
  light" rather than simulate it (source 1). Fortiche's series overrode automated lighting with hand-designed light
  and "hero lighting": the light on a character need not match the room when the story needs it (source 16).
- In the owner's references the one source IS the story: 02's red shelter lamp, 03's phone glow on the girl, 01's
  sunset line behind the towers, 04's glowing cloud over the girl. Everything else sits in a few shade masses.
- **For us:** one KEY per set (the direction for everything) and ONE STORY LIGHT on the subject per scene, the
  brightest thing below the sky, within 0.15 H of the subject (CRAFT §d.2's check); secondary lights (lit windows, far
  lamps) stay at least a step under it.

### 2.2 Falloff
- A point source falls off with the square of the distance; on a floor under a lamp at height h the light goes as
  cos^3(theta) / h^2 (the cosine-cubed law of lighting design, source 10), so a pool is bright under the lamp and fades
  fast at first, then slowly. An area source (a lit doorway, a window, a screen) falls off more slowly near it (about
  1/d close to the opening) and like a point far away.
- Painters compress the curve: a bright core, a quick first drop, a long gentle tail, and the tail TINTS what it reaches
  (the aura colours nearby surfaces, source 17).
- **For us:** falloff is a real curve (cos^3 for a lamp's pool, 1/d then 1/d^2 for an opening), applied as a smooth,
  dithered ramp in a baked light map or as a gradient fill, never as concentric rings; a flat-world pool keeps CRAFT
  §d.7's two steps only where a hard pool is the design.

### 2.3 Rim light and light wrap
- A rim is the thin bright edge where a form turns away from us toward a light behind or beside it. It is brightest
  where the surface faces the light, thicker on soft or thin parts (hair, a scarf, cloth), thinner on hard edges, in
  the light's own colour; an even rim all round reads as an effect and pulls focus (source 18).
- Light wrap is the compositor's version for a subject in front of a bright background: blur the background until only
  its light is left, keep it to a band just inside the subject's edge, add it (screen or plus), with controls for the
  band's width, intensity, which brightness wraps (a luminance tolerance) and saturation (source 3). It is what makes a
  figure in a lit doorway belong to the light behind her rather than look cut out.
- **For us:** a rim from the shape's own distance field: the band inside the silhouette within w px of its edge,
  weighted by (n . l), the edge's outward normal against the direction to the light; light wrap where the subject
  stands against the story light's source.

### 2.4 Glow and bloom, done tastefully
- Bloom is light scattering in the lens and the eye. The modern recipe is a chain of blurs at doubling sizes, summed
  and added back, with no hard brightness threshold, so the glow falls off naturally and never shows a ring (Jimenez,
  SIGGRAPH 2014, source 5).
- Japanese animation's compositing stage (撮影, "photography") treats light as its own layer: 透過光 (transmitted light,
  originally the cel lit from below and double-exposed) for suns, beams, fire and glints, coloured with パラ (coloured
  paraffin paper) for bleed and tint; at ufotable the light "propagates through the shot", bouncing and leaking into the
  lens as bloom, and the gradients are added in compositing (source 2).
- A painter's glow is a core plus an aura that tints what it touches, and it reads only against darker values: a glow
  on a light field is invisible, an overdone one reads as fog or a spotlight (source 17).
- **For us:** bloom only AT emitters (the sun, a lit opening, a lamp, a screen) and at their mirror images in water,
  never on lit surfaces; three sigmas of about 0.1, 0.4 and 1.2 x the source's size; at most +6-8 L* at the source's
  edge, +2 at one source size away, nothing past three; in the light's colour; never in the caption band; never a
  disc or ring.

### 2.5 Light shafts
- The real-time recipe accumulates, for each pixel, samples along the ray toward the light's screen position over an
  occlusion image, with a decay and a weight (Mitchell, GPU Gems 3 ch. 13, source 6). It is the 2D form of what a
  painter does: lighter, soft-edged wedges in hazy air, seen only against darker things.
- Crepuscular rays are parallel; perspective makes them fan out from the sun's image (and meet again at the antisolar
  point), so in a picture they radiate from the sun (source 11).
- **For us:** at most two or three soft wedges from the source's image, +2-4 L*, fading along their length, never
  across the caption band or the focal point, only where the air is dark enough to show them.

### 2.6 Cast shadows and light pools
- Under the sun, shadows are parallel in the world and converge in the picture on a vanishing point on the horizon
  straight below the sun (in front of us when the sun is in frame, so the shadows come toward us); under a lamp they
  radiate from the point on the ground below it. The tip of any shadow is where the line from the light through the
  top meets the line from that foot point through the base (source 11).
- 2D engines build light the same two-layer way we can: an ambient darkening of the whole canvas (Godot's
  CanvasModulate) plus lights added on top (Add, Mix or Subtract), shadows cast by occluder polygons; Unity's 2D
  renderer blends light textures by style (multiply and additive, at most four and usually two per scene, because each
  style costs a pass) (source 7). Ori's sequel painted a light mask on every surface so the world reacts to moving
  lights (source 20).
- **For us:** shadows by projective construction (exact in our perspective); pools as the source's opening projected
  onto the ground with a real falloff; a caster's shadow from the story light cut out of that pool.

### 2.7 Local lights as story lights
- A lit doorway is an area light behind an opening: a spill on the ground shaped like the opening thrown forward, a
  glow at the opening, a wrap and a rim on whoever stands in it, light on the jambs and the soffit, its column in the
  water. A lamp is a small hot core, a halo, an elliptical pool and shadows radiating from its foot. A phone is a tiny
  cool source that lights only the face, hands and the near front (03's couple: the only cool light in a violet world,
  so the eye goes there).
- **For us:** every local light gets the same bundle (core, bloom, spill, the subject's wrap and rim, its reflection),
  and only one of them is the story light.

### 2.8 The colour of light and shadow at dusk
- A low sun's light crosses more air, so the short wavelengths scatter out and the light turns gold to orange (golden
  hour, roughly 2000-3500 K); the shadows are lit by the blue sky, so they lean cool and violet, unless warm bounce
  dominates and the sky is blocked, when shadows turn warm (sources 4, 19). After sunset the world is lit by the sky
  (cool) and every lamp reads warm.
- **For us:** gold light, lilac shade with its chroma kept (CRAFT §d.3: warm surfaces turn toward rose and plum, cool
  ones toward violet), warm bounce under things near a warm ground, and the story light as the one hot accent of the
  colour key.

### 2.9 How light moves in animation
- Klaus tracked its light and shadow shapes to every drawing and in-betweened them, so the light rides the character
  and never boils (source 1). Ori's painted light masks make the world answer a moving light (source 20). Anime pulses
  and flickers transmitted light on story beats (source 2).
- **For us:** a source never moves between cuts (CRAFT §d.1); static light is baked per plane and rides its plane in
  the float; light on a mover is computed from its pose every frame (a function of t only); a light switching is a
  one-frame pop on its story beat, and a light that follows its cause (doors sliding open) changes with that motion.

## Sources (methods only; read through search summaries: the session's network blocks direct page fetches)
1. Klaus / KLaS: animatorsguild.com/?p=5287; cartoonbrew.com/feature-film/how-klaus-draws-on-centuries-old-artistic-principles-to-push-2d-animation-forward-182325.html
2. Anime compositing: animenewsnetwork.com/feature/2018-01-10/interview-yuichi-terao-chief-of-ufotable-digital-team/.125658; neec.ac.jp/tuitionfreedat/syllabusdat/pdf/2021/hac/21LA038.pdf
3. Light wrap: learn.foundry.com/nuke/14.1/content/reference_guide/draw_nodes/lightwrap.html; natron.readthedocs.io/en/v2.4.2/plugins/fr.inria.LightWrap.html
4. gurneyjourney.blogspot.com/2008/01/golden-hour.html; gurneyjourney.blogspot.com/2014/09/complementary-shadows.html
5. iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare/
6. developer.nvidia.com/gpugems/gpugems3/part-ii-light-and-shadows/chapter-13-volumetric-light-scattering-post-process
7. docs.unity3d.com/Packages/com.unity.render-pipelines.universal@15.0/manual/LightBlendStyles.html; docs.godotengine.org/en/4.5/tutorials/2d/2d_lights_and_shadows.html
8. w3.org/TR/compositing-1/; developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDiffuseLighting
9. theoryofcomputing.org/articles/v008a019 (Felzenszwalb and Huttenlocher 2012)
10. schorsch.com/en/kbase/glossary/point-by-point.html
11. scientificamerican.com/article/what-are-crepuscular-rays; studiochalkboard.evansville.edu/lp-shadow.html
12. history.siggraph.org/wp-content/uploads/2021/08/1996-30-Contents-Pixel-Cinematography-A-Lighting-Approach-for-Computer-Graphics.pdf
16. redsharknews.com/why-netflixs-arcane-looks-so-good-how-fortiche-ramped-up-the-animation-pipeline
17. instructables.com/How-to-Draw-Light; tips.clip-studio.com/en-us/articles/1178
18. muddycolors.com/?p=43890; glass.photo/photography-terms/rim-light
19. en.wikipedia.org/wiki/Golden_hour_(photography)
20. wccftech.com/ori-and-the-will-of-the-wisps-dynamic-lighting/
