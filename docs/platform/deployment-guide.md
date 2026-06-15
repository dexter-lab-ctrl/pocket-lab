<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:deployment`. -->

# Pocket Lab Deployment Guide

This deployment evidence page is generated from repository deployment evidence. It documents what exists in this repository; it does not add a new deployment platform or change runtime behavior.

## Deployment model

Pocket Lab remains an edge-first, self-hostable control-plane platform. The runtime flow is preserved:

```text
React / Vite PWA
→ FastAPI Control API
→ NATS / JetStream
→ Workers
→ Events
→ FastAPI
→ UI
```

The deployment automation inspected by deployment evidence is source evidence for installing, validating, and operating that runtime. Frontend code does not execute shell commands and does not talk directly to NATS.

## Source evidence summary

| Evidence area | Count |
| --- | --- |
| Ansible / IaC bases | 4 |
| Ansible playbooks | 25 |
| Ansible roles | 14 |
| Inventory / group vars files | 35 |
| IaC catalog entries | 0 |
| Bootstrap / platform scripts | 49 |
| Platform source docs | 7 |
| Environment/runtime files | 4 |


## Recommended deployment documentation workflow

```bash
task docs:deployment
task docs:deployment:check
mkdocs build --strict
```

## Operator deployment flow

1. Prepare the platform using the documented Android / Termux, Ubuntu, WSL2, or host-specific bootstrap scripts.
2. Start and validate Docker/NATS where applicable.
3. Apply Ansible playbooks from the repository-native IaC tree when targeting a managed host.
4. Validate the FastAPI control API, NATS / JetStream, workers, typed operation contracts, runbook docs, security docs, and MkDocs site.
5. Use generated evidence manifests for review and audit.

## Source-controlled references

- Ansible playbooks: `docs/platform/generated/ansible-playbooks-reference.md`
- Ansible roles and tasks: `docs/platform/generated/ansible-roles-reference.md`
- Bootstrap scripts: `docs/platform/generated/bootstrap-scripts-reference.md`
- Environment variables: `docs/platform/generated/environment-reference.md`
- Runtime blueprint: `docs/architecture/runtime-blueprint.md`
- Evidence manifest: `docs/platform/generated/deployment-evidence-manifest.json`
