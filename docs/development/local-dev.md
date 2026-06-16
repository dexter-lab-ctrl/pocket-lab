# Local Development

Use the Linux filesystem repository for normal development. In the validated Windows workflow, that means WSL2 Ubuntu under `/home/dj/pocket-lab`, not a Windows-mounted mirror.

## Start the stack

```bash
cd /home/dj/pocket-lab
source .venv/bin/activate
source ~/.nvm/nvm.sh
nvm use 24

task dev:up
task dev:status
```

## Edit surfaces

| Area | Paths |
| --- | --- |
| Frontend | `src/`, `public/`, `vite.config.js` |
| FastAPI / workers | `pocket-lab-final-structure/runtime/` |
| Typed operations | `operations/*.yaml` |
| Runbooks | `runbooks/*.yaml` |
| Generated docs | `scripts/docs/`, `docs/**/generated/` |
| Architecture | `architecture/structurizr/`, `docs/architecture/` |
| CI/CD | `.github/workflows/`, `scripts/docs/generate_github_workflow_docs.py` |

## Documentation workflow

```bash
task docs:api
task docs:events
task docs:operations
task docs:architecture
task docs:workflows
task docs:check
```

Generated outputs should be committed only when they are reproducible from repository sources.
