<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:deployment`. -->

# Bootstrap Scripts Reference

This generated page documents repository-native bootstrap, validation, runtime, and Windows/WSL helper scripts.

| Script | Kind | Platform | Summary | Environment variables | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| scripts/dev/android-termux-smoke.sh | ubuntu_shell | Android / Termux / ARM64 | !/usr/bin/env bash | — | fb9ce38bfaf1 |
| scripts/dev/check-api-contract.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | 0228393659f1 |
| scripts/dev/check-architecture-contract.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | a208ffe9d3cf |
| scripts/dev/check-backend.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | fc6ebf99e914 |
| scripts/dev/check-bootstrap.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | efb2e41629e7 |
| scripts/dev/check-faults.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | POCKETLAB_FAULTS_WORKERS | 679704a773f2 |
| scripts/dev/check-frontend.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | 5157e7949d0b |
| scripts/dev/check-iac.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | ANSIBLE_COLLECTIONS_PATH, ANSIBLE_CONFIG, ANSIBLE_LOCAL_TEMP, ANSIBLE_REMOTE_TEMP, ANSIBLE_ROLES_PATH, POCKETLAB_ACTIVE_CODE_SCAN_EXCLUDES | 446068eef2cc |
| scripts/dev/check-lighthouse.sh | ubuntu_shell | Windows WSL2 Ubuntu | !/usr/bin/env bash | CHROME_PATH, LHCI_CHROME_PATH, POCKETLAB_LIGHTHOUSE_CHROME_FLAGS, POCKETLAB_LIGHTHOUSE_CHROME_PATH, POCKETLAB_LIGHTHOUSE_WSL_CHROME_FIX | dcfb0f49d4ec |
| scripts/dev/check-nats-permissions.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | e7e5cc8a1712 |
| scripts/dev/check-schemas.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | 4f34a088371d |
| scripts/dev/check-supply-chain.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | acfc86e9ce7a |
| scripts/dev/check-wsl-docker-desktop.sh | ubuntu_shell | Windows WSL2 Ubuntu | !/usr/bin/env bash | NATS_CONTAINER, NATS_HEALTH_URL, NATS_SERVICE, POCKETLAB_DOCKER_CHECK_CLEANUP, POCKETLAB_DOCKER_COMPOSE_FILE, POCKETLAB_NATS_COMPOSE_SERVICE, POCKETLAB_NATS_CONTAINER_NAME, POCKETLAB_NATS_HEALTH_URL, +1 more | fcd240e7f2db |
| scripts/dev/check-wsl-filesystem-standard.sh | ubuntu_shell | Windows WSL2 Ubuntu | !/usr/bin/env bash | POCKETLAB_WSL_FILESYSTEM_REPORT_PATH, POCKETLAB_WSL_REPO_PATH | 7c77e880892e |
| scripts/dev/check-wsl-ubuntu-dev.sh | ubuntu_shell | Windows WSL2 Ubuntu | !/usr/bin/env bash | POCKETLAB_NODE_MAJOR, POCKETLAB_WSL_CHECK_REPORT_PATH, POCKETLAB_WSL_REPO_PATH | 2edd31933b04 |
| scripts/dev/day0-dry-run.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | 66c8c3f73aa4 |
| scripts/dev/day0-static-check.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | 0a20d3e5c619 |
| scripts/dev/day0-termux-smoke.sh | ubuntu_shell | Android / Termux / ARM64 | !/usr/bin/env bash | — | 42565de57128 |
| scripts/dev/down.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | a2bc32f6ed6b |
| scripts/dev/export-openapi.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | f8cd81098401 |
| scripts/dev/fault-inject.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | da12103510af |
| scripts/dev/implement-documentation-placement.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | 4b0f35e572f1 |
| scripts/dev/install-playwright-browser.sh | ubuntu_shell | Windows WSL2 Ubuntu | !/usr/bin/env bash | POCKETLAB_PLAYWRIGHT_CHANNEL, POCKETLAB_PLAYWRIGHT_REPORT_PATH | 708aff02237d |
| scripts/dev/logs.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | 7d115a63c433 |
| scripts/dev/observability-snapshot.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | POCKETLAB_API_URL | 49bd9d28a053 |
| scripts/dev/organize-mkdocs-docs.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | b20fbef199c4 |
| scripts/dev/populate-pocketlab-docs.py | python_script | Android / Termux / ARM64 | !/usr/bin/env python3 | POCKETLAB_AUTH_TOKEN, POCKETLAB_LOG_LEVEL, POCKETLAB_NATS_REQUIRED, POCKETLAB_NATS_REQUIRE_JETSTREAM, POCKETLAB_NATS_URL, POCKETLAB_RELEASE_CHANNEL, POCKETLAB_STATE_DIR, POCKETLAB_WRITE_TOKEN | ced45318770d |
| scripts/dev/prepare-docs-consolidation-commit.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | 62a407bd413d |
| scripts/dev/release-dry-run.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | POCKETLAB_RELEASE_DRY_RUN_ACTIVE_SCOPE_EXCLUDES | fe6ae412440a |
| scripts/dev/report-flakes.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | POCKETLAB_FLAKES_REPEAT, POCKETLAB_FLAKES_WORKERS, POCKETLAB_FLAKE_ROUNDS, POCKETLAB_FLAKE_WORKERS | 024f714f0f0e |
| scripts/dev/reset-state.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | b3b552392f2b |
| scripts/dev/run-e2e.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | POCKETLAB_E2E_WORKERS | 2c553f7b19d0 |
| scripts/dev/run-fastapi-dev.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | POCKETLAB_NATS_REQUIRED, POCKETLAB_NATS_REQUIRE_JETSTREAM, POCKETLAB_NATS_URL, POCKETLAB_STATE_DIR | 13ed0ee21f28 |
| scripts/dev/run-nats-dev.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | 215debfce777 |
| scripts/dev/run-playwright.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | 897eeabc3a6b |
| scripts/dev/run-validation-gate.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | 3ef189cbf7e2 |
| scripts/dev/run-worker-dev.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | POCKETLAB_NATS_REQUIRED, POCKETLAB_NATS_REQUIRE_JETSTREAM, POCKETLAB_NATS_URL, POCKETLAB_STATE_DIR | d07f1bb12598 |
| scripts/dev/setup-threat-dragon.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | POCKETLAB_THREAT_DRAGON_DIR, POCKETLAB_THREAT_MODEL_DIR | 5708e4f89858 |
| scripts/dev/setup-wsl-ubuntu-dev.sh | ubuntu_shell | Windows WSL2 Ubuntu | !/usr/bin/env bash | POCKETLAB_NODE_MAJOR, POCKETLAB_TASK_VERSION, POCKETLAB_WSL_REPORT_PATH, POCKETLAB_WSL_REPO_PATH, POCKETLAB_WSL_SKIP_REPO_SYNC, POCKETLAB_WSL_SOURCE_ROOT | 4532205fa8cb |
| scripts/dev/status.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | POCKETLAB_API_URL | d9591a93b1ee |
| scripts/dev/sync-wsl-to-windows.sh | ubuntu_shell | Windows WSL2 Ubuntu | !/usr/bin/env bash | POCKETLAB_WINDOWS_REPO, POCKETLAB_WSL_REPO | 7d1c975022ab |
| scripts/dev/test-nats-stack.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | POCKETLAB_API_URL, POCKETLAB_NATS_REQUIRED, POCKETLAB_NATS_REQUIRE_JETSTREAM, POCKETLAB_NATS_URL, POCKETLAB_STATE_DIR, POCKETLAB_TEST_NATS_CURL_CONNECT_TIMEOUT, POCKETLAB_TEST_NATS_CURL_MAX_TIME, POCKETLAB_TEST_NATS_OPERATION_SETTLE_SECONDS, +2 more | 0d5f583b8d4a |
| scripts/dev/trace-operation.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | POCKETLAB_API_URL | 5721d248320c |
| scripts/dev/up.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | b51c1a636f90 |
| scripts/dev/wait-http.sh | ubuntu_shell | Ubuntu / WSL2 / Linux / Termux where compatible | !/usr/bin/env bash | — | 2572f60cf011 |
| scripts/windows/bootstrap-wsl2-ubuntu.ps1 | windows_powershell | Windows WSL2 Ubuntu | bootstrap-wsl2-ubuntu.ps1 | POCKETLAB_WSL_CHECK_ONLY, POCKETLAB_WSL_DISTRO, POCKETLAB_WSL_REPO_PATH, POCKETLAB_WSL_SKIP_REPO_SYNC, POCKETLAB_WSL_SOURCE_ROOT | 854e082ea793 |
| scripts/windows/check-wsl2-host.ps1 | windows_powershell | Windows WSL2 Ubuntu | Windows host version | POCKETLAB_WSL_DISTRO | 827d0dfdf370 |
| scripts/windows/configure-vscode.ps1 | windows_powershell | Windows WSL2 Ubuntu | Attempt Remote WSL extension install for extensions that must execute in the Linux workspace. | POCKETLAB_ENV, POCKETLAB_NATS_REQUIRED, POCKETLAB_NATS_REQUIRE_JETSTREAM, POCKETLAB_NATS_URL, POCKETLAB_STATE_DIR, POCKETLAB_WSL_DISTRO | ff5ea1f63628 |


## Notes

- Windows PowerShell scripts are host-side orchestration only.
- Ubuntu/WSL2 shell scripts validate and operate the Linux development/runtime environment.
- Android / Termux scripts are documented only when source evidence exists.
- Deployment scripts must not bypass FastAPI → NATS / JetStream → Worker execution for app operations.
