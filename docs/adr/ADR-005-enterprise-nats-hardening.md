# Enterprise NATS Hardening Report

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

## Purpose

This report documents Pocket Lab's production control-plane hardening: NATS/JetStream is no longer an optional convenience path for write operations. It is the required command and event backbone for enterprise deployments.

## Runtime decisions

- FastAPI is the only browser-facing runtime API.
- NATS and JetStream are required in production with `POCKETLAB_NATS_REQUIRED=1` and `POCKETLAB_NATS_REQUIRE_JETSTREAM=1`.
- Write requests are accepted only when the command bus is connected and durable streams are available.
- Worker execution is the default and expected production execution path.
- Direct in-process execution is limited to explicit harness/development scenarios.
- Browser clients receive progress through FastAPI WebSocket and event history endpoints.

## Streams and subjects

| Stream | Subject family | Purpose |
|---|---|---|
| `POCKETLAB_COMMANDS` | `pocketlab.commands.>` | Durable domain and operation command intake. |
| `POCKETLAB_EVENTS` | `pocketlab.events.>` | Operation, health, telemetry, release, fleet and drift events. |
| `POCKETLAB_AUDIT` | `pocketlab.audit.>` | Audit trail for control-plane actions. |
| `POCKETLAB_TELEMETRY` | `pocketlab.telemetry.>` | Operational telemetry snapshots and samples. |
| `POCKETLAB_DLQ` | `pocketlab.dlq.>` | Dead-letter messages after retry exhaustion. |

## Hardening controls

- Fail-closed publishing and subscription behavior.
- Durable command consumers with explicit acknowledgements.
- Dead-letter routing for failed commands.
- NATS authentication and optional TLS/mTLS support.
- Redacted workflow command/event journal.
- Role-scoped subject permissions validated by `task test:nats-permissions`.

## Legacy compatibility policy

The following legacy paths are retired and must not be reintroduced into active flows:

- stdlib `BaseHTTPRequestHandler`/`HTTPServer` runtime API server
- `/api/action/update`
- `legacy_intent`
- generic shell execution write payloads
- `sync_bash` and `tofu_deploy` as browser-facing operation contracts
- direct frontend-to-Gatus production calls

Active clients must use typed operation/domain commands through FastAPI, for example `git_sync`, `deploy_blueprint`, `drift_scan`, `fleet_join`, `rotate_secret`, `restore_backup`, `policy_deploy`, and release workflow commands.

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

## Release recommendation

This layer is ready for continued release-candidate validation. Do not tag a release until the remaining PWA quality, Android smoke, golden path, and release dry-run gates are also green.
