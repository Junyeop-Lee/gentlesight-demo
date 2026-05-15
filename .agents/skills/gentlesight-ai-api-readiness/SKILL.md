---
name: gentlesight-ai-api-readiness
description: GentleSight OpenAI and AI API readiness orchestrator. Trigger for OpenAI, AI API keys, /api/report, report generation, privacy-safe AI boundaries, PRD issue creation, "continue previous AI API plan", or any request to make the AI integration ready without adding secrets.
---

# GentleSight AI API Readiness

Use this skill when planning, publishing, implementing, or resuming GentleSight AI API readiness work. This workflow prepares the app so an API key can enable OpenAI-backed guardian report messages while preserving the privacy boundary.

## Scope

- Prepare `POST /api/report` and the guardian report flow for OpenAI.
- Use OpenAI Responses API through the official SDK.
- Default model is `gpt-5.4-mini`; allow `OPENAI_REPORT_MODEL` override.
- Require `OPENAI_API_KEY` only at runtime; never commit secrets or `.env` files.
- AI may generate only the report `message`. Rule-based code remains authoritative for title, severity, tone, CTA, and badge.
- Support Korean and English by carrying `language` through the privacy-safe input.

Out of scope unless explicitly requested: deployment, Vercel env var mutation, production rollout, real NILM model integration, database persistence, and raw event transmission.

## Context Check

Start each run by checking:

1. Current branch and worktree status.
2. Open GitHub issues, if network and auth are available.
3. Existing `/api/report`, `lib/privacySafeAi`, guardian phone, and QA/test setup.
4. Whether a parent PRD issue or AI API work issues already exist.

If matching issues exist, continue from them instead of creating duplicates. If GitHub is unavailable, prepare the issue bodies and state the blocked command.

## Issue Workflow

When asked to publish or resume the PRD, create or reuse:

- Parent PRD issue with labels: `enhancement`, `area:api`, `area:privacy`, `area:guardian-app`, `priority:p0`, `coordination:sequential`.
- Work issue 1: API contract and validation, labels `order:01`, `area:api`, `area:privacy`, `priority:p0`, `coordination:sequential`.
- Work issue 2: OpenAI SDK service and fallback, labels `order:02`, `area:api`, `priority:p0`, `coordination:sequential`.
- Work issue 3: Guardian UI integration, labels `order:03`, `area:guardian-app`, `area:api`, `priority:p1`, `coordination:sequential`.
- Work issue 4: Vitest, docs, and verification, labels `order:04`, `area:qa`, `documentation`, `priority:p1`, `coordination:sequential`.

Do not create `ready-for-agent`; this repository currently uses the existing labels above.

## Implementation Order

Implement sequentially. Do not parallelize UI integration before the API fallback contract is stable.

1. Contract and validation:
   - Extend the privacy-safe input with `language`.
   - Keep recursive blocked raw-field rejection.
   - Return a stable API response shape such as `message`, `source`, and safe metadata.
2. OpenAI service:
   - Add a server-only generator module.
   - Use Responses API with `OPENAI_API_KEY`, default model `gpt-5.4-mini`, and optional `OPENAI_REPORT_MODEL`.
   - Keep generated output short, warm, role-aware, and free of raw appliance data.
   - Fall back to the rule-based message on missing key, provider failure, or unsafe output.
3. Guardian UI:
   - Build privacy-safe input from existing ADL, anomaly, role, language, and rule-based report state.
   - Call `/api/report` only after the local fallback message exists.
   - Cache or debounce by input signature so simulated time does not spam the API.
4. QA and docs:
   - Add Vitest or the smallest suitable test runner.
   - Cover raw-field rejection, valid payload acceptance, missing-key fallback, provider request shape, unsafe output fallback, and bilingual handling.
   - Update README/deployment docs for env vars and verification commands.

## Agent Handoffs

- `ai-api-engineer` owns OpenAI SDK, Responses API, server-only modules, env handling, route response shape, and fallback behavior.
- `privacy-contract-reviewer` owns raw-field policy, privacy-safe payload review, bilingual boundary checks, and leakage-prevention tests.
- `ui-implementer` owns guardian phone wiring only after the API contract and fallback are complete.
- `qa-reviewer` performs cross-boundary checks between API response shape, frontend hook usage, and privacy tests.
- `deployment-operator` is used only when the user asks to deploy or mutate Vercel environment variables.

## Error Handling

- Missing API key is not an error for the demo; return fallback output.
- Provider/network errors should not break the guardian phone.
- Unsafe generated text must be discarded and replaced with the rule-based message.
- If GitHub, sandbox, or network access blocks issue publication, stop the write action and report the exact command that needs approval or manual execution.

## Test Scenarios

- Normal: "AI API key ready connection" creates or reuses the PRD issue sequence, then implements contract, service, UI, and tests in order.
- Resume: "continue previous AI API plan" reads existing issue state and starts from the first incomplete order label.
- Safety: a payload containing nested `events`, `appliance`, `time`, or `waveform` is rejected before any provider call.
- Deployment boundary: "set the OpenAI key on Vercel" routes to `gentlesight-deployment`, not this skill.
