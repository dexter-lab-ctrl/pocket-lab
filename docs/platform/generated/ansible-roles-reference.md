<!-- GENERATED FILE: do not edit by hand. Regenerate with `task docs:deployment`. -->

# Ansible Roles / Tasks Reference

This page is generated from role task, handler, defaults, template, and file sources.

## Role index

| Role | Path | Tasks | Modules | Shell/command | Templates | Files | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| backups | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups | 16 | ansible.builtin.copy, ansible.builtin.debug, ansible.builtin.file, ansible.builtin.template, changed_when | 0 | 4 | 0 | 2cbf8ab05164 |
| caddy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/caddy | 5 | ansible.builtin.copy, ansible.builtin.debug, ansible.builtin.file, ansible.builtin.template, changed_when | 0 | 1 | 0 | 69b46b79a3bb |
| catalog_seed | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed | 13 | ansible.builtin.assert, ansible.builtin.copy, ansible.builtin.debug, ansible.builtin.file, ansible.builtin.stat, block, changed_when, run_once | 0 | 0 | 0 | 74b4ba78c958 |
| common | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/common | 5 | ansible.builtin.assert, ansible.builtin.copy, ansible.builtin.debug, ansible.builtin.file, changed_when | 0 | 0 | 0 | d90a2039b9f3 |
| drift_check | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check | 20 | ansible.builtin.copy, ansible.builtin.debug, ansible.builtin.fail, ansible.builtin.file, ansible.builtin.set_fact, ansible.builtin.template, changed_when, failed_when | 0 | 2 | 0 | f20f230dc35b |
| fastapi_control_plane | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane | 11 | ansible.builtin.assert, ansible.builtin.copy, ansible.builtin.debug, ansible.builtin.fail, ansible.builtin.file, ansible.builtin.stat, ignore_errors | 0 | 0 | 0 | 0b84d0c1d9e9 |
| gitea | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea | 18 | ansible.builtin.assert, ansible.builtin.copy, ansible.builtin.debug, ansible.builtin.file, changed_when, loop_control, no_log | 0 | 1 | 0 | 2237be5afac5 |
| gitea_runner | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner | 11 | ansible.builtin.debug, ansible.builtin.file, changed_when, loop_control, no_log, until | 0 | 1 | 0 | 04a2fccfbac7 |
| mariadb | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/mariadb | 7 | ansible.builtin.assert, ansible.builtin.copy, ansible.builtin.debug, ansible.builtin.file, changed_when, loop_control | 0 | 0 | 0 | 775e162d093e |
| nats | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats | 10 | ansible.builtin.assert, ansible.builtin.copy, ansible.builtin.debug, ansible.builtin.file, changed_when, failed_when, no_log | 0 | 1 | 0 | ed056528453b |
| observability | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability | 7 | ansible.builtin.file, ansible.builtin.template, changed_when | 0 | 5 | 0 | ac32cbf46342 |
| opa | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/opa | 5 | ansible.builtin.file, ansible.builtin.get_url, ansible.builtin.pip, ansible.builtin.template | 0 | 4 | 0 | 2e5b251b9dde |
| tailscale | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale | 11 | ansible.builtin.copy, ansible.builtin.debug, ansible.builtin.file, ansible.builtin.get_url, ansible.builtin.pause, args, changed_when, no_log | 0 | 0 | 0 | 491d089b756e |
| vault | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault | 25 | ansible.builtin.assert, ansible.builtin.copy, ansible.builtin.debug, ansible.builtin.file, ansible.builtin.pause, ansible.builtin.template, changed_when, loop_control, no_log | 0 | 1 | 0 | e3cb96cc9349 |


## Role details

### `backups`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/backups_tasks_main.yml, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/main.yml |
| Handler files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/handlers/backups_handlers_main.yml, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/handlers/main.yml |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/defaults/backups_defaults_main.yml, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/defaults/main.yml |
| Templates | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/templates/backup.sh.j2, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/templates/backups_templates_backup.sh.j2, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/templates/backups_templates_restore.sh.j2, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/templates/restore.sh.j2 |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | — |
| Task | Module | Source |
| --- | --- | --- |
| backups \| ensure backup directory exists | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/backups_tasks_main.yml |
| backups \| render backup script | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/backups_tasks_main.yml |
| backups \| render restore script | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/backups_tasks_main.yml |
| backups \| write retention manifest | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/backups_tasks_main.yml |
| backups \| validate backup script syntax | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/backups_tasks_main.yml |
| backups \| validate restore script syntax | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/backups_tasks_main.yml |
| backups \| summarize | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/backups_tasks_main.yml |
| backups \| ensure backup directory exists | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/main.yml |
| backups \| render backup script | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/main.yml |
| backups \| render restore script | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/main.yml |
| backups \| write retention manifest | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/main.yml |
| backups \| validate backup script syntax | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/main.yml |
| backups \| validate restore script syntax | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/main.yml |
| backups \| summarize | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/tasks/main.yml |
| backups configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/handlers/backups_handlers_main.yml |
| backups configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/backups/handlers/main.yml |
### `caddy`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/caddy |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/caddy/tasks/main.yml |
| Handler files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/caddy/handlers/main.yml |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/caddy/defaults/main.yml |
| Templates | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/caddy/templates/Caddyfile.j2 |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | — |
| Task | Module | Source |
| --- | --- | --- |
| caddy \| ensure directories exist | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/caddy/tasks/main.yml |
| caddy \| render reverse proxy configuration | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/caddy/tasks/main.yml |
| caddy \| validate configuration | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/caddy/tasks/main.yml |
| caddy \| persist route summary | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/caddy/tasks/main.yml |
| caddy configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/caddy/handlers/main.yml |
### `catalog_seed`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/tasks/main.yml |
| Handler files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/handlers/main.yml |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/defaults/main.yml |
| Templates | — |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | — |
| Task | Module | Source |
| --- | --- | --- |
| catalog_seed \| validate inputs | ansible.builtin.assert | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/tasks/main.yml |
| catalog_seed \| ensure source tree exists | run_once | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/tasks/main.yml |
| catalog_seed \| fail when source tree is missing | ansible.builtin.assert | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/tasks/main.yml |
| catalog_seed \| ensure destination exists | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/tasks/main.yml |
| catalog_seed \| copy catalog tree into local checkout | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/tasks/main.yml |
| catalog_seed \| ensure .git exists | ansible.builtin.stat | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/tasks/main.yml |
| catalog_seed \| initialize git repository when absent | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/tasks/main.yml |
| catalog_seed \| configure git identity | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/tasks/main.yml |
| catalog_seed \| stage tree when changed or repo is new | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/tasks/main.yml |
| catalog_seed \| create initial commit when repository is new | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/tasks/main.yml |
| catalog_seed \| set origin remote | block | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/tasks/main.yml |
| catalog_seed \| push to remote when enabled | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/tasks/main.yml |
| catalog_seed configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/catalog_seed/handlers/main.yml |
### `common`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/common |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/common/tasks/main.yml |
| Handler files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/common/handlers/main.yml |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/common/defaults/main.yml |
| Templates | — |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | — |
| Task | Module | Source |
| --- | --- | --- |
| common \| validate environment | ansible.builtin.assert | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/common/tasks/main.yml |
| common \| validate required commands | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/common/tasks/main.yml |
| common \| create shared directories | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/common/tasks/main.yml |
| common \| write runtime metadata | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/common/tasks/main.yml |
| common configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/common/handlers/main.yml |
### `drift_check`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/main.yml |
| Handler files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/handlers/drift_check_handler_main.yml, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/handlers/main.yml |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/defaults/drift_check_defaults_main.yml, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/defaults/main.yml |
| Templates | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/templates/drift_check_templates_healthcheck.sh.j2, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/templates/healthcheck.sh.j2 |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | — |
| Task | Module | Source |
| --- | --- | --- |
| drift_check \| ensure drift directories exist | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml |
| drift_check \| derive timestamp and job id | ansible.builtin.set_fact | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml |
| drift_check \| initialize job containers | ansible.builtin.set_fact | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml |
| drift_check \| probe HTTP endpoints | failed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml |
| drift_check \| run command-based checks | failed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml |
| drift_check \| normalize endpoint results | ansible.builtin.set_fact | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml |
| drift_check \| normalize command results | ansible.builtin.set_fact | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml |
| drift_check \| compute overall status | ansible.builtin.set_fact | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml |
| drift_check \| build drift report object | ansible.builtin.set_fact | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml |
| drift_check \| persist latest drift report | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml |
| drift_check \| persist history snapshot | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml |
| drift_check \| summarize monitored targets | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml |
| drift_check \| fail only when explicitly enabled | ansible.builtin.fail | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/drift_check_tasks_main.yml |
| drift_check \| ensure log directory exists | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/main.yml |
| drift_check \| render health check runner | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/main.yml |
| drift_check \| run health checks | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/main.yml |
| drift_check \| persist drift report | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/main.yml |
| drift_check \| summarize monitored endpoints | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/tasks/main.yml |
| drift_check configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/handlers/drift_check_handler_main.yml |
| drift_check configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/drift_check/handlers/main.yml |
### `fastapi_control_plane`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/tasks/main.yml |
| Handler files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/handlers/main.yml |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/defaults/main.yml |
| Templates | — |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | — |
| Task | Module | Source |
| --- | --- | --- |
| fastapi_control_plane \| ensure directories exist | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/tasks/main.yml |
| fastapi_control_plane \| verify NATS credentials env file exists | ansible.builtin.stat | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/tasks/main.yml |
| fastapi_control_plane \| verify NATS server config exists | ansible.builtin.stat | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/tasks/main.yml |
| fastapi_control_plane \| fail when NATS credentials/config are missing in production mode | ansible.builtin.fail | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/tasks/main.yml |
| fastapi_control_plane \| verify NATS monitor is running | ignore_errors | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/tasks/main.yml |
| fastapi_control_plane \| fail when NATS monitor is unavailable in production mode | ansible.builtin.fail | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/tasks/main.yml |
| fastapi_control_plane \| verify JetStream is enabled | ansible.builtin.assert | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/tasks/main.yml |
| fastapi_control_plane \| verify FastAPI process is running | ignore_errors | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/tasks/main.yml |
| fastapi_control_plane \| warn if control plane is down | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/tasks/main.yml |
| fastapi_control_plane \| persist asset manifest | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/tasks/main.yml |
| fastapi_control_plane configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/fastapi_control_plane/handlers/main.yml |
### `gitea`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| Handler files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/handlers/main.yml |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/defaults/main.yml |
| Templates | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/templates/app.ini.j2 |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | — |
| Task | Module | Source |
| --- | --- | --- |
| gitea \| validate inputs | ansible.builtin.assert | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| determine Vault auth token | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| login with AppRole when token is absent | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| select AppRole token | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| ensure token is available | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| fetch secret bundle from Vault | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| extract secret values | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| validate secrets | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| ensure directories exist | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| render runtime config | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| validate API reachability | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| query existing repos | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| query existing orgs | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| create missing organizations | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| create missing repositories | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| update repository defaults | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea \| persist desired state manifest | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/tasks/main.yml |
| gitea configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea/handlers/main.yml |
### `gitea_runner`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/tasks/main.yml |
| Handler files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/handlers/main.yml |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/defaults/main.yml |
| Templates | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/templates/config.yaml.j2 |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | — |
| Task | Module | Source |
| --- | --- | --- |
| gitea_runner \| validate inputs | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/tasks/main.yml |
| gitea_runner \| ensure base directory exists | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/tasks/main.yml |
| gitea_runner \| wait for Gitea API to be reachable | until | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/tasks/main.yml |
| gitea_runner \| fetch global registration token | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/tasks/main.yml |
| gitea_runner \| ensure individual runner directories exist | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/tasks/main.yml |
| gitea_runner \| render runner configurations | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/tasks/main.yml |
| gitea_runner \| read Vault AppRole identities | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/tasks/main.yml |
| gitea_runner \| inject Zero-Trust .env files | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/tasks/main.yml |
| gitea_runner \| register runners with Gitea | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/tasks/main.yml |
| gitea_runner \| start isolated runners natively via PM2 | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/tasks/main.yml |
| gitea_runner configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/gitea_runner/handlers/main.yml |
### `mariadb`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/mariadb |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/mariadb/tasks/main.yml |
| Handler files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/mariadb/handlers/main.yml |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/mariadb/defaults/main.yml |
| Templates | — |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | — |
| Task | Module | Source |
| --- | --- | --- |
| mariadb \| validate inputs | ansible.builtin.assert | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/mariadb/tasks/main.yml |
| mariadb \| ensure directories exist | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/mariadb/tasks/main.yml |
| mariadb \| ensure service socket is present | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/mariadb/tasks/main.yml |
| mariadb \| create databases | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/mariadb/tasks/main.yml |
| mariadb \| create and secure users | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/mariadb/tasks/main.yml |
| mariadb \| store manifest | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/mariadb/tasks/main.yml |
| mariadb configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/mariadb/handlers/main.yml |
### `nats`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/tasks/main.yml |
| Handler files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/handlers/main.yml |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/defaults/main.yml |
| Templates | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/templates/nats-server.conf.j2 |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | — |
| Task | Module | Source |
| --- | --- | --- |
| nats \| validate production posture | ansible.builtin.assert | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/tasks/main.yml |
| nats \| verify nats-server binary is installed | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/tasks/main.yml |
| nats \| ensure config and store directories exist | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/tasks/main.yml |
| nats \| derive persistent credentials | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/tasks/main.yml |
| nats \| write runtime credentials env file for launcher and agents | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/tasks/main.yml |
| nats \| render authenticated JetStream server config | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/tasks/main.yml |
| nats \| write non-secret manifest | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/tasks/main.yml |
| nats \| probe monitor endpoint when service is already running | failed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/tasks/main.yml |
| nats \| report startup command when NATS is not yet running | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/tasks/main.yml |
| nats configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/nats/handlers/main.yml |
### `observability`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/tasks/main.yml |
| Handler files | — |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/defaults/main.yml |
| Templates | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/custom.ini.j2, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/gatus-config.yaml.j2, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/loki-config.yaml.j2, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/prometheus.yml.j2, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/templates/promtail-config.yaml.j2 |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | — |
| Task | Module | Source |
| --- | --- | --- |
| observability \| ensure PRoot application directories exist | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/tasks/main.yml |
| observability \| render Loki config | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/tasks/main.yml |
| observability \| render Promtail config | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/tasks/main.yml |
| observability \| render Gatus config | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/tasks/main.yml |
| observability \| render Prometheus config | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/tasks/main.yml |
| observability \| render Grafana custom.ini | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/tasks/main.yml |
| observability \| orchestrate services via PM2 Bridge | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/observability/tasks/main.yml |
### `opa`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/opa |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/opa/tasks/main.yml |
| Handler files | — |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/opa/defaults/main.yml |
| Templates | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/opa/templates/execution.rego.j2, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/opa/templates/opa_interceptor.py.j2, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/opa/templates/ports.rego.j2, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/opa/templates/secrets.rego.j2 |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | opa \| Install PyYAML for interceptor parsing |
| Task | Module | Source |
| --- | --- | --- |
| opa \| Install PyYAML for interceptor parsing | ansible.builtin.pip | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/opa/tasks/main.yml |
| opa \| Download OPA ARM64 binary | ansible.builtin.get_url | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/opa/tasks/main.yml |
| opa \| Ensure policies directory exists | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/opa/tasks/main.yml |
| opa \| Deploy Rego policies | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/opa/tasks/main.yml |
| opa \| Deploy Gatekeeper Interceptor script | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/opa/tasks/main.yml |
### `tailscale`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/tasks/main.yml |
| Handler files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/handlers/main.yml |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/defaults/main.yml |
| Templates | — |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | — |
| Task | Module | Source |
| --- | --- | --- |
| tailscale \| ensure patched state directory exists | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/tasks/main.yml |
| tailscale \| download bropines patched installer | ansible.builtin.get_url | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/tasks/main.yml |
| tailscale \| execute patched installer | args | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/tasks/main.yml |
| tailscale \| render env file for patched daemon | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/tasks/main.yml |
| tailscale \| start patched daemon wrapper | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/tasks/main.yml |
| tailscale \| wait for daemon to initialize | ansible.builtin.pause | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/tasks/main.yml |
| tailscale \| authenticate when auth key is provided | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/tasks/main.yml |
| tailscale \| capture status | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/tasks/main.yml |
| tailscale \| persist status snapshot | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/tasks/main.yml |
| tailscale \| summarize state | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/tasks/main.yml |
| tailscale configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/tailscale/handlers/main.yml |
### `vault`
| Field | Value |
| --- | --- |
| Path | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault |
| Task files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/export_approle_ids.yml, pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| Handler files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/handlers/main.yml |
| Default files | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/defaults/main.yml |
| Templates | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/templates/vault.hcl.j2 |
| Files | — |
| Shell/command tasks | — |
| Service tasks | — |
| Package tasks | — |
| Task | Module | Source |
| --- | --- | --- |
| vault \| read role id | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/export_approle_ids.yml |
| vault \| create secret id | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/export_approle_ids.yml |
| vault \| store AppRole bundle | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/export_approle_ids.yml |
| vault \| validate inputs | ansible.builtin.assert | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| ensure directories exist | ansible.builtin.file | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| render configuration | ansible.builtin.template | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| start vault daemon natively via PM2 | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| wait for daemon to initialize | ansible.builtin.pause | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| probe health endpoint | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| determine auth method | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| login with AppRole when token is absent | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| select AppRole token | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| ensure token available | no_log | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| read current mounts | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| enable mounts | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| configure audit device | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| apply policies | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| configure database connections | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| configure database roles | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| enable AppRole auth | changed_when | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| reconcile AppRole roles | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| export AppRole ids when requested | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| write secret bundles | loop_control | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault \| write audit summary | ansible.builtin.copy | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/tasks/main.yml |
| vault configuration updated | ansible.builtin.debug | pocket-lab-final-structure/pocket-lab-iac-api-compatible/roles/vault/handlers/main.yml |
