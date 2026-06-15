# Pocket Lab Documentation Placement Plan

## Objective

The archive currently contains architecture and status documents in multiple locations: repository root, `pocket-lab-final-structure`, `runtime/api_fastapi`, bootstrap scripts, IaC folders, and frontend mocks. This creates duplicate content and increases the chance of stale architecture claims.

The recommended model is to keep canonical long-form documentation under repository-level `docs/`, split by environment:

```text
Pocket-Lab/
  README.md
  docs/
    README.md
    dev/
      README.md
      dev-environment-and-validation.md
      frontend-ui-quality-gates.md
      contracts-schemas-and-mocks.md
      local-runtime-runbook.md
    prod/
      README.md
      production-architecture.md
      runtime-nats-workflow-engine.md
      deployment-bootstrap-and-iac.md
      security-hardening-and-secrets.md
      release-workflow-and-readiness.md
    DOCUMENTATION_PLACEMENT_PLAN.md
    DOC_MIGRATION_MAP.md
```

## Why repository-level `docs/`

Repository-level `docs/` should become the canonical documentation root because it is environment-neutral, visible to contributors, easy to reference from CI/release workflows, and avoids burying production runbooks under generated or nested structure folders.

## What should remain outside `docs/`

Keep only short, component-local README files where they help a developer navigate a folder quickly:

| Existing location | Recommended future content |
|---|---|
| `README.md` | Short product overview and links to `docs/dev` and `docs/prod` |
| `src/mocks/README.md` | Short MSW fixture usage note linking to `docs/dev/contracts-schemas-and-mocks.md` |
| `pocket-lab-final-structure/runtime/api_fastapi/README.md` | Short FastAPI entry point linking to prod runtime docs |
| `pocket-lab-final-structure/pocket-lab-iac-api-compatible/README.md` | Short IaC entry point linking to prod IaC docs |
| `pocket-lab-final-structure/pocket-lab-bootstrap-production-scripts-patched/README.md` | Short bootstrap entry point linking to prod bootstrap docs |

## Documents to retire or replace with links

The previous root-level reports should be replaced by links to consolidated docs:

- `ENTERPRISE_NATS_HARDENING_REPORT.md`
- `IAC_ARCHITECTURE_SYNC_REPORT.md`
- `LEGACY_INTENT_REMOVAL_REPORT.md`
- `PYTHON_API_RETIREMENT_REPORT.md`
- `SANITIZATION_REPORT.md`
- `SECOND_PASS_FASTAPI_NATS_ONLY_REPORT.md`
- `UI_UX_ARCHITECTURE_SYNC_REPORT.md`

These are useful historically, but the consolidated docs should be the active source of truth.

## Environment split

### Dev documentation

Use `docs/dev/` for local development and validation:

- Taskfile-driven dev stack
- Vite proxy and PWA dev behavior
- Playwright/Storybook/visual regression gates
- API contract and schema checks
- MSW fixtures and deterministic mocks
- Debugging NATS, WebSocket, frontend mount, and UI tests

### Prod documentation

Use `docs/prod/` for production and release-candidate operation:

- FastAPI + NATS/JetStream architecture
- Durable worker execution and workflow event sourcing
- Day-0 bootstrap and idempotency
- IaC roles, inventory, and deployment topology
- Caddy proxying of REST/WebSocket traffic
- Vault/OpenBao-style secret handling patterns
- Release workflow and production readiness gates

## Migration approach

1. Add this consolidated `docs/` structure at repository root.
2. Replace duplicate long-form report files with short pointers to the relevant canonical docs.
3. Keep component-local READMEs short and operational.
4. Update `Taskfile.yml`, CI, and release notes to reference the consolidated docs.
5. Treat `docs/prod/release-workflow-and-readiness.md` as the production release gate source of truth.
