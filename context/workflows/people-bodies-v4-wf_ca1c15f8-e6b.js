export const meta = {
  name: 'people-bodies-v4',
  description: 'People bodies: natural poses with weight and gesture, simple real hands, clothes with fit and fall, slim modern proportions; on the v4 heads and hair; stills beside the references',
  phases: [{ title: 'Bodies', detail: 'poses, hands, clothes, proportions; stills and a walk strip' }],
}
const R = '/home/user/Test-'
const D = `${R}/video/docs/look/people_design/bodies_v4`
const OUT = { type: 'object', properties: { status: { type: 'string', enum: ['done', 'partial', 'blocked'] }, summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['status', 'summary', 'files'] }
phase('Bodies')
const r = await agent(`Bodies, poses, hands and clothes for our people. Work in ${R}. Read ${D}/BRIEF.md first and follow its rules. Your final reply is the structured output only, its summary at most 3 short lines.
Look at the references' bodies and our v4 cast (${R}/video/docs/look/people_design/hair_v4/final/), read ${R}/video/docs/look/people_design/EVALUATION.md, then the body and assembly code. Research only what you need (contrapposto and gesture in stylised figures, simple appealing hands in 2D animation, how clothes fold and fall), with sources, in ${D}/NOTES.md (write it from your first step).
Build: (1) POSES with weight and gesture: a relaxed standing contrapposto (the weight on one leg, the hip and shoulder tilting against each other, one arm bent or a hand in a pocket), a walk with a natural arm swing, seated on a ledge (ref 05) and on the ground (ref 01), leaning on a rail; (2) HANDS: simple but real (a thumb and a finger mass with 1-2 separations, a relaxed curl, the wrist taper), never paddles; (3) CLOTHES with fit, fall and a few folds: her evening coat look (a long coat over a knit and wide trousers), a jacket, a knit, a shirt, wide trousers and jeans, sneakers and boots, per fashion.md; (4) PROPORTIONS: slim modern adults (her waist and hips, sloping shoulders, slim wrists and ankles; his V, the neck into the shoulders), the slender tapered neck, the upright head. Keep the v4 hair and faces as they are.
Render into ${D}/stills/: 01_her_before_after.png (direction C now, the v4 stand-in body, the new body: three views at 640 px and film size), 02_cast.png (the six people in their clothes and poses, one scale, close and film size), 03_poses.png (standing, walking, seated on a ledge, seated on the ground, leaning, each beside its reference where one exists), 04_walk_strip.png (her walk, 8 frames). LOOK at each beside the references at full and phone size: natural, appealing, modern, nothing stiff, no mitten hands. Fix what doesn't. Write ${D}/stills/STILLS.md.`,
  { label: 'bodies: poses, hands, clothes', phase: 'Bodies', schema: OUT, effort: 'max' })
log(`bodies: ${r ? r.status + ' | ' + r.summary : 'missing'}`)
return r
