# AGENTS.md

Metrix Realty Group - Professional Website

## Stack & commands
- Framework: Node
- Build: `npm run build`

## Routing & rules (canonical — read before non-trivial work)
Canonical routing lives in `~/guest-getter/company-os/context/ai-tool-routing-2026-06-19.md` (tool + model routing, session naming, API-first writes). At session start, query the open-brain MCP (`brain_search`) for prior decisions, client context, or Kyle's voice before re-asking.

- Never fabricate metrics. Pull the number live or say it is unknown.
- API-first writes: Company OS registry, then 1Password/env, then a direct API/script, before app connectors.
- Do NOT do these without Kyle's explicit approval: client-facing sends, plaintext secrets, git history rewrites, production or `main` deploys.
- No em dashes or en dashes in Kyle's voice.

## Debugging & shipping discipline (2026-07-16)

Kyle's global working rules (source of truth: the same-named section in `~/.claude/CLAUDE.md`). They apply to every agent working in this repo — Claude Code, Cursor Agent, Codex, or any other. These are hard rules, not suggestions.

1. **Root-cause-first, no exceptions.** On any bug report, do NOT change code until the failure is reproduced with evidence: the actual deployed/live state, logs, a screenshot, or a failing test. State the confirmed root cause before proposing a fix. No speculative "try this" fixes.
2. **UI complaints: confirm intent before iterating.** When Kyle says a UI "looks bad / is broken," establish whether it's the visual design or a layout/functional bug (get or take a screenshot) before touching code.
3. **Every production hotfix leaves a regression test behind.** If a bug reached production (or a preview Kyle saw), the fix is not done until a test that would have caught it exists and runs in this repo's build/CI. If the repo has no test infra, add the minimal harness for that one test.
4. **Gate before merge, not after.** Before merging anything prod-facing: build + typecheck + run whatever tests exist + eyeball a preview screenshot against live. The post-deploy verify loop is the second net, not the first. A hotfix after merge is a process failure even when the hotfix works.
5. **Checkpoint long work early.** Commit/tag or write a PICKUP note as soon as there's durable state worth keeping, not at the end of the session.
