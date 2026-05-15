# Pocket Lab Final Structure

## Components

- `pocket-lab-bootstrap-production-scripts-patched/`
  - Day-0 bootstrap scripts and orchestration.
- `pocket-lab-iac-api-compatible/`
  - GitOps IaC repo compatible with `pocket_lab_api_server.py`.
- `runtime/api/pocket_lab_api_server.py`
  - Production-safe runtime API service for Stage 7.

## Execution order

1. Run bootstrap scripts from `pocket-lab-bootstrap-production-scripts-patched/`
2. Bring up Vault, MariaDB, Gitea, and PM2
3. Seed `pocket-lab-iac-api-compatible/` into Gitea
4. Start the runtime API from `runtime/api/pocket_lab_api_server.py`
5. Start the dashboard and supervision loop
