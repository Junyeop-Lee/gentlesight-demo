# Domain Docs

How engineering skills should consume this repo's domain documentation.

## Layout

Single-context repo:

```
/
├── CONTEXT.md          ← domain glossary and bounded context (create with /grill-with-docs)
├── docs/adr/           ← architectural decision records
└── src/
```

`CONTEXT.md` and `docs/adr/` do not exist yet. They are created lazily by `/grill-with-docs` as terms and decisions crystallise.

## Before exploring, read these

- `CONTEXT.md` at the repo root — domain glossary, bounded context, invariants
- `docs/adr/` — ADRs that touch the area you're about to work in

If either doesn't exist, **proceed silently**. Don't flag the absence; don't suggest creating them upfront.

## Use the glossary's vocabulary

When naming a concept in an issue title, refactor proposal, hypothesis, or test name, use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly:

> _Contradicts ADR-0003 (privacy-safe report fields) — but worth reopening because…_
