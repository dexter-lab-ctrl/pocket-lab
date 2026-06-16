# Testing

Pocket Lab testing covers backend contracts, frontend behavior, browser flows, NATS / JetStream runtime behavior, generated documentation, runbooks, security, deployment, observability, and release readiness.

## High-signal commands

```bash
task test:backend
npm run build
task test:e2e
task test:visual
task test:a11y
task test:network
task test:nats
task docs:check
mkdocs build --strict
```

## Documentation validation

```bash
task docs:api
task docs:events
task docs:operations
task docs:architecture
task docs:runbooks:full-check
task docs:security:full-check
task docs:deployment:full-check
task docs:observability:full-check
task docs:validation:evidence
task docs:validation:check
task docs:workflows
mkdocs build --strict
```

## Freshness rule

When a generator changes, update both the generator and the generated output, then run a freshness check or `git diff --exit-code` in CI.
