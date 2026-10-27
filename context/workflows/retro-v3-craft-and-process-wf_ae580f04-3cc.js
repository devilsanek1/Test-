export const meta = {
  name: 'retro-v3-craft-and-process',
  description: 'Retro after v3: why it reads busy, incoherent and rough (story/transitions, attention hierarchy, line quality, light and shadow), whether sketch-first helped or hurt, and the new generic craft spec + a pipeline proposal for the owner',
  phases: [
    { title: 'Diagnose', detail: '4 lenses on v3 vs the references, measured' },
    { title: 'Process', detail: '3 pipeline architects + a judge: sketch-first or not, and what instead' },
    { title: 'Write', detail: 'the generic craft spec and the pipeline proposal' },
    { title: 'Critic', detail: 'adversarial check against the owner\'s words, then fix' },
  ],
}

const V = '/home/user/Test-/video'
const SCR = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/retro'
const GIT = `GIT: commit only the files you changed (git add <paths>); if .git/index.lock exists wait 5 s and retry; message ending with exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR
Push: git pull --no-rebase origin video-production, then git push origin HEAD:video-production (another session pushes too; never discard its
work). The repo is PUBLIC: no email addresses; never copy reference footage or its frames into the repo.`

const CTX = `
THE OWNER'S VERDICT on video 3 (${V}/deliverables/v3/v3_g5b.mp4, sheet ${V}/review/v3_g5b/sheet.jpg; it ships as is), as general feedback for every
future video, verbatim: "It's too busy, too incoherent. There is no story, no clean transitions, just a bunch of shots put together. I think this is
in part related to the fact that we did the sketch first and then added a whole bunch of details to make it feel alive, which is wrong really, so I'm
not sure if doing sketch first here really helped or actually hurt us bad. Then we end up with too many moving parts and I'm not sure what to keep my
attention on. Across the story we should have the main arc going where the attention should be, and the supporting details / supporting animation
that adds subtle loveliness to it, like a bird flying, is not the core of the story, so its visual should be a bit more subtle but yet alive, as it is
part of the scene. Perhaps even to the point where we don't animate and use the same style for every moving piece, but some supporting environment
etc can be drawn a bit more subtle. When it comes to the style it's too rough and messy. We have a lot of rough lines, it's too messy, not looking
clean at all. The style should be overall cleaner, more refined, gentle, to feel a lot more premium. I also noticed we don't have the shadows really
much and the light is weirdly put. Lighting and shadows should be gentle but should probably exist."
Earlier today the owner said the G5 cut was "way too empty", approved a density pilot, and liked: reference video 1 about France
(${V}/assets/ref/reference.mp4; analysis ${V}/docs/style_bible.md, ${V}/docs/motion_spec.md), our v1 PHP film (${V}/deliverables/v1/php2shell_final.mp4),
Arcane's rooftop pull-back (${V}/docs/look/CINEMATIC_GUIDE.md S5 + Scale cues), two cozy references (painterly street from above, painterly riverside:
measurements in ${SCR}/../cozy2/*.md and ${SCR}/../cozy3/*.md; clips ${SCR}/../cozy2/ref.mov, ${SCR}/../cozy3/ref.mov), and the approved G4 style frame
${V}/review/look/v3_g4/nook_C_warm.png. Playbook: ${V}/docs/OWNER_PLAYBOOK.md (the new rules: clean premium, light and shadow, attention hierarchy,
one flowing story). Process: ${V}/docs/PIPELINE_V2.md, ${V}/docs/G3_ANIMATIC.md (G3 is now an "animated sketchbook" with density as placeholders),
${V}/docs/G5_BLOCKING.md, ${V}/docs/look/LIFE_AND_DENSITY.md, ${V}/docs/look/COZY_AND_SCALE.md. v3 history: ${V}/docs/v3/OWNER_NOTES.md (every note in
order), the board ${V}/deliverables/v3/v3_g3_animatic_board.mp4. The v3 film code: ${V}/src/v3/film/ (kit in kit/, panels in scenes/; the drawing
primitives in ${V}/src/lib/sketch.ts, Ink, Fill). Reference footage stays in the scratchpad.`

phase('Diagnose')
const LENSES = [
  { key: 'story', ask: `STORY AND TRANSITIONS. Walk every cut of v3 (14 cuts; times in ${V}/src/v3/film/scenes.json; the script ${V}/docs/v3/script/script_g1.md):
does the eye and the story carry across (a shared object, a match, motion leading out and in, a continuous camera, a consistent place), or does it
jump to an unrelated new picture? Score each cut. Then do the same for reference 1 (its transition recipes are in motion_spec section 8: card flip,
tilt swipe, match zoom-through, push-in, un-build loop) and v1, and say concretely what makes theirs read as one flowing story. Where does v3's main
arc (your laptop's price) disappear for whole shots? Propose a transition grammar and a "through-line" rule with examples.` },
  { key: 'hierarchy', ask: `ATTENTION HIERARCHY. For ~10 v3 frames (one per panel) and ~10 frames of reference 1, v1 and the two cozy references, measure
where the eye goes: contrast and saturation maps, motion energy (frame differences) by region, the number of competing movers, and how much stronger
the story subject is than the supporting things (value contrast, saturation, line weight, size, motion speed). Write the hierarchy each reference
uses (e.g. supporting crowd in muted line-only drawing; one coloured subject) as numbers, and show where v3 breaks it (equal-weight clutter, Pip and
background life competing with the subject, everything outlined the same). Propose concrete hierarchy rules: subject vs support vs environment tiers,
with values for contrast, saturation, line weight, detail and motion per tier, and how supporting life stays alive but subtle.` },
  { key: 'line', ask: `LINE QUALITY AND FINISH. Why does v3 look rough and messy? Inspect the drawing code (${V}/src/lib/sketch.ts jitter/overshoot/breaks/
double strokes, Ink, Fill misregistration, the v3 kit) and full-size crops of v3 frames, and measure line properties (line count per area, wobble,
overshoot, stroke-end gaps, misregistration offsets, line weight spread) against the approved style frame and the references (the cozy references:
lines only ~32 % of boundaries, 2.6 px, only on key items; reference 1 and v1). Say exactly which parameters make it read messy, and write a CLEAN
LINE SPEC for a premium, gentle look (which elements get lines at all, weights by tier, smoothing, joins and ends, no overshoot or double strokes,
fills without misregistration or with a tiny controlled one, texture), with the code parameters to change.` },
  { key: 'light', ask: `LIGHT AND SHADOW. In v3 the owner sees "not much shadow, light weirdly put". Analyse v3 frames (light pools, lamp, window, outdoor
dusk, any shadows) and the references (the cozy references' short soft coloured shadows and good-weather light; reference 1's sun; v1; Arcane's
light), and write a LIGHT AND SHADOW SYSTEM for our flat style: one key light direction per scene (and how to keep it consistent across cuts in the
same place), form shadows and cast shadows as flat soft-edged shapes (colour = the surface darkened and hue-shifted, never grey), contact shadows
under objects and people, light pools that agree with their source, rim light, night/dusk light (a lamp-lit interior, lit windows), what stays
unlit, and how much of the frame is in shadow. Give numbers and the code approach (shapes, not blur).` },
]
const diag = await parallel(LENSES.map((L) => () => agent(`${CTX}
YOUR LENS: ${L.ask}
Work in ${SCR}/${L.key}/ (frames, crops, tools). Look at no more than ~14 images. Do not edit repo files. Return findings (at most ~80 lines,
numbers and concrete examples first) and save them to ${SCR}/${L.key}.md.`, { label: 'diagnose:' + L.key, phase: 'Diagnose' })))
const D = LENSES.map((L, i) => `### ${L.key}\n${diag[i] || 'FAILED'}`).join('\n\n')

phase('Process')
const ARCH = [
  'keep a sketch stage but fix what it decides (story flow, transitions, hierarchy and density placement in the sketch itself) and say why v3\'s sketch-then-decorate failed',
  'design the world and the final look FIRST (style frames + a set/kit in final quality + a colour script), then board and animate inside that world, like a game level or an animated feature\'s art-department-first approach',
  'keyframes first: a handful of final-quality hero frames that define story beats, hierarchy and light, approved by the owner, then in-betweens/transitions, with the animatic built from those keyframes',
]
const archs = await parallel(ARCH.map((a, i) => () => agent(`${CTX}
DIAGNOSIS (from four measured lenses):
${D}

YOU ARE PIPELINE ARCHITECT ${i + 1}. Argue the strongest version of this approach for our studio (an orchestrator and agent teams making 30-45 s
explainer reels for a phone-first owner who reviews by watching): ${a}. Cover: the gates and what the owner sees at each (always a playable video
from the story stage on, per the playbook), how the approach prevents each problem the owner named (busy, incoherent, no story or transitions, no
focus, rough lines, missing light/shadow), what v1 (which the owner liked) actually did, cost and speed with agents, and the risks. Be honest about
the weaknesses. At most 45 lines. Do not edit files.`, { label: 'architect:' + (i + 1), phase: 'Process' })))
const judge = await agent(`${CTX}
THREE PIPELINE ARCHITECTS argued for different answers to the owner's question "did sketch-first help or hurt us?" (below), after a measured
diagnosis (below). Judge them on: preventing every problem the owner named, the owner's review experience (playable video from the story stage on,
signal in the least time), consistency with what worked in v1 and with the owner's other rules, and cost/speed with agents. Give a clear verdict on
sketch-first (helped / hurt / it depends on what the sketch decides), pick ONE recommended pipeline (with grafts), and list the exact gate changes
versus ${V}/docs/PIPELINE_V2.md and ${V}/docs/G3_ANIMATIC.md. At most 45 lines.

DIAGNOSIS:
${D}

ARCHITECTS:
${archs.map((a, i) => `### Architect ${i + 1}\n${a || 'FAILED'}`).join('\n\n')}`, { label: 'judge', phase: 'Process' })

phase('Write')
const write = await agent(`${CTX}
YOU ARE THE WRITER. Turn the diagnosis and the judge's verdict (below) into generic, reusable docs for every future video:
1. ${V}/docs/look/CRAFT.md (new, at most ~160 lines): the craft spec the owner asked for, with numbers and code parameters: (a) one flowing story:
   the through-line rule and the transition grammar; (b) attention hierarchy: subject / support / environment tiers with their contrast, saturation,
   line, detail and motion values, and how supporting life stays alive but subtle (a softer drawing style for support and environment is allowed);
   (c) the clean line spec (premium, gentle); (d) the light and shadow system. Each section ends with a short check an agent can run. Link it from
   ${V}/docs/OWNER_PLAYBOOK.md's new rules (one link each, no new rules), ${V}/docs/look/LIFE_AND_DENSITY.md (density must respect the hierarchy:
   fullness from a calm, well-tiered world, never from equal-weight clutter) and ${V}/docs/look/STORYBOARD_STYLE.md.
2. ${V}/docs/retro/2026-10-27_v3_retro.md (at most ~70 lines): what happened on v3 (the gate history in OWNER_NOTES), the diagnosis in short, the
   verdict on sketch-first, the recommended pipeline and the exact gate changes, written as a PROPOSAL for the owner to approve (do NOT change
   PIPELINE_V2.md or G3_ANIMATIC.md yet; add one line at the top of PIPELINE_V2.md pointing to the proposal).
3. ${V}/docs/retro/2026-10-27_owner_summary.md: an 8-12 line plain-language summary for the owner (phone-readable, no jargon): what went wrong and
   why, what changes, and the one decision we need from them.
${GIT}
REPORT (at most 10 lines).

DIAGNOSIS:
${D}

JUDGE:
${judge || 'FAILED'}`, { label: 'writer', phase: 'Write', effort: 'max' })

phase('Critic')
const critic = await agent(`${CTX}
YOU ARE THE ADVERSARIAL CRITIC. Read ${V}/docs/look/CRAFT.md, ${V}/docs/retro/2026-10-27_v3_retro.md and ${V}/docs/retro/2026-10-27_owner_summary.md
against the owner's words above and the diagnosis files in ${SCR}/*.md. Find at most 8 real problems, most severe first: anything that misreads the
owner (e.g. treating "subtle" as "remove", or "clean" as "lifeless", or quotas instead of feel); a rule that contradicts the playbook or another doc;
a number that misquotes the measurements; a rule an agent could not apply; a proposal that would not prevent one of the named problems; jargon in the
owner summary. Then FIX them directly in those files (and in any doc they contradict), and commit. ${GIT}
REPORT (at most 10 lines): the problems and what you changed.`, { label: 'critic+fix', phase: 'Critic', effort: 'max' })

return { diag: D, archs, judge, write, critic }
