# Mobile Landscape QA

Date: 2026-05-12

Scope: GitHub issue #23, mobile landscape GentleSight web app verification.

## Automated Checks

- `npm run build`: passed
- `git diff --check`: passed
- Browser console `error`/`warning` logs during QA: none observed

## Viewport Checks

| Viewport | Result | Notes |
| --- | --- | --- |
| 932x430 | Passed | Interaction Home filled the viewport, appliance buttons remained touchable, bottom dock opened Guardian/Status/Baseline/Privacy modes. |
| 844x390 | Passed | House image remained visible across the full viewport, bottom dock stayed usable, appliance labels were present. |
| 1024x768 | Passed | Tablet landscape used the mobile app shell with the full house image, compact HUD, and dock. |
| 390x844 | Passed | Portrait view showed the landscape rotation prompt and hid the interactive app surface. |
| 1280x720 | Passed | Desktop overlay flow, language toggle, floating phone trigger, and detail buttons remained available. |

## Interaction Checks

- Guardian mode opened as a full-screen mobile information view.
- First-time role selection appeared centered and readable.
- Family guardian role preserved through mobile mode navigation.
- Guardian report text remained visible inside the two-column landscape dashboard.
- `왜 확인이 필요한가요?` appeared only for the check-needed state and opened as a small floating reason sheet.
- Browser back from a mobile information view returned to Interaction mode.
- Status view displayed current state, change reason, and recent summary signal.
- Baseline view displayed the personal baseline comparison and baseline list.
- Privacy view hid raw appliance data by default.
- Privacy raw processing log appeared only after explicit educational unlock and confirmation.
- Korean/English controls remained available after desktop and mobile viewport changes.

## Residual Risk

- Visual checks were performed in the Codex in-app browser against `http://localhost:3010`.
- The QA covered current responsive breakpoints, but device-specific browser UI chrome differences should still be checked on physical phones before public demo use.
