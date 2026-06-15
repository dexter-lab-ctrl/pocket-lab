# Threat Model Source Synchronization

!!! note "Generated Tier 6.9A evidence"
    This page is generated from Structurizr, OpenAPI, AsyncAPI, Typed Operations, and `operations/*.yaml`. It verifies that security architecture and threat-model metadata stay synchronized with contract-first engineering artifacts.

## Objective

Tier 6.9A automatically synchronizes Pocket Lab threat-model evidence with the architecture and contract sources that define the control plane.

```text
Structurizr + OpenAPI + AsyncAPI + Typed Operations + operations/*.yaml
        ↓
Threat-model source synchronization manifest
        ↓
Security Architecture & Threat Model validation
```

## Source inventory

| Source | Path | Count | Purpose |
|---|---|---|---|
| Structurizr | architecture/structurizr/workspace.dsl | 26 | C4 architecture elements and Tier 5B security views |
| OpenAPI | contracts/generated/openapi.json | 80 | FastAPI HTTP control-plane surface |
| AsyncAPI | contracts/asyncapi/pocketlab-nats-jetstream.yaml | 56 | NATS / JetStream command and event channels |
| Typed Operations | contracts/operations/pocketlab-typed-operations.json | 19 | Execution contract |
| Operation metadata | operations | 19 | Threat Modeling as Code source |

## Finding summary

| Severity | Count |
|---|---|
| error | 0 |
| warning | 5 |
| info | 62 |

## Operation source links

| Operation | Metadata | Typed op | OpenAPI matches | AsyncAPI matches | STRIDE |
|---|---|---|---|---|---|
| backup_now | operations/backup_now.yaml | yes | POST /api/operations/execute | pocketlab.commands.operation.execute | Tampering, Repudiation, Denial of Service, Elevation of Privilege |
| backup_verify | operations/backup_verify.yaml | yes | POST /api/operations/execute | pocketlab.commands.operation.execute | Tampering, Repudiation, Denial of Service, Elevation of Privilege |
| catalog_refresh | operations/catalog_refresh.yaml | yes | GET /api/catalog/refresh, POST /api/catalog/refresh, POST /api/operations/execute | pocketlab.commands.catalog.refresh | Tampering, Repudiation |
| configure_opa | operations/configure_opa.yaml | yes | POST /api/operations/execute | - | Tampering, Repudiation, Information Disclosure, Elevation of Privilege |
| deploy_blueprint | operations/deploy_blueprint.yaml | yes | POST /api/operations/execute | pocketlab.commands.operation.execute | Tampering, Repudiation |
| drift_apply | operations/drift_apply.yaml | yes | POST /api/operations/execute | - | Tampering, Repudiation, Denial of Service, Elevation of Privilege |
| drift_approve | operations/drift_approve.yaml | yes | POST /api/operations/execute | - | Tampering, Repudiation, Denial of Service, Elevation of Privilege |
| drift_ignore | operations/drift_ignore.yaml | yes | POST /api/operations/execute | - | Tampering, Repudiation, Denial of Service, Elevation of Privilege |
| drift_preview | operations/drift_preview.yaml | yes | POST /api/operations/execute, POST /api/operations/preview | - | Tampering, Repudiation, Denial of Service, Elevation of Privilege |
| drift_scan | operations/drift_scan.yaml | yes | POST /api/operations/execute | pocketlab.commands.drift.scan | Tampering, Repudiation, Denial of Service, Elevation of Privilege |
| fleet_join | operations/fleet_join.yaml | yes | POST /api/operations/execute | pocketlab.commands.fleet.join | Tampering, Repudiation, Information Disclosure, Elevation of Privilege |
| git_sync | operations/git_sync.yaml | yes | POST /api/operations/execute | pocketlab.commands.operation.execute | Tampering, Repudiation |
| health_check | operations/health_check.yaml | yes | POST /api/health/check | pocketlab.commands.health.check | Tampering, Repudiation, Information Disclosure, Denial of Service |
| release_apply | operations/release_apply.yaml | yes | POST /api/release/self-update/apply | pocketlab.commands.release.apply | Tampering, Repudiation, Denial of Service, Elevation of Privilege |
| release_check | operations/release_check.yaml | yes | POST /api/release/self-update/check | pocketlab.commands.release.check | Tampering, Repudiation, Denial of Service, Elevation of Privilege |
| restore_backup | operations/restore_backup.yaml | yes | POST /api/operations/execute, POST /api/operations/preview | pocketlab.commands.operation.execute | Tampering, Repudiation, Denial of Service, Elevation of Privilege |
| rotate_secret | operations/rotate_secret.yaml | yes | POST /api/operations/execute | pocketlab.commands.vault.rotate | Tampering, Repudiation, Information Disclosure, Elevation of Privilege |
| secret_read_dynamic | operations/secret_read_dynamic.yaml | yes | POST /api/operations/execute | pocketlab.commands.vault.dynamic_secret | Tampering, Repudiation, Information Disclosure, Elevation of Privilege |
| security_scan | operations/security_scan.yaml | yes | POST /api/security/scan | pocketlab.commands.security.scan | Tampering, Repudiation, Information Disclosure, Elevation of Privilege |

## Findings

| Severity | Source | Code | Message | Remediation |
|---|---|---|---|---|
| warning | asyncapi | DECLARED_NATS_SUBJECT_NOT_IN_ASYNCAPI | Operation configure_opa declares NATS subject pocketlab.commands.security.configure_opa, but it was not found in AsyncAPI channels. | Regenerate AsyncAPI or correct the operation's natsSubject metadata. |
| warning | asyncapi | DECLARED_NATS_SUBJECT_NOT_IN_ASYNCAPI | Operation drift_apply declares NATS subject pocketlab.commands.drift.apply, but it was not found in AsyncAPI channels. | Regenerate AsyncAPI or correct the operation's natsSubject metadata. |
| warning | asyncapi | DECLARED_NATS_SUBJECT_NOT_IN_ASYNCAPI | Operation drift_approve declares NATS subject pocketlab.commands.drift.approve, but it was not found in AsyncAPI channels. | Regenerate AsyncAPI or correct the operation's natsSubject metadata. |
| warning | asyncapi | DECLARED_NATS_SUBJECT_NOT_IN_ASYNCAPI | Operation drift_ignore declares NATS subject pocketlab.commands.drift.ignore, but it was not found in AsyncAPI channels. | Regenerate AsyncAPI or correct the operation's natsSubject metadata. |
| warning | asyncapi | DECLARED_NATS_SUBJECT_NOT_IN_ASYNCAPI | Operation drift_preview declares NATS subject pocketlab.commands.drift.preview, but it was not found in AsyncAPI channels. | Regenerate AsyncAPI or correct the operation's natsSubject metadata. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/drift/{action} | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/events/publish | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/fleet/agents/broadcast | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/fleet/agents/{node_id}/commands | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/fleet/join | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/live-status/restart | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/live-status/sample | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/reliability/dead-letters/{dead_letter_id}/replay | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/reliability/recover | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/runbooks/executions/{execution_id}/approve | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/runbooks/executions/{execution_id}/reject | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/runbooks/{name}/execute | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: PUT /api/settings/governance | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/workflows/rebuild | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/workflows/recover | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | openapi | MUTATING_API_ENDPOINT_NOT_EXPLICITLY_MAPPED | Mutating OpenAPI endpoint is not explicitly mapped to operation metadata: POST /api/workflows/{workflow_id}/replay | Add apiEntrypoints to the relevant operations/*.yaml file if this endpoint triggers a typed operation. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.audit.release.applied | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.audit.runbook.approved | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.audit.runbook.executed | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.audit.runbook.rejected | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.audit.security.policy_updated | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.audit.vault.secret_rotated | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.commands.runbook.approve | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.commands.runbook.execute | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.commands.runbook.reject | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.dlq.original_subject | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.catalog.refreshed | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.command.dead_lettered | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.command.failed | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.command.queued | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.command.retry_scheduled | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.command.succeeded | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.drift.detected | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.fleet.node_heartbeat | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.fleet.node_telemetry | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.health.checked | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.operation.created | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.operation.failed | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.operation.log | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.operation.succeeded | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.operation.worker_claimed | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.release.stage.completed | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.release.workflow.completed | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.release.workflow.started | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.runbook.approval_queued | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.runbook.approval_required | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.runbook.approved | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.runbook.failed | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.runbook.queued | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.runbook.rejected | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.runbook.rejection_queued | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.runbook.resumed | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.runbook.started | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.runbook.step_failed | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.runbook.step_started | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.runbook.step_succeeded | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.runbook.succeeded | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.security.finding | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.telemetry.sampled | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.vault.secret_rotated | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.worker.heartbeat | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |
| info | asyncapi | ASYNCAPI_CHANNEL_NOT_EXPLICITLY_MAPPED | AsyncAPI channel is not explicitly mapped to operation metadata: pocketlab.events.workflow.recovery_completed | Add natsSubject to the relevant operations/*.yaml file if this channel is operation-owned. |

## Generated artifact

```text
threat-model/pocketlab-threat-model-sync-manifest.json
```

## Validation

```bash
task docs:threat-model:sync:check
task docs:threat-model:check
mkdocs build --strict
```

## Enterprise value

- New typed operations cannot silently bypass threat-model metadata.
- Structurizr Tier 5B views remain a required architecture evidence source.
- OpenAPI mutating surfaces are visible for security review.
- AsyncAPI NATS / JetStream channels are visible for command/event boundary review.
- Operation metadata links STRIDE, trust boundaries, attack surfaces, mitigations, and residual risks to generated contracts.
