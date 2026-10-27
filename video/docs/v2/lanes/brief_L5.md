# Helper brief L5: the boards (K3) + V2S6 (the gate) + V2S7 (Google's forecourt)

Read `COMMON.md` (this folder) first. You are lane **L5** (TREATMENT.md section 9: "K3 lettering + boards (ONE owner: L5)" and shots V2S6, V2S7):
equal weight by one owner.

1. **K3 first** (`video/src/v2r/kit/boards/**` + `video/src/entry-v2r-boards.tsx` for its sheet; you own both): `WorldText` on
   `src/lib/font.ts`; `StatementBoard` (ONE enamel A-board face for TOLD THE BBC / GOOGLE SAYS / SHE SAYS at B, plus the deal board; one type
   scale: keys >= 56 px, body 30-34 px, credits 18-20 px; fill-first pen reveal, line pops, the wipe, the clack); `PaperTag`, `Fingerpost` (one
   post, two plates), `NewsBox`, `Plaque`, `DoorSign`; key lines read at 216 px, body and credits at full-screen phone width (~390 px). Exactly
   TREATMENT.md's words (the deal's quoted words with the FULL oversight clause; Google's statement; her quote with BBC spelling
   "criticising"); fairness: the deal board and Google's board equal in size, face, type and light. Commit + push early (L3 and L6 use them).
2. **V2S6 and V2S7** (`video/src/v2r/scenes/V2S6.tsx`, `V2S7.tsx` + `V2S6_*.tsx`, `V2S7_*.tsx`) at FINISHED quality, per TREATMENT.md and
   map.ts. V2S6 uses the Arlington kit (`src/v2r/kit/dc`: the gate, fence, service door) and V2S7 the canal kit (`src/v2r/kit/canal`: the
   forecourt); both kits may still be landing when you start: `git pull` every ~10 min until `src/v2r/kit/dc/README.md` and
   `src/v2r/kit/canal/README.md` exist; build K3 meanwhile. Pip per TREATMENT section 3 (no reaction on Google's beat; S6/S7 pass
   `idle={{flick:false}}` where the Pip README says).
3. **Review files** (your scratch dir): each shot at 6+ key times as 216 px stills beside reference 1 / v1 frames; one full-size 1080x1920 still
   of each shot's key frame; a motion strip (10 frames 0.1 s apart from the busiest second); a 0.5-scale clip with voice (render Film2R with
   `--frames` covering 23.80-32.93, `--gl=angle`); `python3 scripts/qa/density.py` on it.
4. **Critic prompt** (give it the paths of your review files and TREATMENT.md): "You are a fresh-eyes art director, a sound-off viewer and a
   standards editor for two shots of a premium hand-drawn reel (9:16, on a phone). The owner rejected our last film and wants it fresh,
   beautiful, ALIVE like reference 1 and our v1, people small and simple like reference 1, Pip in every shot, strictly fair. Read
   video/docs/v2/TREATMENT.md (shots V2S6, V2S7; acceptance bar in section 9; fairness in section 8). Judge: as full and alive as the
   references at 216 px? Every board line readable (keys at 216 px, body at ~390 px)? The deal board and Google's board truly equal? No
   implied accusation, no war imagery, the full oversight clause always with the purpose line? Something new every few frames? Verdict pass
   only when nothing must change; at most 12 problems, most important first, each with a concrete fix."
5. Done signal: `video/docs/v2/lanes/report_L5.md`.
