<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:deployment`. -->

# Environment Variables Reference

This generated page documents environment variables and runtime/dependency files discovered from deployment scripts and repository templates.

## Environment variables found in scripts

| Variable | Referenced by |
| --- | --- |
| ANSIBLE_COLLECTIONS_PATH | scripts/dev/check-iac.sh |
| ANSIBLE_CONFIG | scripts/dev/check-iac.sh |
| ANSIBLE_LOCAL_TEMP | scripts/dev/check-iac.sh |
| ANSIBLE_REMOTE_TEMP | scripts/dev/check-iac.sh |
| ANSIBLE_ROLES_PATH | scripts/dev/check-iac.sh |
| CHROME_PATH | scripts/dev/check-lighthouse.sh |
| LHCI_CHROME_PATH | scripts/dev/check-lighthouse.sh |
| NATS_CONTAINER | scripts/dev/check-wsl-docker-desktop.sh |
| NATS_HEALTH_URL | scripts/dev/check-wsl-docker-desktop.sh |
| NATS_SERVICE | scripts/dev/check-wsl-docker-desktop.sh |
| POCKETLAB_ACTIVE_CODE_SCAN_EXCLUDES | scripts/dev/check-iac.sh |
| POCKETLAB_API_URL | scripts/dev/observability-snapshot.sh, scripts/dev/status.sh, scripts/dev/test-nats-stack.sh, scripts/dev/trace-operation.sh |
| POCKETLAB_AUTH_TOKEN | scripts/dev/populate-pocketlab-docs.py |
| POCKETLAB_DOCKER_CHECK_CLEANUP | scripts/dev/check-wsl-docker-desktop.sh |
| POCKETLAB_DOCKER_COMPOSE_FILE | scripts/dev/check-wsl-docker-desktop.sh |
| POCKETLAB_E2E_WORKERS | scripts/dev/run-e2e.sh |
| POCKETLAB_ENV | scripts/windows/configure-vscode.ps1 |
| POCKETLAB_FAULTS_WORKERS | scripts/dev/check-faults.sh |
| POCKETLAB_FLAKES_REPEAT | scripts/dev/report-flakes.sh |
| POCKETLAB_FLAKES_WORKERS | scripts/dev/report-flakes.sh |
| POCKETLAB_FLAKE_ROUNDS | scripts/dev/report-flakes.sh |
| POCKETLAB_FLAKE_WORKERS | scripts/dev/report-flakes.sh |
| POCKETLAB_LIGHTHOUSE_CHROME_FLAGS | scripts/dev/check-lighthouse.sh |
| POCKETLAB_LIGHTHOUSE_CHROME_PATH | scripts/dev/check-lighthouse.sh |
| POCKETLAB_LIGHTHOUSE_WSL_CHROME_FIX | scripts/dev/check-lighthouse.sh |
| POCKETLAB_LOG_LEVEL | scripts/dev/populate-pocketlab-docs.py |
| POCKETLAB_NATS_COMPOSE_SERVICE | scripts/dev/check-wsl-docker-desktop.sh |
| POCKETLAB_NATS_CONTAINER_NAME | scripts/dev/check-wsl-docker-desktop.sh |
| POCKETLAB_NATS_HEALTH_URL | scripts/dev/check-wsl-docker-desktop.sh |
| POCKETLAB_NATS_REQUIRED | scripts/dev/populate-pocketlab-docs.py, scripts/dev/run-fastapi-dev.sh, scripts/dev/run-worker-dev.sh, scripts/dev/test-nats-stack.sh, scripts/windows/configure-vscode.ps1 |
| POCKETLAB_NATS_REQUIRE_JETSTREAM | scripts/dev/populate-pocketlab-docs.py, scripts/dev/run-fastapi-dev.sh, scripts/dev/run-worker-dev.sh, scripts/dev/test-nats-stack.sh, scripts/windows/configure-vscode.ps1 |
| POCKETLAB_NATS_URL | scripts/dev/populate-pocketlab-docs.py, scripts/dev/run-fastapi-dev.sh, scripts/dev/run-worker-dev.sh, scripts/dev/test-nats-stack.sh, scripts/windows/configure-vscode.ps1 |
| POCKETLAB_NODE_MAJOR | scripts/dev/check-wsl-ubuntu-dev.sh, scripts/dev/setup-wsl-ubuntu-dev.sh |
| POCKETLAB_PLAYWRIGHT_CHANNEL | scripts/dev/install-playwright-browser.sh |
| POCKETLAB_PLAYWRIGHT_REPORT_PATH | scripts/dev/install-playwright-browser.sh |
| POCKETLAB_RELEASE_CHANNEL | scripts/dev/populate-pocketlab-docs.py |
| POCKETLAB_RELEASE_DRY_RUN_ACTIVE_SCOPE_EXCLUDES | scripts/dev/release-dry-run.sh |
| POCKETLAB_STATE_DIR | scripts/dev/populate-pocketlab-docs.py, scripts/dev/run-fastapi-dev.sh, scripts/dev/run-worker-dev.sh, scripts/dev/test-nats-stack.sh, scripts/windows/configure-vscode.ps1 |
| POCKETLAB_TASK_VERSION | scripts/dev/setup-wsl-ubuntu-dev.sh |
| POCKETLAB_TEST_NATS_CURL_CONNECT_TIMEOUT | scripts/dev/test-nats-stack.sh |
| POCKETLAB_TEST_NATS_CURL_MAX_TIME | scripts/dev/test-nats-stack.sh |
| POCKETLAB_TEST_NATS_OPERATION_SETTLE_SECONDS | scripts/dev/test-nats-stack.sh |
| POCKETLAB_TEST_NATS_OPERATION_SUBMIT_TIMEOUT | scripts/dev/test-nats-stack.sh |
| POCKETLAB_TEST_NATS_SUBMIT_OPERATION | scripts/dev/test-nats-stack.sh |
| POCKETLAB_THREAT_DRAGON_DIR | scripts/dev/setup-threat-dragon.sh |
| POCKETLAB_THREAT_MODEL_DIR | scripts/dev/setup-threat-dragon.sh |
| POCKETLAB_WINDOWS_REPO | scripts/dev/sync-wsl-to-windows.sh |
| POCKETLAB_WRITE_TOKEN | scripts/dev/populate-pocketlab-docs.py |
| POCKETLAB_WSL_CHECK_ONLY | scripts/windows/bootstrap-wsl2-ubuntu.ps1 |
| POCKETLAB_WSL_CHECK_REPORT_PATH | scripts/dev/check-wsl-ubuntu-dev.sh |
| POCKETLAB_WSL_DISTRO | scripts/windows/bootstrap-wsl2-ubuntu.ps1, scripts/windows/check-wsl2-host.ps1, scripts/windows/configure-vscode.ps1 |
| POCKETLAB_WSL_DOCKER_REPORT_PATH | scripts/dev/check-wsl-docker-desktop.sh |
| POCKETLAB_WSL_FILESYSTEM_REPORT_PATH | scripts/dev/check-wsl-filesystem-standard.sh |
| POCKETLAB_WSL_REPO | scripts/dev/sync-wsl-to-windows.sh |
| POCKETLAB_WSL_REPORT_PATH | scripts/dev/setup-wsl-ubuntu-dev.sh |
| POCKETLAB_WSL_REPO_PATH | scripts/dev/check-wsl-filesystem-standard.sh, scripts/dev/check-wsl-ubuntu-dev.sh, scripts/dev/setup-wsl-ubuntu-dev.sh, scripts/windows/bootstrap-wsl2-ubuntu.ps1 |
| POCKETLAB_WSL_SKIP_REPO_SYNC | scripts/dev/setup-wsl-ubuntu-dev.sh, scripts/windows/bootstrap-wsl2-ubuntu.ps1 |
| POCKETLAB_WSL_SOURCE_ROOT | scripts/dev/setup-wsl-ubuntu-dev.sh, scripts/windows/bootstrap-wsl2-ubuntu.ps1 |


## Environment and runtime files

| File | Kind | SHA-256 |
| --- | --- | --- |
| docker-compose.dev.yml | environment_or_runtime_template | 792311cafdc4 |
| package.json | environment_or_runtime_template | b9b27604350f |
| requirements-dev.txt | environment_or_runtime_template | f1b3046c9091 |
| requirements-docs.txt | environment_or_runtime_template | cc8b3b3ae0fe |


## Deployment-related Taskfile targets

| Task | Description |
| --- | --- |
| android:smoke | Run Android/Termux Day 0 smoke helper over SSH |
| check | Run all local quality gates |
| check:api-contract | Export FastAPI OpenAPI and verify frontend API calls |
| check:bootstrap |  |
| check:contracts |  |
| check:iac |  |
| check:schemas | Validate fixtures and event payloads against JSON schemas |
| check:supply-chain |  |
| default | List available Pocket Lab development tasks |
| dev:backend | Start FastAPI locally |
| dev:down | Stop deterministic local stack |
| dev:frontend | Start Vite PWA locally |
| dev:frontend:mock | Start Vite frontend with MSW mock API scenarios enabled |
| dev:logs | Tail local dev stack logs |
| dev:nats | Start local NATS/JetStream |
| dev:nats:down |  |
| dev:observe | Generate local observability HTML snapshot |
| dev:reset | Reset local dev state, logs and pid files |
| dev:status | Show FastAPI/NATS/worker/frontend status |
| dev:storybook | Start Storybook for Pocket Lab UI components |
| dev:up | Start deterministic local stack: NATS, FastAPI, worker, frontend |
| dev:worker | Start Pocket Lab worker locally |
| docs:architecture:serve | Serve Structurizr architecture workspace locally with Docker |
| docs:check | Generate and validate Pocket Lab documentation |
| docs:deployment | Generate Tier 11 deployment documentation from repository-native deployment sources |
| docs:deployment:ansible | Generate Tier 11 Ansible playbook and role/task deployment reference docs |
| docs:deployment:ansible:check | Validate Tier 11 Ansible deployment docs and evidence freshness |
| docs:deployment:check | Validate Tier 11 generated deployment documentation freshness |
| docs:deployment:evidence | Generate Tier 11 deployment evidence manifest from Ansible, bootstrap, platform, Taskfile, and environment sources |
| docs:deployment:evidence:check | Validate Tier 11 deployment evidence manifest fingerprints and source integrity |
| docs:deployment:full-check | Run all Tier 11 deployment documentation generation and freshness checks |
| docs:deployment:platform | Generate Tier 11 platform, bootstrap, environment, and runtime blueprint docs |
| docs:deployment:platform:check | Validate Tier 11 platform deployment docs and MkDocs navigation coverage |
| docs:validation:full-check | Run Tier 8 validation evidence checks and enforce release readiness from recorded evidence |
| docs:validation:release-gates | Record high-signal release validation gates for Tier 8 evidence |
| fault:bad-health |  |
| fault:nats-down |  |
| fault:worker-down |  |
| release:dry-run | Build release artifacts locally without publishing |
| setup | Install Python/npm dependencies |
| test:backend | Backend compile, FastAPI tests and runtime tests |
| test:bootstrap | Day 0 bootstrap static and dry-run validation |
| test:e2e | Playwright browser E2E tests with screenshots/videos/traces |
| test:faults | Enterprise fault injection and degraded-mode gate |
| test:flakes | Enterprise flaky-test gate: quarantine scan plus repeated high-signal Playwright stability runs |
| test:frontend | React/Vite PWA lint, typecheck, unit test and production build |
| test:golden | Run the Pocket Lab golden-path release-candidate E2E flow |
| test:iac | Ansible/IaC validation and drift simulation |
| test:lighthouse | Lighthouse CI PWA quality gate |
| test:nats | Start NATS, FastAPI, worker, submit typed operation, validate events/journal |
| test:nats-permissions | Simulate NATS subject permission model for API, worker and agent |
| test:performance | Performance and reliability smoke tests |
| threatdragon:logs | Tail local OWASP Threat Dragon container logs |
| threatdragon:pull | Pull the pinned OWASP Threat Dragon container image |
| threatdragon:serve | Run OWASP Threat Dragon locally on http://localhost:8082 |
| threatdragon:stop | Stop local OWASP Threat Dragon container |
| trace:operation | Submit and trace a typed operation with correlation IDs |
| windows:host:check | Alias for Windows WSL2 host preflight |
| windows:host:preflight | Validate Windows 10 host readiness for WSL2 Ubuntu Pocket Lab development |
| windows:vscode:check | Write and validate Pocket Lab VS Code workspace files without installing extensions |
| windows:vscode:configure | Configure VS Code for Pocket Lab Windows + WSL2 development |
| windows:vscode:configure:optional | Configure VS Code for Pocket Lab with optional productivity extensions |
| windows:wsl:bootstrap | Bootstrap Ubuntu WSL2 developer environment for Pocket Lab |
| windows:wsl:check | Validate Ubuntu WSL2 Pocket Lab developer environment |
