# Releases Overview

Pocket Lab releases provide source and PWA artifacts that operators can verify, consume, and roll back safely.

## Release model

```mermaid
flowchart LR
  Main[main branch] --> Validate[Validation gates]
  Validate --> Build[Build PWA]
  Build --> Package[dist.zip]
  Package --> Release[GitHub release]
  Release --> Bootstrap[Day 0 consumer]
  Bootstrap --> UI[Installed PWA UI]
```

## Release documentation

- [PWA Release Artifacts](pwa-release-artifacts.md)
- [Release Tags](release-tags.md)
- [Day 0 Release Consumption](day-0-release-consumption.md)
- [Release Workflow & Upgrade Guide](../release/release-workflow-upgrade-guide.md)

## Safety expectations

Release automation should validate artifacts, preserve source commit evidence, and avoid hidden runtime shortcuts. Runtime updates should remain observable through typed operations, stage events, health checks, and rollback guidance.
