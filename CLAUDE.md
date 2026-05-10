# GentleSight Harness

## Active Harness

Use `.claude/skills/gentlesight-issue-orchestrator/SKILL.md` when working on GentleSight issue resolution, PR automation, squash merge flow, UI acceptance QA, or privacy-safe product delivery.

## Agent Team

- `.claude/agents/issue-orchestrator.md`: issue sequencing, PR readiness, and merge coordination.
- `.claude/agents/ui-implementer.md`: fixed phone UI, overlay layout, and privacy-safe interface copy.
- `.claude/agents/qa-reviewer.md`: PRD acceptance, privacy boundary, responsive UI, and regression checks.

## Trigger Rules

- For implementation issues, first identify whether work is sequential or parallel-safe.
- For UI work, preserve Interactive Home as the primary screen and keep the phone surface fixed-height.
- For privacy work, do not expose raw appliance data in default UI; use the explicit unlock path only.

## Change Log

| Date | Change | Target | Reason |
| --- | --- | --- | --- |
| 2026-05-10 | Initial GentleSight harness | `.claude/agents`, `.claude/skills`, `CLAUDE.md` | Sequential issue delivery, QA, PR creation, and squash merge automation |
