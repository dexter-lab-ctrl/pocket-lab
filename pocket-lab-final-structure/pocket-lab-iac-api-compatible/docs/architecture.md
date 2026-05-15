# Architecture

The Pocket Lab control plane operates on a highly specialized "Host-Hypervisor" bridge pattern designed for Android/Termux edge environments. It relies on two distinct repositories:

1. `pocket_lab_iac` — The Day-0/Day-1 infrastructure and bootstrap reconciliation code.
2. `iac-catalog` — The Day-2 dynamic workload blueprints triggered by the React UI.

## The Edge Bridge Pattern
Because Termux uses Android's bionic C-library, standard Linux glibc binaries cannot run natively. The architecture bridges two environments using Node.js PM2 as the master orchestrator:

* **Native Termux (The Host):** Runs PM2, Vault, MariaDB, Gitea, `act_runner` (Gitea Actions), the Python API Control Plane, and hardware telemetry.
* **PRoot Ubuntu (The Guest):** Runs the glibc-dependent Observability Stack (Loki, Promtail, Prometheus, Grafana) and Security Scanners (Trivy, Lynis, OPA).
* **The Bridge:** PM2 natively spawns and monitors guest processes using the `proot-distro login ubuntu --` execution wrapper.

## Execution Flow (GitOps & DevSecOps)
The API server reads the `iac-catalog` repository from Gitea. When a workload is triggered via the UI:
1.  The Python API commits the request to a feature branch in Gitea.
2.  Gitea Actions (`act_runner`) detects the push and begins executing the Ansible playbook.
3.  An Open Policy Agent (OPA) gatekeeper script (`opa_interceptor.py`) intercepts the playbook, verifying it against `.rego` policies (e.g., blocking hardcoded secrets or privileged port binding).
4.  If the policy passes, the workload is deployed. 
5.  All PM2 execution logs are scraped by Promtail natively and shipped to Loki in the PRoot subsystem for Grafana visualization.