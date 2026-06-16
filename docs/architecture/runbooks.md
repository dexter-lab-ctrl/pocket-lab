# Runbooks Architecture

Runbooks orchestrate typed operations. They are not shell scripts exposed to the UI.

## Runbook model

```text
runbooks/*.yaml
→ generated metadata/docs
→ FastAPI
→ NATS commands
→ Workers
→ Typed Operations
→ Event Store
→ Audit
```

## Generated references

- [Runbook Automation](../operations/runbook-automation.md)
- [Generated Runbook Catalog](../operations/generated/runbooks/index.md)
- [Runbook Approval Matrix](../operations/generated/runbooks/approval-matrix.md)
- [Runbook Evidence Matrix](../operations/generated/runbooks/evidence-matrix.md)

## Developer rule

New runbooks should reference typed operations and policy/evidence metadata. They should not reintroduce direct UI shell execution or legacy command paths.
