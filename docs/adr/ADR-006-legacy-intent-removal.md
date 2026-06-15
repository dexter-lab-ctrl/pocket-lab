# Legacy Intent Removal Report

## Result

Pocket Lab now documents typed operations as the only supported mutation contract. The old compatibility bridge has been retired so the app cannot silently fall back to legacy execution semantics.

## Legacy compatibility policy

The following legacy paths are retired and must not be reintroduced into active flows:

- stdlib `BaseHTTPRequestHandler`/`HTTPServer` runtime API server
- `/api/action/update`
- `legacy_intent`
- generic shell execution write payloads
- `sync_bash` and `tofu_deploy` as browser-facing operation contracts
- direct frontend-to-Gatus production calls

Active clients must use typed operation/domain commands through FastAPI, for example `git_sync`, `deploy_blueprint`, `drift_scan`, `fleet_join`, `rotate_secret`, `restore_backup`, `policy_deploy`, and release workflow commands.

## Current operation contract

| User intent | Typed operation or command |
|---|---|
| Keep environment updated | `git_sync` / release workflow commands |
| Install app/service | `deploy_blueprint` |
| Check drift or health issue | `drift_scan` and health event subjects |
| Add device | `fleet_join` |
| Change password/secret | `rotate_secret` |
| Restore backup | `restore_backup` |
| Deploy policy | `policy_deploy` |

## Enforcement points

- Frontend helper APIs emit typed operations.
- `task test:network` verifies browser write payloads do not carry retired fields.
- `task check:api-contract` verifies the frontend call graph maps to FastAPI OpenAPI.
- Worker command handlers accept explicit operation/domain command subjects only.

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
