# Windows WSL2 Host Preflight

This page documents **Windows host preflight capability** of the Windows 10 development environment plan for Pocket Lab.

Windows host preflight capability does **not** install Pocket Lab dependencies inside Ubuntu. It verifies that the Windows host can safely support the later WSL2 Ubuntu development environment.

## Objective

The goal is to confirm that a Windows 10 workstation is ready to host the recommended Pocket Lab workflow:

```text
Windows 10 Host
→ WSL2
→ Ubuntu distro
→ Pocket Lab repository under /home/<user>/pocket-lab
→ existing Ubuntu Taskfile workflows
→ Docker Desktop container engine
```

This preserves the current Pocket Lab runtime architecture:

```text
React / Vite PWA
→ FastAPI Control API
→ NATS / JetStream
→ Workers
→ Events
→ FastAPI
→ UI
```

## What the preflight checks

The host preflight validates required items:

| Check | Required | Purpose |
| --- | --- | --- |
| Windows version | Yes | Confirms the host is Windows 10 or newer. |
| PowerShell 7 | Yes | Ensures the preflight runs with the supported shell. |
| WSL command | Yes | Confirms WSL is installed and responding. |
| WSL optional features | Yes | Checks Windows Subsystem for Linux and Virtual Machine Platform where possible. |
| Ubuntu WSL distro | Yes | Confirms Ubuntu is installed and running as WSL version 2. |
| Git for Windows | Yes | Confirms Windows-side Git is available for host workflows. |
| Docker CLI | Yes | Confirms Docker Desktop CLI is available on Windows. |
| Docker Desktop engine | Yes | Confirms Docker Desktop is running. |
| Docker Compose plugin | Yes | Confirms `docker compose` is available. |
| Docker Desktop WSL integration | Yes | Confirms Docker is reachable from the Ubuntu distro. |
| Ubuntu kernel access | Yes | Confirms the selected Ubuntu distro can execute Linux commands. |

It also reports optional recommendations:

| Check | Required | Purpose |
| --- | --- | --- |
| Visual Studio Code | No | Recommended editor for Remote - WSL development. |
| VS Code Remote - WSL extension | No | Recommended for editing/debugging inside Ubuntu. |
| Windows Terminal | No | Recommended terminal for WSL and PowerShell workflows. |

## Run the preflight

From the Pocket Lab repository root on Windows:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/windows/check-wsl2-host.ps1
```

If your Ubuntu distro has a versioned name, pass it explicitly:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/windows/check-wsl2-host.ps1 -ExpectedDistro Ubuntu-22.04
```

If Taskfile is available on Windows, you can also run:

```powershell
task windows:host:preflight
```

## Generated evidence

The script writes a JSON report to:

```text
.pocketlab-dev/reports/windows-host-preflight.json
```

This report is useful for enterprise onboarding evidence and troubleshooting.

## Expected successful result

A successful run ends with:

```text
Windows host preflight passed. This host is ready for the WSL2 Ubuntu bootstrap capability.
```

The JSON report should contain:

```json
{
  "schema": "pocketlab.windowsHostPreflight/v1",
  "overall_status": "PASS",
  "required_failures": 0
}
```

## Common fixes

### Ubuntu exists but is WSL version 1

Convert it to WSL2:

```powershell
wsl --set-version Ubuntu 2
```

For a versioned distro:

```powershell
wsl --set-version Ubuntu-22.04 2
```

### Docker works on Windows but not inside Ubuntu

Enable Docker Desktop WSL integration:

```text
Docker Desktop
→ Settings
→ Resources
→ WSL Integration
→ Enable integration with your Ubuntu distro
→ Apply & Restart
```

Then re-run the preflight.

### VS Code Remote - WSL is missing

Install the extension from VS Code or run:

```powershell
code --install-extension ms-vscode-remote.remote-wsl
```

## What Windows host preflight capability does not do

Windows host preflight capability intentionally does not:

```text
Install Ubuntu packages
Install Taskfile inside Ubuntu
Install Python dependencies inside Ubuntu
Install Node dependencies inside Ubuntu
Install Playwright dependencies inside Ubuntu
Clone or move the Pocket Lab repository
Start the Pocket Lab runtime stack
Run docs, tests, runbooks, Structurizr or Threat Dragon
```

Those belong to WSL2 Ubuntu bootstrap capability and later WSL2 Ubuntu bootstrap steps.
