# Quick Start

This quick start is for a developer or operator running Pocket Lab locally from the repository.

## Start the local development stack

```bash
cd /home/dj/pocket-lab
source .venv/bin/activate
source ~/.nvm/nvm.sh
nvm use 24

task dev:up
task dev:status
```

Expected local endpoints:

| Service | URL |
| --- | --- |
| React / Vite PWA | `http://127.0.0.1:5173` |
| FastAPI control API | `http://127.0.0.1:8000` |
| NATS monitor | `http://127.0.0.1:8222` |
| MkDocs local site | `http://127.0.0.1:8001` |

## Validate the documentation portal

```bash
task docs:check
mkdocs build --strict
mkdocs serve -a 127.0.0.1:8001
```

## Validate the runtime shape

```bash
task docs:api
task docs:events
task docs:operations
task docs:architecture
task docs:runbooks:full-check
```

## Stop the stack

```bash
task dev:down
```

## Important boundary

The UI should always call FastAPI. FastAPI publishes commands to NATS / JetStream. Workers execute typed operations and emit lifecycle events. Do not introduce a frontend shortcut around that model.
