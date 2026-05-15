---
name: gentlesight-issue-orchestrator
description: "Use for GentleSight GitHub issue implementation, PR automation, squash merge flow, UI acceptance QA, and privacy-safe product delivery. Trigger whenever the user asks to resolve GentleSight issues, automate PRs, or continue issue batches. Route OpenAI, AI API key, /api/report, and privacy-safe AI readiness work to gentlesight-ai-api-readiness."
---

# GentleSight Issue Orchestrator

Use this workflow when resolving GentleSight implementation issues.

## Order Of Work

1. Read the current branch, worktree status, issue list, and PRD acceptance criteria.
2. Resolve issues in priority order. Items tagged as sequential must not be implemented in parallel with dependent tasks.
3. If the request is about OpenAI, an AI API key, `/api/report`, AI-generated guardian messages, or the previous AI API readiness PRD, use `.agents/skills/gentlesight-ai-api-readiness/SKILL.md` and follow its ordered issue sequence.
4. Keep the Interactive Home as the main canvas. Other UI surfaces should appear as overlays or bottom controls.
5. Maintain the privacy boundary:
   - Default UI shows living-rhythm summaries only.
   - Raw event logs are available only through the explicit privacy unlock explanation.
   - AI API inputs should use privacy-safe summaries, not raw appliance-level events.
6. Treat AI API readiness implementation as sequential until the API contract and fallback behavior are stable.
7. Keep phone UI compact, realistic portrait smartphone ratio near 9:19.5, and opaque. Manage extra content inside the phone frame.
8. Verify with `npm run build`, `git diff --check`, and browser QA when possible.
9. Create a PR that references all resolved issues, then squash merge when checks and requested QA are complete.

## PR Automation Checklist

- Create or reuse a focused branch.
- Commit only intended files.
- Push the branch.
- Create a PR with `Closes #...` references for all completed issues.
- Use squash merge and delete the branch when the user requested automation.

If sandbox, network, or GitHub authorization blocks a step, stop at the blocked step and report the exact command that needs approval or manual execution.
