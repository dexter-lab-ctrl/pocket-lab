# Pocket Lab Bootstrap Scripts

## Purpose

This directory contains the Day-0 bootstrap scripts used to prepare a Pocket Lab node for the current FastAPI + NATS/JetStream architecture.

## Design goals

- Android/Termux-aware and ARM-friendly.
- Idempotent reruns with stage markers and file locks.
- Safe secret generation and export.
- Repeatable setup of platform dependencies and supervisor entries.
- Compatible with the GitOps/IaC tree and the FastAPI/NATS runtime.

## Expected bootstrap flow

```text
bootstrap.sh
  -> common helpers and environment checks
  -> package/platform preparation
  -> secrets and Vault bootstrap
  -> Gitea/GitOps seed
  -> NATS/FastAPI/worker/dashboard service setup
  -> health and smoke validation
```

## Validation

```bash
bash scripts/dev/day0-static-check.sh
bash scripts/dev/day0-dry-run.sh
```

These are also exposed as:

```bash
task test:bootstrap
```

## Current validation baseline

The documentation reflects the latest development baseline validated in the Ubuntu dev environment through the visual regression gate:

| Gate | Status | Meaning |
|---|---:|---|
| `task test:nats` | ✅ Passed | FastAPI, NATS/JetStream, worker command flow, event publication, and journal flow are integrated. |
| `task test:nats-permissions` | ✅ Passed | Subject permission model for API, worker, and agent roles is enforced. |
| `task test:websockets` | ✅ Passed | Browser event delivery over FastAPI WebSocket is functional. |
| `task check:api-contract` | ✅ Passed | Frontend API calls are represented in the generated FastAPI OpenAPI contract. |
| `task check:schemas` | ✅ Passed | JSON fixtures/events conform to the checked schemas. |
| `task test:frontend` | ✅ Passed with warnings | Vite/PWA build succeeds; lint/format/security cleanup remains tracked as quality debt. |
| `task test:network` | ✅ Passed | Browser write flows use typed operations and do not send legacy payloads. |
| `task test:redaction` | ✅ Passed | Journals/log payloads redact secrets before persistence. |
| `task test:storybook` | ✅ Passed | Component documentation builds successfully. |
| `task test:visual` | ✅ Passed | The app shell renders deterministically and matches the visual baseline. |

Remaining release-candidate gates are `task test:lighthouse`, `task test:a11y`, `task test:golden`, `task test:flakes`, `task android:smoke`, and `task release:dry-run`.
