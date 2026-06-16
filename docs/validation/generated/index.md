# Generated Validation Evidence

!!! note "Generated validation evidence"
    This page is generated from validation command results, repository contracts, generated documentation artifacts, and local test outputs. Update validation sources and rerun `task docs:validation:evidence`; do not manually edit generated files.

## Release Readiness

| Field | Value |
|---|---|
| State | ⚠️ WARNING |
| Generated | 2026-06-16T11:07:50Z |
| Gates | 21 |
| PASS | 20 |
| WARNING | 1 |
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
| `docs-api` OpenAPI backend contract | ✅ PASS | Contract | `task docs:api` | executed-command | `.pocketlab-dev/validation/command-results/docs-api.json`<br>`.pocketlab-dev/validation/logs/docs-api.stdout.log`<br>`.pocketlab-dev/validation/logs/docs-api.stderr.log` |
| `docs-events` NATS / JetStream AsyncAPI contract | ✅ PASS | Contract | `task docs:events` | executed-command | `.pocketlab-dev/validation/command-results/docs-events.json`<br>`.pocketlab-dev/validation/logs/docs-events.stdout.log`<br>`.pocketlab-dev/validation/logs/docs-events.stderr.log` |
| `docs-operations` Typed Operations catalog | ✅ PASS | Contract | `task docs:operations` | executed-command | `.pocketlab-dev/validation/command-results/docs-operations.json`<br>`.pocketlab-dev/validation/logs/docs-operations.stdout.log`<br>`.pocketlab-dev/validation/logs/docs-operations.stderr.log` |
| `docs-architecture` Structurizr architecture-as-code | ✅ PASS | Architecture | `task docs:architecture` | executed-command | `.pocketlab-dev/validation/command-results/docs-architecture.json`<br>`.pocketlab-dev/validation/logs/docs-architecture.stdout.log`<br>`.pocketlab-dev/validation/logs/docs-architecture.stderr.log` |
| `docs-threat-model` Threat model validation | ✅ PASS | Security | `task docs:threat-model:check` | executed-command | `.pocketlab-dev/validation/command-results/docs-threat-model.json`<br>`.pocketlab-dev/validation/logs/docs-threat-model.stdout.log`<br>`.pocketlab-dev/validation/logs/docs-threat-model.stderr.log` |
| `docs-runbooks` Runbook catalog, docs, and validation gates | ✅ PASS | Operations | `task docs:runbooks:full-check` | executed-command | `.pocketlab-dev/validation/command-results/docs-runbooks.json`<br>`.pocketlab-dev/validation/logs/docs-runbooks.stdout.log`<br>`.pocketlab-dev/validation/logs/docs-runbooks.stderr.log` |
| `mkdocs-build` MkDocs strict documentation build | ✅ PASS | Documentation | `mkdocs build --strict` | executed-command | `.pocketlab-dev/validation/command-results/mkdocs-build.json`<br>`.pocketlab-dev/validation/logs/mkdocs-build.stdout.log`<br>`.pocketlab-dev/validation/logs/mkdocs-build.stderr.log` |
| `pytest-backend` Backend pytest evidence | ✅ PASS | Test | `task test:backend` | executed-command | `.pocketlab-dev/validation/command-results/pytest-backend.json`<br>`.pocketlab-dev/validation/logs/pytest-backend.stdout.log`<br>`.pocketlab-dev/validation/logs/pytest-backend.stderr.log` |
| `pytest-performance` Performance smoke pytest evidence | ✅ PASS | Performance | `task test:performance` | executed-command | `.pocketlab-dev/validation/command-results/pytest-performance.json`<br>`.pocketlab-dev/validation/logs/pytest-performance.stdout.log`<br>`.pocketlab-dev/validation/logs/pytest-performance.stderr.log` |
| `playwright-e2e` Playwright browser E2E evidence | ✅ PASS | Test | `task test:e2e` | executed-command | `.pocketlab-dev/validation/command-results/playwright-e2e.json`<br>`.pocketlab-dev/validation/logs/playwright-e2e.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-e2e.stderr.log` |
| `playwright-visual` Playwright visual regression evidence | ✅ PASS | UI | `task test:visual` | executed-command | `.pocketlab-dev/validation/command-results/playwright-visual.json`<br>`.pocketlab-dev/validation/logs/playwright-visual.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-visual.stderr.log` |
| `playwright-a11y` Accessibility evidence | ✅ PASS | Accessibility | `task test:a11y` | executed-command | `.pocketlab-dev/validation/command-results/playwright-a11y.json`<br>`.pocketlab-dev/validation/logs/playwright-a11y.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-a11y.stderr.log` |
| `playwright-network` Frontend network contract evidence | ✅ PASS | Contract | `task test:network` | executed-command | `.pocketlab-dev/validation/command-results/playwright-network.json`<br>`.pocketlab-dev/validation/logs/playwright-network.stdout.log`<br>`.pocketlab-dev/validation/logs/playwright-network.stderr.log` |
| `lighthouse` Lighthouse PWA quality evidence | ✅ PASS | Performance | `task test:lighthouse` | executed-command | `.pocketlab-dev/validation/command-results/lighthouse.json`<br>`.pocketlab-dev/validation/logs/lighthouse.stdout.log`<br>`.pocketlab-dev/validation/logs/lighthouse.stderr.log` |
| `nats-runtime` NATS / JetStream runtime stack evidence | ✅ PASS | Runtime | `task test:nats` | executed-command | `.pocketlab-dev/validation/command-results/nats-runtime.json`<br>`.pocketlab-dev/validation/logs/nats-runtime.stdout.log`<br>`.pocketlab-dev/validation/logs/nats-runtime.stderr.log` |
| `nats-permissions` NATS subject permission evidence | ✅ PASS | Security | `task test:nats-permissions` | executed-command | `.pocketlab-dev/validation/command-results/nats-permissions.json`<br>`.pocketlab-dev/validation/logs/nats-permissions.stdout.log`<br>`.pocketlab-dev/validation/logs/nats-permissions.stderr.log` |
| `redaction` Secret redaction evidence | ✅ PASS | Security | `task test:redaction` | executed-command | `.pocketlab-dev/validation/command-results/redaction.json`<br>`.pocketlab-dev/validation/logs/redaction.stdout.log`<br>`.pocketlab-dev/validation/logs/redaction.stderr.log` |
| `faults` Fault and degraded-mode evidence | ✅ PASS | Reliability | `task test:faults` | executed-command | `.pocketlab-dev/validation/command-results/faults.json`<br>`.pocketlab-dev/validation/logs/faults.stdout.log`<br>`.pocketlab-dev/validation/logs/faults.stderr.log` |
| `flakes` Flaky-test stability evidence | ✅ PASS | Reliability | `task test:flakes` | executed-command | `.pocketlab-dev/validation/command-results/flakes.json`<br>`.pocketlab-dev/validation/logs/flakes.stdout.log`<br>`.pocketlab-dev/validation/logs/flakes.stderr.log` |
| `android-smoke` Android / Termux edge smoke evidence | ⚠️ WARNING | Platform | `task android:smoke` | missing-advisory-evidence | missing |
| `release-dry-run` Release dry-run evidence | ✅ PASS | Release | `task release:dry-run` | executed-command | `.pocketlab-dev/validation/command-results/release-dry-run.json`<br>`.pocketlab-dev/validation/logs/release-dry-run.stdout.log`<br>`.pocketlab-dev/validation/logs/release-dry-run.stderr.log` |

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
