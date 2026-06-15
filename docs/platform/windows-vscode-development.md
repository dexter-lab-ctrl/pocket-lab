# Windows VS Code Development Configuration

This page documents the Pocket Lab Windows host script that prepares Visual Studio Code for the WSL2 Ubuntu development workflow.

This is still a Windows host preflight capability. It prepares the editor and debugging experience, but it does not install Ubuntu packages or bootstrap the Pocket Lab runtime inside Ubuntu. Ubuntu-side package installation belongs to the WSL2 Ubuntu bootstrap capability.

## Purpose

The VS Code configuration step prepares a Windows workstation for daily Pocket Lab development by adding:

- VS Code extension recommendations.
- Windows-side extension installation when the `code` CLI is available.
- Remote WSL extension installation when the Ubuntu `code` helper is available.
- Workspace settings for Python, pytest, ESLint, YAML, Playwright, Markdown, and Linux line endings.
- VS Code tasks for common Pocket Lab development, validation, and documentation checks.
- VS Code debug launch profiles for FastAPI, the worker, and the frontend browser.
- A JSON configuration report for onboarding evidence.

## Script

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/windows/configure-vscode.ps1
```

If your Ubuntu distro has a versioned name:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/windows/configure-vscode.ps1 -ExpectedDistro Ubuntu-22.04
```

To include optional productivity extensions:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/windows/configure-vscode.ps1 -IncludeOptionalExtensions
```

To write workspace configuration without installing extensions:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/windows/configure-vscode.ps1 -SkipExtensionInstall
```

## Taskfile commands

```bash
task windows:vscode:configure
task windows:vscode:configure:optional
task windows:vscode:check
```

The `windows:vscode:check` task writes configuration files and generates a JSON report without installing extensions.

## Generated workspace files

```text
.vscode/extensions.json
.vscode/settings.json
.vscode/tasks.json
.vscode/launch.json
```

These files are intentionally repository-local so Windows + WSL2 developers get the same development, test, documentation, and debugging entrypoints.

## Evidence report

The script writes:

```text
.pocketlab-dev/reports/vscode-configuration.json
```

This report records which VS Code extensions and workspace files were configured.

## Required extension groups

Windows host extensions:

```text
ms-vscode-remote.remote-wsl
ms-vscode-remote.remote-containers
ms-vscode.powershell
```

Workspace development extensions:

```text
ms-python.python
ms-python.vscode-pylance
ms-python.black-formatter
charliermarsh.ruff
dbaeumer.vscode-eslint
esbenp.prettier-vscode
ms-playwright.playwright
redhat.vscode-yaml
redhat.ansible
timonwong.shellcheck
ms-azuretools.vscode-docker
github.vscode-github-actions
bierner.markdown-mermaid
yzhang.markdown-all-in-one
```

Optional productivity extensions:

```text
eamodio.gitlens
DavidAnson.vscode-markdownlint
streetsidesoftware.code-spell-checker
```

## Debug profiles

The generated `.vscode/launch.json` adds:

```text
Pocket Lab: FastAPI
Pocket Lab: Worker
Pocket Lab: Frontend in browser
Pocket Lab: API + Worker
```

The FastAPI and worker profiles preserve Pocket Lab's architecture by using the existing FastAPI control API, NATS / JetStream, and worker process. They do not introduce frontend direct shell execution or frontend direct NATS access.

## Validation

Run from Windows PowerShell 7:

```powershell
task windows:host:preflight
task windows:vscode:configure
```

Then open the repository in WSL2 Ubuntu:

```powershell
wsl -d Ubuntu -- bash -lc "cd ~/pocket-lab && code ."
```

Inside the Remote WSL VS Code window, validate the normal Pocket Lab workflow:

```bash
task dev:up
task dev:status
npm run build
task docs:api
task docs:events
task docs:operations
task docs:architecture
task docs:runbooks:full-check
mkdocs build --strict
```

## Notes

If Remote WSL extension installation is reported as deferred, open the repository once through Remote WSL and rerun the configuration script. VS Code installs its WSL helper only after the Remote WSL workflow has been initialized.
