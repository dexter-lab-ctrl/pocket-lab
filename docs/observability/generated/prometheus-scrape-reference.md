<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:observability`. -->

# Prometheus Scrape Reference

This page is generated from the existing Ansible observability role, inventory variables, bootstrap scripts, and runtime contracts. It documents the current Prometheus scrape setup without adding a new metrics stack.

## Port inventory

| Component | Port | Source |
| --- | --- | --- |
| gatus | 8081 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/defaults/main.yml` |
| grafana | 3050 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/defaults/main.yml` |
| loki | 3100 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/defaults/main.yml` |
| prometheus | 9090 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/defaults/main.yml` |
| promtail | 9080 | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/defaults/main.yml` |

## Prometheus global settings

| Setting | Value |
| --- | --- |
| Prometheus port | 9090 |
| Scrape interval | 15s |
| Evaluation interval | 15s |
| FastAPI `/metrics` endpoint | Not verified in this repo snapshot |
| Source | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/prometheus.yml.j2` |

## Scrape jobs

| Job | Metrics path | Targets | Params | Notes | Source |
| --- | --- | --- | --- | --- | --- |
| prometheus | /metrics | localhost:{{ observability_prometheus_port }} | — | — | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/prometheus.yml.j2` |
| pm2_bridge_services | /metrics | localhost:{{ observability_grafana_port }}, localhost:{{ observability_loki_port }} | — | — | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/prometheus.yml.j2` |
| vault | /v1/sys/metrics | 127.0.0.1:8200 | format=['prometheus'] | Vault metrics rely on unauthenticated_metrics_access | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/prometheus.yml.j2` |

## Enterprise-readiness notes

- Prometheus integration is verified at the platform/IaC level from the repository sources above.
- FastAPI `/metrics` is intentionally listed as **not verified** unless an endpoint exists in the FastAPI route inventory.
- Vault metrics scraping is documented from the existing Prometheus template and relies on the configured Vault metrics behavior.
- Static documentation evidence does not prove Prometheus is currently running or that all targets are `UP`.
