# Security Overview

Pocket Lab security documentation is generated and maintained from repository-native sources: threat model metadata, policy guardrail metadata, typed operations, runbooks, generated evidence, and architecture-as-code.

## Security references

- [Security Architecture & Threat Model](security-architecture-threat-model.md)
- [Adaptive Approval](adaptive-approval.md)
- [Audit Evidence](audit-evidence.md)
- [Policy Guardrails Guide](policy-guardrails-guide.md)
- [OPA Policy Reference](generated/policy-reference.md)
- [Operation-to-policy Mapping](generated/policy-operation-map.md)
- [Compliance Controls Reference](generated/compliance-controls-reference.md)

## Security boundary

The frontend is not a privileged execution surface. Security controls rely on FastAPI validation, NATS / JetStream command/event boundaries, worker-owned execution, typed operations, policy metadata, and audit evidence.
