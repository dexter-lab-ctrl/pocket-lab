<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:observability`. -->

# Telemetry Contract Reference

This generated page ties Pocket Lab observability back to the control-plane contract model.

Pocket Lab runtime flow remains:

```text
React / Vite PWA
→ FastAPI Control API
→ NATS / JetStream
→ Workers
→ Events
→ FastAPI
→ UI
```

## FastAPI observability and telemetry routes

| Method | Route | Function | Source |
| --- | --- | --- | --- |
| POST | /api/events/publish | publish_event | `pocket-lab-final-structure/runtime/api_fastapi/routers/events.py` |
| GET | /api/events/recent | recent_events | `pocket-lab-final-structure/runtime/api_fastapi/routers/events.py` |
| GET | /api/events/status | event_bus_status | `pocket-lab-final-structure/runtime/api_fastapi/routers/events.py` |
| GET | /api/health-engine.json | health_engine | `pocket-lab-final-structure/runtime/api_fastapi/routers/health.py` |
| POST | /api/health/check | health_check | `pocket-lab-final-structure/runtime/api_fastapi/routers/health.py` |
| GET | /api/nats/status | event_bus_status | `pocket-lab-final-structure/runtime/api_fastapi/routers/events.py` |
| GET | /api/telemetry | telemetry | `pocket-lab-final-structure/runtime/api_fastapi/routers/telemetry.py` |
| GET | /api/telemetry.json | telemetry | `pocket-lab-final-structure/runtime/api_fastapi/routers/telemetry.py` |
| GET | /api/telemetry/live/status | telemetry_live_status | `pocket-lab-final-structure/runtime/api_fastapi/routers/telemetry.py` |
| GET | /api/workers/status | worker_status | `pocket-lab-final-structure/runtime/api_fastapi/routers/events.py` |
| GET | /health | health | `pocket-lab-final-structure/runtime/api_fastapi/routers/health.py` |
| GET | /healthz | health | `pocket-lab-final-structure/runtime/api_fastapi/routers/health.py` |
| GET | /loki/api/v1/query | loki_query | `pocket-lab-final-structure/runtime/api_fastapi/routers/security.py` |
| GET | /ready | ready | `pocket-lab-final-structure/runtime/api_fastapi/routers/health.py` |

## OpenAPI observability paths

| OpenAPI path |
| --- |
| /api/drift/metrics |
| /api/events/publish |
| /api/events/recent |
| /api/events/status |
| /api/fleet/health.json |
| /api/fleet/nodes/{node_id}/health |
| /api/gitops/health.json |
| /api/health-engine.json |
| /api/health/check |
| /api/nats/status |
| /api/operations/health |
| /api/telemetry |
| /api/telemetry.json |
| /api/telemetry/live/status |
| /api/workers/status |
| /api/workflows/events |
| /health |
| /healthz |
| /loki/api/v1/query |
| /ready |

## AsyncAPI / event subjects related to observability

| Subject |
| --- |
| pocketlab.audit.> |
| pocketlab.audit.release.applied |
| pocketlab.audit.runbook.approved |
| pocketlab.audit.runbook.executed |
| pocketlab.audit.runbook.rejected |
| pocketlab.audit.security.policy_updated |
| pocketlab.audit.vault.secret_rotated |
| pocketlab.commands.health.check |
| pocketlab.commands.operation.execute |
| pocketlab.dlq.> |
| pocketlab.dlq.original_subject |
| pocketlab.events.fleet.node_telemetry |
| pocketlab.events.health.checked |
| pocketlab.events.operation.created |
| pocketlab.events.operation.failed |
| pocketlab.events.operation.log |
| pocketlab.events.operation.succeeded |
| pocketlab.events.operation.worker_claimed |
| pocketlab.events.telemetry.sampled |
| pocketlab.events.worker.heartbeat |

## Frontend event, health, telemetry, and log consumers

| Consumer | Purpose | Hooks | Endpoints | Source |
| --- | --- | --- | --- | --- |
| LogExplorerTab | Log Explorer queries Loki-compatible log data through FastAPI. | — | /loki/api/v1/query?query=${encodeURIComponent(query)}&limit=100, /ready | `src/tabs/LogExplorerTab.jsx` |
| SecurityPostureTab | Security Posture surfaces safety scans and security log activity. | useHealthEngine | /loki/api/v1/query?query={job="pm2_logs"} \|= "security_audit"&limit=5 | `src/tabs/SecurityPostureTab.jsx` |
| NocTelemetryTab | NOC Telemetry / System Status consumes health, telemetry, and runtime observability snapshots. | useHealthEngine, useTelemetry, useObservabilityStatus | — | `src/tabs/NocTelemetryTab.jsx` |
| RuntimeObservabilityStatusPanel | UI card for live Prometheus, Loki, Grafana, Gatus, Promtail, and Prometheus target status through FastAPI. | — | — | `src/components/RuntimeObservabilityStatusPanel.jsx` |
| useObservabilityStatus | Shared hook that polls FastAPI runtime observability health status. | useObservabilityStatus | /api/observability/status | `src/hooks/useObservabilityStatus.js` |
| useHealthEngine | Shared hook that polls FastAPI health-engine snapshots. | useHealthEngine, usePocketLabEvents | /api/health-engine.json | `src/hooks/useHealthEngine.js` |
| useTelemetry | Shared hook that polls FastAPI telemetry snapshots. | useTelemetry, usePocketLabEvents | /api/telemetry.json | `src/hooks/useTelemetry.js` |
| usePocketLabEvents | Shared hook that replays recent events and streams live Pocket Lab events. | usePocketLabEvents | /api/events/recent?limit=${Math.max(limit, 25)}${prefix}, /ws/events | `src/hooks/usePocketLabEvents.js` |

## Redaction rules

| Sensitive key |
| --- |
| token |
| password |
| secret |
| api_key |
| authorization |
| private_key |
| value |

## Contract sources

| Source |
| --- |
| `contracts/generated/openapi.json` |
| `contracts/asyncapi/pocketlab-nats-jetstream.yaml` |
| `contracts/operations/pocketlab-typed-operations.json` |
| `docs/runtime/nats-jetstream-event-contract.md` |
| `docs/runtime/typed-operations-catalog.md` |

## Correlation expectations

- Every write workflow should remain traceable through API request, NATS command, worker logs, operation events, audit events, and UI event panels.
- Lifecycle events must remain observable and auditable.
- The frontend must consume runtime observability health through FastAPI only; it must not call Prometheus, Loki, Grafana, Gatus, Promtail, or NATS directly.
- DLQ and retry subjects should remain visible through generated event contracts and operator diagnostics.
