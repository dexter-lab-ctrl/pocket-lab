# Release Tags

Pocket Lab release tags should be traceable and safe to consume from Day 0 bootstrap scripts or operator release workflows.

## Current release tag convention

The existing release workflow expects identifiers shaped like:

```text
YYYY.MM.DD.N
```

It creates tags in this form:

```text
release/YYYY.MM.DD.N
```

Example:

```text
release/2026.06.15.1
```

## Tag safety rules

- Do not reuse a release tag.
- Build release artifacts from the intended source commit.
- Include release notes and checksums when publishing artifacts.
- Preserve rollback and verification guidance.
- Treat published artifacts as operator-facing release evidence.
