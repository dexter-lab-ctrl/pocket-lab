# Windows WSL2 Ubuntu Bootstrap

This page documents WSL2 Ubuntu bootstrap capability of the Windows development environment work for Pocket Lab.

WSL2 Ubuntu bootstrap capability creates the real Pocket Lab development environment inside WSL2 Ubuntu. Windows remains the host and editor surface, while Ubuntu runs the Linux tooling, Taskfile workflows, Python virtual environment, Node dependencies, Docker CLI, documentation tooling, and validation commands.

## Target model

```text
Windows 10 host
→ WSL2 Ubuntu
→ /home/<user>/pocket-lab
→ Linux Taskfile workflows
→ Python .venv
→ Node/npm dependencies
→ Docker Desktop engine via WSL integration
→ FastAPI / NATS / Worker / React / MkDocs validation
```

The repository should live in the Linux filesystem for daily development, not under `/mnt/c` or another mounted Windows drive.

## Commands

From Windows PowerShell 7:

```powershell
task windows:wsl:bootstrap
task windows:wsl:check
```

Direct wrapper usage:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/windows/bootstrap-wsl2-ubuntu.ps1
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/windows/bootstrap-wsl2-ubuntu.ps1 -CheckOnly
```

## Ubuntu-side scripts

```text
scripts/dev/setup-wsl-ubuntu-dev.sh
scripts/dev/check-wsl-ubuntu-dev.sh
```

The setup script installs Ubuntu dependencies, Taskfile, Node.js through nvm, Python dependencies, npm packages, Playwright browser dependencies, and pulls core development container images when Docker is available.

The check script writes evidence to:

```text
/home/<user>/pocket-lab/.pocketlab-dev/reports/wsl-ubuntu-check.json
```

## Validation

After bootstrap, open Ubuntu and run:

```bash
cd ~/pocket-lab
task --version
python3 --version
node --version
npm --version
docker version
docker compose version
bash scripts/dev/check-wsl-ubuntu-dev.sh
```

Then continue with Pocket Lab validation:

```bash
task setup
npm run build
task docs:api
task docs:events
task docs:operations
task docs:architecture
task docs:runbooks:full-check
mkdocs build --strict
```

## Notes

This phase does not change Pocket Lab runtime architecture. The runtime remains React/Vite → FastAPI → NATS/JetStream → Workers → Events → FastAPI → UI.
