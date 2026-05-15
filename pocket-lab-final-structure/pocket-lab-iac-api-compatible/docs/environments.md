# Environments

`inventory/dev` is intended for safe validation, iterative development, and testing OPA Rego policies in "Audit Mode."

`inventory/prod` is intended for the live edge node and should be used only with real Vault credentials, active Tailscale mesh routing, and production-safe secrets.

## The Ignition Sequence
The master `site.yml` controls the exact order of operations necessary to bootstrap the bridged environment safely. Ensure this sequence is strictly followed:
1.  **Core & Identity:** Vault, MariaDB, Gitea (`00_preflight` to `30_gitea`).
2.  **DevSecOps Gatekeeper:** Open Policy Agent (`40_opa`) must be staged before workloads to intercept any malformed playbooks.
3.  **Mesh & UI:** Tailscale, Caddy, Dashboard API.
4.  **Workloads:** GitOps Catalog, PhotoPrism, etc.
5.  **Observability:** Loki, Promtail, Prometheus, Grafana.

## Suggested Flow
1.  Reconcile `dev` via `ansible-playbook site.yml -i inventory/dev/hosts.yml`.
2.  Verify the PM2 Bridge (`pm2 status`). Ensure Loki, Promtail, and Vault show 0 restarts.
3.  Confirm OPA correctly audits (but does not block) test deployments.
4.  Switch to `prod` inventory.
5.  Reconcile `prod` and switch the OPA Gatekeeper to "Enforcement Mode" via the UI.