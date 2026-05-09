# GentleSight Product Requirements Document

## Status

- Product: GentleSight
- Artifact type: Interactive web prototype
- Primary audience: family guardians
- Secondary audience: social workers in a single-case detail view
- Current implementation state: Next.js mock-data prototype
- Future integration: privacy-safe AI report API

## Product Summary

GentleSight is a privacy-preserving home care prototype that turns non-invasive daily living signals into understandable living-rhythm summaries. The product should not feel like a raw appliance log or a surveillance tool. The central experience is an interactive home where time flows naturally, daily routines may or may not occur, and the guardian-facing phone UI explains only meaningful changes in daily rhythm.

The core story is: GentleSight quietly understands changes in daily living patterns, compares them to a personal baseline, and helps a family guardian or social worker decide whether a gentle check-in is needed.

## Technical Foundation

The prototype is grounded in these technical ideas from the discussion notes:

- NILM-style and non-invasive sensor signals can be interpreted as digital biomarkers for daily living and cognitive/health change.
- Personal baselines are necessary because older adults have different daily routines.
- The product should compare today's living rhythm against a learned baseline rather than a fixed universal schedule.
- LLM output should reduce data fatigue by converting technical signals into actionable care guidance.
- Privacy is central: camera-like surveillance and raw device logs should not be part of the default guardian experience.

## Goals

- Make the Interactive Home the primary screen.
- Let simulated time flow automatically, even when the user does nothing.
- Represent absence of expected activity as a meaningful signal.
- Replace explicit `normal / delayed` scenario toggles with internal baseline comparison.
- Keep raw appliance data hidden by default.
- Provide role-specific phone reports for family guardians and social workers.
- Allow educational raw-data explanation only after explicit lock confirmation.
- Prepare a future AI API boundary that receives privacy-safe summaries, not raw appliance events.

## Non-Goals

- No login, account management, or database storage.
- No real NILM model connection in the MVP.
- No real LLM API call in the MVP.
- No multi-household B2G dashboard in the MVP.
- No medical diagnosis language such as dementia suspicion, disease prediction, or emergency diagnosis.
- No full raw timeline shown in the default guardian experience.

## Users

### Family Guardian

Family guardians want to understand whether a parent or older family member's day is progressing normally and whether a check-in call or visit is appropriate.

The tone should be warm, concise, and personal.

Example report:

> 오늘 아침 생활 리듬이 평소보다 늦게 시작된 것으로 보여요. 가볍게 안부를 확인해보세요.

Primary actions:

- Call
- Leave a family note
- Review why check-in is needed

### Social Worker

Social workers use the same home state as a single case detail screen. The MVP does not include a multi-household dashboard, but the social worker mode should hint at operational use through priority, case memo, and recommended follow-up language.

The tone should be objective, concise, and work-oriented.

Example report:

> 개인 기준선 대비 오전 루틴 지연이 확인되었습니다. 전화 확인 또는 방문 우선순위 검토가 권장됩니다.

Primary actions:

- Add case memo
- Mark phone check
- Review visit priority

## Core UX Model

### Main Screen

The main screen is the Interactive Home. Other functions should appear as components over the home, not as separate large page sections.

Required layout:

- Top-left: small GentleSight brand mark
- Top-right: current simulated time and time controls
- Center: realistic home image with demo input buttons
- Bottom-center: global action bar
- Bottom-right: Guardian Phone entry button or open phone UI

Remove from the primary information architecture:

- Large hero section
- Separate timeline panel
- Separate waveform panel
- Technical `Inference / Anomaly / LLM` pipeline labels

### Global Action Bar

The bottom-center global action bar has exactly three buttons:

- 상태 보기
- 평소와 비교
- 프라이버시 요약

The reset button belongs near the time display. The phone open button belongs at the bottom-right.

### Status View

`상태 보기` shows user-facing living state, not technical pipeline details.

Show:

- Current living rhythm state
- Baseline comparison summary
- Observation severity
- Recently interpreted living signal

Do not show:

- Inference / Anomaly / LLM labels
- Power waveform
- Specific appliance names
- Wattage or duration values

### Baseline Comparison

`평소와 비교` compares the current day against a personal baseline.

The baseline is described as:

- `개인 기준선 기준`
- `최근 28일 생활 리듬을 바탕으로 한 예시`

Baseline examples:

- 아침 활동 시작: 평소 07:50-08:20
- 아침 식사 준비: 평소 08:00-08:40
- 오전 휴식: 평소 09:00-11:00
- 점심 전 활동: 평소 11:30-12:30
- 저녁 루틴: 평소 18:30-20:00
- 취침 전 안정: 평소 21:30-22:30

The UI should prioritize the baseline relevant to the current simulated time and provide a broader day summary only in the comparison panel.

## Time Model

Time is autonomous and not tied to user clicks.

Requirements:

- Simulation starts at 07:30.
- Default speed: 1 real second = 10 simulated minutes.
- Fast preview speed: 1 real second = 30 simulated minutes.
- Controls: play/pause, reset, fast preview.
- Reset returns the day to 07:30 and clears today's detected events.
- Reset does not clear the selected phone role.
- MVP excludes a direct time scrubber.

The product must support normal daily life where no explicit user interaction occurs. No interaction is itself meaningful when the baseline expects activity.

## Demo Inputs

Interactive Home keeps appliance buttons because this is a prototype. They are demo controls, not the final guardian-facing product model.

Requirements:

- Label the input area as `데모 입력` or `생활 신호 시뮬레이션`.
- Keep clear button labels such as 조명, 밥솥, 전자레인지, TV, 냉장고, 선풍기.
- Guardian reports, comparison panels, and reason explanations must not expose appliance names by default.
- Demo input events should be timestamped with the current simulated time.

## Severity Model

Avoid medical or diagnostic language. Use living-rhythm observation states:

- 안정: within expected personal baseline range
- 관찰: meaningful change, but not enough for direct check-in escalation
- 확인 필요: important delay or routine gap where check-in is recommended

Morning routine scenario:

- 07:30-08:30: 안정
- Around 08:40 without expected morning living signal: 관찰
- Around 09:00 without expected morning living signal: 확인 필요
- If a related morning living signal appears after 확인 필요: downgrade to 관찰 with `늦게 확인됨`
- Later stable time blocks may return the day to 안정

## Guardian Phone

When the user first opens the phone UI, ask for role:

- 가족 보호자
- 사회복지사

After selection:

- The selected role is retained across day resets.
- A `역할 변경` control is available in the phone top area.
- Role switching does not recalculate raw data.
- The same privacy-safe summary is remapped into role-specific wording, CTA, and information density.

Role differences:

| Area | Family Guardian | Social Worker |
| --- | --- | --- |
| Purpose | Understand a family member's day and decide whether to call | Review one care case and decide whether follow-up is needed |
| Tone | Warm, personal | Objective, operational |
| CTA | 전화하기, 가족 메모 | 케이스 메모, 전화 확인, 방문 우선순위 |
| Detail | Lower information density | More structured summary |
| Privacy | Raw data hidden by default | Raw data hidden by default |

## Notification Policy

- 안정: no large notification
- 관찰: quiet badge only
- 확인 필요: emphasized report card and notification badge on phone entry button
- If the phone is already open, the report updates in place
- Role-specific alert copy:
  - Family guardian: 안부 확인 권장
  - Social worker: 케이스 확인 권장

## Why Check-In Is Needed

`왜 확인 필요한가요?` appears only when the severity is `확인 필요`.

Placement:

- Inside the phone UI
- Below the report card
- Expands into an explanation panel in the same phone frame

The explanation must use living-rhythm language, not raw device language.

Allowed examples:

- 오전 활동 시작이 개인 기준선보다 늦게 확인되고 있습니다.
- 평소 아침 식사 준비 시간대에 관련 생활 신호가 아직 확인되지 않았습니다.
- 오늘은 직접 안부 확인이 필요한 수준의 생활 리듬 변화가 감지되었습니다.

Disallowed examples:

- 전자레인지가 사용되지 않았습니다.
- 밥솥 사용이 55분 지연되었습니다.
- 620W 전력 변화가 감지되었습니다.

## Privacy Model

The default experience should communicate:

> GentleSight는 생활을 감시하지 않고, 생활 리듬의 변화만 요약합니다.

Default privacy panel shows:

- 카메라 없이: 영상/사진을 수집하지 않음
- 원천 데이터 숨김: 보호자 리포트에는 기기별 사용 기록을 노출하지 않음
- 생활 리듬 요약: 식사/휴식/수면 같은 생활 상태로 변환해 전달

### Raw Processing Explainer

The lock unlock flow is educational and prototype-specific.

Requirements:

- The user clicks `교육용 원천 처리 보기`.
- Show confirmation copy:
  - 이 화면은 프로토타입 설명을 위한 처리 로그입니다.
  - 실제 보호자 리포트에는 기기별 사용 기록이 직접 표시되지 않습니다.
- The user must click `이해했습니다`.
- Only then show processing logs based on the actual demo inputs the user performed.
- Closing the panel returns it to the locked state.

Processing log structure:

1. 원천 신호
2. 비식별 처리
3. 리포트 반영

Example:

- 원천 신호: 밥솥 입력 감지
- 비식별 처리: 주방 식사 준비 신호로 변환
- 리포트 반영: 아침 식사 준비 관련 생활 신호가 확인되었습니다.

The explainer may show the actual demo event because the user created it in the prototype, but the panel must clearly state that real guardian reports do not expose device logs.

## AI API Boundary

The MVP uses rule-based local generation. The implementation should still prepare a future AI API integration boundary.

Requirements:

- Build a privacy-safe `reportInput` object.
- Do not send raw appliance events to the AI boundary.
- Send:
  - living rhythm state
  - baseline comparison result
  - role
  - severity
  - privacy-safe reason summary
  - recommended action
  - privacy policy marker
- Block or reject raw fields:
  - events
  - appliance
  - applianceLabel
  - powerDelta
  - duration
  - waveform
  - time
  - baselineTime

API failure fallback:

> 현재 리포트를 생성하지 못했습니다. 감지된 생활 변화 요약을 확인해주세요.

## Visual Requirements

- The home image remains visually legible in all time states.
- Time and light controls may subtly change brightness, but objects and controls must remain visible.
- Night state must not obscure appliance buttons, global action bar, phone entry button, status badges, or core home objects.
- Use lighting changes as context cues only, not as a primary information channel.
- Mobile landscape is acceptable for the MVP, but controls must not overlap and touch targets must remain usable.

## Primary Demo Scenario

Scenario: 아침 루틴 지연

1. Time starts at 07:30 and flows automatically.
2. The personal baseline expects morning activity around 08:00.
3. The user does nothing.
4. Around 08:40, the state becomes 관찰.
5. Around 09:00, the state becomes 확인 필요.
6. The phone shows a role-specific report.
7. `왜 확인 필요한가요?` explains the living-rhythm reason.
8. The user clicks a relevant demo input such as 밥솥 or 전자레인지.
9. The state changes to 관찰 with a late-confirmed message.
10. The privacy explainer shows how the user's demo input was transformed into a privacy-safe report phrase.

## Acceptance Criteria

- Time flows without appliance clicks.
- Reset returns time to 07:30 and clears today's events while preserving selected role.
- `평소/지연` scenario buttons no longer exist.
- Baseline comparison is available through the bottom action bar.
- `Inference`, `Anomaly`, and `LLM` labels are removed from the visible product UI.
- Appliance names appear only in the demo input controls and explicit educational raw-processing explainer.
- Guardian reports do not expose appliance names, wattage, waveform, duration, or raw event logs.
- The phone asks for role on first entry and supports role switching afterward.
- Family guardian and social worker modes produce visibly different language and CTAs.
- `왜 확인 필요한가요?` appears only in 확인 필요 state.
- Privacy lock requires an explicit confirmation step before showing raw processing logs.
- Raw processing logs are based on actual demo inputs.
- Future AI API input remains privacy-safe.
- Home image remains legible in both day and night lighting states.

## Implementation Sequence

1. Build autonomous simulated time and shared day state.
2. Replace scenario mode with personal baseline comparison.
3. Rework the main UI around Interactive Home overlays.
4. Build bottom global action bar and user-facing panels.
5. Add role selection and role-specific phone report rendering.
6. Add 확인 필요 reason explanation flow.
7. Rework privacy explainer with confirmation and actual demo-input processing logs.
8. Prepare privacy-safe AI report input boundary.
9. Tune lighting, idle states, notifications, and responsive behavior.
10. Run final QA and accessibility pass.
