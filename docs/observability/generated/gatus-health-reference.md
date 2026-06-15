<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:observability`. -->

# Gatus Health Reference

This generated page documents Gatus as Pocket Lab's health aggregation layer when verified by repository source.

## Gatus integration summary

| Field | Value |
| --- | --- |
| Port | 8081 |
| Health-engine integration | control_plane_core.fetch_gatus_statuses() |
| Fallback behavior | FastAPI can return fallback health data when Gatus is unreachable |
| Endpoint groups | core, drift, fleet, gitops, observability, platform, policy |
| Source | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |

## Health checks

| Name | Group | URL | Interval | Conditions | Source |
| --- | --- | --- | --- | --- | --- |
| pocket-lab-api | core | http://127.0.0.1:8080/health | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| pocket-lab-ready | core | http://127.0.0.1:8080/ready | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| vault | platform | http://127.0.0.1:8200/v1/sys/health?standbyok=true | 30s | [STATUS] == any(200, 429) | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| gitea | platform | http://127.0.0.1:3030/api/healthz | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| loki | observability | http://127.0.0.1:3100/ready | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| prometheus | observability | http://127.0.0.1:9090/-/ready | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| grafana | observability | http://127.0.0.1:3050/api/health | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| gatus-self | observability | http://127.0.0.1:8081/health | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| opa | policy | http://127.0.0.1:8181/health | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| tailscale | platform | http://127.0.0.1:8080/api/config/tailscale.json | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| fleet-health | fleet | http://127.0.0.1:8080/api/fleet/health.json | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| fleet-nodes | fleet | http://127.0.0.1:8080/api/fleet.json | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| fleet-node-1 | fleet | http://127.0.0.1:8080/api/fleet/nodes/node-1/health | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| fleet-node-2 | fleet | http://127.0.0.1:8080/api/fleet/nodes/node-2/health | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| fleet-node-3 | fleet | http://127.0.0.1:8080/api/fleet/nodes/node-3/health | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| drift-summary | drift | http://127.0.0.1:8080/api/drift/summary | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| drift-jobs | drift | http://127.0.0.1:8080/api/drift/jobs | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| drift-metrics | drift | http://127.0.0.1:8080/api/drift/metrics | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| gitops-health | gitops | http://127.0.0.1:8080/api/gitops/health.json | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |
| git-history | gitops | http://127.0.0.1:8080/api/git_history.json | 30s | [STATUS] == 200 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2` |

## Operating notes

- Gatus status is consumed by FastAPI health aggregation when reachable.
- Fallback behavior must remain explicit in operator-facing responses; generated documentation distinguishes `source=gatus` from fallback behavior.
- Static source inspection does not prove that Gatus is currently running. Use `curl -fsS http://127.0.0.1:8081/health` for live validation.
