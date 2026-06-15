# Runbook Automation

Tier 7B provides enterprise-grade generated runbook documentation from the native Pocket Lab runbook catalog. This remains metadata and documentation only; runtime execution is intentionally deferred to later Tier 7 phases.

## Architecture

```text
runbooks/*.yaml
  -> runbook catalog generator
  -> generated runbook documentation
  -> generated operation map
  -> generated approval matrix
  -> generated evidence matrix
  -> later FastAPI runbook API
  -> later NATS / JetStream runbook commands
  -> later runbook worker
  -> typed operations
  -> operation events, audit evidence, and DLQ paths
```

## Enterprise Design Rules

- Runbooks orchestrate typed operations only.
- Runbooks do not execute shell commands.
- The frontend must not talk directly to NATS.
- FastAPI remains the control API.
- NATS / JetStream remains the command and event backbone.
- Workers remain the execution boundary.
- Approval, evidence, rollback, and safety metadata are required.
- Generated runbook docs must be reproducible from `runbooks/*.yaml`.

## Generated Documentation

- [Generated Runbook Catalog](generated/runbooks/)
- [Runbook Operation Map](generated/runbooks/operation-map.md)
- [Runbook Approval Matrix](generated/runbooks/approval-matrix.md)
- [Runbook Evidence Matrix](generated/runbooks/evidence-matrix.md)
- [Simple Mode Runbook Guide](generated/runbooks/simple-mode.md)

## Current Scope

| Capability | Tier | Status |
|---|---|---|
| Runbook metadata catalog | 7A | Implemented |
| Generated runbook documentation | 7B | Implemented |
| Runbook validation gates | 7C | Planned |
| FastAPI / NATS runbook execution | 7D | Planned |
| Runbook audit and DLQ events | 7E | Planned |

## Validation

```bash
task docs:runbooks:docs:check
task docs:runbooks
mkdocs build --strict
```
