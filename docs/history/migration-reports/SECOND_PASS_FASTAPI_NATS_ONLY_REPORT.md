# Second-pass FastAPI/NATS-only Report

## Result

The second pass aligns Pocket Lab around a single production runtime: FastAPI for HTTP/WebSocket and NATS/JetStream for durable command/event transport.

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

## Runtime-only policy

- FastAPI owns REST, OpenAPI, health, readiness, WebSocket, and operation intake.
- NATS/JetStream owns durable command, event, telemetry, audit, and dead-letter streams.
- Workers own execution of operation/domain commands.
- Local fallback execution is not a production behavior.

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
