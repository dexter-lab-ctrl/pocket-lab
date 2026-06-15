# Pocket Lab release workflow

This document records the exact end-to-end path used by the updated archive.

## Stage 1: Develop and validate locally

Files:
- `src/App.jsx`
- `src/components/Header.jsx`
- `src/components/OTAUpdater.jsx`
- `src/lib/operations.js`
- `src/tabs/ReleaseWorkflowTab.jsx`
- `pocket-lab-final-structure/runtime/core/control_plane_core.py`
- `pocket-lab-final-structure/runtime/core/release_workflow.py`

Subsystems:
- Frontend PWA
- Pocket Lab FastAPI/NATS control plane
- Typed operation client
- Workflow metadata service

Steps:
1. Edit the files above.
2. Run the frontend build.
3. Preview or validate the typed operations before release.

## Stage 2: Commit and publish the code release

Files:
- `Taskfile.yml`
- `pocket-lab-final-structure/README.md`
- `src/tabs/GitOpsTab.jsx`

Subsystems:
- GitHub repository
- Release tagging
- Taskfile
- GitOps UI

Steps:
1. Commit only source files and workflow docs.
2. Push the change set to the public GitHub repository.
3. Publish or update the release tag used by the updater.

## Stage 3: Sync repository state and refresh the catalog

Files:
- `src/tabs/GitOpsTab.jsx`
- `pocket-lab-final-structure/runtime/core/operations/service.py`
- `pocket-lab-final-structure/runtime/core/operations/registry.py`

Subsystems:
- GitOps subsystem
- Dulwich repository layer
- Catalog store
- Release workflow API

Steps:
1. Pull the new commit into the local repo cache.
2. Refresh the catalog so blueprint and app-store views show the new version.
3. Persist the repo snapshot and rollback pointer.

## Stage 4: Gate the release and deploy the target runtime

Files:
- `src/tabs/SecurityPostureTab.jsx`
- `src/tabs/IdentityVaultTab.jsx`
- `src/tabs/AppStoreTab.jsx`
- `src/tabs/BlueprintTab.jsx`
- `pocket-lab-final-structure/runtime/core/operations/service.py`
- `pocket-lab-final-structure/runtime/core/artifacts/oras_store.py`

Subsystems:
- Security guardrails
- Vault
- App Store
- Blueprint engine
- Ansible runner
- OCI store

Steps:
1. Take a backup snapshot before promotion.
2. Apply the blueprint or workload through the typed operation layer.
3. Rotate secrets only when the deployment path requires it.

## Stage 5: Verify drift, health, and user propagation

Files:
- `src/tabs/DriftCenterTab.jsx`
- `src/components/OTAUpdater.jsx`
- `src/main.jsx`
- `vite.config.js`
- `src/App.jsx`
- `pocket-lab-final-structure/runtime/core/control_plane_core.py`
- `pocket-lab-final-structure/runtime/core/release_auto_update.py`

Subsystems:
- Drift Center
- Health engine
- PWA auto-update
- Operations history
- User clients

Steps:
1. Run drift verification after deployment.
2. Check health and telemetry status.
3. Let the browser service worker pick up the new frontend bundle.
4. Let the release auto-updater detect, apply, and reload the instance without manual intervention.

The archive intentionally excludes the desktop-version future track.

## Stage 6: Auto-apply the release and refresh user instances

Files:
- `pocket-lab-final-structure/runtime/core/release_auto_update.py`
- `pocket-lab-final-structure/runtime/core/control_plane_core.py`
- `src/components/OTAUpdater.jsx`
- `src/main.jsx`
- `vite.config.js`

Subsystems:
- Release auto-updater
- GitHub Releases
- PWA service worker
- Browser clients
- Reload loop

Steps:
1. Detect a newer release tag from GitHub.
2. Automatically run backup, sync, deploy, and verify through the typed operations layer.
3. Mark the release applied, then let the PWA/service worker and browser reload pull the new bundle.

The archive intentionally excludes the desktop-version future track.
