export const meta = {
  name: 'journals-score',
  description: 'Journal-corpus study, step 2: the first scorer scores every story, a blind second scorer re-scores a 20 % sample, an auditor re-finds 10 % of the rows',
  phases: [
    { title: 'Score', detail: 'first scorer (all rows) and blind scorer (the sample), independent' },
    { title: 'Audit', detail: 'every 10th row re-found by a fresh search' },
  ],
}

const J = '/home/user/Test-/video/docs/studies/2026-10-28_city_posters/journals'
const TOOL = '/home/user/Test-/video/scripts/look/posters/journals.py'
const SCRATCH = '/tmp/claude-0/-home-user-Test-/3f39faed-1bdf-5258-8a21-7148ee2f778a/scratchpad'
const COLS = 'id,W,H,D,N,M,fit,gate,gate_reason,R,T,Mo,F,S,value,owner,wow,world,real_place,happens_to,conflict,everyday,mood,ad_risk,past_topic,tech_ai,news_shape,telling_shape,view,dup_of,confidence,note'

const SCORE_SCHEMA = {
  type: 'object',
  properties: {
    rows: { type: 'number' },
    mean_fit: { type: 'number' },
    share_fit_6: { type: 'number' },
    notes: { type: 'string' },
  },
  required: ['rows', 'notes'],
}
const AUDIT_SCHEMA = {
  type: 'object',
  properties: {
    audited: { type: 'number' }, found: { type: 'number' }, date_ok: { type: 'number' }, summary_ok: { type: 'number' },
    problems: { type: 'string' },
  },
  required: ['audited', 'found', 'problems'],
}

function scorer(role) {
  const blind = role === 'blind'
  const out = blind ? 'scores_blind.csv' : 'scores.csv'
  const other = blind ? 'scores.csv' : 'scores_blind.csv'
  const which = blind
    ? `ONLY the ids listed in ${J}/blind_sample_ids.txt (a seeded 20 % sample): you are the BLIND second scorer, the
check on whether the rubric gives the same answer in other hands.`
    : `EVERY row listed in ${J}/stage2_ids.txt (stage 2: every search row, the feed rows the triage
picked, and a random 10 % control of the other feed rows): you are the
first scorer.`
  return `You are a scorer in the journal-corpus study (a research thread for a short-form explainer channel whose films
are drawn worlds: v1, the best performer, drew the internet as a town of buildings).

Read ${J}/README.md in full first: section 4 (the rubric) is your instrument and its anchors (4.5) are your calibration;
sections 1-2 tell you what the owner wants. Then read the stage-2 rows of ${J}/corpus.csv (filter it by ${J}/stage2_ids.txt with a
small script; the full corpus has 1,209 rows), to calibrate and to spot the same event at two outlets.

Score ${which}
- Score each story from its corpus row alone (outlet, date, headline, section, type, our one-line summary; feed rows,
  source rss, have no summary: use the headline, the feed section and the feed_tags) plus your general knowledge of
  what such a story involves; mark confidence low when a headline is too cryptic to judge. No web searches: both
  scorers must work from the same information. Ignore the triage file: score afresh.
- Columns of ${J}/${out}, in this order: ${COLS}
  W H D N M: section 4.2 (integers). gate: pass/fail (4.1), gate_reason only for a fail. R T Mo F S: section 4.3,
  integers 1-10 (F follows the date bands; Mo the slate's need). fit, value, owner: fill them; the checker recomputes
  them. wow (0-2), world, real_place, happens_to, conflict, everyday, mood, ad_risk, past_topic, tech_ai, news_shape,
  telling_shape, view, dup_of, confidence, note: section 4.4 (wow: the owner wants WOW stories; score it strictly). news_shape is an OPEN code you write fresh for each story (2-6 words, the
  kind of event); telling_shape is exactly one of 4.4's list; view is one line, home place / hero / the far-out thing
  ("none" when W is 0); dup_of names the id of the same event at another outlet; note at most 15 words.
- Be strict and use the whole range. Most news is placeless (W 0-1); W 3 needs the event to happen TO one world, and a
  metaphor world must pass all four parts of the metaphor test. Score what the STORY offers, not what a brilliant artist
  could force onto it. A story about a person or a company usually passes the gate (people small, buildings unbranded).
- Work in batches of about 25 rows; after each batch append them to the file with a small Python script using the csv
  module (header first; never hand-written CSV). A usage limit can stop you at any moment: what is on disk counts.
- When every row is written, run: python3 ${TOOL} check ${out} --fix
  and repair every problem it lists (missing ids, ranges, tag values) until it reports 0 problems.

RULES
- Write only ${J}/${out} (scratch, if any, in ${SCRATCH}/journals-score-${role}/). Never open ${J}/${other}: another
  scorer writes it at the same time, and your scores must be independent of theirs.
- No git commands, no web, no agents or workflows.
- Final reply (data for the orchestrator): rows scored, the mean fit and the share with fit >= 6, and in "notes" at most
  3 lines on where the rubric was hard to apply (which part, which kind of story).`
}

const AUDIT = `You are the corpus auditor of the journal-corpus study. The corpus ${J}/corpus.csv was built from web-search
results by three collectors; your job is to check that its rows are real and faithful. Read ${J}/README.md section 3
first.

Audit every SEARCH row (source search) whose id ends in 0 (C1-010, C1-020, ..., C2-010, ..., C4-010, ...: about 10 %
of the search rows; the feed rows come from the outlets' own feeds and are not audited). For each:
- Run WebSearch (mode "standard") for its headline, with allowed_domains set to the outlet's domain (TIME time.com,
  Forbes forbes.com, Bloomberg bloomberg.com, Fortune fortune.com, MIT Technology Review technologyreview.com, Scientific
  American scientificamerican.com, National Geographic nationalgeographic.com, Smithsonian smithsonianmag.com, The
  Washington Post washingtonpost.com, CNN cnn.com, NPR npr.org). WebFetch and curl on these sites fail here: don't try.
- found: Y if a result is the same article (the same URL, or the same article at an equivalent URL); url_match: exact /
  equivalent / none; date_match: Y / N / unknown (from the URL or the result's text); summary_ok: Y / partly / N (is
  our one-line summary consistent with what the result says, with no fact the result doesn't support?); note: what is
  wrong, in a few words.
- Write ${J}/audit.csv with the columns id,outlet,found,url_match,date_match,summary_ok,note (Python csv module;
  append as you go). Scratch in ${SCRATCH}/journals-audit/.

RULES: write only audit.csv; never edit corpus.csv or any scores file; no git; no agents. Final reply (data for the
orchestrator): the counts, and in "problems" the ids that failed and why (at most 3 lines).`

phase('Score')
const [first, blind, audit] = await parallel([
  () => agent(scorer('first'), { label: 'score:first', phase: 'Score', schema: SCORE_SCHEMA, effort: 'max' }),
  () => agent(scorer('blind'), { label: 'score:blind', phase: 'Score', schema: SCORE_SCHEMA, effort: 'max' }),
  () => agent(AUDIT, { label: 'audit', phase: 'Audit', schema: AUDIT_SCHEMA, effort: 'max' }),
])
return { first, blind, audit }
