# Contributing

This project is a prototype, so changes should stay focused and easy to review.

## Workflow

1. Create or reference a GitHub issue for non-trivial work.
2. Create a branch from `main`.
3. Keep commits scoped to one concern.
4. Run verification before opening a pull request.
5. Open a pull request using the repository template.

## Local Verification

```bash
npm run build
```

For UI changes, also verify:

- Desktop or landscape layout
- Portrait mobile orientation prompt
- Appliance interaction flow
- Guardian phone panel
- Privacy summary and raw-signal explainer
- `/api/report` raw-field rejection behavior

## Coding Notes

- Keep user-facing report text in Korean unless the product copy is intentionally changed.
- Do not send raw appliance events to the AI API boundary.
- Use existing component and CSS conventions before adding new abstractions.
- Keep prototype-specific layout overrides in `app/prototype.css`.
