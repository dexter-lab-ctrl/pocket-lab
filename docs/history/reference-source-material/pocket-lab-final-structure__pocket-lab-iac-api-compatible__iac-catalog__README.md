# Pocket Lab IaC Catalog

## Purpose

The IaC catalog is the desired-state registry for deployable Pocket Lab platform and workload blueprints. It supports the Apps & Services/Blueprint Catalog experience in the UI while keeping deployments controlled through typed operations and GitOps state.

## Catalog rules

- Catalog entries must map to explicit operation/domain handlers.
- Deploy actions must use `deploy_blueprint` or a typed release workflow command.
- Rollback/restore actions must use explicit typed operations such as `restore_backup`.
- Catalog metadata should be safe to display in Simple Mode and Professional Mode.
- No catalog entry should require generic shell execution from the browser.

## Validation

Catalog changes should be validated with:

```bash
task check:schemas
task test:network
task test:golden
```
