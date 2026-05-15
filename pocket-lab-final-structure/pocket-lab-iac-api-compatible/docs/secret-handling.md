# Secret Handling

The Pocket Lab operates on a strict Zero-Trust model managed by HashiCorp Vault. 

- **No Hardcoded Passwords:** Do not commit plaintext passwords or API keys. The OPA interceptor utilizes a `.rego` policy that automatically denies any Ansible playbook containing hardcoded `password` variables that do not utilize the `lookup('hashi_vault')` plugin.
- **Dynamic Ephemeral Secrets:** For database access (e.g., MariaDB), always prefer Vault's database engine to generate short-lived, ephemeral credentials with automatic TTL expiration.
- **Least Privilege Observability:** The observability stack (Loki, Promtail, Prometheus) is configured to operate without persistent high-privilege tokens. Access to Vault metrics is provided via local-only unauthenticated endpoints or short-lived AppRoles generated during the initial Ansible bootstrap.
- **Log Masking:** Ensure `no_log: true` is set on any Ansible tasks that manipulate sensitive data. This prevents secrets from being leaked into the PM2 `stdout` streams, which are actively scraped by Promtail and stored in Loki.
- **Token Minimization:** We have transitioned away from the `token_manager.py` daemon. Secret injection is now handled declaratively by Ansible templates during the reconciliation phase, reducing the attack surface of the runtime environment.
- **Machine Authentication:** Prefer Vault AppRole for machine-to-machine authentication. Store sensitive Role-IDs and Secret-IDs in the filesystem with `0600` permissions, accessible only by the service's execution user.