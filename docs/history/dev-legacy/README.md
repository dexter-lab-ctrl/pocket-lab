# Pocket Lab Dev Documentation

This directory is the canonical documentation set for developer workstations, local validation, and CI-style quality gates.

## Dev architecture

```text
Developer workstation
  -> Taskfile aliases
  -> Vite React PWA on 127.0.0.1:5173
  -> FastAPI on 127.0.0.1:8000
  -> NATS/JetStream dev container
  -> local worker process
  -> Playwright, Storybook, API contracts, schema, redaction and visual gates
```

The dev environment mirrors the production architecture but uses local processes and deterministic mocks where appropriate.

## Current dev validation status

| Gate | Status |
|---|---:|
| `task dev:up` | Passed |
| `task dev:status` | Passed after status script fix |
| `task test:nats` | Passed |
| `task test:nats-permissions` | Passed |
| `task test:websockets` | Passed |
| `task check:api-contract` | Passed |
| `task check:schemas` | Passed |
| `task test:frontend` | Passed with warnings |
| `task test:network` | Passed |
| `task test:redaction` | Passed |
| `task test:storybook` | Passed |
| `task test:visual` | Passed after snapshot baseline |

## Dev document set

- [`dev-environment-and-validation.md`](./dev-environment-and-validation.md)
- [`frontend-ui-quality-gates.md`](./frontend-ui-quality-gates.md)
- [`contracts-schemas-and-mocks.md`](./contracts-schemas-and-mocks.md)
- [`local-runtime-runbook.md`](./local-runtime-runbook.md)
