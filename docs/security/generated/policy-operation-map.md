<!-- GENERATED FILE - DO NOT EDIT. Run task docs:security:policies. -->

# Operation-to-policy Mapping

This generated page maps typed operations and native runbooks to policy guardrails. It is documentation-only and preserves worker-owned execution through NATS / JetStream.

## Typed Operations

| Operation | Policies | Source |
| --- | --- | --- |
| `backup_now` | — | `operations/backup_now.yaml` |
| `backup_verify` | — | `operations/backup_verify.yaml` |
| `catalog_refresh` | — | `operations/catalog_refresh.yaml` |
| `configure_opa` | — | `operations/configure_opa.yaml` |
| `deploy_blueprint` | Hardcoded Secrets Prevention, Privileged Port Restriction, PRoot Isolation Enforcement | `operations/deploy_blueprint.yaml` |
| `drift_apply` | Adaptive Runbook Approval | `operations/drift_apply.yaml` |
| `drift_approve` | Adaptive Runbook Approval | `operations/drift_approve.yaml` |
| `drift_ignore` | — | `operations/drift_ignore.yaml` |
| `drift_preview` | — | `operations/drift_preview.yaml` |
| `drift_scan` | — | `operations/drift_scan.yaml` |
| `fleet_join` | — | `operations/fleet_join.yaml` |
| `git_sync` | — | `operations/git_sync.yaml` |
| `health_check` | Privileged Port Restriction | `operations/health_check.yaml` |
| `release_apply` | Adaptive Runbook Approval, PRoot Isolation Enforcement | `operations/release_apply.yaml` |
| `release_check` | — | `operations/release_check.yaml` |
| `restore_backup` | Adaptive Runbook Approval, PRoot Isolation Enforcement | `operations/restore_backup.yaml` |
| `rotate_secret` | Adaptive Runbook Approval, Hardcoded Secrets Prevention | `operations/rotate_secret.yaml` |
| `secret_read_dynamic` | Hardcoded Secrets Prevention | `operations/secret_read_dynamic.yaml` |
| `security_scan` | Hardcoded Secrets Prevention, Privileged Port Restriction | `operations/security_scan.yaml` |

## Runbooks

| Runbook | Policies | Requires approval | Minimum role | Source |
| --- | --- | --- | --- | --- |
| `backup_restore_verify` | Adaptive Runbook Approval, PRoot Isolation Enforcement | True | operator | `runbooks/backup_restore_verify.yaml` |
| `drift_detect_approve_apply` | Adaptive Runbook Approval | True | operator | `runbooks/drift_detect_approve_apply.yaml` |
| `recover_failed_install` | Adaptive Runbook Approval, Privileged Port Restriction, PRoot Isolation Enforcement | True | operator | `runbooks/recover_failed_install.yaml` |
| `release_rollback` | Adaptive Runbook Approval, PRoot Isolation Enforcement | True | release_manager | `runbooks/release_rollback.yaml` |
| `rotate_secret_with_audit` | Adaptive Runbook Approval, Hardcoded Secrets Prevention | True | security_reviewer | `runbooks/rotate_secret_with_audit.yaml` |

## Freshness Signals

- Unknown policy operation references: `[]`
- Unknown policy runbook references: `[]`
- Operations without explicit policy mapping: `['backup_now', 'backup_verify', 'catalog_refresh', 'configure_opa', 'drift_ignore', 'drift_preview', 'drift_scan', 'fleet_join', 'git_sync', 'release_check']`
- Runbooks without explicit policy mapping: `[]`
