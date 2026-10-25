# context/: everything the orchestrating session knew, exported 2026-10-25

Start with `../HANDOFF.md`. This folder is the raw material behind it.

| Path | What |
|---|---|
| `conversation/USER_MESSAGES.md` | every message the owner sent, verbatim, with UTC timestamps |
| `conversation/CONVERSATION_2026-10-24.md`, `..._2026-10-25.md` | the full thread: owner messages, the assistant's replies as the owner saw them, subagent hand-backs and context-compaction markers |
| `conversation/ACTIONS_LOG.md` | one line per tool call the orchestrator made (time, tool, what) |
| `summaries/compaction_1..3.md` | the summaries the session continued from each time its context filled up; `compaction_3.md` is the latest |
| `uploads/` | the owner's screenshots and screen recordings that are not already in `video/assets/` (see `uploads/README.md`) |
| `workflows/` | every multi-agent Workflow script run in the session, with full agent prompts; `INDEX.md` lists the runs |
| `agent_reports/` | per workflow run, each agent's final report (and which agents failed) |
| `scratchpad_tools/` | throwaway working scripts from the session scratchpad (the maintained tools are in `video/scripts`, `video/audio/tools`); `export_context.py` regenerates this folder from a session transcript |

Redactions: the owner's email address is removed everywhere. Subagent transcripts (3.3 GB) and render scratch (11 GB)
were not exported; their results are in `agent_reports/` and the repo itself.
