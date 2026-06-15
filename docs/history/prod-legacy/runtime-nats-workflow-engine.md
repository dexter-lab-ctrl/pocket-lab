# Runtime, NATS, and Workflow Engine

## Purpose

This document consolidates the former phase reports for the FastAPI + NATS/JetStream runtime, worker process, live events, domain handlers, release orchestration, health telemetry, fleet agent, retry/DLQ handling, and event-sourced workflow engine.

## Runtime flow

```text
Frontend operation request
  -> FastAPI validates operation payload
  -> command is published to JetStream
  -> worker durable consumer receives command
  -> domain handler executes operation
  -> events/audit/telemetry are emitted
  -> workflow projection updates
  -> UI receives progress over REST/WebSocket
```

## JetStream stream model

| Stream | Purpose |
|---|---|
| `POCKETLAB_COMMANDS` | Durable typed operation commands |
| `POCKETLAB_EVENTS` | Operation, health, fleet and release events |
| `POCKETLAB_AUDIT` | Auditable control-plane records |
| `POCKETLAB_TELEMETRY` | Runtime and NOC telemetry events |
| `POCKETLAB_DLQ` | Failed messages after retry budget |

## Worker model

Workers must use durable consumers and idempotent domain handlers. Each operation should have a correlation ID, operation ID, subject, domain type, audit record, and resulting projection update.

## Domain handler examples

| Domain | Handler responsibility |
|---|---|
| GitOps | sync desired state from the configured source |
| Blueprint/App Store | deploy, import, rollback and report package status |
| Drift | compare desired and observed state, emit drift events |
| Fleet | join/register devices and report fleet agent status |
| Vault/Identity | rotate secrets and update identity records safely |
| Backup/DR | verify backup references and restore through typed operation |
| Policy | deploy and validate guardrail policy changes |
| Release | orchestrate self-update and release workflow state |

## Event-sourced workflow engine

The workflow engine records commands and events so operations can be reconstructed after process restarts. Projections are derived state, not the source of truth.

Production behavior must include:

- durable command ingestion
- bounded retries
- DLQ on permanent failure
- idempotent handler behavior
- correlation IDs across logs/events
- redaction of secrets in all event payloads
- recoverable workflow projections

## Production hardening

- NATS/JetStream is required for production writes.
- Local fallback command execution must not be enabled for production mutation paths.
- Subject permissions should restrict publishers and consumers by role.
- Browser clients must not hold NATS credentials.
- DLQ and audit streams must be monitored.
