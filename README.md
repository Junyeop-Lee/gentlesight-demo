# GentleSight

GentleSight is an interactive Next.js prototype that explains how NILM-style home energy signals can be interpreted as daily living routines and summarized for a guardian-facing app.

The demo uses local mock data only. It does not connect to a live NILM model, database, or LLM provider yet.

## Overview

GentleSight presents a home scene where users can interact with household appliances over a simulated daily timeline. Each interaction accumulates into routine signals, passes through a three-step AI pipeline, and updates a guardian phone report.

The prototype focuses on:

- Storytelling through a day timeline
- Appliance interaction over a realistic home image
- ADL inference from appliance combinations
- Baseline/anomaly comparison
- Guardian report generation with typing animation
- A privacy layer that shows how raw signals are summarized before AI usage

## Features

- Interactive home view with appliance touch targets
- Timeline for morning, noon, evening, and night routine progression
- Guardian phone panel with live Korean report copy
- Pipeline summary for inference, anomaly detection, and LLM generation
- Privacy summary panel with an optional raw-signal explainer
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
components/         UI components for home, timeline, pipeline, phone, privacy
data/               Mock routine and appliance dataset
docs/               Product and planning documents
lib/                Rule-based NILM logic and AI payload helpers
public/             Static prototype images
.github/            GitHub issue, PR, ownership, and dependency config
```

## Privacy Model

The default guardian UI does not send raw appliance events to the AI report endpoint. The API rejects raw event fields such as `events`, `appliance`, `applianceLabel`, `powerDelta`, `duration`, `waveform`, `time`, and `baselineTime`.

For prototype explanation, the privacy panel can reveal raw values after an explicit user action. This is intended to show how raw signals are transformed into safer summaries:

```text
Raw signal -> Local routine summary -> AI-safe report input
```

## AI API Contract

`POST /api/report` currently validates a privacy-safe report payload and returns the generated prompt that a future LLM call can use.

Expected payload:

```json
{
  "routineState": "아침 루틴 지연",
  "confidence": 91,
  "severity": "caution",
  "riskScore": 84,
  "trendSummary": "평소보다 늦은 루틴 시작",
  "recommendedAction": "안부 전화 걸기",
  "privacyPolicy": "No raw activity data."
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
