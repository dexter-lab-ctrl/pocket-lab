# Rotate Secret with Audit Evidence

!!! note "Generated runbook page"
    This page is generated from `runbooks/rotate_secret_with_audit.yaml`. Update the runbook YAML source, not this generated page.

## Identity

| Field | Value |
|---|---|
| Runbook ID | `rotate_secret_with_audit` |
| Source | `runbooks/rotate_secret_with_audit.yaml` |
| Owner | security-operations |
| Category | security |
| Severity | `critical` |
| Approval Required | yes |
| Professional Mode | Rotate Secret with Audit Evidence |
| Simple Mode | Change Password Safely |

## Description

Rotate a managed secret with policy approval, audit evidence, and post-change verification.

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
| Minimum Role | security_reviewer |
| Evidence Required | yes |
| Approval Reason | Secret rotation changes sensitive access material. |

## Prerequisites

- Secret owner has approved the rotation window.
- Dependent services are identified.
- Audit destination is reachable.

## Execution Plan

| # | Step | Typed Operation | Operation Label | Simple Label | Approval | Timeout | On Failure |
|---|---|---|---|---|---|---|---|
| 1 | Pre-rotation Health Check | `health_check` | Refresh health snapshot | Check system health | no | 300s | stop |
| 2 | Rotate Secret | `rotate_secret` | Rotate Secret | Change Password | yes | 600s | stop |
| 3 | Verify Secret Access | `secret_read_dynamic` | Read dynamic secret | Get temporary password | no | 300s | stop |
| 4 | Post-rotation Health Check | `health_check` | Refresh health snapshot | Check system health | no | 300s | continue |

## Operation Contract Evidence

| Step | NATS Subject | API Entrypoints |
|---|---|---|
| Pre-rotation Health Check | pocketlab.commands.health.check | /api/health/check |
| Rotate Secret | pocketlab.commands.vault.rotate | /api/operations/execute |
| Verify Secret Access | pocketlab.commands.vault.dynamic_secret | /api/operations/execute |
| Post-rotation Health Check | pocketlab.commands.health.check | /api/health/check |

## Rollback

| Field | Value |
|---|---|
| Operation | `rotate_secret` |
| Requires Approval | yes |
| Description | Rotate again or restore the prior credential according to the approved recovery path. |

## Evidence Requirements

- `operation_events`
- `audit_events`
- `workflow_journal`
- `policy_decision`
- `redaction_check`

## Safety

- Impact: `critical`
- Notes: Secret values must never be written to runbook logs, audit events, docs, or DLQ payloads.

## Tier 7B Scope

This page documents metadata only. Runtime execution through FastAPI, NATS / JetStream, and workers is planned for later Tier 7 phases.
