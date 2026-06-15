<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:deployment`. -->

# Ansible Playbooks Reference

This page is generated from repository Ansible YAML. Optional `ansible-playbook --syntax-check` validation may be run locally when Ansible is installed.

## Playbook index

| Playbook | Hosts | Become | Roles | Tasks | Shell/command tasks | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/backup_restore/maintenance.yml | backups | no | backups | 0 | 0 | 91e99330a7ee |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/cve_patcher/playbook.yml | localhost | no | — | 2 | 1 | a455560e8041 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/drift_check/maintenance.yml | drift_check | no | — | 1 | 0 | 3a879371b962 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/host_hardening/playbook.yml | localhost | no | — | 2 | 1 | 6ee0035a8dbb |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/observability/maintenance.yml | observability | no | — | 1 | 0 | e26b150b11dd |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/photoprism/playbook.yml | workloads | no | workloads/photoprism | 0 | 0 | f7722eb6fe79 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/secret_rotation/maintenance.yml | localhost | no | — | 3 | 0 | 984cdf35de09 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/security_scanners/playbook.yml | localhost | no | — | 3 | 0 | bb79cdf8576c |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/tailscale_ztp/maintenance.yml | localhost | no | — | 4 | 0 | 13207dcd0f3b |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/00_preflight.yml | common | no | common | 0 | 0 | ffbf7bb631b4 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/10_vault.yml | vault | no | common, vault | 0 | 0 | 62de42287aae |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/20_mariadb.yml | mariadb | no | common, mariadb | 0 | 0 | 5775668adc96 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/30_gitea.yml | gitea | no | common, gitea, vault | 0 | 0 | 8ad677cf1898 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/40_opa.yml | localhost | no | opa | 0 | 0 | 522a449e0f21 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/50_tailscale.yml | tailscale | no | common, tailscale | 0 | 0 | 0b83033b8ff8 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/60_caddy.yml | caddy | no | caddy, common | 0 | 0 | b98462d2e8df |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/65_nats.yml | nats | no | common, nats | 0 | 0 | 3cfc6554f605 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/70_fastapi_control_plane.yml | fastapi_control_plane | no | common, fastapi_control_plane | 0 | 0 | ecaf35c2afac |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/80_catalog_seed.yml | catalog_seed | no | catalog_seed, common, gitea, vault | 0 | 0 | dd1e8a2ccab7 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/90_workloads.yml | workloads | no | common, photoprism, vault | 0 | 0 | 97e50d559f9a |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/95_backup_restore.yml | backups | no | backups, common | 0 | 0 | 0c68ac44a932 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/97_gitea_runner.yml | gitea | no | common, gitea_runner | 0 | 0 | 8c0b2329b774 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/98_observability.yml | observability | no | common, observability, vault | 0 | 0 | 14892f5f7ca9 |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/99_drift_check.yml | drift_check | no | common, drift_check | 0 | 0 | 6dde3a495c0a |
| pocket-lab-final-structure/pocket-lab-iac-api-compatible/site.yml | — | no | — | 0 | 0 | efbb0b05481b |


## Playbook details

### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/backup_restore/maintenance.yml`
| Field | Value |
| --- | --- |
| Hosts | backups |
| Become | no |
| Roles | backups |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 91e99330a7ee9e96617537e0e89d454f1e844f1d0f345d62473eda37e133869d |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/cve_patcher/playbook.yml`
| Field | Value |
| --- | --- |
| Hosts | localhost |
| Become | no |
| Roles | — |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | a455560e8041d102e586932c71bd59797f2c8824c720fa2a5bf8cca82e262ca9 |
| Section | Task | Module | Shell/command |
| --- | --- | --- | --- |
| tasks | Apply OS-Level Security Patches | changed_when | no |
| tasks | Log Patch Event to Loki | ansible.builtin.shell | yes |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/drift_check/maintenance.yml`
| Field | Value |
| --- | --- |
| Hosts | drift_check |
| Become | no |
| Roles | — |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 3a879371b96277f1e92da0c909a8ea0313dbf3e390c1e6d28fa46b9d26981e62 |
| Section | Task | Module | Shell/command |
| --- | --- | --- | --- |
| tasks | Run drift check role | ansible.builtin.include_role | no |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/host_hardening/playbook.yml`
| Field | Value |
| --- | --- |
| Hosts | localhost |
| Become | no |
| Roles | — |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 6ee0035a8dbb1eafdbf182e70ecf280f7546b6dec9f5402790f7359106cce7c2 |
| Section | Task | Module | Shell/command |
| --- | --- | --- | --- |
| tasks | Enforce Strict File Permissions on PRoot /etc | changed_when | no |
| tasks | Log Hardening Event to Loki | ansible.builtin.shell | yes |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/observability/maintenance.yml`
| Field | Value |
| --- | --- |
| Hosts | observability |
| Become | no |
| Roles | — |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | e26b150b11dd691e3179d4c7f656ba8bcda46dcacead7b56ad0126a1ddccc34d |
| Section | Task | Module | Shell/command |
| --- | --- | --- | --- |
| tasks | Run observability role | ansible.builtin.include_role | no |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/photoprism/playbook.yml`
| Field | Value |
| --- | --- |
| Hosts | workloads |
| Become | no |
| Roles | workloads/photoprism |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | f7722eb6fe797ed8a48231c55972a4c4e7ba8556675206347a88fef0ba9322a5 |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/secret_rotation/maintenance.yml`
| Field | Value |
| --- | --- |
| Hosts | localhost |
| Become | no |
| Roles | — |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 984cdf35de0969f901930bc518627f289542fa60600428079ce1fb5dc3f44282 |
| Section | Task | Module | Shell/command |
| --- | --- | --- | --- |
| tasks | Authenticate with Vault AppRole | no_log | no |
| tasks | Set dynamic Vault token | no_log | no |
| tasks | Rotate application secret in Vault | no_log | no |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/security_scanners/playbook.yml`
| Field | Value |
| --- | --- |
| Hosts | localhost |
| Become | no |
| Roles | — |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | bb79cdf8576c876175b7930c74c7eca7bbbcd57e43e98f58d1a311302dab286c |
| Section | Task | Module | Shell/command |
| --- | --- | --- | --- |
| tasks | Execute Trivy Rootfs Vulnerability Scan | changed_when | no |
| tasks | Execute Lynis Host Hardening Audit | changed_when | no |
| tasks | Emit Audit Summary to Promtail | ansible.builtin.debug | no |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/iac-catalog/tailscale_ztp/maintenance.yml`
| Field | Value |
| --- | --- |
| Hosts | localhost |
| Become | no |
| Roles | — |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 13207dcd0f3b8f6b01ee40792be6583911a6ddc504aa61884b516823f1c3f67e |
| Section | Task | Module | Shell/command |
| --- | --- | --- | --- |
| tasks | Authenticate with Vault AppRole | no_log | no |
| tasks | Set dynamic Vault token | no_log | no |
| tasks | Verify Tailscale API key exists in Vault | changed_when | no |
| tasks | Fail when Tailscale secret is missing | ansible.builtin.fail | no |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/00_preflight.yml`
| Field | Value |
| --- | --- |
| Hosts | common |
| Become | no |
| Roles | common |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | ffbf7bb631b4da17ae7b7515c7c3de5daae3b60944473ea2d1020db5e9dbe565 |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/10_vault.yml`
| Field | Value |
| --- | --- |
| Hosts | vault |
| Become | no |
| Roles | common, vault |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 62de42287aaec193d596eb98ffebc1fc18787eaba5c24f988f1c4fa3c5956c91 |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/20_mariadb.yml`
| Field | Value |
| --- | --- |
| Hosts | mariadb |
| Become | no |
| Roles | common, mariadb |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 5775668adc96600381415bfce674d49219ec39e7cbba7cb721f753f613b66c91 |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/30_gitea.yml`
| Field | Value |
| --- | --- |
| Hosts | gitea |
| Become | no |
| Roles | common, gitea, vault |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 8ad677cf189889fa5253c27fc38804e56eea3866d7e8ab27b328110904358f15 |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/40_opa.yml`
| Field | Value |
| --- | --- |
| Hosts | localhost |
| Become | no |
| Roles | opa |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 522a449e0f2131d73a04d44b06bd8eeb50d63089c714592701b7cd5eb865c36c |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/50_tailscale.yml`
| Field | Value |
| --- | --- |
| Hosts | tailscale |
| Become | no |
| Roles | common, tailscale |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 0b83033b8ff81ac3505322b5492bd1eb804a76ec9cf11525e4bb8cbfee5882a6 |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/60_caddy.yml`
| Field | Value |
| --- | --- |
| Hosts | caddy |
| Become | no |
| Roles | caddy, common |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | b98462d2e8dfbadef4674532ee933d8a6597c725968601a14913fef2d45fcbb0 |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/65_nats.yml`
| Field | Value |
| --- | --- |
| Hosts | nats |
| Become | no |
| Roles | common, nats |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 3cfc6554f605d204bedd2903546788afe2783ce45357705c319c362d6764b550 |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/70_fastapi_control_plane.yml`
| Field | Value |
| --- | --- |
| Hosts | fastapi_control_plane |
| Become | no |
| Roles | common, fastapi_control_plane |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | ecaf35c2afac1c88de16f0fbdda7e68ce26f9ebe1ad6e4986e9821ff6fc3b462 |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/80_catalog_seed.yml`
| Field | Value |
| --- | --- |
| Hosts | catalog_seed |
| Become | no |
| Roles | catalog_seed, common, gitea, vault |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | dd1e8a2ccab7dc1c57da1f17d1d13940fb008bba4360df88c4085c6fb3bbfb34 |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/90_workloads.yml`
| Field | Value |
| --- | --- |
| Hosts | workloads |
| Become | no |
| Roles | common, photoprism, vault |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 97e50d559f9a9bc70908a46075e7d11a6440ebce0da69d57f4ecbd87926930cc |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/95_backup_restore.yml`
| Field | Value |
| --- | --- |
| Hosts | backups |
| Become | no |
| Roles | backups, common |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 0c68ac44a932e622e94a506403675380f4231963a7b455f8e3731508164bb24a |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/97_gitea_runner.yml`
| Field | Value |
| --- | --- |
| Hosts | gitea |
| Become | no |
| Roles | common, gitea_runner |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 8c0b2329b774ed253f7bf08fe9783662a3e5ce09687435dd18b823e5898247f5 |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/98_observability.yml`
| Field | Value |
| --- | --- |
| Hosts | observability |
| Become | no |
| Roles | common, observability, vault |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 14892f5f7ca9c98c9e6e84e3150df0ac08f7c891d87b36a4774bb28324a434e6 |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/playbooks/99_drift_check.yml`
| Field | Value |
| --- | --- |
| Hosts | drift_check |
| Become | no |
| Roles | common, drift_check |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | 6dde3a495c0acd3e31f297ee20745b50ec9a1ba8b6d2220d8188a4e77e181445 |
### `pocket-lab-final-structure/pocket-lab-iac-api-compatible/site.yml`
| Field | Value |
| --- | --- |
| Hosts | — |
| Become | no |
| Roles | — |
| Vars | — |
| Vars files | — |
| Tags | — |
| SHA-256 | efbb0b05481b5c387d745b56751b74f083f4a97695dac93bc38cd9700d5a59ec |
