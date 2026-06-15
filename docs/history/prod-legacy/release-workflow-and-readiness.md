# Release Workflow and Readiness

## Purpose

This document defines how Pocket Lab changes move from development to release-candidate readiness.

## Release workflow

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

## Current passed gates

| Gate | Status |
|---|---:|
| `task test:nats` | Passed |
| `task test:nats-permissions` | Passed |
| `task test:websockets` | Passed |
| `task check:api-contract` | Passed |
| `task check:schemas` | Passed |
| `task test:frontend` | Passed with warnings |
| `task test:network` | Passed |
| `task test:redaction` | Passed |
| `task test:storybook` | Passed |
| `task test:visual` | Passed |

## Remaining release-candidate gates

```bash
task test:lighthouse
task test:a11y
task test:golden
task test:flakes
task android:smoke
task release:dry-run
```

## Release rule

Do not tag a production release if any of the following fail:

- NATS integration
- NATS permissions
- WebSocket/event flow
- API contract
- JSON schema validation
- redaction
- network contract / no legacy payloads
- visual regression
- accessibility and Lighthouse
- golden path E2E
- Android/Termux smoke
- release dry-run

## Readiness interpretation

Passing through `task test:visual` indicates the app has a stable architecture and UI validation foundation. It does not yet mean production release is complete. The remaining gates validate user experience quality, accessibility, full end-to-end behavior, Android/Termux compatibility, and release artifacts.
