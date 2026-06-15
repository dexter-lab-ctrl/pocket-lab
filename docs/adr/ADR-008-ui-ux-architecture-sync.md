# Pocket Lab UI/UX Architecture Sync Report

## Objective

The React/Vite PWA is aligned with the FastAPI + NATS/JetStream architecture and supports both Professional Mode and Simple Experience Mode without creating separate backend behavior.

## UI architecture

```text
App.jsx
  -> ExperienceModeContext
  -> Professional tabs / SimpleDashboard
  -> typed operation client
  -> FastAPI REST + WebSocket
  -> live event panels and status components
```

## Simple Experience Mode mapping

| Professional label | Simple label |
|---|---|
| GitOps | Keep My Environment Updated |
| Blueprint Catalog | Apps & Services |
| Drift Center | Health & Issues |
| Fleet Scaling | My Devices |
| Identity & Vault | Passwords & Access |
| Security Posture | Safety Center |
| NOC Telemetry | System Status |
| Deploy Blueprint | Install |
| Version | Release |
| Drift Detected | Something Changed |
| Join Fleet | Add Device |
| Desired State | What Should Be Installed |
| Rotate Secret | Change Password |

## Frontend quality gates

- Vite/PWA production build passes.
- Storybook builds for component sanity.
- Visual regression baseline exists and `task test:visual` passes.
- Network contract test proves write flows send typed operations and no legacy payloads.
- Vite dev proxy forwards `/api`, `/ready`, and `/ws` to FastAPI, so local browser development reflects the deployed API shape.

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

## Remaining UI release gates

The next UI-focused gates are `task test:lighthouse` and `task test:a11y`, followed by golden-path E2E.
