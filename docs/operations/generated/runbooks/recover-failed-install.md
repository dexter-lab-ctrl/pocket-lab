# Recover Failed Install

!!! note "Generated runbook page"
    This page is generated from `runbooks/recover_failed_install.yaml`. Update the runbook YAML source, not this generated page.

## Identity

| Field | Value |
|---|---|
| Runbook ID | `recover_failed_install` |
| Source | `runbooks/recover_failed_install.yaml` |
| Owner | platform-operations |
| Category | recovery |
| Severity | `high` |
| Approval Required | yes |
| Professional Mode | Recover Failed Blueprint Deployment |
| Simple Mode | Fix Failed App Install |

## Description

Guided recovery path for a failed Apps & Services / Blueprint installation.

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
| Minimum Role | operator |
| Evidence Required | yes |
| Approval Reason | Failed deployment recovery can change installed state. |

## Prerequisites

- FastAPI control API is reachable.
- NATS / JetStream is healthy.
- Worker process is running.
- Operator has reviewed the failed operation correlation ID.

## Execution Plan

| # | Step | Typed Operation | Operation Label | Simple Label | Approval | Timeout | On Failure |
|---|---|---|---|---|---|---|---|
| 1 | Scan Current State | `drift_scan` | Run drift scan | Check what changed | no | 300s | stop |
| 2 | Create Safety Backup | `backup_now` | Backup now | Save a copy | no | 600s | stop |
| 3 | Re-run Install | `deploy_blueprint` | Deploy Workload | Install | yes | 1200s | stop |
| 4 | Verify Health | `health_check` | Refresh health snapshot | Check system health | no | 300s | continue |

## Operation Contract Evidence

| Step | NATS Subject | API Entrypoints |
|---|---|---|
| Scan Current State | pocketlab.commands.drift.scan | /api/operations/execute |
| Create Safety Backup | pocketlab.commands.operation.execute | /api/operations/execute |
| Re-run Install | pocketlab.commands.operation.execute | /api/operations/execute |
| Verify Health | pocketlab.commands.health.check | /api/health/check |

## Rollback

| Field | Value |
|---|---|
| Operation | `restore_backup` |
| Requires Approval | yes |
| Description | Restore from the safety backup if recovery leaves the environment unhealthy. |

## Evidence Requirements

- `operation_events`
- `audit_events`
- `workflow_journal`
- `backup_manifest`
- `drift_report`

## Safety

- Impact: `high`
- Notes: Must preserve typed operation boundaries, audit events, and rollback evidence.

## Scope

This page documents metadata only. Runtime execution through FastAPI, NATS / JetStream, and workers is planned for later native runbook capability steps.
