# Enterprise Mode

Enterprise Mode is the strict governance posture for teams that need human authorization, role-aware review, and audit evidence.

It is opt-in. Personal Mode remains the friendly default for public GitHub and self-hosted installations.

## Enterprise governance behavior

| Capability | Enterprise expectation |
| --- | --- |
| Governed runbooks | Pause at approval-required states. |
| Approval decisions | Require an approve or reject action with role and reason metadata. |
| Resume behavior | Workers resume only approved executions and do not replay completed steps. |
| Rejection behavior | Rejection stops execution and records failure/audit evidence. |
| Audit trail | Approval, rejection, auto-approval where applicable, and execution events remain visible. |
| Policy evidence | Policy-to-operation and runbook-to-policy mapping remains documented. |

## Relationship to Simple and Professional modes

Simple and Professional modes change presentation. Enterprise Mode changes governance strictness.

A user can have a friendly Simple Mode interface while the deployment uses Personal governance, or a Professional interface while Enterprise governance is enabled for stricter approval flows.
