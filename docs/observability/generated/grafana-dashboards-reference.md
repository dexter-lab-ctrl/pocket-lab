<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:observability`. -->

# Grafana Dashboards / Provisioning Reference

This generated page documents Grafana configuration and provisioning paths that exist in the current repository snapshot.

## Grafana runtime config

| Field | Value |
| --- | --- |
| Port | {{ observability_grafana_port }} |
| HTTP address | 0.0.0.0 |
| Data path | {{ observability_base_dir }}/grafana/data |
| Logs path | {{ observability_base_dir }}/grafana/logs |
| Plugins path | {{ observability_base_dir }}/grafana/plugins |
| Provisioning path | {{ observability_base_dir }}/grafana/provisioning |
| Source files | `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/custom.ini.j2`, `pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/tasks/main.yml` |

## Provisioning directories

| Type | Paths |
| --- | --- |
| Dashboards | {{ observability_base_dir }}/grafana/provisioning/dashboards |
| Datasources | {{ observability_base_dir }}/grafana/provisioning/datasources |

## Provisioned source files verified

| Artifact type | Verified | Files |
| --- | --- | --- |
| Dashboard JSON | no | — |
| Datasource YAML | no | — |

## Enterprise-readiness notes

- Grafana itself is verified from the Ansible observability role and generated `custom.ini` template.
- Dashboard directories and datasource directories are verified as runtime/provisioning paths.
- Dashboards-as-code and datasources-as-code are **not claimed** unless committed dashboard JSON or datasource YAML files are found.
