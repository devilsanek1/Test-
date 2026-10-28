// WATER STUDY, candidate B (the owner on v5's water, 2026-10-28: "it's just looking way too cheap, not clean or premium
// quality or refined. Just lazy and cheap. I mean that about the water"). THE DESIGNER'S ONE FILE: draw the whole canal
// of S1 here; nothing else changes (the leaves, motes, people, Pip, sky, buildings and captions stay as approved).
// Read first: docs/v2/water/DIAGNOSIS.md (what reads cheap in v5, S1's water geometry and camera, the seam, the render
// commands), then the playbook's depth / water rule, DIRECTION, CRAFT §c, §d, §f, §g.
//
// The contract (src/entry-v2r-waterstudy.tsx wires it; WaterStudyB renders it):
//   CandWater   drawn INSTEAD of S1Water's body, in the same place: inside the water's parallax plane group (S1_PLANE
//               .water, 0.725 of the float), the environment tier (a <Fill>'s colour is calmed by the clean pen unless
//               `backdrop`), the flood's <Look> cascade (a <Fill> is pale until the front from SUN0 reaches it) and
//               <Lit rig={RIG_CANAL}>. Under the far towpath, the boats, the duck, our bank, Pip and the particles.
//               `t` = scene seconds (S1: film seconds, 0.00-6.13). Deterministic per frame: seeds (lib/rng),
//               @remotion/noise, never Math.random or Date. Flat colour, clean edges, no blur, no glow; the ONE gradient
//               allowed is the shot's own sky (lib/sky S1_EVENING) seen in the water.
//   GLINTS_OFF  true hides V2S1_particles' sun-path glint field (the four-point sparkles): draw your own glitter.
//   CandDuck    optional (null = the kit duck as it is): drawn INSTEAD of the kit duck (S1_DUCK, with its paper V wake),
//               in the moored boats' plane after the boats: the duck with your water's ripples and reflection.
import React from 'react';

/** Candidate B's canal (null for now: WaterStudyB then shows S1 with no water at all). */
export const CandWater: React.FC<{t: number}> = () => null;

/** true = hide the v5 glint field (V2S1_particles S1GlintsOff). */
export const GLINTS_OFF = false;

/** Candidate B's duck, or null for the kit duck as it is. */
export const CandDuck: React.FC<{t: number}> | null = null;
