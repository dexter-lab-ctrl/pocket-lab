# Architecture Overview

Pocket Lab is an edge-first control-plane platform. Its architecture intentionally separates user intent, API validation, command delivery, execution, events, and UI state.

## Runtime boundary

```text
React / Vite PWA
→ FastAPI Control API
→ NATS / JetStream
→ Workers
→ Events
→ FastAPI
→ UI
```

This boundary is the most important architecture rule in the project.

| Component | Responsibility |
| --- | --- |
| React / Vite PWA | Presents the UI and submits typed requests to FastAPI. |
| FastAPI Control API | Validates requests, exposes status, and publishes commands. |
| NATS / JetStream | Provides durable command and event delivery. |
| Workers | Own execution, resume, retries, and typed operation handlers. |
| Event store / audit evidence | Records lifecycle state, decisions, and evidence. |
| Generated contracts | Keep architecture, APIs, events, operations, runbooks, and docs reproducible. |

## Source-of-truth references

- [Runtime Flow](runtime-flow.md)
- [Structurizr Architecture](structurizr-architecture.md)
- [Enterprise Architecture Blueprint](enterprise-architecture-blueprint.md)
- [Typed Operations](typed-operations.md)
- [Workers](workers.md)
- [Runbooks](runbooks.md)
- [Approvals](approvals.md)
