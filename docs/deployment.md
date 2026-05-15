# GentleSight Deployment

## Live Demo

**URL:** https://gentlesight-demo.vercel.app

## Platform

| Item | Value |
|---|---|
| Platform | Vercel |
| Framework | Next.js (auto-detected) |
| Repo | [Junyeop-Lee/gentlesight-demo](https://github.com/Junyeop-Lee/gentlesight-demo) |
| Branch | `main` → production |
| PR branches | preview deployments (auto) |

## Build

```bash
# Install
npm ci

# Production build (verified locally before deploy)
npm run build

# Output directory: Vercel default (.next)
```

## Deploy

### First-time setup

```bash
# 1. Authenticate (browser flow)
npx vercel@latest login

# 2. Link repo to Vercel project
npx vercel@latest link
# → Project name: gentlesight-demo
# → Framework: Next.js
# → Root directory: .

# 3. Deploy to production
npx vercel@latest --prod
```

### Subsequent deploys

Push to `main` → Vercel auto-deploys production.
Open a PR → Vercel auto-creates a preview URL.

## Environment Variables

No environment variables are required for local fallback behavior.

When adding AI API features, register variables in the Vercel Dashboard only — **do not commit `.env` files**:

| Variable | Purpose | Where to set |
|---|---|---|
| `OPENAI_API_KEY` | Enables OpenAI-backed guardian report messages | Vercel → Settings → Environment Variables |
| `OPENAI_REPORT_MODEL` | Optional model override; defaults to `gpt-5.4-mini` | Vercel → Settings → Environment Variables |
| `ANTHROPIC_API_KEY` | Reserved for future provider expansion | Vercel → Settings → Environment Variables |

## Rollback

### Via Vercel Dashboard
1. Open the project in [vercel.com/dashboard](https://vercel.com/dashboard)
2. Go to **Deployments** tab
3. Find the last known-good deployment
4. Click **⋯ → Promote to Production**

### Via CLI
```bash
# List recent deployments
npx vercel@latest ls

# Rollback to a specific deployment URL
npx vercel@latest rollback <deployment-url>
```

## Sharing with Students

Share the production URL directly — no login required. The app serves public, read-only data with no real user PII.
