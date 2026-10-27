# K6 canal kit (`src/v2r/kit/canal/`)

The London canal world of video 2 ("One Small Window", `docs/v2/TREATMENT.md` §2, §5, K6), made new for this film:
Google's canal wing, her brick terrace, the water, the towpaths, the S1 steps, narrowboats, the far roofs, the
newsstand and the life layer, at every size the shot list uses. Positions come from `src/v2r/world/map.ts`; colours only
from `src/v2r/palette.ts` (`CM`). Import the palette module FIRST in any entry. Barrel: `index.ts`.

**Preview:** `src/entry-v2r-canal.tsx` registers `KitCanal` (the sheet) and `CanalSample-S1/S2/S4/S8` (sets at the map's
positions; people, ghosts, Pip and boards as kit placeholders):
`GL=angle node scripts/render-frames.mjs CanalSample-S1 <dir> 5.3 --entry=src/entry-v2r-canal.tsx --scale=0.5`.

## How lanes use it
- **Sets** (`sets.tsx`): `S1Set`, `S2Set`, `S4Set`, `S8Set` are full layer stacks drawn at the shot's pose (zoom 1.00,
  screen px = world px). Put them inside your `<World>` / camera; story events are props with the TREATMENT's defaults
  (S1: `lampOffAt` 0.40, `lettersAt` 0.97, `birdsBridgeAt` 1.40, `birdsRoofsAt` 4.98 and `duckLandsAt` (both cut by the
  conform: the 4.98 hit is the row's), `busAt`; S2:
  `staffCoolAt`, `story`, `boatAt`; S4: `dxFar/dxBacks/dxPath` per-plane truck offsets, `birdsAt`; S8: `dxHouse`,
  `dxNear` (pre-truck = map `S8.truck`), `wAt` (W lights), `lampRunAt` (the lamp + string-light run)). Lanes may
  instead compose the pieces below in their own `Layer`s.
- **Slots** (`slots.tsx`): every person is a `PersonSlot` (`{id, x, y, h, pose, dir, seed, acc, gait, actAt}`; poses
  stand / walk / jog / cycle / sit / read / bust / dog / window). Wrap a set in
  `<CanalCast person={(s) => <K4Person .../>} pip={(seat) => <Pip .../>}>` and K4's people and K5's Pip replace the
  placeholders everywhere. Story slots are also props: `S1Set behindDoor / towpath / pip`, `S2Set aBoard / bench /
  storyOverlay / pip`, `S4Set towpath / pip`, `S8Set board / lane / pip`.
- **Story windows** (S2): `WingS2` draws her dark window and the five staff windows EXACTLY on map `S2` rects (states
  `lit` / `cool` / `dark` / `unlit`; `staffCoolAt` + `staffOnStagger`); `storyOverlay(w)` draws K4's silhouettes and
  blinds over each.

## Pieces (screen px; each takes a seed; deterministic, scene seconds, no opacity)
| piece | file | what / sizes |
|---|---|---|
| `WingS1`, `WingS7`, `WingFront` | wing.tsx | the wing frontal on a homography (`PlaneMap`): S1 x 330 -> right edge, coping 600 -> 640, door 540-720, canopy fascia 520-740 x 800-845, W (860, 700) 150 x 170 lit -> plum at `lampOffAt`, `doorKeys` (S1: open 0.45-0.52, shut 1.10), `lettersAt`, `behindDoor` slot; panes lit / unlit switching (`litAt`); S7 at ~72 px/m, canopy x 660-900 |
| `HandLetteredGoogle` | lettering.tsx | "Google" in ink, monoline sign-writer glyphs (no logo), letters pop one by one or draw on |
| `WingS2`, `s2x/s2y/s2g/s2u` | wall.tsx | the receding wall: columns 0-2 on the map, then one-point toward VP (1400, 700); windows 150 px -> ~10 px; the stepped tiers (~380 tiny windows, one batch) at y >= 600 |
| `TerraceRow`, `sashInto`, `doorInto`, `potsInto`, `terraceBacksInto` | terrace.tsx | two storeys + mansard (tops >= 600), her French window (teal frame, Juliet rail, blind up, lamp, `inside` slot for K4) and teal door on exact map rects; neighbours (window slots), balconies with string lights; rear elevations for S4 |
| `Water`, `copingInto` | water.tsx | bank shade, broken reflections (`reflections`, `reflTop`), ripples drifting, glints switching, `wake` |
| `Towpath` (+ `bend`), `Lamp` (`lightAt`, `pool`, `variant: 'near'`), `Railing`, `Bench`, `Bollard`, `Planter`, `Bike`, bins, drains, `Tree` | towpath.tsx | paving that is never flat, the coping and rings; heritage lamps with a 3-frame flicker on (drop it in S7's and S8's runs: each lamp switches on ONCE, flash-safe); a near swan-neck post whose arm leaves the frame (never crosses the band) |
| `Steps`, `S1_STEPS`, `S1_SEATED` | steps.tsx | S1's bottom third: coping, landing, five treads, Pip's waterline bollard (map `S1_BOLLARD`), cups, bags, a bike; seated slots in three rows (since the conform only the low row on the landing by the water, ~60 px, is used: no
  stranger's back in the foreground, DIRECTION rule 3) + a dog (at rest) |
| `Narrowboat`, `boatInto`, `PerspBoat`, `CafeDeck`, `BoatWiper` | boat.tsx | slate hull + ONE plum gunwale stripe, sage / oat / brick cabins, portholes with curtains, flower panel, fenders, roof dressing (pots, bike, rope, can, mop), chimney + smoke; `hullK` for top-down views (S4); the cafe boat (`cafe`: hatch, bunting); S8's stern deck; S7's foreground wipe (`BoatWiper.half` set) |
| `FarRoofs`, `roofRowInto`, `gasholderInto`, `viaductInto` + `ViaductTrain`, `roadBridgeInto` + `BridgeBus`, `warehouseInto` | far.tsx | seeded roof rows in flat depth steps (stone / light brick / brick), chimney stacks, pots, aerials, sash windows that switch; King's-Cross-like gasholder frames |
| `Newsstand` | newsstand.tsx | S2's kiosk: awning, magazines, folded papers (no legible print), urn steam, a newsagent slot |
| life | life.tsx | `Birds` (perch, peck, `liftAt`, wheel away under `ceil` 580), `Pigeons`, `Ducks` (+ `landAt`), `Heron`, `Puffs` (smoke / steam + `bursts`), `FallingLeaves`, `FloatingLeaves`, `StringLights` (`onAt` run, twinkle), `Cloud`, `Branch` (S1's plane branch, y 0-240), `Movers` (walkers / joggers / cyclists / dogs as slots), `litAt` |

## Tiers (the clean pen, 2026-10-27)
`src/v2r/pen.ts` switches the film to `lib/pen.ts` `setPen('clean')`: every line and fill here follows its piece's
ATTENTION TIER (by story role, `docs/look/CRAFT.md` §b-§c; wrappers in `../tiers.tsx`). **Defaults: every export is
`environment`** (no outline; fills calmer; things that ARE lines kept as hairlines): the sets `S1Set` `S2Set` `S4Set`
`S8Set`, `WingFront` / `WingS1` / `WingS7` / `WingS2`, `TerraceRow`, `Water`, `Towpath`, `Lamp`, `Railing`, `Bench`,
`Bollard`, `Planter`, `Bike`, `Tree`, `Steps`, the boats, `FarRoofs` / `BridgeBus` / `ViaductTrain`, `Newsstand`,
`HandLetteredGoogle` (its letters are `graphic`: they keep their ink), `SunDisc`, and the life (`Birds`, `Pigeons`,
`Ducks`, `Heron`, `Puffs`, `FallingLeaves`, `FloatingLeaves`, `StringLights`, `Cloud`, `Branch`, `Movers`: its people
too). Story parts inside a set default to `support` and take a prop to promote on their beat: `WingFront wTier` (her
window W), `WingS2 storyTier` (hers and the five staff windows, and the `storyOverlay`), `TerraceRow herTier` (her door
and French window). Slots (`behindDoor`, `towpath`, `seated`, `pip`, `aBoard`, `bench`, `board`, `lane`, `her.inside`)
draw as untagged (support with thin tinted lines; `Slot` in `../tiers.tsx`): K4 / K5 / K3 pieces keep their own tier.
`Paint` has no tier of its own: a lane's batch draws in the scope it sits in, so wrap a scene-built set in
`<Tier tier="environment">` and mark strokes that ARE the thing `b.ink(d, w, color, open, {thing: true, tone})`
(wires, railing bars, bike frames, twigs, aerials, ropes; `tone` = the fill they belong to) or `{graphic: true}` (a
shape drawn with a stroke, lettering). Override per beat: `<Lamp tier="support">`, `<Movers tier="support">`.

## Rules kept
Nothing drawn in the caption band (y 317-556): roofs, stacks, aerials, planting and tiers are clamped to y >= 600 (S1's
roof planting to y >= 575), flyers to `ceil` 580, puffs to 580-600. Hero teal only on her door and French window frame;
the pop orange only on the sun disc (`SunDisc`); plum anchor on her dark window, gunwale stripes, lamps and railings.
Ink by size (`inkFor`: 4.8 / 3.4 / 2.2 / 1.6 / none), loose and open, never on sky, water or shadows. Shadows are colour
(`shadowInto`, stone shade). Hundreds of small things go through `Batch` + `Paint` (one `<Fill>` per colour, one `<Ink>`
per weight, layer by layer), so a full set renders in ~0.3-0.5 s per 1080 x 1920 frame with `--gl=angle`.

## Open
The samples use kit placeholders for her, the ghosts, the public, Pip and the boards (K4 / K5 / K3 plug in through
the slots). S3's set is the `TerraceRow` at W2_CUT (sheet cell 4); lane L3 assembles S3 with `Water`, `Narrowboat` and
`Towpath`. S7's forecourt set (fountains, cafe tables, plane trees with string lights) is lane L5's, on `WingS7`.
