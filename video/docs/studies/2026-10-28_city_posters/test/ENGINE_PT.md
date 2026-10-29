# The look test's patchwork and texture lane (PT): `lib/patchwork.ts`, `lib/texture.tsx`, `check_banding.py --texture`

*Lane PT of the 7 s look test (`STUDY.md` §10, build items 6 and 10). Written as it goes. Specs: CRAFT §b ("Tier C's
build: the low poly patchwork"), §c ("The paper-and-paint test, its spec"); `style.md` L3-L4 and §1.3-1.4; `pro_2` §3.1,
§3.4; `pro_4` §3.4. Decided (owner, 2026-10-29, "Go with your suggestions"): the patchwork for the ground and the far
city (never on the subject, never in the sky), a VERY subtle mottle, 2 px lines on floating layers.*

Status: in progress (2026-10-29). Nothing existing is changed: two new lib files, one new option in a QA script.

## 1. The pieces
| File | What |
|---|---|
| `src/lib/patchwork.ts` | pure TS (no React, no clock): a seeded guillotine split of a plane's mass, projected (groundCam, a quad's homography, or frontal), whole-pixel facets with tones from the plane's fills |
| `src/lib/texture.tsx` | `<Mottle>`: the per-plane mottle, an SVG filter (feTurbulence -> feComposite), locked to its plane's group |
| `scripts/qa/check_banding.py` | `--texture`: the texture-aware mode (A/B against the flat render) |
| `src/look/pt/` | the demo compositions (entry `src/look/pt/entry.tsx`) |

## 2. API
(planned; filled in as each piece lands)
