# Generated Runbook Catalog

!!! note "Generated runbook documentation capability runbook documentation"
    This page is generated from `runbooks/*.yaml`. Runbooks orchestrate typed operations only. They do not introduce shell execution or any external automation control plane.

## Summary

| Metric | Value |
|---|---|
| Runbooks | 5 |
| Typed operation step references | 20 |
| Approval-gated runbooks | 5 |
| Categories | disaster-recovery, drift-management, recovery, release-management, security |
| Severities | critical, high, medium |

## Generated Pages

- [Runbook Operation Map](operation-map.md)
- [Runbook Approval Matrix](approval-matrix.md)
- [Runbook Evidence Matrix](evidence-matrix.md)
- [Runbook Validation Gates](validation-gates.md)
- [Simple Mode Runbook Guide](simple-mode.md)

## Runbook Index

| Runbook | Professional label | Simple label | Category | Severity | Approval | Steps | Owner |
|---|---|---|---|---|---|---|---|
| [`backup_restore_verify`](backup-restore-verify.md) | Verify Backup and Restore Readiness | Check Saved Copy and Recovery Readiness | disaster-recovery | high | yes | 4 | platform-operations |
| [`drift_detect_approve_apply`](drift-detect-approve-apply.md) | Detect, Approve, and Apply Drift Remediation | Review and Fix Something Changed | drift-management | medium | yes | 4 | platform-operations |
| [`recover_failed_install`](recover-failed-install.md) | Recover Failed Blueprint Deployment | Fix Failed App Install | recovery | high | yes | 4 | platform-operations |
| [`release_rollback`](release-rollback.md) | Roll Back Failed Release | Go Back to Previous Release | release-management | critical | yes | 4 | release-operations |
| [`rotate_secret_with_audit`](rotate-secret-with-audit.md) | Rotate Secret with Audit Evidence | Change Password Safely | security | critical | yes | 4 | security-operations |

## Enterprise Rules

- Runbook steps must reference typed operations from `operations/*.yaml`.
- Runbook documentation is generated and must not be manually edited under `docs/operations/generated/runbooks/`.
- Runbooks preserve FastAPI as the control API, NATS / JetStream as the event backbone, and workers as the execution boundary.
- runbook documentation capability is documentation generation only. Runtime execution is intentionally deferred to later native runbook capability steps.
