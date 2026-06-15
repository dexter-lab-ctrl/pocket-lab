# Pocket Lab Final Structure

## Components

- `pocket-lab-bootstrap-production-scripts-patched/`
  - Day-0 bootstrap scripts and orchestration.
- `pocket-lab-iac-api-compatible/`
  - GitOps IaC repo compatible with `control_plane_core.py / FastAPI/NATS control plane`.
- `runtime/core/control_plane_core.py`
  - Production-safe runtime API service for Stage 7.

## Execution order

1. Run bootstrap scripts from `pocket-lab-bootstrap-production-scripts-patched/`
2. Bring up Vault, MariaDB, Gitea, and PM2
3. Seed `pocket-lab-iac-api-compatible/` into Gitea
4. Start the FastAPI/NATS runtime from `runtime/api_fastapi/pocket_lab_fastapi_server.py`
5. Start the dashboard and supervision loop


Health engine integration: Pocket Lab now treats Gatus as the primary dependency-aware health source for the API and NOC UI.


## Release workflow

Pocket Lab now exposes a concrete release workflow that binds the public GitHub release path to the existing control-plane subsystems.

1. Edit the frontend or backend files listed in `docs/release-workflow.md`.
2. Run local validation and preview the typed operations.
3. Commit only source and workflow docs.
4. Push the changes to the public GitHub repository and publish the release tag.
5. Use the GitOps subsystem to sync the repo and refresh the catalog.
6. Pass the release through security, vault, health, and drift gates.
7. Promote the blueprint or workload with typed operations.
8. Verify drift and let the PWA auto-update pick up the new frontend bundle.
9. Let the release auto-updater close the last mile and reload user instances automatically.

The workflow intentionally excludes the desktop-version future track.


## FastAPI/NATS control API

The retired stdlib Python API has been removed. `runtime/api_fastapi/` is now the authoritative FastAPI/NATS control API that serves the React PWA `/api/...` contracts while reusing the shared operation service, Ansible Runner integration, Dulwich Git abstraction, ORAS-style artifact store, source ingestion, release workflow, telemetry, health, drift, fleet, and security helpers.

Start it with:

```bash
python3 runtime/api_fastapi/pocket_lab_fastapi_server.py
```

The Day 0 `start-dashboard.sh` script now prefers the FastAPI runtime by default and no longer starts or falls back to the retired stdlib Python API server.
