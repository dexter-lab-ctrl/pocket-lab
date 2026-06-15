# Pocket Lab Prod Documentation

This directory is the canonical documentation set for production architecture, deployment, runtime hardening, secrets, release workflow, and readiness.

## Production architecture baseline

```text
Operator browser / PWA
  -> Caddy / HTTPS edge
  -> FastAPI REST/OpenAPI + WebSocket
  -> NATS/JetStream command and event streams
  -> worker/domain handlers
  -> event-sourced workflow journal and projections
  -> IaC, bootstrap, GitOps, fleet, release and health subsystems
```

## Production invariants

- FastAPI is the only supported HTTP/API control plane.
- NATS/JetStream is required for production writes and events.
- Browser clients never publish directly to NATS.
- Mutations use typed operation contracts.
- Retired compatibility paths remain blocked.
- Secrets are never committed, printed, or exposed through UI telemetry.
- Bootstrap and IaC are idempotent.
- Android/Termux constraints are considered for edge/self-hosted operation.

## Prod document set

- [`production-architecture.md`](./production-architecture.md)
- [`runtime-nats-workflow-engine.md`](./runtime-nats-workflow-engine.md)
- [`deployment-bootstrap-and-iac.md`](./deployment-bootstrap-and-iac.md)
- [`security-hardening-and-secrets.md`](./security-hardening-and-secrets.md)
- [`release-workflow-and-readiness.md`](./release-workflow-and-readiness.md)
