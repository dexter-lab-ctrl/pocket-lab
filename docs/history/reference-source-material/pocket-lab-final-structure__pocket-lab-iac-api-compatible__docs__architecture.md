# Pocket Lab IaC Architecture

## Overview

The IaC layer is the desired-state implementation of Pocket Lab's control plane. It does not define a separate API model; it deploys the same FastAPI + NATS/JetStream architecture used by the development and release gates.

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

## Ingress and API model

- Caddy routes browser/API traffic to FastAPI.
- `/api/*`, `/ready`, and `/ws/*` are API-owned paths.
- The PWA never calls Gatus, Vault, NATS, or workers directly in production.
- Health engine details are exposed through FastAPI snapshots and events.

## Desired-state boundaries

| Boundary | IaC responsibility |
|---|---|
| Platform services | Install, configure, and supervise dependencies. |
| Control plane | Deploy FastAPI, workers, and environment variables. |
| Event backbone | Deploy NATS/JetStream streams and security settings. |
| GitOps state | Seed repositories and catalog state. |
| Health/drift | Define checks and evidence paths. |

## Security and reliability requirements

- NATS/JetStream is required for production writes.
- Durable consumers acknowledge successful work and use retry/dead-letter handling for failed work.
- Event and command journals redact tokens, passwords, API keys, secret values, and authorization material.
- NATS permissions are modeled by role: API publishes commands/events, workers subscribe to command subjects, and agents use constrained fleet subjects.
- Health and telemetry are API-mediated; the UI consumes FastAPI snapshots/events instead of coupling directly to internal service endpoints.
- Release candidate promotion must require contract, schema, network, redaction, visual, accessibility, Lighthouse, golden path, Android smoke, and release dry-run gates.
