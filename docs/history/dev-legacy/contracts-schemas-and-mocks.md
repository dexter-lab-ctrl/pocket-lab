# Contracts, Schemas, and Mocks

## Purpose

This document defines how the dev environment keeps the frontend, FastAPI OpenAPI contract, JSON schemas, and deterministic mocks synchronized.

## Contract model

The frontend must call only paths exposed by the FastAPI OpenAPI document unless a path is explicitly handled by the Vite dev server or static asset layer.

Run:

```bash
task check:api-contract
```

A passing result means scanned frontend API paths are represented in OpenAPI.

## Schema model

Run:

```bash
task check:schemas
```

Schemas should cover operation events, telemetry, health snapshots, and other browser-consumed JSON documents. Fixture files must remain aligned with schema expectations.

## Mocking model

Use MSW and deterministic fixtures for UI quality gates. Mocked responses should represent FastAPI-facing contracts, not direct service internals.

Examples:

| UI data | Mock at |
|---|---|
| readiness | `/ready` |
| NATS status | `/api/nats/status` |
| worker status | `/api/workers/status` |
| health engine | `/api/health-engine.json` |
| recent events | `/api/events/recent` |
| release self-update | `/api/release/self-update/status` |

The browser should not call Gatus directly in production UI paths. Gatus-compatible status data is consumed through FastAPI-facing health snapshots/events.

## Legacy contract ban

The following should remain absent from active frontend write flows:

- `legacy_intent`
- `/api/action/update`
- generic shell command write payloads
- browser-facing `sync_bash`
- browser-facing `tofu_deploy`
- direct frontend-to-Gatus production calls

## Local debugging

If the UI is blank, first verify whether React mounted and whether API requests succeeded:

```bash
node pocketlab-ui-debug.mjs
```

Expected healthy output:

```text
ROOT HTML LENGTH > 0
CONSOLE ERRORS: none
PAGE ERRORS: none
FAILED REQUESTS: none
```
