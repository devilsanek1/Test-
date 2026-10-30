# Hair v4: research (what the tools and the illustrators do, and what we take) (2026-10-30)

Only what the build needed, with sources and their strength: **[T]** a tool's or studio's own documentation, **[A]**
a pro artist's course or book, **[P]** a practitioner's tutorial or a community copy of a tool's readme. Written from
the first step of the rig work and kept as it went.

## 1. How a 2D animator rigs hair (the method we copy)

| Tool | What it does for hair | Source |
|---|---|---|
| **Spine (Esoteric)** | A *physics constraint* "simulates how physics and secondary motion would affect the movement of a bone": the bone's own animated (unconstrained) pose is the target, and the constraint adds an OFFSET from it driven by how the bone moves. Parameters: **inertia** (how much of the bone's movement feeds the offset), **strength** (the spring back to the pose), **damping** (slows fast motion more than slow, so big swings settle), **mass** (resists acceleration; more mass needs more strength), **wind** (a constant world-x force), **gravity** (a constant world-y force), **mix**, a speed **limit**, and a fixed **FPS** step ("the lower the FPS the more likely the simulation is to fail"; 30-60 recommended); a *deterministic* mode recomputes from frame 0 so scrubbing is repeatable. | [T] https://esotericsoftware.com/spine-physics-constraints |
| **Spine weights** | Mesh vertices are bound to several bones with weights; the bones deform the mesh. | [T] https://esotericsoftware.com/spine-weights |
| **Live2D Cubism** | Hair swing is a *pendulum* per group ("swinging bangs", "swinging back hair"), its suspension point moved by **input** parameters (head angle, body angle; type *Position X* or *Angle*, each with an influence %). **Multi-stage pendulums** chain: "child pendulums respond to their parent's movement". Pendulum settings: **duration** (swing speed), **ease of swinging** (~0.7-0.99), **reaction time**, **speed of convergence** (how fast it settles). The swing angle is written to an **output** parameter that drives the art's deformers (keyforms). | [T] https://docs.live2d.com/en/cubism-editor-manual/physics-operation/ and https://docs.live2d.com/en/cubism-editor-manual/physical-operation-setting/ |
| **Rive** | Bones bind straight to VECTOR PATHS: Rive "can weight a vertex and its Bézier handles independently"; **Auto-Weights** "assigns weights based on each vertex's nearest bone", with an **influence** cap (bones per vertex) and a **blend** width between two bones. | [T] https://rive.app/docs/editor/manipulating-shapes/bones |
| **Moho (Lost Marble)** | *Bone dynamics*: **torque** ("a bone moves more in response to its parent's movement"), **spring** ("how quickly it bounces back"), **damping** ("how quickly a dynamic bone stops moving", "like making the bone move through a thick fluid"). | [T] https://lostmarble.com/moho/manual/tut03/03/index.html |
| **Dynamic Bone (Unity, a widely used asset)** | Per chain: **damping**, **elasticity** ("the force applied to return each bone to original orientation"), **stiffness** ("how much bone's original orientation are preserved"), **inert** (how much the character's own movement is ignored); each with a *distribution curve* along the chain. | [P] community copy of the asset's ReadMe: https://g.freya.cat/unityprojects/plain/VRCSDK3AvatarsLegacy/Assets/Resources/DynamicBone/ReadMe.txt |

**What all of them share, and what our rig does (`video/src/look/people_dirs/hair_v4/`):**
1. **The drawing is the rest pose; physics only adds an offset** (Spine's "offset from the unconstrained pose", Dynamic
   Bone's elasticity to the original orientation). Ours: the authored shapes are the equilibrium of an upright head in
   still air, so a still frame is exactly the drawing.
2. **Three springs, as the tools split them** (`sim.ts`): STRENGTH pulls each bone back to its animated ABSOLUTE
   direction (Spine's strength; Live2D's pendulum, whose restoring force is gravity: ~g / bone length, ~130 /s^2 for long
   hair), so a sideways load tilts the chain as a whole by about atan(load / (k L)); SHAPE pulls each bone to its rest
   angle RELATIVE to its parent (Dynamic Bone's stiffness: keeps the drawn curve); ELASTICITY is a weak pull of each joint
   to the animated pose (Dynamic Bone's elasticity). Our first version had only the relative spring: a sideways load then
   curls the chain joint by joint (the deflection compounds toward the tip). Lesson kept.
3. **Motion comes from the parent** (Live2D's multi-stage pendulums, Moho's torque, Spine's inertia). Ours: the root is
   pinned to the head; Verlet integration carries the head's motion down the chain root to tip, so lag, overlap and
   settle come out of the integration, not out of a "bend rule". A change of DRAWING (the yaw keyform morph) is felt at
   42 % only (Spine's inertia < 1); without it the far-side chains whipped half a head-width.
4. **Settle is damping, per chain, varying along it** (Live2D's convergence, Spine's damping, Dynamic Bone's damping
   distribution). Ours: `Spring.damp`, applied to the motion RELATIVE TO THE PARENT (damping absolute velocity brakes a
   steady walk like thick fluid: the hair lagged a head-width behind; a lesson kept); stiffness falls root to tip by
   `Spring.taper` (Dynamic Bone's distribution curves).
5. **Wind and gravity are world forces** (Spine). Ours: the air is a drag toward the wind's velocity, ~1.2 /s per unit of
   `air` (a walk is its own headwind); our first drag was 10x too strong, every pose folded and the anti-fold guard
   silently returned the rest drawing (a lesson: when a strip shows no motion, print the joints). Gravity, after a first
   version as a force (it summed bone by bone and flung long hair to its limits), is a bounded turn of each bone's
   target back toward plumb when the head tilts (at most the tilt).
6. **A fixed, fast step and determinism** (Spine's FPS and deterministic mode). Ours: 240 Hz, recomputed from t = 0 with
   a 1.5 s settled pre-roll, cached per motion: every frame of a strip is repeatable.
7. **Weights on the vector itself** (Rive: vertices AND Bézier handles). Ours: each anchor gets weights by where it
   projects along its chain (a C1 partition of unity over the bones; the top share glued to the head), and its two
   handles take the anchor's blended transform: an affine map keeps the three points collinear, so a smooth node stays
   smooth in any pose (no kinks by construction). A guard eases a folded shape back toward rest.
8. **Turns are keyforms, not regenerated drawings** (Live2D's angle parameters drive keyforms). Ours: the 3/4 and
   profile drawings of each piece have the same anchors landmark by landmark and morph by the head's yaw (`morphOf`),
   so a head turn bends and slides the designed shapes; the chains' rest joints morph with them.

## 2. How an illustrator constructs a haircut (the design method)

| Point | Source |
|---|---|
| Look at hair as **big areas of shape first**; individual strands from the start are overwhelming; add smaller detail only after the big shape is in place. | [P] Clip Studio tips (several practitioners), e.g. https://tips.clip-studio.com/en-us/articles/6043 and https://tips.clip-studio.com/en-us/articles/16594 |
| Break the mass into **3-5 major clumps**, sized **big / medium / small** (a 70-30 split), each following the block's direction (gravity for falling hair). | [P] same Clip Studio tips |
| Draw the hair **in silhouette first**. | [P] Envato Tuts+ course "Vector Portraits for Beginners", lesson "Focus on the hair": https://design.tutsplus.com/courses/vector-portraits-for-beginners/lessons/focus-on-the-hair |
| **Few anchor points**: geometric curves need few anchors (the Curvature tool), Alt for corners. | [T] Adobe, "Minimum vector portrait": https://www.adobe.com/learn/illustrator/web/minimum-vector-portrait |
| For a cartoon look, a **pen-tool outline with a darker shadow shape** on its own layer rather than brush strands. | [P] https://illustratorhow.com/?p=4767 |

**What we take:** each cut is a recognisable silhouette first (drawn large on the real head), then 3-5 big pieces with
a size hierarchy, all following the parting and the crown, then ONE shadow shape and ONE highlight placed by the light,
then 1-3 thin flow lines and 1-2 placed strands. The references (`../refs_hair_2026-10-30/`) and the orchestrator's
evaluation (`../EVALUATION.md`) add: VOLUME all round the skull, an asymmetric parting, one broad S, ends of different
sizes turning one way, a rim and a gloss.
