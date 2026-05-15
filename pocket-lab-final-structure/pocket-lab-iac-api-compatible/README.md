Pocket Lab GitOps Infrastructure

This repository is the Ansible/GitOps control plane for Pocket Lab.

It is compatible with the production-safe pocket_lab_api_server.py service by keeping the catalog repository and the infrastructure repository separate:

pocket_lab_iac is the infrastructure reconciliation repo managed by Ansible.

iac-catalog is the Gitea catalog repository read by the API at /api/catalog.json.

Bootstrap responsibilities stay in the bootstrap repo:

Android/Termux setup

package installation

proot Ubuntu installation

first Vault init and unseal

first local process bring-up via PM2 Bridge

This repository owns the declarative day-1/day-2 state:

Vault mounts, policies, database roles, secret bundles, and audit settings

MariaDB databases, users, and grants

Gitea configuration, orgs, repos, and repository settings

Gitea Actions (act_runner) configuration and CI/CD pipelines

Open Policy Agent (OPA) DevSecOps policies and gatekeeper interception

Tailscale configuration and enrollment metadata

Caddy reverse proxy configuration

Dashboard/API files (Python Control Plane)

Catalog seeding content for the iac-catalog repo

Workload launchers and Security Scanners (Trivy, Lynis)

Backups and Observability artifacts (Loki, Promtail, Prometheus, Grafana)

Layout

site.yml is the top-level reconciliation entry point.

playbooks/ contains lifecycle playbooks.

roles/ contains single-responsibility roles (e.g., gitea_runner, opa, observability).

iac-catalog/ contains the catalog tree that is copied into the dedicated Gitea repository.

inventory/dev is for safe validation runs and Audit-Mode OPA testing.

inventory/prod is for production deployments with Strict-Mode OPA enforcement.

API compatibility

The dashboard/API service expects:

POCKETLAB_IAC_DIR to point to the local checkout used for branch commits.

POCKETLAB_GITEA_REPO to point to the catalog repository name iac-catalog.

each catalog item to live at the root of the iac-catalog repository, in its own directory, with a metadata.json file and either playbook.yml or maintenance.yml.

Running

Install collections:

ansible-galaxy collection install -r requirements.yml


Run the full reconciliation:

ansible-playbook site.yml


Run one playbook:

ansible-playbook playbooks/30_gitea.yml


Production launch checklist

Provide Vault credentials through environment variables or a secure AppRole.

Confirm Gitea and MariaDB are already bootstrapped by the bootstrap scripts.

Verify that opa_interceptor.py is configured to "Enforcement Mode" for production safety.

Review docs/production-readiness.md before first rollout.

Run the test inventory first, then switch to inventory/prod.