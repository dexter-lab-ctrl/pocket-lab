# Release Rollback

!!! note "Generated runbook page"
    This page is generated from `runbooks/release_rollback.yaml`. Update the runbook YAML source, not this generated page.

## Identity

| Field | Value |
|---|---|
| Runbook ID | `release_rollback` |
| Source | `runbooks/release_rollback.yaml` |
| Owner | release-operations |
| Category | release-management |
| Severity | `critical` |
| Approval Required | yes |
| Professional Mode | Roll Back Failed Release |
| Simple Mode | Go Back to Previous Release |

## Description

Controlled rollback path when release validation or apply fails.

## Trigger Metadata

```yaml
{
  "manual": true,
  "eventHints": [
    "pocketlab.events.operation.failed",
    "pocketlab.dlq.original_subject"
  ]
}
```

## Policy and Approval

| Policy Field | Value |
|---|---|
| Minimum Role | release_manager |
| Evidence Required | yes |
| Approval Reason | Release rollback changes platform runtime state. |

## Prerequisites

- Failed release correlation ID is available.
- Previous known-good release or backup reference is known.
- Operator has reviewed release evidence.

## Execution Plan

| # | Step | Typed Operation | Operation Label | Simple Label | Approval | Timeout | On Failure |
|---|---|---|---|---|---|---|---|
| 1 | Check Release State | `release_check` | Check release | Check for update | no | 300s | stop |
| 2 | Create Pre-rollback Backup | `backup_now` | Backup now | Save a copy | no | 600s | stop |
| 3 | Restore Previous State | `restore_backup` | Restore backup | Restore saved copy | yes | 1200s | stop |
| 4 | Verify After Rollback | `health_check` | Refresh health snapshot | Check system health | no | 300s | stop |

## Operation Contract Evidence

| Step | NATS Subject | API Entrypoints |
|---|---|---|
| Check Release State | pocketlab.commands.release.check | /api/release/self-update/check |
| Create Pre-rollback Backup | pocketlab.commands.operation.execute | /api/operations/execute |
| Restore Previous State | pocketlab.commands.operation.execute | /api/operations/execute, /api/operations/preview |
| Verify After Rollback | pocketlab.commands.health.check | /api/health/check |

## Rollback

| Field | Value |
|---|---|
| Operation | `release_apply` |
| Requires Approval | yes |
| Description | Re-apply release only after root cause review and approval. |

## Evidence Requirements

- `operation_events`
- `audit_events`
- `workflow_journal`
- `backup_manifest`
- `release_evidence`
- `health_snapshot`

## Safety

- Impact: `critical`
- Notes: Rollback must preserve evidence and correlation IDs for post-incident review.

## Tier 7B Scope

This page documents metadata only. Runtime execution through FastAPI, NATS / JetStream, and workers is planned for later Tier 7 phases.
