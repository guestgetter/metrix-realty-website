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
