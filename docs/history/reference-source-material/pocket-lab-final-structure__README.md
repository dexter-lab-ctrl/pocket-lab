# Pocket Lab Final Structure

## Enterprise architecture baseline

Pocket Lab is now documented as a FastAPI + NATS/JetStream control plane with a React/Vite PWA operator console and worker-executed typed operations.

```text
React/Vite PWA
  -> FastAPI REST/OpenAPI + WebSocket
  -> NATS/JetStream command and event streams
  -> Pocket Lab worker/domain handlers
  -> event-sourced workflow journal and projections
  -> UI live event panels, health, telemetry, release and fleet views
```

The active model is fail-closed for production writes. Browser clients do not talk directly to NATS. They call FastAPI, which validates requests, submits typed commands to JetStream, records audit/workflow events, and exposes progress back to the UI through REST and WebSocket endpoints.

## Directory map

| Path | Purpose |
|---|---|
| `pocket-lab-bootstrap-production-scripts-patched/` | Day-0, Android/Termux-aware bootstrap scripts. |
| `pocket-lab-iac-api-compatible/` | Ansible/GitOps IaC tree aligned to FastAPI + NATS/JetStream. |
| `runtime/api_fastapi/` | FastAPI routers, WebSocket API, event bus integration, and runtime entry points. |
| `runtime/core/` | Shared services for operations, workflows, Git/Dulwich, artifacts/ORAS, health, telemetry, release and state. |
| `runtime/workers/` | Worker processes that consume durable NATS commands. |
| `docs/` | Release workflow and operator documentation. |

## Execution order

1. Run Day-0 bootstrap scripts.
2. Start platform dependencies: Vault, MariaDB, Gitea, NATS/JetStream, OPA, Gatus and observability components as configured.
3. Seed the IaC repository into Gitea.
4. Start FastAPI and workers.
5. Start the React/Vite PWA or serve the production PWA build.
6. Validate with the Taskfile gates listed below.

## Operator runbook

Use the deterministic dev stack for validation:

```bash
task dev:up
task dev:status
task test:nats
task test:nats-permissions
task test:websockets
task check:api-contract
task check:schemas
task test:frontend
task test:network
task test:redaction
task test:storybook
task test:visual
```

For local browser development, Vite must proxy `/api`, `/ready`, and `/ws` to FastAPI so the PWA does not receive false 404 responses from the frontend server. The frontend dev server should force dependency re-optimization when stale Vite optimized dependency caches produce `504 Outdated Optimize Dep`.

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
