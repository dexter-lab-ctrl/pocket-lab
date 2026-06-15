<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:observability`. -->

# Loki Log Pipeline Reference

This generated page distinguishes the real Loki service, the Promtail log pipeline, Caddy routes, and FastAPI's Loki-compatible query API.

## Loki service

| Field | Value |
| --- | --- |
| Listen address | 127.0.0.1 |
| Listen port | {{ observability_loki_port }} |
| Query path | /loki/api/v1/query |
| Path prefix | {{ observability_base_dir }}/loki |
| Chunks directory | {{ observability_base_dir }}/loki/chunks |
| Rules directory | {{ observability_base_dir }}/loki/rules |
| Source | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/loki-config.yaml.j2` |

## Promtail pipeline

| Field | Value |
| --- | --- |
| Promtail listen port | {{ observability_promtail_port }} |
| Loki push URL | http://127.0.0.1:{{ observability_loki_port }}/loki/api/v1/push |
| Positions file | {{ observability_base_dir }}/promtail/positions.yaml |
| Source | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/promtail-config.yaml.j2` |

## Promtail scrape jobs

| Job | Targets | Log path pattern | Source |
| --- | --- | --- | --- |
| pm2_logs | localhost | {{ observability_termux_pm2_logs }}/*.log | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/promtail-config.yaml.j2` |

## Caddy observability routes

| Route | Upstream | Source |
| --- | --- | --- |
| /loki/* | {{ caddy_routes.loki }} | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/caddy/templates/Caddyfile.j2` |
| /gatus/* | {{ caddy_routes.gatus }} | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/caddy/templates/Caddyfile.j2` |

## FastAPI Loki-compatible query routes

| Method | Route | Function | Source |
| --- | --- | --- | --- |
| GET | /loki/api/v1/query | loki_query | `pocket-lab-final-structure/runtime/api_fastapi/routers/security.py` |

## UI log consumers

| Consumer | Purpose | Endpoints / tokens | Source |
| --- | --- | --- | --- |
| LogExplorerTab | Log Explorer queries Loki-compatible log data through FastAPI. | /ready | `src/tabs/LogExplorerTab.jsx` |
| SecurityPostureTab | Security Posture surfaces safety scans and security log activity. | — | `src/tabs/SecurityPostureTab.jsx` |

## Redaction and access notes

| Note |
| --- |
| Do not expose token, password, secret, api_key, authorization, private_key, value, or join-secret material in logs. |
| FastAPI Loki-compatible routes should return safe query results only and preserve existing redaction behavior. |

- This page does not claim the Loki service is currently running. Use runtime checks such as `curl -fsS http://127.0.0.1:3100/ready` for live validation.
- The route `/loki/api/v1/query` can refer to the real Loki API behind Caddy or the FastAPI Loki-compatible query endpoint depending on the deployment path. Keep that distinction visible during troubleshooting.
