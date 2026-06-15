# Deployment, Bootstrap, and IaC

## Purpose

This document consolidates the bootstrap, idempotency, IaC architecture, environment, and catalog documentation for production and production-like environments.

## Canonical IaC tree

```text
pocket-lab-final-structure/
  pocket-lab-iac-api-compatible/
    inventory/
      dev/
      prod/
    playbooks/
    roles/
      common/
      nats/
      fastapi_control_plane/
      caddy/
      gitea/
      vault/
      mariadb/
      opa/
      observability/
      catalog_seed/
      drift_check/
      backups/
      workloads/
    iac-catalog/
```

## Deployment responsibilities

| Area | Responsibility |
|---|---|
| `inventory/dev` | production-like developer/integration settings |
| `inventory/prod` | production deployment settings |
| `roles/nats` | JetStream service and stream configuration |
| `roles/fastapi_control_plane` | FastAPI runtime service |
| `roles/caddy` | HTTPS/reverse proxy for REST/WebSocket |
| `roles/vault` | secret backend/bootstrap integration |
| `roles/gitea` | GitOps source and repository service |
| `roles/observability` | logs, health and telemetry plumbing |
| `roles/catalog_seed` | app/blueprint catalog bootstrap |
| `roles/drift_check` | drift validation hooks |
| `roles/backups` | backup and restore support |

## Day-0 bootstrap principles

Bootstrap scripts must be safe to rerun and safe on constrained edge devices.

Required patterns:

- use shared `scripts/lib/common.sh` helpers
- detect Termux/Android explicitly
- use state markers only after successful stage completion
- use atomic writes for generated config and secrets
- keep generated secrets out of Git
- restart services idempotently
- validate readiness with bounded retries
- smoke test through FastAPI-facing endpoints where possible

## Dev versus prod use

| Environment | Expected behavior |
|---|---|
| Dev | local stack, deterministic state, fast reset, Vite proxy, Playwright gates |
| Prod | durable services, strict secrets, Caddy/HTTPS, NATS required, no legacy fallback |

## Catalog and packages

The IaC catalog should describe deployable workloads and blueprints without bypassing typed operation controls. App Store/Blueprint UI actions should result in typed operations, not ad hoc shell commands.
