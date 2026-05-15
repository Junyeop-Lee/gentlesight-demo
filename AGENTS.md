# GentleSight Harness

## Active Harness

Use `.agents/skills/gentlesight-issue-orchestrator/SKILL.md` when working on GentleSight issue resolution, PR automation, squash merge flow, UI acceptance QA, or privacy-safe product delivery.

Use `.agents/skills/gentlesight-ai-api-readiness/SKILL.md` when working on OpenAI integration readiness, AI API keys, `/api/report`, AI-generated guardian report messages, privacy-safe AI boundaries, or PRD issue creation for the AI API plan.

Use `.agents/skills/gentlesight-deployment/SKILL.md` when deploying to Vercel, updating the live URL, managing environment variables, or rolling back a production deployment.

## Agent Team

- `.codex/agents/issue-orchestrator.toml`: issue sequencing, PR readiness, and merge coordination.
- `.codex/agents/ai-api-engineer.toml`: OpenAI SDK, Responses API, server-only report generation, route response shape, and fallback behavior.
- `.codex/agents/privacy-contract-reviewer.toml`: AI payload privacy boundary, raw-field blocking, bilingual safety, and leakage-prevention tests.
- `.codex/agents/ui-implementer.toml`: fixed phone UI, overlay layout, and privacy-safe interface copy.
- `.codex/agents/qa-reviewer.toml`: PRD acceptance, privacy boundary, responsive UI, and regression checks.
- `.codex/agents/deployment-operator.toml`: Vercel deployment, environment variables, public URL, rollback.

## Trigger Rules

- For implementation issues, first identify whether work is sequential or parallel-safe.
- For AI API readiness work, use the dedicated AI API readiness skill and keep the four work issues sequential: API contract, OpenAI fallback, UI connection, tests/docs.
- For UI work, preserve Interactive Home as the primary screen and keep the phone surface fixed-height.
- For privacy work, do not expose raw appliance data in default UI; use the explicit unlock path only.
- For deployment work, always run `npm run build` before deploying; never commit `.env` files; record the live URL in both `README.md` and `docs/deployment.md`.

## Change Log

| Date | Change | Target | Reason |
| --- | --- | --- | --- |
| 2026-05-10 | Initial GentleSight harness | `.codex/agents`, `.agents/skills`, `AGENTS.md` | Sequential issue delivery, QA, PR creation, and squash merge automation |
| 2026-05-10 | Added phone ratio and opacity rule | `.codex/agents/ui-implementer.toml`, `.agents/skills/gentlesight-issue-orchestrator/SKILL.md` | Phone UI should keep a realistic portrait ratio and opaque surfaces |
| 2026-05-10 | Refined phone scale and day simulation rule | `app/globals.css`, `lib/simulationClock.ts`, `.codex` and `.agents` harness docs | Phone should be compact and the simulation should stop after a full day at next-day 05:00 |
| 2026-05-13 | Added deployment harness | `.codex/agents/deployment-operator.toml`, `.agents/skills/gentlesight-deployment/SKILL.md`, `docs/deployment.md`, `AGENTS.md` | Vercel deployment automation, URL recording, env var policy, rollback procedure |
| 2026-05-15 | Added AI API readiness harness | `.codex/agents`, `.agents/skills`, `AGENTS.md` | OpenAI report-readiness PRD, sequential issue workflow, privacy review, and QA handoff |
