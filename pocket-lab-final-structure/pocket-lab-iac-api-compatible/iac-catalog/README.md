# iac-catalog

This repository is the Gitea catalog consumed by `pocket_lab_api_server.py`.

Rules:
- Each top-level directory is treated as a catalog item.
- Each item must contain `metadata.json`.
- Each item must contain either `playbook.yml` or `maintenance.yml`.
- Keep the repository focused on deployable catalog items only.
