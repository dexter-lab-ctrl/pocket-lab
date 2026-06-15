# Validation / Release Gate Matrix

!!! note "Generated validation readiness matrix"
    This page is generated from validation evidence. Update the source gate definitions or run validation commands; do not manually maintain this matrix.

## Current Release Readiness

| Metric | Value |
|---|---|
| State | ⚠️ WARNING |
| Generated | 2026-06-15T17:02:58Z |
| Source fingerprint | `077d27a15fbd95f4` |
| Passed checks | 20 |
| Warnings | 1 |
| Failed checks | 0 |
| Blocked checks | 0 |

## Validation Matrix

| Gate | Status | Category | Owner | Release Requirement | Command | Evidence |
|---|---|---|---|---|---|---|
| `docs-api` OpenAPI backend contract | ✅ PASS | Contract | Backend | Required | `task docs:api` | `.pocketlab-dev/validation/command-results/docs-api.json`<br>`.pocketlab-dev/validation/logs/docs-api.stdout.log`<br>`.pocketlab-dev/validation/logs/docs-api.stderr.log` |
| `docs-events` NATS / JetStream AsyncAPI contract | ✅ PASS | Contract | Runtime | Required | `task docs:events` | `.pocketlab-dev/validation/command-results/docs-events.json`<br>`.pocketlab-dev/validation/logs/docs-events.stdout.log`<br>`.pocketlab-dev/validation/logs/docs-events.stderr.log` |
| `docs-operations` Typed Operations catalog | ✅ PASS | Contract | Runtime | Required | `task docs:operations` | `.pocketlab-dev/validation/command-results/docs-operations.json`<br>`.pocketlab-dev/validation/logs/docs-operations.stdout.log`<br>`.pocketlab-dev/validation/logs/docs-operations.stderr.log` |
| `docs-architecture` Structurizr architecture-as-code | ✅ PASS | Architecture | Architecture | Required | `task docs:architecture` | `.pocketlab-dev/validation/command-results/docs-architecture.json`<br>`.pocketlab-dev/validation/logs/docs-architecture.stdout.log`<br>`.pocketlab-dev/validation/logs/docs-architecture.stderr.log` |
| `docs-threat-model` Threat model validation | ✅ PASS | Security | Security | Required | `task docs:threat-model:check` | `.pocketlab-dev/validation/command-results/docs-threat-model.json`<br>`.pocketlab-dev/validation/logs/docs-threat-model.stdout.log`<br>`.pocketlab-dev/validation/logs/docs-threat-model.stderr.log` |
| `docs-runbooks` Runbook catalog, docs, and validation gates | ✅ PASS | Operations | Operations | Required | `task docs:runbooks:full-check` | `.pocketlab-dev/validation/command-results/docs-runbooks.json`<br>`.pocketlab-dev/validation/logs/docs-runbooks.stdout.log`<br>`.pocketlab-dev/validation/logs/docs-runbooks.stderr.log` |
| `mkdocs-build` MkDocs strict documentation build | ✅ PASS | Documentation | Docs | Required | `mkdocs build --strict` | `.pocketlab-dev/validation/command-results/mkdocs-build.json`<br>`.pocketlab-dev/validation/logs/mkdocs-build.stdout.log`<br>`.pocketlab-dev/validation/logs/mkdocs-build.stderr.log` |
| `pytest-backend` Backend pytest evidence | ✅ PASS | Test | Backend | Required | `task test:backend` | `.pocketlab-dev/validation/command-results/pytest-backend.json`<br>`.pocketlab-dev/validation/logs/pytest-backend.stdout.log`<br>`.pocketlab-dev/validation/logs/pytest-backend.stderr.log` |
| `pytest-performance` Performance smoke pytest evidence | ✅ PASS | Performance | Platform | Required | `task test:performance` | `.pocketlab-dev/validation/command-results/pytest-performance.json`<br>`.pocketlab-dev/validation/logs/pytest-performance.stdout.log`<br>`.pocketlab-dev/validation/logs/pytest-performance.stderr.log` |
| `playwright-e2e` Playwright browser E2E evidence | ✅ PASS | Test | Frontend | Required | `task test:e2e` | `.pocketlab-dev/validation/command-results/playwright-e2e.json`<br>`.pocketlab-dev/validation/logs/playwright-e2e.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-e2e.stderr.log` |
| `playwright-visual` Playwright visual regression evidence | ✅ PASS | UI | Frontend | Required | `task test:visual` | `.pocketlab-dev/validation/command-results/playwright-visual.json`<br>`.pocketlab-dev/validation/logs/playwright-visual.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-visual.stderr.log` |
| `playwright-a11y` Accessibility evidence | ✅ PASS | Accessibility | Frontend | Required | `task test:a11y` | `.pocketlab-dev/validation/command-results/playwright-a11y.json`<br>`.pocketlab-dev/validation/logs/playwright-a11y.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-a11y.stderr.log` |
| `playwright-network` Frontend network contract evidence | ✅ PASS | Contract | Frontend | Required | `task test:network` | `.pocketlab-dev/validation/command-results/playwright-network.json`<br>`.pocketlab-dev/validation/logs/playwright-network.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-network.stderr.log` |
| `lighthouse` Lighthouse PWA quality evidence | ✅ PASS | Performance | Frontend | Required | `task test:lighthouse` | `.pocketlab-dev/validation/command-results/lighthouse.json`<br>`.pocketlab-dev/validation/logs/lighthouse.stdout.log`<br>`.pocketlab-dev/validation/logs/lighthouse.stderr.log` |
| `nats-runtime` NATS / JetStream runtime stack evidence | ✅ PASS | Runtime | Runtime | Required | `task test:nats` | `.pocketlab-dev/validation/command-results/nats-runtime.json`<br>`.pocketlab-dev/validation/logs/nats-runtime.stdout.log`<br>`.pocketlab-dev/validation/logs/nats-runtime.stderr.log` |
| `nats-permissions` NATS subject permission evidence | ✅ PASS | Security | Runtime | Required | `task test:nats-permissions` | `.pocketlab-dev/validation/command-results/nats-permissions.json`<br>`.pocketlab-dev/validation/logs/nats-permissions.stdout.log`<br>`.pocketlab-dev/validation/logs/nats-permissions.stderr.log` |
| `redaction` Secret redaction evidence | ✅ PASS | Security | Security | Required | `task test:redaction` | `.pocketlab-dev/validation/command-results/redaction.json`<br>`.pocketlab-dev/validation/logs/redaction.stdout.log`<br>`.pocketlab-dev/validation/logs/redaction.stderr.log` |
| `faults` Fault and degraded-mode evidence | ✅ PASS | Reliability | Platform | Required | `task test:faults` | `.pocketlab-dev/validation/command-results/faults.json`<br>`.pocketlab-dev/validation/logs/faults.stdout.log`<br>`.pocketlab-dev/validation/logs/faults.stderr.log` |
| `flakes` Flaky-test stability evidence | ✅ PASS | Reliability | QA | Required | `task test:flakes` | `.pocketlab-dev/validation/command-results/flakes.json`<br>`.pocketlab-dev/validation/logs/flakes.stdout.log`<br>`.pocketlab-dev/validation/logs/flakes.stderr.log` |
| `android-smoke` Android / Termux edge smoke evidence | ⚠️ WARNING | Platform | Platform | Required before edge release | `task android:smoke` | missing |
| `release-dry-run` Release dry-run evidence | ✅ PASS | Release | Release Engineering | Required before tag/release | `task release:dry-run` | `.pocketlab-dev/validation/command-results/release-dry-run.json`<br>`.pocketlab-dev/validation/logs/release-dry-run.stdout.log`<br>`.pocketlab-dev/validation/logs/release-dry-run.stderr.log` |

## Release Blockers

No release blockers recorded.


## Advisory Warnings

| Gate | Evidence State | Summary |
|---|---|---|
| android-smoke | missing-advisory-evidence | No machine-readable advisory evidence found. This does not block the default release readiness calculation. |

## Machine-Readable Evidence

- [Generated validation evidence](generated/index.md)
- [`validation-manifest.json`](generated/validation-manifest.json)
- [`validation-evidence.json`](generated/validation-evidence.json)
- [`release-readiness.json`](generated/release-readiness.json)
- [`validation-evidence-bundle.json`](generated/validation-evidence-bundle.json)
- [`allure-results/`](generated/allure-results/)

## Decision Rule

| State | Meaning |
|---|---|
| PASS | All blocking gates have recorded pass evidence and there are no advisory warnings. |
| WARNING | No blocking failures exist, but advisory warnings or missing advisory evidence remain. |
| FAIL | At least one blocking gate has recorded failure evidence. |
| BLOCKED | At least one blocking gate is missing release-grade machine-readable execution evidence. |

## Maintenance Rule

Validation docs are generated from actual command results where available, plus machine-readable repository artifacts. Before a release, run the release validation gates through `scripts/docs/record_validation_result.py` so the matrix reflects execution evidence instead of artifact presence alone.
