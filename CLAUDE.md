# GentleSight Harness

## Active Harness

Use `.claude/skills/gentlesight-issue-orchestrator/SKILL.md` when working on GentleSight issue resolution, PR automation, squash merge flow, UI acceptance QA, or privacy-safe product delivery.

Use `.claude/skills/gentlesight-deployment/SKILL.md` when deploying to Vercel, updating the live URL, managing environment variables, or rolling back a production deployment.

## Agent Team

- `.claude/agents/issue-orchestrator.md`: issue sequencing, PR readiness, and merge coordination.
- `.claude/agents/ui-implementer.md`: fixed phone UI, overlay layout, and privacy-safe interface copy.
- `.claude/agents/qa-reviewer.md`: PRD acceptance, privacy boundary, responsive UI, and regression checks.
- `.claude/agents/deployment-operator.md`: Vercel deployment, environment variables, public URL, rollback.

## Trigger Rules

- For implementation issues, first identify whether work is sequential or parallel-safe.
- For UI work, preserve Interactive Home as the primary screen and keep the phone surface fixed-height.
- For privacy work, do not expose raw appliance data in default UI; use the explicit unlock path only.
- For deployment work, always run `npm run build` before deploying; never commit `.env` files; record the live URL in both `README.md` and `docs/deployment.md`.

## Change Log

| Date | Change | Target | Reason |
| --- | --- | --- | --- |
| 2026-05-10 | Initial GentleSight harness | `.claude/agents`, `.claude/skills`, `CLAUDE.md` | Sequential issue delivery, QA, PR creation, and squash merge automation |
| 2026-05-10 | Added phone ratio and opacity rule | `.claude/agents/ui-implementer.md`, `.claude/skills/gentlesight-issue-orchestrator/SKILL.md` | Phone UI should keep a realistic portrait ratio and opaque surfaces |
| 2026-05-10 | Refined phone scale and day simulation rule | `app/globals.css`, `lib/simulationClock.ts`, `.claude` harness docs | Phone should be compact and the simulation should stop after a full day at next-day 05:00 |
| 2026-05-13 | Added deployment harness | `.claude/agents/deployment-operator.md`, `.claude/skills/gentlesight-deployment/SKILL.md`, `docs/deployment.md`, `CLAUDE.md` | Vercel deployment automation, URL recording, env var policy, rollback procedure |
