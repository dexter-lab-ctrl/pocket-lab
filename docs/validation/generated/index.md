# Generated Validation Evidence

!!! note "Generated Tier 8 validation evidence"
    This page is generated from validation command results, repository contracts, generated documentation artifacts, and local test outputs. Update validation sources and rerun `task docs:validation:evidence`; do not manually edit generated files.

## Release Readiness

| Field | Value |
|---|---|
| State | ⚠️ WARNING |
| Generated | 2026-06-14T19:32:50Z |
| Gates | 21 |
| PASS | 13 |
| WARNING | 8 |
| FAIL | 0 |
| BLOCKED | 0 |

## Machine-Readable Evidence

- [`validation-manifest.json`](validation-manifest.json)
- [`validation-evidence.json`](validation-evidence.json)
- [`release-readiness.json`](release-readiness.json)
- [`validation-evidence-bundle.json`](validation-evidence-bundle.json)
- [`allure-results/`](allure-results/)
- [`allure-history/`](allure-history/)

## Gate Evidence

| Gate | Status | Category | Command | Evidence state | Evidence |
|---|---|---|---|---|---|
| `docs-api` OpenAPI backend contract | ⚠️ WARNING | Contract | `task docs:api` | repository-artifact | `contracts/generated/openapi.json`<br>`contracts/openapi.json` |
| `docs-events` NATS / JetStream AsyncAPI contract | ⚠️ WARNING | Contract | `task docs:events` | repository-artifact | `contracts/asyncapi/pocketlab-nats-jetstream.yaml`<br>`docs/runtime/generated/nats-jetstream-asyncapi/index.html` |
| `docs-operations` Typed Operations catalog | ⚠️ WARNING | Contract | `task docs:operations` | repository-artifact | `contracts/operations/pocketlab-typed-operations.json`<br>`docs/runtime/generated/typed-operations-catalog/index.html` |
| `docs-architecture` Structurizr architecture-as-code | ⚠️ WARNING | Architecture | `task docs:architecture` | repository-artifact | `architecture/structurizr/workspace.dsl`<br>`docs/architecture/structurizr-architecture.md` |
| `docs-threat-model` Threat model validation | ⚠️ WARNING | Security | `task docs:threat-model:check` | repository-artifact | `threat-model/pocketlab-threat-model.yaml`<br>`threat-model/pocketlab-threat-model-drift-manifest.json`<br>`threat-model/pocketlab-threat-model-sync-manifest.json`<br>`docs/security/security-architecture-threat-model.md` |
| `docs-runbooks` Runbook catalog, docs, and validation gates | ⚠️ WARNING | Operations | `task docs:runbooks:full-check` | repository-artifact | `docs/operations/generated/runbooks/runbook-catalog.json`<br>`docs/operations/generated/runbooks/runbook-validation-gates.json`<br>`docs/operations/generated/runbooks/validation-gates.md` |
| `mkdocs-build` MkDocs strict documentation build | ⚠️ WARNING | Documentation | `mkdocs build --strict` | repository-artifact | `site/index.html` |
| `pytest-backend` Backend pytest evidence | ✅ PASS | Test | `task test:backend` | executed-command | `.pocketlab-dev/validation/command-results/pytest-backend.json`<br>`.pocketlab-dev/validation/logs/pytest-backend.stdout.log`<br>`.pocketlab-dev/validation/logs/pytest-backend.stderr.log` |
| `pytest-performance` Performance smoke pytest evidence | ✅ PASS | Performance | `task test:performance` | executed-command | `.pocketlab-dev/validation/command-results/pytest-performance.json`<br>`.pocketlab-dev/validation/logs/pytest-performance.stdout.log`<br>`.pocketlab-dev/validation/logs/pytest-performance.stderr.log` |
| `playwright-e2e` Playwright browser E2E evidence | ✅ PASS | Test | `task test:e2e` | executed-command | `.pocketlab-dev/validation/command-results/playwright-e2e.json`<br>`.pocketlab-dev/validation/logs/playwright-e2e.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-e2e.stderr.log` |
| `playwright-visual` Playwright visual regression evidence | ✅ PASS | UI | `task test:visual` | executed-command | `.pocketlab-dev/validation/command-results/playwright-visual.json`<br>`.pocketlab-dev/validation/logs/playwright-visual.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-visual.stderr.log` |
| `playwright-a11y` Accessibility evidence | ✅ PASS | Accessibility | `task test:a11y` | executed-command | `.pocketlab-dev/validation/command-results/playwright-a11y.json`<br>`.pocketlab-dev/validation/logs/playwright-a11y.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-a11y.stderr.log` |
| `playwright-network` Frontend network contract evidence | ✅ PASS | Contract | `task test:network` | executed-command | `.pocketlab-dev/validation/command-results/playwright-network.json`<br>`.pocketlab-dev/validation/logs/playwright-network.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-network.stderr.log` |
| `lighthouse` Lighthouse PWA quality evidence | ✅ PASS | Performance | `task test:lighthouse` | executed-command | `.pocketlab-dev/validation/command-results/lighthouse.json`<br>`.pocketlab-dev/validation/logs/lighthouse.stdout.log`<br>`.pocketlab-dev/validation/logs/lighthouse.stderr.log` |
| `nats-runtime` NATS / JetStream runtime stack evidence | ✅ PASS | Runtime | `timeout --kill-after=15s 180s task test:nats` | executed-command | `.pocketlab-dev/validation/command-results/nats-runtime.json`<br>`.pocketlab-dev/validation/logs/nats-runtime.stdout.log`<br>`.pocketlab-dev/validation/logs/nats-runtime.stderr.log` |
| `nats-permissions` NATS subject permission evidence | ✅ PASS | Security | `timeout --kill-after=15s 180s task test:nats-permissions` | executed-command | `.pocketlab-dev/validation/command-results/nats-permissions.json`<br>`.pocketlab-dev/validation/logs/nats-permissions.stdout.log`<br>`.pocketlab-dev/validation/logs/nats-permissions.stderr.log` |
| `redaction` Secret redaction evidence | ✅ PASS | Security | `timeout --kill-after=15s 180s task test:redaction` | executed-command | `.pocketlab-dev/validation/command-results/redaction.json`<br>`.pocketlab-dev/validation/logs/redaction.stdout.log`<br>`.pocketlab-dev/validation/logs/redaction.stderr.log` |
| `faults` Fault and degraded-mode evidence | ✅ PASS | Reliability | `bash scripts/dev/run-validation-gate.sh 300 env POCKETLAB_FAULTS_WORKERS=1 task test:faults` | executed-command | `.pocketlab-dev/validation/command-results/faults.json`<br>`.pocketlab-dev/validation/logs/faults.stdout.log`<br>`.pocketlab-dev/validation/logs/faults.stderr.log` |
| `flakes` Flaky-test stability evidence | ✅ PASS | Reliability | `bash scripts/dev/run-validation-gate.sh 300 env POCKETLAB_FLAKES_WORKERS=1 POCKETLAB_FLAKES_REPEAT=1 task test:flakes` | executed-command | `.pocketlab-dev/validation/command-results/flakes.json`<br>`.pocketlab-dev/validation/logs/flakes.stdout.log`<br>`.pocketlab-dev/validation/logs/flakes.stderr.log` |
| `android-smoke` Android / Termux edge smoke evidence | ⚠️ WARNING | Platform | `task android:smoke` | missing-advisory-evidence | missing |
| `release-dry-run` Release dry-run evidence | ✅ PASS | Release | `timeout --kill-after=30s 900s task release:dry-run` | executed-command | `.pocketlab-dev/validation/command-results/release-dry-run.json`<br>`.pocketlab-dev/validation/logs/release-dry-run.stdout.log`<br>`.pocketlab-dev/validation/logs/release-dry-run.stderr.log` |

## Release Blockers

No release blockers recorded.


## Documentation Flow

```text
Validation Tools
→ Generated Results
→ Allure result files
→ Generated Evidence
→ MkDocs
→ Release Readiness
```
