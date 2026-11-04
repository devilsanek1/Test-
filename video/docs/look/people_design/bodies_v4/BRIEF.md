# People: bodies, poses, hands and clothes (iteration, 2026-10-30)

**Why:** the overhaul (`../hair_v4/final/`) made the hair and the faces clean and animatable, but the bodies are
stand-ins: stiff poses, paddle "mitten" hands, arms hanging straight, plain tees, stilt legs (`../hair_v4/final/
02_cast.png`, the middle row). The owner asked for better "proportions and stature" (playbook, Visual style: hair and
faces bullets; "People: small and simple in the frame, contemporary and refined in design"; "Hair, face, light and
values are designed together, as one character, judged OVERALL beside the references"). The orchestrator's evaluation
`../EVALUATION.md` applies to bodies too (3D-aware construction, gesture, a slender tapered neck, sloping shoulders, a
harmonious palette with a real value range, one key light with a rim).

**The bar:** the references' bodies (`../refs_hair_2026-10-30/`: 05 the girl on the ledge, 03 the students, 02 the
street people, 01 the pair on the hill): natural poses with weight and gesture, simple but real hands, clothes with fit,
fall and folds, slim modern adults.

**Build on** `video/src/look/people_dirs/people_v4/` (`body.ts`, `assemble.ts`, its API body(sex, build, pose, outfit))
and the assembly in `video/src/look/people_dirs/hair_v4/asm_*.ts` (keep the hair and faces as they are; the heads stay
on their frame). Wardrobe ideas: `../fashion.md` (20-30-year-olds in New York and Los Angeles now, by setting).

**An ITERATION:** one agent, no critic, stills only (motion strips allowed), about an hour; the orchestrator looks at the
result beside the references before the owner does. Every agent rule from `../hair_v4/BRIEF.md` holds (files from the
first step, 3-line reply, no git index changes, code only in `people_dirs/people_v4/` and `people_dirs/hair_v4/asm_*`
plus a new entry if needed, sources for research claims, renders one at a time).
