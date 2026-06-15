# Pocket Lab IaC Architecture Sync Report

Archive base: `pocketlab_enterprise_nats_no_typed operation request field.zip`

Scope reviewed and updated:

`pocket-lab-final-structure/pocket-lab-iac-api-compatible/`

## Result

The IaC tree is now synchronized with the current Pocket Lab architecture:

- FastAPI is the only control-plane API target.
- NATS/JetStream is a first-class production dependency.
- Write execution remains worker/NATS based.
- Legacy Python API and legacy intent names are not referenced by active IaC.
- Caddy proxies REST and WebSocket control-plane traffic.
- Ansible inventory, site order, roles, playbooks, docs, and drift targets reflect the FastAPI/NATS production model.

## Key changes

### Added enterprise NATS IaC layer

Added:

- `playbooks/65_nats.yml`
- `roles/nats/defaults/main.yml`
- `roles/nats/tasks/main.yml`
- `roles/nats/templates/nats-server.conf.j2`
- `roles/nats/handlers/main.yml`
- `roles/nats/meta/main.yml`
- `inventory/dev/group_vars/nats.yml`
- `inventory/prod/group_vars/nats.yml`

The NATS role renders:

- authenticated NATS server config
- JetStream store path
- persistent API/worker/agent credentials env file
- non-secret manifest
- local monitor posture
- TLS/mTLS-ready variables

### Updated site reconciliation order

`site.yml` now runs NATS before FastAPI readiness validation:

1. Caddy
2. NATS / JetStream
3. FastAPI control plane
4. catalog, workloads, backups, runner, drift

### Updated FastAPI control-plane role

`roles/fastapi_control_plane` now:

- requires NATS config and credential env file when production NATS is enabled
- checks the NATS monitor endpoint
- asserts JetStream is enabled
- checks `/ready` instead of plain `/health`
- records NATS config/env paths in its manifest

### Updated Caddy role

`roles/caddy/templates/Caddyfile.j2` now proxies:

- `/api/*`
- `/ws/*`
- `/gitea/*`
- `/loki/*`
- `/gatus/*`

This matches the React frontend live event/WebSocket model and the FastAPI/NATS runtime.

### Updated inventories

Both `inventory/dev` and `inventory/prod` now include:

- `nats` host group
- NATS group vars
- `fastapi_control_plane_health_path: /ready`
- common NATS directories
- `nats-server` as a required command
- NATS monitor drift check
- Caddy route alignment with FastAPI, Gitea, Loki, and Gatus

### Updated docs and tree

Updated:

- `README.md`
- `docs/architecture.md`
- `docs/environments.md`
- `docs/production-readiness.md`
- `TREE.txt`

## Validation performed

- Stale reference grep passed for:
  - `typed operation request field`
  - `typed GitOps operation`
  - `typed blueprint deployment operation`
  - `sync_compat`
  - `retired standalone API server module`
  - `FastAPI runtime directory`
  - `fastapi_control_plane`
  - `api_server.py`
  - `retired API runtime selector`
  - `http.server`
  - `retired stdlib HTTP handler`
  - `retired stdlib HTTP server`
  - `retired update compatibility endpoint`
  - `dashboard_health_path`

- YAML/JSON parse check passed for 124 structured files.
- Jinja template render sanity checks passed for:
  - NATS config template
  - Caddyfile template

## Production note

The IaC role now renders and validates the production NATS posture. Actual process supervision is still handled by the Day 0 runtime launcher / PM2 bridge unless you add a dedicated systemd-like supervisor for non-Termux deployments.
