# Pocket Lab Production Readiness

## Readiness position

The app has passed the main runtime, contract, redaction, frontend, Storybook, and visual regression gates through `task test:visual`. It is not yet a release candidate until the remaining quality and release gates pass.

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

## Production readiness checklist

| Category | Required evidence |
|---|---|
| Runtime | `task test:nats`, `task test:nats-permissions`, `task test:websockets` |
| Contracts | `task check:api-contract`, `task check:schemas`, `task test:network` |
| Security | `task test:redaction`, supply-chain review, secret handling review |
| UI | `task test:frontend`, `task test:storybook`, `task test:visual`, `task test:a11y`, `task test:lighthouse` |
| E2E | `task test:golden`, `task test:flakes` |
| Edge | `task android:smoke` |
| Release | `task release:dry-run` |

## Known cleanup before RC

- Resolve or formally accept frontend lint warnings.
- Review `npm audit` output and upgrade dependencies in a controlled pass.
- Keep generated state/test artifacts out of source control unless intentionally used as baselines.
- Commit visual baseline snapshots only after review.
