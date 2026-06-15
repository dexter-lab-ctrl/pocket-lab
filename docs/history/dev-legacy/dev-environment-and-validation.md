# Dev Environment and Validation

## Purpose

This document defines the developer environment used to validate Pocket Lab before release-candidate promotion.

## Required local services

| Service | Local endpoint | Purpose |
|---|---|---|
| React/Vite PWA | `http://127.0.0.1:5173` | Operator UI and PWA shell |
| FastAPI | `http://127.0.0.1:8000` | REST/OpenAPI/WebSocket control plane |
| NATS/JetStream | `nats://127.0.0.1:4222` | Command and event backbone |
| NATS monitor | `http://127.0.0.1:8222` | NATS health/monitoring |
| Worker | local process | Typed operation execution |

## Recommended startup

```bash
task dev:down
pkill -f "vite" || true
pkill -f "npm run dev" || true
rm -rf node_modules/.vite .vite
task dev:up
task dev:status
```

The frontend should be started with Vite `--force` in the dev script to avoid stale optimized dependency errors after dependency or Storybook changes.

## Vite proxy requirement

Local dev must proxy FastAPI paths through Vite so browser requests made to `127.0.0.1:5173` reach FastAPI on `127.0.0.1:8000`.

Required proxy paths:

```text
/api -> http://127.0.0.1:8000
/ready -> http://127.0.0.1:8000
/ws -> http://127.0.0.1:8000 with WebSocket enabled
```

This prevents local UI errors such as `404 /api/nats/status`, `404 /ready`, and `404 /api/health-engine.json`.

## Validation order

Run gates in this order when stabilizing a dev branch:

```bash
task test:nats
task test:nats-permissions
task test:websockets
task check:api-contract
task check:schemas
task test:frontend
task test:network
task test:redaction
task test:storybook
task test:visual
```

After these pass, continue with Lighthouse, accessibility, golden path, flakes, Android smoke, and release dry-run.

## Known non-blocking warnings

- ESLint warnings around unused imports and React hook dependencies should be cleaned before release candidate, but they do not block the current frontend build gate.
- Vite and Storybook may warn about large chunks. Route-level code splitting can be handled as a later performance improvement.
- `npm audit` may report vulnerabilities; do not run `npm audit fix --force` blindly. Treat dependency updates as a controlled maintenance change.
