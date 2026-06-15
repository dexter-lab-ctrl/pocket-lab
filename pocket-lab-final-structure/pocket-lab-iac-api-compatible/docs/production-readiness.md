# Production Readiness

Before relying on the edge node for production workloads, ensure the following Zero-Trust and GitOps standards are enforced:

- **Policy-as-Code Enforcement:** The OPA Gatekeeper must be toggled to "Enforcement Mode" via the UI (writing `enforce_mode: true` to `opa_config.json`). This ensures that any deployments containing hardcoded secrets or unauthorized native package manager commands are blocked before execution.
- **GitOps Separation of Concerns:** Keep bootstrap-only tasks (Stage 0-7) in the `pocket_lab_iac` repo and limit the `iac-catalog` repository strictly to deployable application blueprints and maintenance playbooks.
- **PRoot Isolation Compliance:** Verify that all playbooks utilizing standard Linux package managers (`apt`, `dpkg`) or executing glibc-dependent binaries are correctly wrapped in the `proot-distro login ubuntu --` prefix to avoid execution failure in the native Termux environment.
- **Branch Protection:** Protect the `main` branch in both repositories. The Dashboard API is architected to commit changes to `feature/*` branches, allowing Gitea Actions to validate the state change before merging.
- **Identity Hardening:** Ensure `unauthenticated_metrics_access` is enabled in Vault specifically for the local loopback, allowing Prometheus to scrape system health without sidecar token managers, reducing circular dependencies.
- **Mesh Integrity:** Store Tailscale API keys exclusively in Vault. Never commit keys or pre-authorized tokens to the GitOps catalog.

## Enterprise NATS/JetStream alignment

The IaC tree now treats NATS/JetStream as a first-class production dependency. `playbooks/65_nats.yml` renders the authenticated NATS server config, persistent per-role credentials, JetStream storage directory, and a non-secret manifest under `{{ common_state_dir }}/nats`. `playbooks/70_fastapi_control_plane.yml` must run after NATS and validates that the monitor endpoint is reachable and JetStream is enabled before declaring the FastAPI control plane ready. WebSocket traffic is proxied through Caddy via `/ws/*`, matching the React live event frontend.
