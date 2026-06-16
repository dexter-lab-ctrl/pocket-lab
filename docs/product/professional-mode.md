# Professional Mode

Professional Mode is the default operator-facing experience for users who understand local control-plane concepts.

It keeps product language concise while exposing enough runtime context to troubleshoot operations, releases, drift, telemetry, and policy checks.

## What Professional Mode exposes

| Area | Operator value |
| --- | --- |
| Typed operations | Shows operation names, status, and lifecycle events. |
| Runtime boundaries | Makes FastAPI, NATS / JetStream, workers, and events visible where useful. |
| Degraded state | Explains why writes are paused or unavailable. |
| Evidence receipts | Shows operation, audit, and validation evidence. |
| Observability grouping | Separates metrics, logs, dashboards, and health checks. |
| Release workflow | Shows staged release checks, artifacts, verification, and rollback guidance. |

## Runtime contract

Professional Mode still uses the same safe path:

```text
React / Vite PWA → FastAPI → NATS / JetStream → Worker → Events → FastAPI → UI
```

No Professional Mode UI component should directly execute shell commands, call NATS, or call observability services directly.
