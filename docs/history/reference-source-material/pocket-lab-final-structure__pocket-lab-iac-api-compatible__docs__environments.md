# Pocket Lab Environments

## Purpose

Environment definitions provide the host, service URL, health-check, and policy differences between dev, prod, and edge/Termux deployments.

## Environment model

| Environment | Purpose | Notes |
|---|---|---|
| `dev` | Deterministic local validation | Uses Taskfile, local NATS container, FastAPI, worker, Vite proxy. |
| `prod` | Production/self-hosted deployment | Requires fail-closed NATS/JetStream, durable workers, supervised services. |
| `termux/edge` | Android ARM/edge deployment | Uses idempotent bootstrap, constrained resources, and smoke validation. |

## URL ownership

- FastAPI owns `/api`, `/ready`, and `/ws`.
- Vite owns frontend development assets only.
- Caddy owns production routing.
- Gatus is internal health evidence and should be API-mediated for UI use.

## Promotion guidance

Do not promote environment inventory changes unless `task test:iac`, API contract checks, schema checks, and relevant smoke tests remain green.

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
