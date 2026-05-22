# Issue Tracker

Issues for this repo live in **GitHub Issues** on `Junyeop-Lee/gentlesight-demo`.

## CLI

Use the `gh` CLI for all issue operations:

```bash
gh issue create --title "..." --body "..." --label "needs-triage"
gh issue list --label "ready-for-agent"
gh issue view <number>
gh issue edit <number> --add-label "..." --remove-label "..."
gh issue close <number>
```

## Conventions

- Every new issue gets the `needs-triage` label on creation.
- Issue titles use imperative mood: "Add X", "Fix Y", "Remove Z".
- Issue bodies follow the template: **What**, **Why**, **Acceptance criteria**.
- Link PRs to issues with `Closes #<number>` in the PR body so GitHub closes the issue on merge.

## Repo

`https://github.com/Junyeop-Lee/gentlesight-demo`
