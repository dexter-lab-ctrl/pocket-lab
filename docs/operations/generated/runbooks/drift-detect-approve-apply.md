# Drift Detect, Approve, and Apply

!!! note "Generated runbook page"
    This page is generated from `runbooks/drift_detect_approve_apply.yaml`. Update the runbook YAML source, not this generated page.

## Identity

| Field | Value |
|---|---|
| Runbook ID | `drift_detect_approve_apply` |
| Source | `runbooks/drift_detect_approve_apply.yaml` |
| Owner | platform-operations |
| Category | drift-management |
| Severity | `medium` |
| Approval Required | yes |
| Professional Mode | Detect, Approve, and Apply Drift Remediation |
| Simple Mode | Review and Fix Something Changed |

## Description

Guided drift remediation using preview, approval, and typed apply operations.

## Trigger Metadata

```yaml
{
  "manual": true,
  "eventHints": [
    "pocketlab.events.operation.succeeded"
  ]
}
```

## Policy and Approval

| Policy Field | Value |
|---|---|
| Minimum Role | operator |
| Evidence Required | yes |
| Approval Reason | Drift remediation changes desired or runtime state. |

## Prerequisites

- Desired state has been reviewed.
- Operator understands the proposed remediation.

## Execution Plan

| # | Step | Typed Operation | Operation Label | Simple Label | Approval | Timeout | On Failure |
|---|---|---|---|---|---|---|---|
| 1 | Scan Drift | `drift_scan` | Run drift scan | Check what changed | no | 300s | stop |
| 2 | Preview Remediation | `drift_preview` | Preview remediation | Preview fix | no | 300s | stop |
| 3 | Approve Remediation | `drift_approve` | Approve remediation | Approve fix | yes | 300s | stop |
| 4 | Apply Remediation | `drift_apply` | Apply remediation | Fix issue | yes | 900s | stop |

## Operation Contract Evidence

| Step | NATS Subject | API Entrypoints |
|---|---|---|
| Scan Drift | pocketlab.commands.drift.scan | /api/operations/execute |
| Preview Remediation | pocketlab.commands.drift.preview | /api/operations/preview, /api/operations/execute |
| Approve Remediation | pocketlab.commands.drift.approve | /api/operations/execute |
| Apply Remediation | pocketlab.commands.drift.apply | /api/operations/execute |

## Rollback

| Field | Value |
|---|---|
| Operation | `drift_ignore` |
| Requires Approval | yes |
| Description | Mark or ignore remediation only after operator review if apply is not safe. |

## Evidence Requirements

- `operation_events`
- `audit_events`
- `workflow_journal`
- `drift_report`
- `approval_record`

## Safety

- Impact: `medium`
- Notes: Preview and approval steps are required before apply.

## Scope

This page documents metadata only. Runtime execution through FastAPI, NATS / JetStream, and workers is planned for later native runbook capability steps.
