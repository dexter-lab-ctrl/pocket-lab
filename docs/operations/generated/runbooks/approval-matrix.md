# Runbook Approval Matrix

!!! note "Generated approval matrix"
    Approval metadata is generated from `runbooks/*.yaml` and is intended for later FastAPI / OPA enforcement.

| Runbook | Severity | Runbook Approval | Minimum Role | Reason | Approval Steps | Evidence Required |
|---|---|---|---|---|---|---|
| [`backup_restore_verify`](backup-restore-verify.md) | high | yes | operator | Restore validation can touch backup and recovery paths. | Restore Backup | yes |
| [`drift_detect_approve_apply`](drift-detect-approve-apply.md) | medium | yes | operator | Drift remediation changes desired or runtime state. | Approve Remediation, Apply Remediation | yes |
| [`recover_failed_install`](recover-failed-install.md) | high | yes | operator | Failed deployment recovery can change installed state. | Re-run Install | yes |
| [`release_rollback`](release-rollback.md) | critical | yes | release_manager | Release rollback changes platform runtime state. | Restore Previous State | yes |
| [`rotate_secret_with_audit`](rotate-secret-with-audit.md) | critical | yes | security_reviewer | Secret rotation changes sensitive access material. | Rotate Secret | yes |
