# Production Architecture

## Purpose

This document is the production source of truth for Pocket Lab's current architecture.

## Architecture

```text
React/Vite PWA
  -> Caddy reverse proxy
  -> FastAPI REST/OpenAPI + WebSocket
  -> NATS/JetStream command and event streams
  -> worker/domain handlers
  -> event-sourced workflow journal and projections
  -> UI live event panels, health, telemetry, release and fleet views
```

## Runtime responsibilities

| Component | Responsibility |
|---|---|
| React/Vite PWA | Operator console, Simple Mode, Professional Mode, live panels |
| FastAPI | OpenAPI, request validation, REST, WebSocket, operation submission, read projections |
| NATS/JetStream | Durable command/event/audit/telemetry streams |
| Worker | Domain execution of typed operations |
| Workflow engine | Event journal, projections, recovery and replay |
| Caddy | HTTPS and reverse proxy for REST/WebSocket traffic |
| Gatus/health engine | Health source consumed through FastAPI-facing snapshots/events |
| IaC and bootstrap | Idempotent deployment and node preparation |

## Typed operation model

Supported write flows use typed operations such as:

- `git_sync`
- `deploy_blueprint`
- `drift_scan`
- `fleet_join`
- `rotate_secret`
- `restore_backup`
- `policy_deploy`
- release workflow operations

The browser-facing API must not use generic shell payloads or retired compatibility fields.

## Retired architecture

The following are not production-supported mutation contracts:

- stdlib `BaseHTTPRequestHandler`/`HTTPServer` runtime server
- `/api/action/update`
- `legacy_intent`
- direct generic shell command write payloads
- browser-facing `sync_bash`
- browser-facing `tofu_deploy`
- direct production frontend calls to Gatus

Internal implementation helpers may still use lower-level tools where appropriate, but browser contracts and release gates must remain operation-typed and FastAPI/NATS-backed.

## UI modes

Simple Experience Mode changes labels and operator language only. It does not create separate backend behavior.

| Professional | Simple |
|---|---|
| GitOps | Keep My Environment Updated |
| Blueprint Catalog | Apps & Services |
| Drift Center | Health & Issues |
| Fleet Scaling | My Devices |
| Identity & Vault | Passwords & Access |
| Security Posture | Safety Center |
| NOC Telemetry | System Status |
