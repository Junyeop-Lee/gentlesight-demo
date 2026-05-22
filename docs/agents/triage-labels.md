# Triage Labels

Five canonical triage labels for `Junyeop-Lee/gentlesight-demo`.

| Role | Label | Meaning |
|------|-------|---------|
| Needs evaluation | `needs-triage` | Maintainer must assess before any work starts |
| Waiting on reporter | `needs-info` | Blocked — need more information from the issue author |
| AFK-ready | `ready-for-agent` | Fully specified; an agent can pick it up with no additional context |
| Human implementation | `ready-for-human` | Needs a human to implement (too ambiguous or sensitive for an agent) |
| Closed without action | `wontfix` | Will not be actioned; close with a brief reason |

## State machine

```
[created] → needs-triage
needs-triage → needs-info       (missing info)
needs-triage → ready-for-agent  (clear enough for AFK agent)
needs-triage → ready-for-human  (needs human judgment)
needs-triage → wontfix          (out of scope / duplicate)
needs-info   → needs-triage     (reporter replied)
needs-info   → wontfix          (no response after reasonable wait)
```

## Creating labels

If these labels don't exist yet on the repo, create them:

```bash
gh label create needs-triage    --color "e4e669" --description "Maintainer needs to evaluate"
gh label create needs-info      --color "d876e3" --description "Waiting on reporter"
gh label create ready-for-agent --color "0075ca" --description "Fully specified, AFK-ready"
gh label create ready-for-human --color "008672" --description "Needs human implementation"
gh label create wontfix         --color "ffffff" --description "Will not be actioned"
```
