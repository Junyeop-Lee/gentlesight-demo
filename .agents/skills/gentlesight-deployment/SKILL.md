---
name: gentlesight-deployment
description: GentleSight Vercel deployment skill — pre-build verification, Vercel link/deploy, URL recording, post-deploy QA checklist. Trigger when asked to deploy, check deployment status, update live URL, or manage environment variables.
---

# GentleSight Deployment Skill

Use this skill for any task involving: deploying to Vercel, updating the live URL, adding environment variables, rolling back a bad deploy, or checking deployment status.

## When to Trigger

- "배포해줘", "deploy", "Vercel에 올려줘"
- "live URL 업데이트", "README URL 바꿔줘"
- "env var 추가", "API key 등록"
- "롤백", "이전 버전으로 되돌려줘"
- "배포 확인", "배포 상태"

## Step 1: Pre-deploy Check

```bash
# Must pass before any deploy
git status --short --branch   # confirm clean tree on correct branch
npm run build                  # must succeed with no errors
```

Stop and fix build errors before proceeding. Do not deploy a broken build.

## Step 2: Vercel Authentication (first time only)

```bash
# Check if already authenticated as Junyeop-Lee
gh auth status

# If not authenticated or wrong account:
npx vercel@latest login       # browser flow — user must complete in browser
```

Confirm active account is `Junyeop-Lee` before continuing.

## Step 3: Link Project (first time only)

```bash
npx vercel@latest link
```

Respond to prompts:
- **Set up and deploy:** Yes
- **Which scope:** Junyeop-Lee
- **Link to existing project:** No (first time) / Yes (reconnecting)
- **Project name:** `gentlesight-demo`
- **Root directory:** `.`

## Step 4: Deploy

```bash
# Production
npx vercel@latest --prod

# Preview (PR or staging)
npx vercel@latest
```

Copy the production URL from CLI output.

## Step 5: Record URL

Update two files with the live URL:

**README.md** — add/update at the top:
```markdown
## Live Demo
[gentlesight-demo.vercel.app](https://gentlesight-demo.vercel.app)
```

**docs/deployment.md** — replace the placeholder comment with the actual URL.

## Step 6: Post-deploy QA

Run through each item after every production deploy:

- [ ] `/` loads — mobile portrait shows landscape warning
- [ ] `/` loads — mobile landscape shows Interaction Home full screen
- [ ] Guardian / Status / Baseline / Privacy mode switching works
- [ ] `/api/report` returns data without exposing raw appliance fields
- [ ] README.md Live Demo URL matches actual production URL
- [ ] PR preview deployment created for any open PRs

## Rollback Procedure

```bash
# List deployments
npx vercel@latest ls gentlesight-demo

# Promote a known-good deployment
npx vercel@latest rollback <deployment-url>
```

Or use Vercel Dashboard → Deployments → ⋯ → Promote to Production.

After rollback: open a GitHub issue with root cause and affected deployment URL.

## Environment Variables

Never commit secrets. Register in Vercel Dashboard → Settings → Environment Variables.

| Variable | Required now | Notes |
|---|---|---|
| *(none)* | — | Prototype has no external APIs |
| `OPENAI_API_KEY` | No | Add when AI features are introduced |
| `ANTHROPIC_API_KEY` | No | Add when AI features are introduced |

## Key Constraints

- No `.env` files in git
- No force-push to `main`
- Build must pass before deploy
- `Junyeop-Lee` account must be active in `gh` CLI for PR/push operations
