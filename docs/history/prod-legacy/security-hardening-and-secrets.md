# Security Hardening and Secrets

## Purpose

This document consolidates production hardening, NATS security, secret-handling, redaction, and retired compatibility controls.

## Control-plane security invariants

- FastAPI validates all browser-facing mutation requests.
- Browser clients do not receive NATS credentials.
- NATS subject permissions are role-scoped.
- Workers consume from durable command streams.
- Audit and DLQ streams are monitored.
- Secrets never appear in logs, events, browser state, or screenshots.
- Redaction gates must pass before release-candidate promotion.

## Secret handling

Production secrets should be sourced from a secret backend or local protected environment file. Generated secrets must be written atomically with restrictive permissions.

Do not commit:

- tokens
- private keys
- AppRole secret IDs
- database passwords
- NATS credentials
- Tailscale/auth keys
- generated runtime state containing secrets

## Redaction requirement

Run:

```bash
task test:redaction
```

This gate must pass before release-candidate tagging.

## NATS hardening

Production NATS should use:

- explicit users/accounts where supported
- least-privilege subject permissions
- separate publisher/consumer roles
- durable consumers for workers
- TLS where deployed over untrusted networks
- monitored JetStream limits
- DLQ handling and alerting

## Retired compatibility guardrail

The following must remain blocked in production-facing flows:

- `legacy_intent`
- `/api/action/update`
- browser-originated generic shell execution
- direct browser write access to infrastructure tools
- browser-facing compatibility wrappers for old sync/deploy commands

## Supply-chain posture

Dependency warnings should be triaged before release candidate. Avoid forced upgrade commands that can introduce breaking changes without a controlled test pass.
