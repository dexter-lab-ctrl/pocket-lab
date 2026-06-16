# Pocket Lab

Pocket Lab is an edge-first, self-hostable local control-plane platform. It combines a React / Vite PWA, FastAPI control API, NATS / JetStream command and event backbone, worker-owned typed operation execution, event/audit evidence, runbook automation, and generated documentation.

## Documentation

Pocket Lab includes a GitHub-hostable MkDocs documentation site covering:

- Product overview and Simple / Professional / Enterprise experience modes.
- Getting started, Day 0 bootstrap, and PWA UI installation.
- Runtime architecture, Structurizr architecture-as-code, typed operations, workers, runbooks, and approvals.
- FastAPI OpenAPI, NATS / JetStream AsyncAPI, generated operation catalog, runbook catalog, security policy docs, observability docs, deployment docs, validation evidence, and CI/CD workflow docs.

Published documentation URL:

```text
TODO: Replace this with the GitHub Pages URL shown after the first successful "Publish MkDocs documentation site" workflow run.
```

Local documentation commands:

```bash
task docs:check
mkdocs build --strict
mkdocs serve -a 127.0.0.1:8001
```

Regenerate GitHub Actions workflow documentation after changing `.github/workflows/*.yml`:

```bash
task docs:workflows
```

## Runtime boundary

Pocket Lab preserves this runtime flow:

```text
React / Vite PWA
→ FastAPI Control API
→ NATS / JetStream
→ Workers
→ Events
→ FastAPI
→ UI
```

The frontend does not execute shell commands, does not talk directly to NATS, and does not call observability tools directly. FastAPI remains the frontend-facing control API, and workers own execution and resume.
