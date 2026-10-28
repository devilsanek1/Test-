export const meta = {
  name: 'journals-collect',
  description: 'Journal-corpus study, step 1: three collectors build a sample of real stories from 11 big outlets (last 30 days) from search results',
  phases: [
    { title: 'Collect', detail: '3 collectors, outlets split; rows written to parts/ as they go' },
  ],
}

const J = '/home/user/Test-/video/docs/studies/2026-10-28_city_posters/journals'
const SCRATCH = '/tmp/claude-0/-home-user-Test-/3f39faed-1bdf-5258-8a21-7148ee2f778a/scratchpad'

const COLLECTORS = [
  { key: 'C1', outlets: [
    ['TIME', 'time.com'], ['Forbes', 'forbes.com'], ['Bloomberg', 'bloomberg.com'], ['Fortune', 'fortune.com'] ] },
  { key: 'C2', outlets: [
    ['MIT Technology Review', 'technologyreview.com'], ['Scientific American', 'scientificamerican.com'],
    ['National Geographic', 'nationalgeographic.com'], ['Smithsonian', 'smithsonianmag.com'] ] },
  { key: 'C3', outlets: [
    ['The Washington Post', 'washingtonpost.com'], ['CNN', 'cnn.com'], ['NPR', 'npr.org'] ] },
]

const SCHEMA = {
  type: 'object',
  properties: {
    rows: { type: 'number' },
    per_outlet: { type: 'array', items: { type: 'object', properties: {
      outlet: { type: 'string' }, rows: { type: 'number' }, a_rows: { type: 'number' }, b_rows: { type: 'number' },
      queries: { type: 'number' } }, required: ['outlet', 'rows'] } },
    notes: { type: 'string' },
  },
  required: ['rows', 'per_outlet', 'notes'],
}

function brief(c) {
  const list = c.outlets.map(([n, d]) => `${n} (${d})`).join(', ')
  return `You are collector ${c.key} of the journal-corpus study (a research thread for a short-form explainer channel).
Your job: build a fair sample of REAL stories that these outlets published between 2026-09-28 and 2026-10-28:
${list}.

Read first: ${J}/README.md, sections 1-3 (the question, the refinements, and "3. The corpus": follow section 3 exactly).
Today is 2026-10-28.

HOW TO SEARCH
- Use the WebSearch tool only, mode "standard" ("extended" only when a standard result is thin), with allowed_domains set
  to the outlet's domain on every query. WebFetch and curl on these sites fail in this environment: don't try them.
- Per outlet, stratum A (section-neutral): one query per section the outlet actually runs, from this list: world; US and
  politics; business and economy; technology and AI; science; health; climate and environment; culture, arts and
  entertainment; travel and lifestyle; history; sport (news outlets only). Phrase it "<outlet> <section> October 2026".
  From each result list take the in-window ARTICLE links IN THE ORDER RETURNED, at most 2 per query. Never choose by
  whether a story looks visual or interesting: that is the point of stratum A. Expect about 14-20 A rows per outlet.
- Per outlet, stratum B (place-targeted): 3 queries, picking the 3 themes that suit the outlet from: city; architecture
  or building; landmark; archaeology; storm, flood, wildfire or earthquake; river, ocean or coast; mountain, volcano or
  glacier; infrastructure (bridge, dam, rail, port, tunnel); festival or season; wildlife in a place; megaproject; the
  sky or space. Same rule: in-window articles in the order returned, at most 2 per query (about 6 B rows per outlet).
- Aim for about 22 rows per outlet (A + B), at least 18, at most 26. If an outlet gives too few in-window articles, run
  1-3 extra section queries (late-September variants, or "this week") and say so in your notes; never pad.

WHAT A ROW IS (and is not)
- Every row comes from a real search result: the URL exactly as returned, the headline as returned (the result's title,
  minus a trailing " - Outlet" or " : NPR" suffix). Never invent or "fix" a URL, a headline or a date.
- The date (YYYY-MM-DD): from the URL when it carries one (date_source "url"), else as the search result's text states
  it for that article (date_source "result"). No date seen: skip the result (one targeted search on its headline is
  allowed to find the date). Outside 2026-09-28..2026-10-28: skip.
- Skip non-stories: section, tag, author, topic and index pages; price or data tickers and rate tables (e.g. Fortune's
  "current price of gold"); methodology pages; videos or podcasts with no article page; press-room posts; sponsored
  content (BrandVoice, "paid post"); Forbes Councils posts (forbes.com/councils/); live blogs older than the window;
  exact duplicate URLs. Keep news, features, analysis, opinion, interviews, reviews, lists and live coverage pages.
- summary: ONE line in YOUR OWN words, 15-35 words: what happened, where (name the place if there is one), and the
  so-what for an ordinary person. Paraphrase what the search result says; never paste sentences from it or from the
  article (the repo is public; paywalls are respected). If the result gives too little to summarise honestly, run one
  search on the headline, or skip the row. Never add facts the results don't state.
- section: from the URL path (e.g. "science", "world", "opinion"; forbes.com/sites/<name>/ -> "contributor") or the
  outlet's own label. type: news / feature / analysis / opinion / interview / review / list / live.

FILES (write as you go: a usage limit can stop you at any moment)
- Rows: ${J}/parts/corpus_${c.key}.csv with the header
  id,outlet,date,date_source,headline,url,section,type,stratum,query,summary,collector
  id = ${c.key}-001, ${c.key}-002, ... ; stratum = A or B; query = the exact query string; collector = ${c.key}.
  Append with a small Python script using the csv module (UTF-8, standard quoting) after EACH outlet at the latest;
  never hand-write CSV lines. Check the file parses (python3 -c "import csv; print(sum(1 for _ in csv.DictReader(open(...))))").
- Query log: ${J}/parts/queries_${c.key}.txt: one line per query run: outlet | stratum | query | links returned | rows
  kept | skipped (with the reasons, e.g. "2 out of window, 1 hub page").
- Scratch (anything else) goes to ${SCRATCH}/journals-${c.key}/.

RULES
- Write only your two files (and scratch). No git commands. Don't edit any other file. Don't start agents or workflows.
- Every agent you might start must run at max effort (repo rule) - but you start none.
- Final reply (it is data for the orchestrator): your row total, rows per outlet (A and B), queries run per outlet, and
  in "notes" at most 3 lines: anything that bends the sample (an outlet with few in-window results, one week's event
  crowding a section, dates hard to establish).`
}

phase('Collect')
const results = await parallel(COLLECTORS.map(c => () =>
  agent(brief(c), { label: `collect:${c.key}`, phase: 'Collect', schema: SCHEMA, effort: 'max' })
    .then(r => ({ key: c.key, ...r }))))
return results.filter(Boolean)
