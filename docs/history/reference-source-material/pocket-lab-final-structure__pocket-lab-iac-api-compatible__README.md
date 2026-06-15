# Pocket Lab IaC API-compatible Deployment

## Purpose

This Ansible/GitOps tree deploys the Pocket Lab platform in a way that matches the current FastAPI + NATS/JetStream control-plane architecture.

## Architecture

```text
Inventory/group_vars
  -> Ansible roles
  -> platform services
  -> FastAPI + worker runtime
  -> Caddy/API ingress
  -> health/drift/release validation
```

## Primary roles

- `common`
- `mariadb`
- `vault`
- `gitea`
- `nats`
- `fastapi_control_plane`
- `caddy`
- `observability`
- `opa`
- `catalog_seed`
- `drift_check`
- `backups`
- workload roles such as `workloads/photoprism`

## Validation

```bash
task test:iac
```

The validation must reject retired runtime/API symbols and verify that environment/group vars align to the active FastAPI/NATS architecture.

## Legacy compatibility policy

The following legacy paths are retired and must not be reintroduced into active flows:

- stdlib `BaseHTTPRequestHandler`/`HTTPServer` runtime API server
- `/api/action/update`
- `legacy_intent`
- generic shell execution write payloads
- `sync_bash` and `tofu_deploy` as browser-facing operation contracts
- direct frontend-to-Gatus production calls

Active clients must use typed operation/domain commands through FastAPI, for example `git_sync`, `deploy_blueprint`, `drift_scan`, `fleet_join`, `rotate_secret`, `restore_backup`, `policy_deploy`, and release workflow commands.

## Current validation baseline

The documentation reflects the latest development baseline validated in the Ubuntu dev environment through the visual regression gate:

| Gate | Status | Meaning |
|---|---:|---|
| `task test:nats` | ✅ Passed | FastAPI, NATS/JetStream, worker command flow, event publication, and journal flow are integrated. |
| `task test:nats-permissions` | ✅ Passed | Subject permission model for API, worker, and agent roles is enforced. |
| `task test:websockets` | ✅ Passed | Browser event delivery over FastAPI WebSocket is functional. |
| `task check:api-contract` | ✅ Passed | Frontend API calls are represented in the generated FastAPI OpenAPI contract. |
| `task check:schemas` | ✅ Passed | JSON fixtures/events conform to the checked schemas. |
| `task test:frontend` | ✅ Passed with warnings | Vite/PWA build succeeds; lint/format/security cleanup remains tracked as quality debt. |
| `task test:network` | ✅ Passed | Browser write flows use typed operations and do not send legacy payloads. |
| `task test:redaction` | ✅ Passed | Journals/log payloads redact secrets before persistence. |
| `task test:storybook` | ✅ Passed | Component documentation builds successfully. |
| `task test:visual` | ✅ Passed | The app shell renders deterministically and matches the visual baseline. |

Remaining release-candidate gates are `task test:lighthouse`, `task test:a11y`, `task test:golden`, `task test:flakes`, `task android:smoke`, and `task release:dry-run`.
