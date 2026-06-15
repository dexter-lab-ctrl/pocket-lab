# Runbook Operation Map

!!! note "Generated operation map"
    This page maps runbook steps to typed operations, NATS subjects, and API entrypoints.

| Runbook | Step # | Step | Typed Operation | Simple Label | NATS Subject | API Entrypoints |
|---|---|---|---|---|---|---|
| [`backup_restore_verify`](backup-restore-verify.md) | 1 | Create Backup | `backup_now` | Save a copy | pocketlab.commands.operation.execute | /api/operations/execute |
| [`backup_restore_verify`](backup-restore-verify.md) | 2 | Verify Backup | `backup_verify` | Check saved copy | pocketlab.commands.operation.execute | /api/operations/execute |
| [`backup_restore_verify`](backup-restore-verify.md) | 3 | Restore Backup | `restore_backup` | Restore saved copy | pocketlab.commands.operation.execute | /api/operations/execute, /api/operations/preview |
| [`backup_restore_verify`](backup-restore-verify.md) | 4 | Post-restore Health Check | `health_check` | Check system health | pocketlab.commands.health.check | /api/health/check |
| [`drift_detect_approve_apply`](drift-detect-approve-apply.md) | 1 | Scan Drift | `drift_scan` | Check what changed | pocketlab.commands.drift.scan | /api/operations/execute |
| [`drift_detect_approve_apply`](drift-detect-approve-apply.md) | 2 | Preview Remediation | `drift_preview` | Preview fix | pocketlab.commands.drift.preview | /api/operations/preview, /api/operations/execute |
| [`drift_detect_approve_apply`](drift-detect-approve-apply.md) | 3 | Approve Remediation | `drift_approve` | Approve fix | pocketlab.commands.drift.approve | /api/operations/execute |
| [`drift_detect_approve_apply`](drift-detect-approve-apply.md) | 4 | Apply Remediation | `drift_apply` | Fix issue | pocketlab.commands.drift.apply | /api/operations/execute |
| [`recover_failed_install`](recover-failed-install.md) | 1 | Scan Current State | `drift_scan` | Check what changed | pocketlab.commands.drift.scan | /api/operations/execute |
| [`recover_failed_install`](recover-failed-install.md) | 2 | Create Safety Backup | `backup_now` | Save a copy | pocketlab.commands.operation.execute | /api/operations/execute |
| [`recover_failed_install`](recover-failed-install.md) | 3 | Re-run Install | `deploy_blueprint` | Install | pocketlab.commands.operation.execute | /api/operations/execute |
| [`recover_failed_install`](recover-failed-install.md) | 4 | Verify Health | `health_check` | Check system health | pocketlab.commands.health.check | /api/health/check |
| [`release_rollback`](release-rollback.md) | 1 | Check Release State | `release_check` | Check for update | pocketlab.commands.release.check | /api/release/self-update/check |
| [`release_rollback`](release-rollback.md) | 2 | Create Pre-rollback Backup | `backup_now` | Save a copy | pocketlab.commands.operation.execute | /api/operations/execute |
| [`release_rollback`](release-rollback.md) | 3 | Restore Previous State | `restore_backup` | Restore saved copy | pocketlab.commands.operation.execute | /api/operations/execute, /api/operations/preview |
| [`release_rollback`](release-rollback.md) | 4 | Verify After Rollback | `health_check` | Check system health | pocketlab.commands.health.check | /api/health/check |
| [`rotate_secret_with_audit`](rotate-secret-with-audit.md) | 1 | Pre-rotation Health Check | `health_check` | Check system health | pocketlab.commands.health.check | /api/health/check |
| [`rotate_secret_with_audit`](rotate-secret-with-audit.md) | 2 | Rotate Secret | `rotate_secret` | Change Password | pocketlab.commands.vault.rotate | /api/operations/execute |
| [`rotate_secret_with_audit`](rotate-secret-with-audit.md) | 3 | Verify Secret Access | `secret_read_dynamic` | Get temporary password | pocketlab.commands.vault.dynamic_secret | /api/operations/execute |
| [`rotate_secret_with_audit`](rotate-secret-with-audit.md) | 4 | Post-rotation Health Check | `health_check` | Check system health | pocketlab.commands.health.check | /api/health/check |
