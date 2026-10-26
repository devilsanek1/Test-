# Video 3 look (G4, LOCKED 2026-10-26)

- **Palette: Autumn Ochre** (owner pick, C), from `docs/look/palettes.json`, plus its night-window slates
  (#9DA8B0 / #6E7A85 / #4C555E) for the data center seen through the window. One hero (burnt orange: the laptops),
  one dark anchor, one pop (the blue "Add to cart" / price-tag accent).
- **Style frame:** `review/look/v3_g4/nook_C.png` (composition `StyleNook`, palette "Autumn Ochre", `src/v3/StyleNook.tsx`).
- **Builder flags to fix at G5:** the hero covers only ~1.5 % of the frame (PALETTE asks 5-15 %): make the laptops and
  the price tag bigger or repeat the hero colour; "Add to cart" sits at y 1391-1472 (inside the safe zone).
- **Rules that apply:** `docs/look/CINEMATIC_GUIDE.md` (environment shot types + the opening rule), `COZY_AND_SCALE.md`,
  60 fps production renders. Rejected palettes A and B are in `archive/g4/`.
