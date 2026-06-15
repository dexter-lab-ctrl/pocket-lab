<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:deployment`. -->

# Pocket Lab Runtime Blueprint

This Tier 11 runtime blueprint is generated from deployment evidence and preserves the existing Pocket Lab runtime architecture.

## Runtime flow

```text
React / Vite PWA
→ FastAPI Control API
→ NATS / JetStream
→ Workers
→ Events
→ FastAPI
→ UI
```

## Deployment evidence feeding this blueprint

| Evidence | Count |
| --- | --- |
| Ansible bases | 4 |
| Playbooks | 25 |
| Roles | 14 |
| Bootstrap scripts | 48 |
| Platform docs | 7 |
| Environment/runtime files | 4 |


## Boundaries

- React/Vite is the user interface and never talks directly to NATS.
- FastAPI remains the control API.
- NATS / JetStream remains the command and event backbone.
- Workers own execution and resume.
- Typed Operations remain the execution contract.
- Runbooks orchestrate typed operations and keep approval, rejection, resume, auto-approval, and audit evidence explicit.

## Platform compatibility

Tier 11 links existing Android / Termux / ARM64 and Ubuntu / WSL2 evidence where present. It does not claim a platform is implemented unless a source file exists in the evidence manifest.
