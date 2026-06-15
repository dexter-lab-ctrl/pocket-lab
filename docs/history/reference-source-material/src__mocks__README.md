# Pocket Lab MSW Mock API

## Purpose

The MSW mock layer supports frontend development, Storybook scenarios, and deterministic UI quality gates without requiring every backend service to be live.

## Run mock frontend

```bash
npm run dev:mock
# or
task dev:frontend:mock
```

## Supported scenarios

Set a scenario in the browser console:

```js
localStorage.setItem('POCKETLAB_MOCK_SCENARIO', 'healthy')
localStorage.setItem('POCKETLAB_MOCK_SCENARIO', 'nats-down')
localStorage.setItem('POCKETLAB_MOCK_SCENARIO', 'worker-down')
localStorage.setItem('POCKETLAB_MOCK_SCENARIO', 'vault-sealed')
location.reload()
```

## Mock contract rules

- Mock handlers must match FastAPI/OpenAPI paths.
- Write mocks must emit typed operations only.
- Mock payloads should conform to JSON schemas used by `task check:schemas`.
- Mock scenarios should support Storybook, visual regression, accessibility, and golden-path tests.

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
