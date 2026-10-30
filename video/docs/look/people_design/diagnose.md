# Why our people read old and ugly: the diagnosis

**Status: IN PROGRESS (2026-10-30).** Partial notes; the sheet and the final ranked write-up follow.

Sources being cropped: the final masters of v1 (`deliverables/v1/php2shell_final.mp4`), v2
(`deliverables/v2/v2r_G7_master_v1.mp4`) and v3 (`deliverables/v3/v3_final.mp4`) at the baseline times of
`docs/studies/2026-10-28_city_posters/baseline/` (full 1080 x 1920 instead of the baseline's 540 x 960), the v3 G5b
draft (`deliverables/v3/v3_g5b.mp4`: its faces and winter crowds), the painted still v6, the people sheet
(`paint_recipes/people_sheet.png`), the v2 cast sheet (`KitCast`) and the first v2 kit sheet (`KitSheet2`, the faces).

## Measured so far (head height / standing height; refs 6.5-7.5 heads)

| figure | heads tall | legs below the coat | torso width |
|---|---|---|---|
| v1 bun + backpack (t1, 150 px) | 4.4 | 0.31 H | 0.45 H |
| v1 clipboard researcher (t18, 168 px) | 4.7 | 0.34 H | ~0.45 H |
| v1 pom-pom walker (t21, 130 px) | 3.0 (with the beanie) | 0.20 H | ~0.45 H |
| v1 maker in an apron (t36, 174 px) | 4.0 | 0.29 H | ~0.45 H |
| v2 her rear 3/4 (t2, 172 px) | 4.5 | 0.24 H | 0.26 H |
| v2 her profile (t17.5, 175 px) | 4.1 | 0.13 H | 0.20 H |
| v2 man by the board (t9, 258 px) | 4.2 | 0.27 H | 0.26 H |
| v2 first pass her with a face (KitSheet2 P2) | 4.6 | | |
| v6 her (the refined `src/lib/figure`, 155 px) | 6.2 (model 6.75) | | |

Code: v1 kit Person (`src/lib/kit/Person.tsx`, used by `Figures.tsx` and v3's `People3.tsx`): torso 86-100 px wide on a
199 px figure (0.47 H), head 0.23 H, legs 62 px (0.31 H), "ears stick out on both sides". v2r (`src/v2r/kit/cast/body.ts`):
head radius 0.112 H (4.46 heads), torso 0.33 H, shoulders 0.25 H below the top, legs two capsules 0.09 H wide, arms
inside the coat. Skin in v2r is drawn from the set's tokens (paving, brick, brickLight, brickDeep, the caption box);
in v1 skin is `sand` ("mid walls, necks/skin").
