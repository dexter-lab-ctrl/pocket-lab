# Pocket Lab Release Workflow

## Purpose

This workflow defines how Pocket Lab changes move from developer edits to a release-candidate artifact without bypassing architecture, security, UI, or runtime gates.

## Release control path

```text
Developer commit
  -> local Taskfile gates
  -> FastAPI OpenAPI/schema validation
  -> NATS/worker/WebSocket validation
  -> frontend build + Storybook + visual baseline
  -> accessibility/Lighthouse/golden path
  -> Android/Termux smoke
  -> release dry-run artifacts
  -> tag and publish
```

## Release workflow runtime

Release check/apply requests are event-orchestrated domain commands:

```text
POST /api/release/self-update/check|apply
  -> FastAPI validation
  -> NATS subject pocketlab.commands.release.*
  -> worker/domain handler
  -> release workflow service
  -> pocketlab.events.release.*
  -> WebSocket/LiveEventPanel
```

## Required gates before release tag

```bash
task check
task check:api-contract
task check:schemas
task test:websockets
task test:nats
task test:nats-permissions
task test:visual
task test:lighthouse
task test:a11y
task test:network
task test:redaction
task test:golden
task test:flakes
task android:smoke
task release:dry-run
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

## Release rule

Do not tag a release if any of the following fail: NATS integration, NATS permissions, API contract, schemas, WebSocket/event flow, redaction, visual regression, accessibility, Lighthouse, golden path, Android smoke, or release dry-run.
