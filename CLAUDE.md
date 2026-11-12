# LuxuryBoma platform (Realogic first)

Start with the handoff, then the Next.js rules:

@HANDOFF.md
@AGENTS.md

Standing rules:

- Run `npm test`, `npm run lint`, `npm run typecheck` and `npm run build` before every commit.
- Never edit an applied migration; add a new one. Every new table gets row-level security, grants, policies and a test.
- Never print or commit secrets. `.env` is local only. The repo is public.
- Do not weaken the independence rules (HANDOFF.md section 6) to make a feature easier.
- Windows machine, PowerShell.
