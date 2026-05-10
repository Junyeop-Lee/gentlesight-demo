# Product Plan

This document is the implementation-facing companion to `docs/prd.md`.

## 1. Core Experience

GentleSight should feel like an Interactive Home first. The home image is the main screen, while supporting information appears as overlays:

- Top-left: compact GentleSight brand
- Top-right: simulated time, play/pause, fast preview, reset
- Center: realistic home scene with labeled demo input buttons
- Bottom-center: `상태 보기`, `평소와 비교`, `프라이버시 요약`
- Bottom-right: Guardian Phone entry or phone overlay

The product should not present a technical pipeline as the main story. The user-facing story is living-rhythm change, not raw energy inspection.

## 2. Time And Baseline Model

Time flows automatically from 07:30. A user does not need to click anything for the system to produce state changes.

The current day is compared against a mock 28-day personal baseline:

- Before 08:40 without a morning signal: `안정`
- Around 08:40 without a morning signal: `관찰`
- Around 09:00 without a morning signal: `확인 필요`
- If a morning signal appears late: `관찰 - 늦게 확인됨`

This replaces the old `평소 / 지연` scenario toggle.

## 3. Privacy-Safe Information Design

Raw appliance data is hidden by default.

Allowed default language:

- 생활 리듬
- 개인 기준선
- 아침 활동 시작
- 식사 관련 생활 신호
- 확인 필요

Disallowed in default reports and panels:

- Specific appliance names
- Wattage
- Duration
- Waveform
- Raw event logs

The only exception is the educational privacy explainer. It requires explicit confirmation and shows only the actual demo inputs the user created.

## 4. Guardian Phone Roles

The phone asks for role on first entry:

- `가족 보호자`: warmer copy, `전화하기`, `가족 메모`
- `사회복지사`: operational copy, `전화 확인`, `케이스 메모`, `방문 우선순위`

Role switching remaps copy and actions without recalculating the day or exposing raw data.

## 5. Future AI Boundary

The MVP remains rule-based. Future AI integration should use `POST /api/report` with privacy-safe input only:

- living rhythm state
- baseline comparison
- role
- severity
- reason summary
- recommended action
- privacy policy marker

The API rejects raw fields, including nested `events`, `appliance`, `applianceLabel`, `powerDelta`, `duration`, `waveform`, `time`, and `baselineTime`.
