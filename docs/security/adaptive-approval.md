# Adaptive Approval

Adaptive approval keeps self-hosted Pocket Lab usable while preserving strict governance for organizations.

## Model

| Mode | Expected behavior |
| --- | --- |
| Personal | Safe eligible runbooks may auto-approve and continue with audit evidence. |
| Enterprise | Governed runbooks pause until approved or rejected by a human role. |

## References

- [Adaptive Approval Policies and Enterprise Mode](../runtime/adaptive-approval-enterprise-mode.md)
- [Runbook Approval and Resume Lifecycle](../runtime/runbook-approval-lifecycle.md)
- [Runbook Approval Matrix](../operations/generated/runbooks/approval-matrix.md)

Adaptive approval is not a shortcut around worker execution. Workers still own resume and execution.
