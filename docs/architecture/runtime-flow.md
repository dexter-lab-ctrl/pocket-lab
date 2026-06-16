# Runtime Flow

Pocket Lab’s runtime flow is intentionally simple at the product boundary and strict at the execution boundary.

```mermaid
flowchart LR
  UI[React / Vite PWA] --> API[FastAPI Control API]
  API --> JS[NATS / JetStream]
  JS --> Worker[Workers]
  Worker --> Ops[Typed Operations]
  Worker --> Events[Lifecycle Events]
  Events --> API
  API --> UI
```

## What this means for operators

A button in the UI does not run a shell command. It creates a typed request. FastAPI validates and publishes that request. NATS / JetStream delivers it. A worker claims and executes it. Events then flow back to FastAPI and the UI.

## What this means for developers

| Rule | Reason |
| --- | --- |
| Frontend calls FastAPI only. | Keeps browser code safe and testable. |
| FastAPI publishes commands. | Keeps write paths observable and auditable. |
| Workers own execution. | Prevents UI/API shortcuts and supports resume. |
| Typed Operations define execution contracts. | Keeps frontend, backend, workers, and docs aligned. |
| Events record lifecycle state. | Enables replay, debugging, validation, and audit evidence. |

## Runtime sequence

```mermaid
sequenceDiagram
  participant User
  participant UI as React / Vite PWA
  participant API as FastAPI
  participant NATS as NATS / JetStream
  participant Worker
  participant Events as Event Store

  User->>UI: Starts action
  UI->>API: Submit typed request
  API->>NATS: Publish command
  Worker->>NATS: Consume command
  Worker->>Events: Record started / log / completed
  API->>Events: Read current state
  API->>UI: Return status and events
```

## Explicit non-goals

- No frontend direct NATS access.
- No frontend shell execution.
- No frontend direct calls to Prometheus, Loki, Grafana, Gatus, or Promtail.
- No legacy command editor or retired update endpoint.
