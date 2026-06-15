<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:observability`. -->

# Alerting / SLO Reference

Alert/SLO source files were **Not verified in the current repo snapshot**.

This page is a generated gap and roadmap reference unless alert/SLO source files are present in the manifest. It is not a claim that alerting is implemented.

## Verified alert/SLO source files

| Source |
| --- |
| — |

## Recommended future source files

| Path | Purpose |
| --- | --- |
| observability/alerts/pocketlab-alerts.yaml | Future alert rule source |
| observability/slo/pocketlab-slos.yaml | Future SLO metadata source |

## Candidate future SLOs

| SLO |
| --- |
| API ready endpoint availability |
| NATS command publish success |
| Worker heartbeat freshness |
| Runbook execution success ratio |
| Operation failure ratio |
| Vault health |
| Loki ready |
| Prometheus ready |
| Grafana health |
| Fleet node freshness |
| Backup verification success |

## Current limitations

- Static source inspection does not prove services are running or alerting is active.
- Alertmanager, SLO burn-rate rules, and notification routing are not part of the observability evidence baseline unless implemented separately with validation.
- Do not expose observability endpoints broadly without access-control guidance.
