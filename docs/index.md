# Pocket Lab Documentation

Pocket Lab is an edge-first, self-hostable local control-plane platform for small labs, portable environments, Android / Termux style edge devices, and Ubuntu-based operator workstations.

It provides a browser-based React / Vite PWA, a FastAPI control API, NATS / JetStream command and event delivery, worker-owned typed operation execution, generated contracts, event-sourced evidence, and an MkDocs documentation portal that can be published to GitHub Pages.

## What this site covers

| Area | What you will find |
| --- | --- |
| Product | What Pocket Lab is, how Simple / Professional / Enterprise experiences differ, and how operators use the UI. |
| Getting Started | Quick-start guidance, Day 0 bootstrap flow, and PWA UI installation from release artifacts. |
| Architecture | Runtime flow, Structurizr architecture-as-code, workers, typed operations, runbooks, and approvals. |
| Operations | Runbook automation, approval and evidence matrices, degraded-mode handling, backup, restore, and recovery. |
| API & Events | FastAPI OpenAPI contract, NATS / JetStream AsyncAPI contract, and the generated typed operations catalog. |
| Security | Threat model, policy guardrails, adaptive approval, audit evidence, and compliance control references. |
| Observability | Repository-generated observability references and FastAPI-owned runtime health status. |
| Deployment | Platform, Ansible, bootstrap script, environment, Android / Termux, and WSL2 development references. |
| Releases | PWA release artifacts, release tags, Day 0 release consumption, and upgrade flow. |
| Development | Local development, testing, debugging, CI/CD workflows, and generated GitHub Actions documentation. |
| Validation | Release readiness, validation evidence, UI evidence, and quality gates. |

## Documentation model

Pocket Lab uses documentation-as-code. Most reference pages are generated from repository sources such as OpenAPI, AsyncAPI, typed operation metadata, runbooks, policy metadata, deployment sources, observability sources, Storybook UI states, and validation evidence.

The intended balance is:

- **Generated reference documentation:** contracts, catalogs, evidence matrices, workflow inventory, observability references, deployment references, validation evidence.
- **Human-maintained guidance:** product overview, operator workflows, getting started, release consumption, development workflow, debugging, and architecture explanation.

## Runtime model

```text
React / Vite PWA
→ FastAPI Control API
→ NATS / JetStream
→ Workers
→ Events
→ FastAPI
→ UI
```

The frontend calls FastAPI only. It does not execute shell commands, does not talk directly to NATS, and does not call Prometheus, Loki, Grafana, Gatus, or Promtail directly.

## Recommended local documentation commands

```bash
task docs:check
mkdocs build --strict
mkdocs serve -a 127.0.0.1:8001
```

Use `task docs:workflows` after changing `.github/workflows/*.yml` so the CI/CD documentation stays reproducible.
