# Backup, Restore & Disaster Recovery Guide

## Purpose

This guide explains how Pocket Lab protects runtime state and recovers from failures.

## Backup Principles

Backups should be explicit, verifiable, restorable, redacted where required, taken before risky operations, and associated with release workflows.

## Backup Scope

| Data | Include |
|---|---|
| State directory | Yes |
| Event journal | Yes |
| Operation records | Yes |
| Catalog metadata | Yes |
| Release metadata | Yes |
| Fleet metadata | Yes |
| Backup manifests | Yes |
| Secrets | Only if encrypted and allowed |

## Do Not Back Up Unprotected

- Plaintext tokens.
- Vault root material.
- Private keys.
- Unredacted secret responses.
- Temporary logs containing sensitive values.

## Operations

| Operation | Purpose |
|---|---|
| `backup_now` | Create backup snapshot. |
| `backup_verify` | Verify manifest/checksum integrity. |
| `restore_backup` | Restore from selected backup. |

## Release Backup Flow

```mermaid
flowchart LR
  Apply[Apply Release] --> Backup[backup_now]
  Backup --> Sync[release_sync]
  Sync --> Deploy[release_deploy]
  Deploy --> Verify[release_verify]
  Verify --> Done[Release Complete]
```

If backup fails, release should not continue.

## Restore Flow

```mermaid
flowchart LR
  Select[Select Backup] --> Preview[Restore Preview]
  Preview --> Confirm[Operator Confirm]
  Confirm --> Restore[restore_backup]
  Restore --> Verify[backup_verify / drift_scan]
  Verify --> Refresh[Refresh UI State]
```

## Restore Safety

Restore workflows should show what will be restored, what will be overwritten, estimated size, backup timestamp/ref, manifest status, and destructive-change warnings.

## Disaster Scenarios

| Scenario | Recovery |
|---|---|
| Failed release | Restore last pre-release backup. |
| Corrupted state | Restore verified state snapshot. |
| Lost catalog | Refresh catalog after restoring state. |
| Worker failure | Restore worker then replay events. |
| Fleet state loss | Restore fleet metadata and recheck agents. |
| Drift after restore | Run drift scan and reconcile. |

## Verification

After restore:

```bash
task test:backend
task check:api-contract
task test:faults
```

For release recovery:

```bash
task release:dry-run
```

## Maintenance Rule

Any change to backup format, manifest fields, restore behavior, or release backup behavior must update this guide.
