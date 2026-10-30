# Video 4: style adjustments to the visual script (owner-approved, 2026-10-30)

**The owner** (2026-10-30, in the city-poster study session https://claude.ai/code/session_01YGLGMqbgdpycjemYZL3aoL,
after sending this script as `Helsinki_Visual_Script.zip`): "What do you think about this script / Would it fit into our
style?", then, on the answer below: "Commit the adjacentment to the story script to the story 4".

**Status:** the STORY stays as written (12 shots on the 42.24 s take, one camera, the warm-water thread, the planet move,
the loop). The PICTURE is translated into the look the owner set on 2026-10-29/30 (playbook: PROPER LIGHT; PAINTED
PIECES; ORGANIC, NOT GEOMETRIC; SCENE COMPOSITION; DEPTH AND SCALE FROM A HUMAN VIEWPOINT; People ... BEAUTIFUL; the
designed view ON HOLD). Fold these into `VISUAL_SCRIPT.md` at its next pass, before G3; the owner's own questions in
it (the un-draw after the hook; the computer's size) still stand.

## The adjustments, by shot
1. **S1, S2, the loop: the pen becomes a brush.** Frame 0 still draws itself on the first word, but as PAINT laid on in a
   painter's order (the sky washes, the harbour and the far city, then the street, the block and the window), never
   outlines (no tier draws an outline now). The S2 un-draw and the loop's un-draw are the same reveal run backwards
   (`src/lib/paint/reveal.tsx`, a seeded brush-mask reveal). The pen tip may stay as the cursor that leads it.
2. **S1-S2, S10-S12: no diagram cut-away.** A straight cut through the ground and a cut wall read "square and proper".
   Show the heat organically: the melt line in the snow above the pipe (already in the script), steam from grates and
   manholes along the run, a warm glow through the snow over the pipe, frost clearing on the window as it warms. If a
   cut is kept, it is a soft, irregular, painted cut of snow and earth with the pipe glowing inside, never a ruled line.
3. **One colour key and one story light, all film long.** A cold blue snowy night (one family) with ONE warm accent: the
   heat. The lit window is the story light (a soft glow at the window, a warm pool on the snow, a rim on what it
   touches); the computer's small lights are a second, cooler source. Windows lighting one by one carry the warm accent
   across the city.
4. **S1, S11, S12: a person near the camera.** Depth and scale come from a human viewpoint: someone walking home through
   the snow in the foreground of the home view (from behind or in profile, about 130-220 px tall), so the world reads
   vast and the payoff lands on a person. Draw them with the new people design (cool 20-30 styling, a generic face;
   `video/docs/look/PEOPLE_DESIGN.md` when done). The S12 gloved hand and phone stay.
5. **The home view's composition: one place to look.** Group the street, the block, the computer, the harbour, the far
   city, the pipe, the box, the window, the ferry and the tram into a few value masses (a dark near street and block, a
   mid harbour, a light sky), with the lit window as the focal point; fewer props of equal weight (the playbook's "our
   scene is very busy" lesson from scene-1 v6).
6. **The giant computer as a painted, glowing monolith** in steam and falling snow (soft edges in the steam, rows of
   small lights, snow melting on its top), not a hard geometric box. Near pieces sharper, far pieces more painterly, in
   ONE painted language (never one painted object in a flat world).
7. **Painted pieces:** the night sky, snow, steam, the harbour and the far city are painted (`video/docs/look/
   PAINT_RECIPES.md`: sky and clouds, water, foliage, buildings and ground), with the organic-shape and light rules from
   `video/docs/look/ORGANIC.md` when done.
8. **S6, the planet:** a painted view, beautiful at phone size, in the same colour key, the warm accent kept on Helsinki.

## Where the look stands (the study session)
Scene-1 painter v6 (`video/docs/studies/2026-10-28_city_posters/paint_test/paint_still_v6.png`) is the latest engine
look; the owner: the gap list is right ("All you hit all your points correctly"); next v7 brings one painted language,
the story light, organic shapes, a simpler composition and one colour key. The owner's call: "Let’s try to do in engine
first without AI painted pieces".
