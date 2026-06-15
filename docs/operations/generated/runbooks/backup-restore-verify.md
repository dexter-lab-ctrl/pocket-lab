# Backup Restore Verification

!!! note "Generated runbook page"
    This page is generated from `runbooks/backup_restore_verify.yaml`. Update the runbook YAML source, not this generated page.

## Identity

| Field | Value |
|---|---|
| Runbook ID | `backup_restore_verify` |
| Source | `runbooks/backup_restore_verify.yaml` |
| Owner | platform-operations |
| Category | disaster-recovery |
| Severity | `high` |
| Approval Required | yes |
| Professional Mode | Verify Backup and Restore Readiness |
| Simple Mode | Check Saved Copy and Recovery Readiness |

## Description

Prove backup integrity and controlled restore readiness without bypassing typed operations.

## Trigger Metadata

```yaml
{
  "manual": true,
  "scheduleHint": "before-release-or-maintenance"
}
```

## Policy and Approval

| Policy Field | Value |
|---|---|
| Minimum Role | operator |
| Evidence Required | yes |
| Approval Reason | Restore validation can touch backup and recovery paths. |

## Prerequisites

- Backup destination has sufficient free space.
- Operator has selected the backup reference to verify.
- Restore target is clearly identified.

## Execution Plan

| # | Step | Typed Operation | Operation Label | Simple Label | Approval | Timeout | On Failure |
|---|---|---|---|---|---|---|---|
| 1 | Create Backup | `backup_now` | Backup now | Save a copy | no | 600s | stop |
| 2 | Verify Backup | `backup_verify` | Verify backup | Check saved copy | no | 600s | stop |
| 3 | Restore Backup | `restore_backup` | Restore backup | Restore saved copy | yes | 1200s | stop |
| 4 | Post-restore Health Check | `health_check` | Refresh health snapshot | Check system health | no | 300s | stop |

## Operation Contract Evidence

| Step | NATS Subject | API Entrypoints |
|---|---|---|
| Create Backup | pocketlab.commands.operation.execute | /api/operations/execute |
| Verify Backup | pocketlab.commands.operation.execute | /api/operations/execute |
| Restore Backup | pocketlab.commands.operation.execute | /api/operations/execute, /api/operations/preview |
| Post-restore Health Check | pocketlab.commands.health.check | /api/health/check |

## Rollback

| Field | Value |
|---|---|
| Operation | `restore_backup` |
| Requires Approval | yes |
| Description | Restore the prior known-good backup if verification restore fails. |

## Evidence Requirements

- `operation_events`
- `audit_events`
- `workflow_journal`
- `backup_manifest`
- `health_snapshot`

## Safety

- Impact: `high`
- Notes: Restore execution requires explicit approval and auditable evidence.

## Tier 7B Scope

This page documents metadata only. Runtime execution through FastAPI, NATS / JetStream, and workers is planned for later Tier 7 phases.
