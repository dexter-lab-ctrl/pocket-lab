# Pocket Lab Local GitOps State

## Purpose

This directory represents local GitOps state used by the development/test harness. It should be treated as generated or environment-specific state, not as the canonical enterprise documentation source.

## Current operation shape

The active operation model for repository synchronization is typed and explicit:

```json
{
  "operation": "git_sync",
  "task": "release_sync",
  "target": {
    "type": "repo",
    "ref": "pocket_lab_iac"
  },
  "params": {
    "branch": "main"
  }
}
```

## Policy

- Do not use `legacy_intent`.
- Do not use browser-originated shell commands.
- Keep local GitOps state aligned with `pocket-lab-final-structure/pocket-lab-iac-api-compatible`.
