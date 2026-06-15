# Pocket Lab Secret Handling

## Purpose

Secret handling must support Vault/OpenBao-style secret storage, bootstrap-generated credentials, dynamic secret reads, and operation journals without leaking sensitive values.

## Secret policy

- Secrets are never written to logs or workflow journals in cleartext.
- Event and command payloads are redacted before persistence.
- Secret rotation uses typed operations such as `rotate_secret`.
- Dynamic secret reads use explicit typed requests and must be audited.
- Bootstrap scripts reuse existing secrets unless explicit rotation is requested.

## Redaction evidence

`task test:redaction` has passed in the current baseline. This verifies that sensitive values are masked before they are stored in the operation/event journal.

## Sensitive fields

Treat these and similar fields as sensitive:

- `token`
- `password`
- `secret`
- `api_key`
- `authorization`
- `client_secret`
- `private_key`
- Vault AppRole IDs/secrets

## Security and reliability requirements

- NATS/JetStream is required for production writes.
- Durable consumers acknowledge successful work and use retry/dead-letter handling for failed work.
- Event and command journals redact tokens, passwords, API keys, secret values, and authorization material.
- NATS permissions are modeled by role: API publishes commands/events, workers subscribe to command subjects, and agents use constrained fleet subjects.
- Health and telemetry are API-mediated; the UI consumes FastAPI snapshots/events instead of coupling directly to internal service endpoints.
- Release candidate promotion must require contract, schema, network, redaction, visual, accessibility, Lighthouse, golden path, Android smoke, and release dry-run gates.
