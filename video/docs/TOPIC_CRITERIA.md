# Topic criteria (G0): what a story is picked by

The one list the G0 editor scores every candidate on (1-10 each) and the owner sees with the shortlist, **in the owner's
order of importance** (2026-10-28: "lets make it relevant first but include buzz here too and surprise, then true and
solid, then fresh, then visually appealing, then mood. Then shareabliity potential"; then "lets move the freshness lower
and make it last month or so"; then, 2026-10-29, truth moved down: "Actually let's move truth down the list it's okay to exhagerste a bit like in this case so we don't have to be exactly precise like a law firm / Exaggerating and generalizing and making it bigger is fine"). The weighted score is
(6 x 1 + 5 x 2 + 4 x 3 + 3 x 4 + 2 x 5 + 1 x 6) / 21, out of 10; `video/scripts/topic_chart.py` draws it for the owner
as a column chart (every shortlist comes with it). **Out whatever it scores: a story whose core event didn't happen**
(exaggeration is fine; inventing the event is not).

**Never baity** (playbook, Audience and goal): each proposed core line is heard cold over its first frame: "ad or
news?". A line that sounds like a commercial (a sales question, a testimonial, a feature demo, the product as the first
picture) is reworded as news (what happened, then why it matters) or the story is out. A company's launch or a gadget
story starts with ad risk (v3 opened like an ad: 64.5 % skipped).

1. **Relevant, with buzz and surprise (weight 6):** a big question millions care about, with a concrete "so what" for
   an ordinary person; people are already talking about it (the "fuss"); a "wait, seriously?" fact or a twist. Tech,
   AI or AI-adjacent (science, health tech, space, robots, computers, energy); not a past video's topic; Anthropic not
   a key entity.
2. **Visually appealing in our look (weight 5)**, judged against `docs/look/DIRECTION.md`: a literal subject that reads
   with the sound off; one thread object for the whole story; a cozy home place and room for one scale moment; a
   physical frame-0 hook (the expected thing, then reality overtaking it); small people acting with their pose, no
   faces; few words in the picture; nothing we can't draw (logos, product screens, a real person's likeness, gore).
3. **The mood the slate needs (weight 4):** a positive story after a negative one (hopeful, never hype), and vice versa.
4. **True enough (weight 3):** the core event really happened and the big claim holds in spirit (one solid source, or
   the fact lock). Rounding up, generalizing and making it bigger are fine; no law-firm precision (the owner, 2026-10-29,
   on the Big Bend reel's "New York once got a proposal" for an architect's concept).
5. **Fresh (weight 2):** news from about the last month (10 = the last week, 8 = within the month, lower for older work
   newly reported, low for older).
6. **Shareable (weight 1):** a reason to send it to someone.

Tie-breaker: one real person in their own words (or a direct question to the viewer), and a plain core line the video
can pay off without walking it back.
