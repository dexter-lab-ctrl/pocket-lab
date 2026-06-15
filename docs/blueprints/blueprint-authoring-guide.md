# App Catalog / Blueprint Authoring Guide

## Purpose

This guide explains how to create and maintain Pocket Lab blueprints for Apps & Services.

## Blueprint Concept

A blueprint is a deployable workload definition. It may include metadata, source reference, Ansible playbook, configuration defaults, policy expectations, runtime requirements, and rollback guidance.

## Source Modes

| Mode | Purpose |
|---|---|
| Repository | Git-backed blueprint source. |
| OCI artifact | Blueprint packaged as OCI artifact. |
| ZIP archive | Packaged archive source. |
| HTTP/HTTPS | Remote source reference. |
| Local path | Local development or imported blueprint. |

## Recommended Layout

```text
blueprint-name/
  blueprint.yaml
  README.md
  playbooks/
    site.yml
  roles/
  files/
  templates/
  policies/
```

## Metadata Example

```yaml
id: example-app
name: Example App
description: Example self-hosted workload
version: 1.0.0
category: observability
entrypoint: playbooks/site.yml
requires:
  - fastapi
  - nats
operations:
  deploy: deploy_blueprint
  rollback: rollback_blueprint
```

## Deployment Operation Example

```json
{
  "operation": "deploy_blueprint",
  "target": {
    "type": "repository",
    "ref": "example-app"
  },
  "params": {
    "name": "example-app",
    "playbook": "site.yml"
  }
}
```

## Authoring Rules

Blueprints should avoid hardcoded secrets, use Vault/secret references, provide idempotent playbooks, support repeated apply, emit useful operation logs, include rollback notes, declare dependencies, avoid unsupported shell assumptions, and remain ARM/edge friendly where possible.

## Policy Checks

Policy checks should verify no plaintext secrets, no unjustified privileged tasks, no unsupported destructive commands, valid metadata, explicit source/version, and expected playbook presence.

## Catalog Refresh

After adding or updating a blueprint:

1. Commit blueprint changes.
2. Run catalog refresh.
3. Verify the App Catalog shows the blueprint.
4. Run preview/deploy in a controlled environment.
5. Check events for operation output.

## Testing

```bash
task test:iac
task test:e2e
task test:faults
task check:api-contract
```

## Maintenance Rule

Any blueprint that changes deployment behavior must update its README, metadata, policy expectations, and rollback notes.
