# Runbook Evidence Matrix

!!! note "Generated evidence matrix"
    Evidence requirements prepare native runbook capability runbooks for auditability, workflow recovery, and later event-sourced execution.

| Runbook | Severity | `approval_record` | `audit_events` | `backup_manifest` | `drift_report` | `health_snapshot` | `operation_events` | `policy_decision` | `redaction_check` | `release_evidence` | `workflow_journal` |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [`backup_restore_verify`](backup-restore-verify.md) | high |  | yes | yes |  | yes | yes |  |  |  | yes |
| [`drift_detect_approve_apply`](drift-detect-approve-apply.md) | medium | yes | yes |  | yes |  | yes |  |  |  | yes |
| [`recover_failed_install`](recover-failed-install.md) | high |  | yes | yes | yes |  | yes |  |  |  | yes |
| [`release_rollback`](release-rollback.md) | critical |  | yes | yes |  | yes | yes |  |  | yes | yes |
| [`rotate_secret_with_audit`](rotate-secret-with-audit.md) | critical |  | yes |  |  |  | yes | yes | yes |  | yes |
