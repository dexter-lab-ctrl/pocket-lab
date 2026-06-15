<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:observability`. -->

# Observability Runtime Map

This generated map connects operator-facing UI surfaces to FastAPI endpoints, runtime events, and observability components.

## Runtime map

| UI surface | FastAPI / Route | Runtime function | Observability source | Component | Operator-facing page | Related runbook |
| --- | --- | --- | --- | --- | --- | --- |
| Log Explorer | /loki/api/v1/query | control_plane_core.search_loki() | Loki-compatible logs | Loki / Promtail | Observability / Log Explorer | — |
| Security Posture | /loki/api/v1/query?query={job="pm2_logs"} \|= "security_audit" | security audit log query | Security audit log activity | Loki / Promtail | Safety Center / Security Posture | rotate_secret_with_audit, security_scan |
| NOC Telemetry / System Status | /api/telemetry.json, /api/health-engine.json | LIVE_STATUS sampler and health engine | Health + telemetry snapshots | Gatus when reachable, fallback otherwise | System Status | health_check |
| Runtime Observability Health | /api/observability/status | observability_status service | Prometheus/Loki/Grafana/Gatus readiness, Prometheus target summary, inferred Promtail log shipping | FastAPI-owned bounded runtime probes | System Status | health_check |
| Event panels | /api/events/recent, /ws/events | FastAPI event bus replay/stream | NATS / event journal | NATS / JetStream | Operation activity panels | All runbooks via lifecycle events |
| NATS status | /api/nats/status | NATS bus status service | NATS monitor/runtime status | NATS / JetStream | Runtime diagnostics | — |
| Worker status | /api/workers/status | worker registry/status route | Worker runtime status | Workers | Runtime diagnostics | — |
| Gatus health dashboard | /gatus/* via Caddy | Caddy reverse proxy | Health checks | Gatus | Health Engine | health_check |
| Loki route | /loki/* via Caddy | Caddy reverse proxy | Log query API | Loki or FastAPI-compatible route depending on deployment | Log Explorer | — |

## Source inventory

| Source group | Files |
| --- | --- |
| ansible_inventory_vars | 8 |
| ansible_observability_role | 7 |
| bootstrap_observability_scripts | 20 |
| caddy_routes | 3 |
| fastapi_runtime_observability | 9 |
| frontend_observability_consumers | 8 |
| observability_human_docs | 1 |
| runtime_contracts | 6 |

## Warnings from source inspection

| Warning |
| --- |
| FastAPI /metrics endpoint was not verified in the current repository snapshot. |
| Grafana directories/config exist, but dashboard JSON files were not verified. |
| Grafana datasource provisioning YAML was not verified. |
| Alert/SLO source files were not verified; Tier 12 generates a gap/reference page only. |

## Missing enterprise hardening features

| Missing / planned item |
| --- |
| First-class FastAPI /metrics endpoint and app-level metrics instrumentation. |
| Grafana dashboards-as-code JSON under a committed provisioning path. |
| Grafana datasource provisioning as code for Prometheus and Loki. |
| Alert rules and SLO metadata as committed source files. |

## Validation boundary

- Tier 12 static validation proves generated evidence and documentation freshness from repository sources.
- Tier 13 runtime health is exposed through FastAPI at `/api/observability/status` and must be validated separately from Tier 12 static evidence.
- Runtime health can also be cross-checked with service checks such as Prometheus `/-/ready`, Loki `/ready`, Grafana `/api/health`, Gatus `/health`, and bounded Loki `pm2_logs` queries.
