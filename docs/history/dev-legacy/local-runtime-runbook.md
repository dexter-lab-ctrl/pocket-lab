# Local Runtime Runbook

## Start cleanly

```bash
task dev:down
pkill -f "vite" || true
pkill -f "npm run dev" || true
rm -rf node_modules/.vite .vite
task dev:up
task dev:status
```

## Diagnose blank UI

A blank UI with `#root` empty usually means React did not load or crashed before mounting.

Check browser-side errors:

```bash
node pocketlab-ui-debug.mjs
```

Common root causes:

| Symptom | Likely cause | Fix |
|---|---|---|
| `504 Outdated Optimize Dep` | stale Vite optimizer cache | kill Vite, remove `node_modules/.vite`, restart with `--force` |
| `404 /api/...` | missing Vite proxy | add `/api`, `/ready`, `/ws` proxy to FastAPI |
| `#root` attached but empty | module load failure or React runtime error | inspect console/page errors |
| visual test unstable | live polling/timestamps/small UI changes | freeze time and mock API responses |

## Diagnose NATS worker issues

If the worker reports a durable consumer conflict, reset local JetStream state:

```bash
task dev:down
docker compose -f docker-compose.dev.yml down -v
rm -rf .pocketlab-dev/state/nats
task dev:up
task test:nats
task test:nats-permissions
```

## Validate runtime path

Use this sequence after runtime fixes:

```bash
task dev:status
task test:nats
task test:nats-permissions
task test:websockets
task test:network
```

A healthy local runtime confirms:

```text
Frontend -> FastAPI -> NATS/JetStream -> Worker -> Workflow projection -> WebSocket/UI
```
