# Debugging

Debug Pocket Lab by following the runtime path instead of bypassing it.

```text
FastAPI → NATS / JetStream → Worker → Typed Operation → Events → FastAPI/UI
```

## Runtime status

```bash
task dev:status
curl -s http://127.0.0.1:8000/api/health | python3 -m json.tool
curl -s http://127.0.0.1:8222/healthz
```

## Logs

```bash
task dev:logs
ls -lah .pocketlab-dev/logs
```

## Common failure patterns

| Symptom | What to check | Recovery |
| --- | --- | --- |
| UI action does not progress | FastAPI health, NATS health, worker process, event logs | Restart dev stack and rerun typed operation trace. |
| NATS unavailable | Docker Desktop / Docker engine / NATS container | `task dev:down`, verify Docker, then `task dev:up`. |
| Generated docs stale | Changed source metadata without regenerating docs | Run the matching `task docs:*` target and commit generated output. |
| Release artifact missing files | PWA build or packaging problem | Run `npm run build` and verify `dist/` contents. |
| Observability service unknown | Service not running or status cached | Check `/api/observability/status` and service-specific runtime. |

## Trace an operation

```bash
task trace:operation
```

Do not fix runtime issues by adding frontend shell execution, frontend direct NATS access, or direct frontend observability-tool calls.
