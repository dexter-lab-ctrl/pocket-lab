# Validation / Release Gate Matrix

!!! note "Generated Tier 8 readiness matrix"
    This page is generated from validation evidence. Update the source gate definitions or run validation commands; do not manually maintain this matrix.

## Current Release Readiness

| Metric | Value |
|---|---|
| State | ⚠️ WARNING |
| Generated | 2026-06-14T19:32:50Z |
| Source fingerprint | `e0a45b1f1700a8f5` |
| Passed checks | 13 |
| Warnings | 8 |
| Failed checks | 0 |
| Blocked checks | 0 |

## Validation Matrix

| Gate | Status | Category | Owner | Release Requirement | Command | Evidence |
|---|---|---|---|---|---|---|
| `docs-api` OpenAPI backend contract | ⚠️ WARNING | Contract | Backend | Required | `task docs:api` | `contracts/generated/openapi.json`<br>`contracts/openapi.json` |
| `docs-events` NATS / JetStream AsyncAPI contract | ⚠️ WARNING | Contract | Runtime | Required | `task docs:events` | `contracts/asyncapi/pocketlab-nats-jetstream.yaml`<br>`docs/runtime/generated/nats-jetstream-asyncapi/index.html` |
| `docs-operations` Typed Operations catalog | ⚠️ WARNING | Contract | Runtime | Required | `task docs:operations` | `contracts/operations/pocketlab-typed-operations.json`<br>`docs/runtime/generated/typed-operations-catalog/index.html` |
| `docs-architecture` Structurizr architecture-as-code | ⚠️ WARNING | Architecture | Architecture | Required | `task docs:architecture` | `architecture/structurizr/workspace.dsl`<br>`docs/architecture/structurizr-architecture.md` |
| `docs-threat-model` Threat model validation | ⚠️ WARNING | Security | Security | Required | `task docs:threat-model:check` | `threat-model/pocketlab-threat-model.yaml`<br>`threat-model/pocketlab-threat-model-drift-manifest.json`<br>`threat-model/pocketlab-threat-model-sync-manifest.json`<br>`docs/security/security-architecture-threat-model.md` |
| `docs-runbooks` Runbook catalog, docs, and validation gates | ⚠️ WARNING | Operations | Operations | Required | `task docs:runbooks:full-check` | `docs/operations/generated/runbooks/runbook-catalog.json`<br>`docs/operations/generated/runbooks/runbook-validation-gates.json`<br>`docs/operations/generated/runbooks/validation-gates.md` |
| `mkdocs-build` MkDocs strict documentation build | ⚠️ WARNING | Documentation | Docs | Required | `mkdocs build --strict` | `site/index.html` |
| `pytest-backend` Backend pytest evidence | ✅ PASS | Test | Backend | Required | `task test:backend` | `.pocketlab-dev/validation/command-results/pytest-backend.json`<br>`.pocketlab-dev/validation/logs/pytest-backend.stdout.log`<br>`.pocketlab-dev/validation/logs/pytest-backend.stderr.log` |
| `pytest-performance` Performance smoke pytest evidence | ✅ PASS | Performance | Platform | Required | `task test:performance` | `.pocketlab-dev/validation/command-results/pytest-performance.json`<br>`.pocketlab-dev/validation/logs/pytest-performance.stdout.log`<br>`.pocketlab-dev/validation/logs/pytest-performance.stderr.log` |
| `playwright-e2e` Playwright browser E2E evidence | ✅ PASS | Test | Frontend | Required | `task test:e2e` | `.pocketlab-dev/validation/command-results/playwright-e2e.json`<br>`.pocketlab-dev/validation/logs/playwright-e2e.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-e2e.stderr.log` |
| `playwright-visual` Playwright visual regression evidence | ✅ PASS | UI | Frontend | Required | `task test:visual` | `.pocketlab-dev/validation/command-results/playwright-visual.json`<br>`.pocketlab-dev/validation/logs/playwright-visual.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-visual.stderr.log` |
| `playwright-a11y` Accessibility evidence | ✅ PASS | Accessibility | Frontend | Required | `task test:a11y` | `.pocketlab-dev/validation/command-results/playwright-a11y.json`<br>`.pocketlab-dev/validation/logs/playwright-a11y.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-a11y.stderr.log` |
| `playwright-network` Frontend network contract evidence | ✅ PASS | Contract | Frontend | Required | `task test:network` | `.pocketlab-dev/validation/command-results/playwright-network.json`<br>`.pocketlab-dev/validation/logs/playwright-network.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-network.stderr.log` |
| `lighthouse` Lighthouse PWA quality evidence | ✅ PASS | Performance | Frontend | Required | `task test:lighthouse` | `.pocketlab-dev/validation/command-results/lighthouse.json`<br>`.pocketlab-dev/validation/logs/lighthouse.stdout.log`<br>`.pocketlab-dev/validation/logs/lighthouse.stderr.log` |
| `nats-runtime` NATS / JetStream runtime stack evidence | ✅ PASS | Runtime | Runtime | Required | `timeout --kill-after=15s 180s task test:nats` | `.pocketlab-dev/validation/command-results/nats-runtime.json`<br>`.pocketlab-dev/validation/logs/nats-runtime.stdout.log`<br>`.pocketlab-dev/validation/logs/nats-runtime.stderr.log` |
| `nats-permissions` NATS subject permission evidence | ✅ PASS | Security | Runtime | Required | `timeout --kill-after=15s 180s task test:nats-permissions` | `.pocketlab-dev/validation/command-results/nats-permissions.json`<br>`.pocketlab-dev/validation/logs/nats-permissions.stdout.log`<br>`.pocketlab-dev/validation/logs/nats-permissions.stderr.log` |
| `redaction` Secret redaction evidence | ✅ PASS | Security | Security | Required | `timeout --kill-after=15s 180s task test:redaction` | `.pocketlab-dev/validation/command-results/redaction.json`<br>`.pocketlab-dev/validation/logs/redaction.stdout.log`<br>`.pocketlab-dev/validation/logs/redaction.stderr.log` |
| `faults` Fault and degraded-mode evidence | ✅ PASS | Reliability | Platform | Required | `bash scripts/dev/run-validation-gate.sh 300 env POCKETLAB_FAULTS_WORKERS=1 task test:faults` | `.pocketlab-dev/validation/command-results/faults.json`<br>`.pocketlab-dev/validation/logs/faults.stdout.log`<br>`.pocketlab-dev/validation/logs/faults.stderr.log` |
| `flakes` Flaky-test stability evidence | ✅ PASS | Reliability | QA | Required | `bash scripts/dev/run-validation-gate.sh 300 env POCKETLAB_FLAKES_WORKERS=1 POCKETLAB_FLAKES_REPEAT=1 task test:flakes` | `.pocketlab-dev/validation/command-results/flakes.json`<br>`.pocketlab-dev/validation/logs/flakes.stdout.log`<br>`.pocketlab-dev/validation/logs/flakes.stderr.log` |
| `android-smoke` Android / Termux edge smoke evidence | ⚠️ WARNING | Platform | Platform | Required before edge release | `task android:smoke` | missing |
| `release-dry-run` Release dry-run evidence | ✅ PASS | Release | Release Engineering | Required before tag/release | `timeout --kill-after=30s 900s task release:dry-run` | `.pocketlab-dev/validation/command-results/release-dry-run.json`<br>`.pocketlab-dev/validation/logs/release-dry-run.stdout.log`<br>`.pocketlab-dev/validation/logs/release-dry-run.stderr.log` |

## Release Blockers

No release blockers recorded.


## Advisory Warnings

| Gate | Evidence State | Summary |
|---|---|---|
| docs-api | repository-artifact | Repository artifact exists, but no recorded command outcome was found. Use the validation recorder for release-grade evidence. |
| docs-events | repository-artifact | Repository artifact exists, but no recorded command outcome was found. Use the validation recorder for release-grade evidence. |
| docs-operations | repository-artifact | Repository artifact exists, but no recorded command outcome was found. Use the validation recorder for release-grade evidence. |
| docs-architecture | repository-artifact | Repository artifact exists, but no recorded command outcome was found. Use the validation recorder for release-grade evidence. |
| docs-threat-model | repository-artifact | Repository artifact exists, but no recorded command outcome was found. Use the validation recorder for release-grade evidence. |
| docs-runbooks | repository-artifact | Repository artifact exists, but no recorded command outcome was found. Use the validation recorder for release-grade evidence. |
| mkdocs-build | repository-artifact | Repository artifact exists, but no recorded command outcome was found. Use the validation recorder for release-grade evidence. |
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
