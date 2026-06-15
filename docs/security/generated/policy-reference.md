<!-- GENERATED FILE - DO NOT EDIT. Run task docs:security:policies. -->

# OPA Policy Reference

This generated reference describes OPA-style policy guardrails and repository-native policy metadata found in the current Pocket Lab source tree.

> No standalone `.rego` bundle was found in this repository snapshot. policy and security evidence therefore uses `security/policies/*.yaml` as a minimal repository-native policy metadata layer and records embedded UI guardrail evidence without changing runtime behavior.

## Adaptive Runbook Approval

- Policy ID: `adaptive-runbook-approval`
- Package: `pocketlab.approval`
- Severity: **high**
- Decision mode: **decision**
- Source: `security/policies/pocketlab-policy-bundle.yaml`

Preserves Personal Mode auto-approval evidence and Enterprise Mode strict human authorization for approval-gated runbooks.

**Simple Mode wording:** Lets safe home-lab actions continue automatically, while Enterprise Mode requires a person to approve important changes.

**Mapped controls:** PL-CTRL-002, PL-CTRL-003

**Evidence events:** pocketlab.events.runbook.auto_approved, pocketlab.audit.runbook.auto_approved, pocketlab.audit.runbook.approved, pocketlab.audit.runbook.rejected

## Hardcoded Secrets Prevention

- Policy ID: `hardcoded-secrets-prevention`
- Package: `pocketlab.security`
- Severity: **high**
- Decision mode: **enforceable**
- Source: `security/policies/pocketlab-policy-bundle.yaml`

Requires secret handling through Vault / OpenBao lookup paths instead of plaintext playbook variables.

**Simple Mode wording:** Keeps passwords and tokens out of app setup files.

**Mapped controls:** PL-CTRL-001, PL-CTRL-003, PL-CTRL-004

**Evidence events:** pocketlab.events.vault.secret_rotated, pocketlab.audit.vault.secret_rotated, pocketlab.events.security.finding

```rego
package pocketlab.security

deny[msg] {
    some key
    val := input.playbook.vars[key]
    contains(lower(key), "password")
    not contains(val, "lookup('hashi_vault'")
    msg := "Hardcoded secrets detected. You must use the Vault AppRole lookup plugin."
}
```

## Privileged Port Restriction

- Policy ID: `privileged-port-restriction`
- Package: `pocketlab.network`
- Severity: **critical**
- Decision mode: **enforceable**
- Source: `security/policies/pocketlab-policy-bundle.yaml`

Prevents workloads from binding to privileged ports below 1024 on Android / Termux targets.

**Simple Mode wording:** Keeps apps from using restricted phone ports that would fail on Android.

**Mapped controls:** PL-CTRL-001, PL-CTRL-004

**Evidence events:** pocketlab.events.security.finding, pocketlab.audit.security.policy_updated

```rego
package pocketlab.network

deny[msg] {
    port := input.playbook.tasks[_].pm2_env.PORT
    to_number(port) < 1024
    msg := "Android OS denies non-root binding to ports < 1024. Please use a port > 1023."
}
```

## PRoot Isolation Enforcement

- Policy ID: `proot-isolation-enforcement`
- Package: `pocketlab.execution`
- Severity: **medium**
- Decision mode: **audit**
- Source: `security/policies/pocketlab-policy-bundle.yaml`

Ensures Linux package manager actions run inside the PRoot Ubuntu subsystem instead of native Termux.

**Simple Mode wording:** Keeps advanced Linux commands inside the safe Linux container area on Android.

**Mapped controls:** PL-CTRL-001, PL-CTRL-004

**Evidence events:** pocketlab.events.security.finding

```rego
package pocketlab.execution

deny[msg] {
    task := input.playbook.tasks[_]
    contains(task.command, "apt-get")
    not contains(task.prefix, "proot-distro login ubuntu")
    msg := "Linux package managers must be executed inside the PRoot Ubuntu subsystem."
}
```

