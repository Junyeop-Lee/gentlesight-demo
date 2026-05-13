# GentleSight

**Live Demo:** [gentlesight-demo.vercel.app](https://gentlesight-demo.vercel.app)

GentleSight is an interactive Next.js prototype that explains how NILM-style home energy signals can be interpreted as daily living routines and summarized for a guardian-facing app.

The demo uses local mock data only. It does not connect to a live NILM model, database, or LLM provider yet.

## Overview

GentleSight presents a realistic home scene where simulated time flows on its own. The app compares the current day against a mock 28-day personal baseline and summarizes only living-rhythm changes for a guardian-facing phone UI.

The prototype focuses on:

- Autonomous day simulation with reset, pause, and fast preview controls
- Appliance interaction over a realistic home image
- Personal baseline comparison without manual normal/delayed scenario toggles
- Role-specific Guardian Phone reports for family guardians and social workers
- Privacy-safe living-rhythm panels instead of raw appliance logs
- A locked educational explainer showing how user-created demo inputs are summarized

## Features

- Interactive home view with appliance touch targets
- Autonomous simulated time starting at 07:30
- Bottom action bar with `상태 보기`, `평소와 비교`, and `프라이버시 요약`
- Guardian phone panel with role selection and Korean report copy
- Privacy summary panel with explicit confirmation before raw-processing logs
- Future AI API boundary at `POST /api/report`

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Framer Motion
- lucide-react
- CSS with global prototype styles

## Getting Started

### Requirements

- Node.js 20 or later recommended
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Open `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run start
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server |

## Project Structure

```text
app/
  api/report/       Privacy-safe report API placeholder
  globals.css       Shared UI styles
  prototype.css     Full-screen prototype layout overrides
components/         UI components for home, action panels, phone, privacy
data/               Mock routine and appliance dataset
docs/               Product and planning documents
lib/                Rule-based NILM logic and AI payload helpers
public/             Static prototype images
.github/            GitHub issue, PR, ownership, and dependency config
```

## Privacy Model

The default guardian UI does not send raw appliance events to the AI report endpoint. The API rejects raw event fields such as `events`, `appliance`, `applianceLabel`, `powerDelta`, `duration`, `waveform`, `time`, and `baselineTime`.

For prototype explanation, the privacy panel can reveal raw processing logs only after explicit confirmation. This is intended to show how user-created demo inputs are transformed into safer summaries:

```text
Raw demo input -> De-identified living-rhythm signal -> AI-safe report input
```

## AI API Contract

`POST /api/report` currently validates a privacy-safe report payload and returns the generated prompt that a future LLM call can use.

Expected payload:

```json
{
  "routineState": "아침 루틴 지연",
  "confidence": 91,
  "severity": "caution",
  "role": "family",
  "riskScore": 84,
  "baselineComparison": "개인 기준선 07:50-08:20",
  "reasonSummary": "오전 활동 시작이 기준선보다 늦음",
  "trendSummary": "확인 필요",
  "recommendedAction": "전화하기",
  "privacyPolicyMarker": "PRIVACY_SAFE_SUMMARY_ONLY"
}
```

Raw fields are blocked even when nested inside another object.

## Documentation

- [Product Requirements Document](docs/prd.md)
- [Product Plan](docs/product-plan.md)

## Repository Management

Use GitHub issues for tasks and bugs, and pull requests for all reviewable changes. The repository includes:

- Issue templates under `.github/ISSUE_TEMPLATE/`
- Pull request template under `.github/PULL_REQUEST_TEMPLATE.md`
- CODEOWNERS under `.github/CODEOWNERS`
- Dependabot npm update configuration under `.github/dependabot.yml`
- CI build workflow under `.github/workflows/ci.yml`

## License

No license has been specified yet. Treat this repository as all rights reserved until a license is added.
