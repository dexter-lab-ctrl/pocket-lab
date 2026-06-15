# Threat Model Drift Detection

This page documents Tier 6.8 — Threat Drift Detection for Pocket Lab.

!!! note "Generated page"
    This page is generated from `threat-model/pocketlab-threat-model-drift-manifest.json` and current repository fingerprints.

## Objective

Threat drift detection fails the build when architecture, API contracts, event contracts, typed operation contracts, or operation security metadata change without resealing the generated threat model artifacts.

## Drift status

| Check | Status |
|---|---|
| Source fingerprint | PASS |
| Generated output fingerprint | PASS |
| Manifest | `threat-model/pocketlab-threat-model-drift-manifest.json` |
| Page generated at | 2026-06-13T23:15:28.756630+00:00 |

## Sources tracked

| Source | Size bytes | SHA-256 prefix |
|---|---:|---|
| architecture/structurizr/workspace.dsl | 13185 | 80659057feb60cff... |
| contracts/asyncapi/pocketlab-nats-jetstream.yaml | 36658 | 80b91f358f774e6e... |
| contracts/generated/openapi.json | 198396 | c2aa4119d33c2616... |
| contracts/operations/pocketlab-typed-operations.json | 22222 | 740abf611e28ab29... |
| operations/backup_now.yaml | 1821 | acc49bf6bbfad8e4... |
| operations/backup_verify.yaml | 1825 | 39a033d38487384d... |
| operations/catalog_refresh.yaml | 1790 | 63a56f29313e31cc... |
| operations/configure_opa.yaml | 1839 | a41c4134342e868d... |
| operations/deploy_blueprint.yaml | 1716 | 60590cbd7527d274... |
| operations/drift_apply.yaml | 1825 | f3e9f5f563d36063... |
| operations/drift_approve.yaml | 1750 | ed8b54887c51e723... |
| operations/drift_ignore.yaml | 1756 | a0773dd9ae0d95c8... |
| operations/drift_preview.yaml | 1804 | 75f4f18bd5cfbce4... |
| operations/drift_scan.yaml | 1918 | ac912127e123ed5b... |
| operations/fleet_join.yaml | 1903 | 61d9653c389c9870... |
| operations/git_sync.yaml | 1590 | d43f97a7c8f95ecd... |
| operations/health_check.yaml | 1758 | 27208e976bb314a9... |
| operations/release_apply.yaml | 1983 | 71aaec58b212e6ac... |
| operations/release_check.yaml | 1829 | 6bdeb99f1aa5cc7d... |
| operations/restore_backup.yaml | 1939 | 60895eaa4c40ff6a... |
| operations/rotate_secret.yaml | 1862 | 237ca8464a4971a2... |
| operations/secret_read_dynamic.yaml | 1888 | c9c87767604577e0... |
| operations/security_scan.yaml | 1821 | aa98b073415206e4... |

## Generated outputs tracked

| Output | Size bytes | SHA-256 prefix |
|---|---:|---|
| threat-model/pocketlab-threat-model.yaml | 83328 | 31ec864e6e6a2e2e... |
| docs/security/security-architecture-threat-model.md | 62656 | 6351f1f89f09cecf... |
| docs/security/generated/threat-model/pocketlab-threat-model.json | 154230 | 4854922093148454... |
| docs/security/generated/threat-model/index.md | 328 | 1f64fe7f0390803b... |

## Commands

Seal after regenerating threat-model artifacts:

```bash
task docs:threat-model
task docs:threat-model:drift:seal
```

Check without modifying files:

```bash
task docs:threat-model:drift
```

Full validation:

```bash
task docs:threat-model:check
mkdocs build --strict
```

## Enterprise value

Tier 6.8 protects against silent security documentation drift. If a developer changes `Structurizr`, `OpenAPI`, `AsyncAPI`, typed operations, or operation-level security metadata, the drift gate fails until the generated threat model is regenerated, reviewed, and resealed.

## Raw manifest summary

```json
{
  "apiVersion": "pocketlab.io/v1alpha1",
  "kind": "ThreatModelDriftManifest",
  "source_fingerprint": "7ffbfb5f2f58f70e39d3de0a82b57f160c56ab176308158ceaa606002bcd3f22",
  "generated_output_fingerprint": "15cefc951c4424336235dd72a47a75d48edc71472ba9b067e91aabfa5ca29b0e"
}
```
