# Pocket Lab Documentation Index

Pocket Lab documentation is consolidated into two operational documentation sets:

- [`docs/dev`](../dev-legacy/README.md): developer workstation, local validation, test gates, mocks, contracts, and UI quality.
- [`docs/prod`](../prod-legacy/README.md): production architecture, hardened runtime, Day-0 bootstrap, IaC, secrets, release workflow, and operational readiness.

The canonical placement should be the repository-level `docs/` directory. Component-local README files may remain as short entry points, but long-form architecture, validation, security, and release documentation should live here to avoid duplication and drift.

## Current architecture baseline

```text
React/Vite PWA
  -> FastAPI REST/OpenAPI + WebSocket
  -> NATS/JetStream command and event streams
  -> Pocket Lab worker/domain handlers
  -> event-sourced workflow journal and projections
  -> UI live event panels, health, telemetry, release and fleet views
```

Browser clients do not publish directly to NATS. The frontend calls FastAPI, FastAPI validates typed operations, JetStream stores durable commands/events, workers execute domain handlers, and the UI receives status through REST/WebSocket projections.

## Current validation state

Validated through the visual regression gate:

| Gate | Status |
|---|---:|
| NATS integration | Passed |
| NATS permissions | Passed |
| WebSockets | Passed |
| API contract | Passed |
| Schemas | Passed |
| Frontend build | Passed with warnings |
| Network contract | Passed |
| Redaction | Passed |
| Storybook | Passed |
| Vite dev proxy / React mount | Passed |
| Visual regression baseline and `task test:visual` | Passed |

Pending release-candidate gates include Lighthouse, accessibility, golden path, flaky quarantine/reporting, Android/Termux smoke, and release dry-run.
