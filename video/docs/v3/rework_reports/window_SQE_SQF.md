# WINDOW lane report: outside, h2_window, SQE, SQF (2026-10-27)
**Built:** `scenes/outside.tsx` (OutsideFar = S9's far field re-laid by the REVEAL map + their `RevealPeak`, a summit stick, the hall, the sign step at 36.98; OutsideTown with a calm factory roof and an `onRoad` slot; OutsideStreet: wall, lit gate, booth, barrier, floodlight pool, notice, queue, workers, walkers, snow; the whole timeline in `vehiclesAt(T)`, all on film time via `useFilmT`/`FilmClock`), `scenes/h2_window.tsx` (frost, sill, desk with the nook rig; `entryCam`, `pushCam`, `h2Cams`, `H2View`), kit `Fleet.tsx` (FleetVan `van`/`dc`/`better`, NoticeFlip for the 5x and 2027 faces, CrateFlight/CrateBox), `SQE.tsx`, `SQF.tsx` (EraseDown loop), and `SQE_front.tsx`, a thread-plane stand-in at LEFT/PAYOFF.
**Beats:** these follow flow_v2 §4. Trucks A and B stand in the pool at J4, and A loads 23.10-24.20. The barrier lifts at 24.20, then A drives up the road while B rolls up to the gate. Our van rolls into the pool (lit) at 25.72, and its one crate lands on its roof at 26.04. The 5x face swings on at 27.08. The van drives to the kerb at 29.20 and the crate hops over the front plane into the listing (CrateHop). The van leaves left at 30.40 and BETTER joins the queue at 31.40. B leaves at 33.50, the notice flips to 2027 at 34.60, and C and D overtake (BETTER nudged back 35.62). The sign steps up at 36.98. The beat's subject gets the 3 px inner outline.
**Checks:** `tsc` is clean. `check_light.py` gives LIGHT OK at 8 beats (23.5, 26.1, 27.5, 30.1, 33.0, 35.7, 37.5, 40.0); brightest 5 % is within 0.00-0.145 H. Warm-lit is 4.8-5.7 % (CRAFT 8-15; reported only).
**Seams** (Film3Seams on the merged head, after REVEAL's 1be06a0 drew SQE's H2Scene from 22.25): J4 is 0.01 % / 0.04 % (OK) and J5 is 0.07 % / 0.00 % (OK).
**Density:** on the SQE+SQF 0.5x clip, fullness passes (flat 33 %, 135 obj/Mpx, detail 35 %). Motion WARNs (3.7 ev/s). SQF's hold is 56 % static, which is FAR on the meter; I left it calm on purpose (it is the payoff hold), with exhaust puffs and a far car added. The clean-pen grep is clean. Phone-size reads: "~5x" and "2027" read; the vans read only in the push.
**Open:**
- I used flow_v2 §7's read fallback: the push is x1.35, not x1.25 (street 1.35, town 1.2, far 1.08; the summit stays under the caption band).
- The queue is still small at phone size outside the push.
- The front plane is a stand-in until `thread_plane.tsx` lands.
- The desk is calm (planner, mug, herbs).
**REQUESTS:**
- SQD (REVEAL): done in 1be06a0 (you draw H2Scene from 22.25). Keep it; when the thread plane lands it changes in H2Scene for both of us.
- thread_plane owner: SQE draws `<CrateHop to={listing laptop screen centre at T}>` over the plane at 29.90-30.25 (default (171, 1236)); tick to $1,099 at 30.28.
- SQE.tsx/SQF.tsx: swap `FrontStandIn` for the thread plane in `H2Scene` (one line) once it lands; I will do it if asked.
