<!-- GENERATED FILE - DO NOT EDIT. Run task docs:security:policies. -->

# Compliance Controls Reference

This generated reference maps Pocket Lab policy guardrails to repository evidence sources for security review, auditability, and release readiness.

| Control | Family | Description | Evidence |
| --- | --- | --- | --- |
| `PL-CTRL-001` Typed Operation Execution Boundary | Runtime Governance | User-facing actions must resolve to typed operations executed through FastAPI, NATS / JetStream, and workers. | `contracts/operations/pocketlab-typed-operations.json`<br>`operations/*.yaml`<br>`contracts/asyncapi/pocketlab-nats-jetstream.yaml` |
| `PL-CTRL-002` Worker-Owned Execution and Resume | Runbook Governance | Runbooks orchestrate typed operations and workers own execution, approval handling, rejection, and resume. | `runbooks/*.yaml`<br>`docs/operations/generated/runbooks/runbook-catalog.json`<br>`docs/runtime/runbook-approval-lifecycle.md` |
| `PL-CTRL-003` Adaptive Approval Evidence | Approval Governance | Personal Mode auto-approval and Enterprise Mode human approval must produce explicit audit evidence. | `pocket-lab-final-structure/runtime/api_fastapi/services/approval_policy.py`<br>`pocket-lab-final-structure/runtime/api_fastapi/services/governance_settings.py`<br>`contracts/asyncapi/pocketlab-nats-jetstream.yaml` |
| `PL-CTRL-004` Policy Guardrail Visibility | Security Posture | OPA-style guardrails and policy decisions must be documented and visible in the Security documentation portal. | `src/tabs/PolicyGuardrailsTab.jsx`<br>`docs/security/policy-guardrails-guide.md`<br>`docs/security/generated/policy-reference.md` |
| `PL-CTRL-005` Threat and Policy Source Freshness | Documentation Governance | Security documentation must be regenerated from repository sources and checked for stale generated artifacts. | `docs/security/generated/policy-evidence-manifest.json`<br>`scripts/docs/check_policy_evidence.py`<br>`scripts/docs/check_policy_docs.py` |

## Source Fingerprints

The policy evidence manifest records SHA-256 fingerprints for source files used by this generator. Use `task docs:security:policies:check` or `task docs:security:full-check` to detect stale generated output.
