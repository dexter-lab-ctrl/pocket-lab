# Runbook Validation Gates

!!! note "Generated runbook validation report"
    This page is generated from `runbooks/*.yaml`, `operations/*.yaml`, and the generated runbook catalog. Update source metadata, not this generated page.

## Summary

| Metric | Value |
|---|---|
| Runbooks | 5 |
| Typed operation step references | 20 |
| Validation gates | 10 |
| Blocking failures | 0 |
| Warnings | 0 |
| Overall status | pass |

## Gate Results

| Gate | Title | Severity | Status | Message | Remediation |
|---|---|---|---|---|---|
| RB-GATE-001 | Runbook schema and catalog validation | blocking | pass | All runbooks satisfy the runbook metadata catalog schema and typed-operation catalog validation. | Review the generated validation report and update runbooks/*.yaml. |
| RB-GATE-002 | No direct shell or script execution in runbooks | blocking | pass | No direct shell/script execution fields were found. Runbooks preserve typed-operation-only execution semantics. | Review the generated validation report and update runbooks/*.yaml. |
| RB-GATE-003 | Approval and policy gate | blocking | pass | High-impact and approval-gated runbooks include enterprise approval metadata. | Review the generated validation report and update runbooks/*.yaml. |
| RB-GATE-004 | Evidence coverage gate | blocking | pass | All runbooks declare operation events, audit events, and workflow journal evidence. | Review the generated validation report and update runbooks/*.yaml. |
| RB-GATE-005 | Typed operation contract evidence gate | warning | pass | All runbook steps reference typed operations with API and NATS evidence metadata. | Review the generated validation report and update runbooks/*.yaml. |
| RB-GATE-006 | Timeout and bounded execution gate | warning | pass | Runbook timeout metadata is bounded within runbook validation gates guidance. | Review the generated validation report and update runbooks/*.yaml. |
| RB-GATE-007 | Simple Mode language gate | warning | pass | Simple Mode runbook labels avoid the configured technical terms. | Review the generated validation report and update runbooks/*.yaml. |
| RB-GATE-008 | Generated documentation freshness gate | blocking | pass | Generated runbook documentation is present for the current catalog. | Review the generated validation report and update runbooks/*.yaml. |
| RB-GATE-009 | Retired architecture token gate | blocking | pass | No retired architecture tokens were found in native runbook capability runbook paths. | Review the generated validation report and update runbooks/*.yaml. |
| RB-GATE-010 | Rollback and safety review gate | warning | pass | High-impact runbooks include rollback and safety metadata suitable for review. | Review the generated validation report and update runbooks/*.yaml. |

## Gate Semantics

- `blocking` gates fail CI/release readiness when their status is `fail`.
- `warning` gates do not block generation yet, but they identify enterprise-readiness improvements.
- Runbooks must orchestrate typed operations only and must not introduce direct script execution or an external automation control plane.
- Runbook validation gates verify metadata, documentation, safety, approval, and evidence readiness. Runtime execution remains worker-owned and governed by typed operations.

## Validation Commands

```bash
task docs:runbooks:gates:check
task docs:runbooks:docs:check
mkdocs build --strict
```
