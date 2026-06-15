# Enterprise NATS Hardening Report

This archive updates Pocket Lab from FastAPI/NATS-first with local execution fallback to a production fail-closed FastAPI + NATS/JetStream control-plane model.

## Runtime changes

- `runtime/api_fastapi/services/nats_bus.py`
  - NATS is required by default: `POCKETLAB_NATS_REQUIRED=1`.
  - JetStream is required by default: `POCKETLAB_NATS_REQUIRE_JETSTREAM=1`.
  - Added NATS username/password/token authentication support.
  - Added optional TLS/mTLS client support through `POCKETLAB_NATS_TLS`, `POCKETLAB_NATS_TLS_CA`, `POCKETLAB_NATS_TLS_CERT`, and `POCKETLAB_NATS_TLS_KEY`.
  - Removed silent publish fallback. Failed NATS publish now raises an error and marks the bus unavailable.
  - Durable command consumers now require JetStream and fail closed instead of downgrading to volatile live queue delivery.
  - Bus status now reports `nats_required`, `jetstream_required`, `auth_configured`, and `tls_configured`.

- `runtime/api_fastapi/services/action_queue.py`
  - Default execution mode is `worker`.
  - Write operations now require connected NATS/JetStream.
  - Direct in-process execution is blocked in production and returns HTTP 403 unless an explicit harness-only override is set.
  - Domain commands are submitted only as durable NATS/JetStream worker commands.

- `runtime/api_fastapi/routers/*`
  - Removed domain fallback usage from catalog, drift, operations, and release write paths.
  - Write paths now route through durable command submission.

- `runtime/api_fastapi/routers/health.py`
  - `/ready` now requires NATS connectivity and JetStream availability.
  - Readiness payload includes NATS status.

- `runtime/agents/pocketlab_node_agent.py`
  - Added NATS username/password/token authentication support.
  - Added optional TLS/mTLS support.

- `runtime/api_fastapi/routers/fleet.py`
  - Generated join scripts now include agent-scoped NATS credentials when available.

## Bootstrap changes

- `pocket-lab-bootstrap-production-scripts-patched/scripts/start-dashboard.sh`
  - Requires `nats-server`; startup fails if it is missing.
  - Generates persistent per-role NATS credentials under `$STATE_DIR/nats/pocketlab-nats.env`.
  - Writes an authenticated JetStream config under `$STATE_DIR/nats/nats-server.conf`.
  - Starts NATS using the generated config, not open unauthenticated defaults.
  - Starts FastAPI with API-scoped NATS credentials.
  - Starts worker with worker-scoped NATS credentials.
  - Starts fleet agent with agent-scoped NATS credentials.
  - Disallows `POCKETLAB_DISABLE_WORKER=1` in production NATS mode.

- `install-fleet-agent.sh`
  - Persists NATS user/password fields in the fleet agent environment file.

## Ansible/IaC changes

- `roles/fastapi_control_plane/defaults/main.yml`
  - Added production NATS/JetStream required variables.

- `roles/fastapi_control_plane/tasks/main.yml`
  - Verifies the NATS monitor endpoint before considering the FastAPI control plane reconciled.
  - Fails when NATS is unavailable and `pocketlab_nats_required` is true.
  - Writes NATS production posture into the role manifest.

- `inventory/dev` and `inventory/prod` FastAPI control-plane group vars
  - Added NATS required, JetStream required, worker execution, URL, monitor URL, and role user variables.

## Validation performed

- Python compile check passed for the complete runtime tree.
- FastAPI app import passed and still exposes 78 routes.
- Fail-closed write-path check passed: disconnected NATS returns HTTP 503 instead of local execution.
- Bootstrap shell syntax passed for `start-dashboard.sh` and `install-fleet-agent.sh`.
- Ansible/YAML parse check passed for 111 YAML files.

## Production notes

The generated Day 0 NATS config uses authenticated per-role users and local-only binding. For multi-host production, add TLS/mTLS by setting the TLS environment variables and replacing local-only `listen`/`http` binding with a secure network listener behind firewall/Tailscale policy.
