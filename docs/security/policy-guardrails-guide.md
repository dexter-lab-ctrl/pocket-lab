<!-- GENERATED FILE - DO NOT EDIT. Run task docs:security:policies. -->

# Policy Guardrails Guide

This page is generated from Pocket Lab policy metadata, operation metadata, runbook metadata, runtime approval/governance services, and existing security documentation sources.

## Source Status

- Formal `.rego` bundle discovered: **No — using repository-native policy metadata plus embedded guardrail evidence.**
- Policy metadata bundles: **1**
- Policies documented: **4**
- Controls documented: **5**
- Operations inspected: **19**
- Runbooks inspected: **5**

## Runtime Guardrail Boundary

Pocket Lab policy documentation does not change runtime behavior. User actions continue to flow through React / Vite PWA → FastAPI Control API → NATS / JetStream → Workers → Events → FastAPI → UI.

Runbooks orchestrate typed operations. Policies document the governance expectations around those typed operations, approvals, and audit events; they do not authorize frontend shell execution or frontend NATS access.

## Mode Semantics

| Mode | Meaning |
| --- | --- |
| Enterprise Mode | Opt-in strict governance. Human approval, role checks, and approval/rejection reasons are required for governed runbooks. |
| Personal Mode | Default self-hosted mode. Eligible safe and dry-run governed runbooks may auto-approve with audit evidence. |
| Professional Mode | Shows operation, policy, and audit terminology for power users and maintainers. |
| Simple Mode | Uses friendly wording for non-technical users while preserving the same governed execution path. |

## Guardrail Summary

| Policy | Severity | Mode | Simple wording |
| --- | --- | --- | --- |
| Adaptive Runbook Approval | high | decision | Lets safe home-lab actions continue automatically, while Enterprise Mode requires a person to approve important changes. |
| Hardcoded Secrets Prevention | high | enforceable | Keeps passwords and tokens out of app setup files. |
| Privileged Port Restriction | critical | enforceable | Keeps apps from using restricted phone ports that would fail on Android. |
| PRoot Isolation Enforcement | medium | audit | Keeps advanced Linux commands inside the safe Linux container area on Android. |

## Policy Decision Evidence

Policy decision evidence is expected in generated operation/runbook documentation, event contracts, and audit subjects. Personal Mode auto-approval remains audit logged. Enterprise Mode requires strict human authorization and reason capture for governed runbooks.

See also:

- [OPA Policy Reference](generated/policy-reference.md)
- [Operation-to-policy Mapping](generated/policy-operation-map.md)
- [Compliance Controls Reference](generated/compliance-controls-reference.md)
- [Security Architecture & Threat Model](security-architecture-threat-model.md)
