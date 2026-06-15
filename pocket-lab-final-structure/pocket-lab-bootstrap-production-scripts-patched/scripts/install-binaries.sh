#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/common.sh"
VAULT_VERSION="${VAULT_VERSION:-2.0.0}"; ACT_RUNNER_VERSION="${ACT_RUNNER_VERSION:-0.2.10}"
PROM_VERSION="${PROM_VERSION:-2.51.0}"; GRAFANA_VERSION="${GRAFANA_VERSION:-13.0.1}"; LOKI_VERSION="${LOKI_VERSION:-3.7.2}"; PROMTAIL_VERSION="${PROMTAIL_VERSION:-3.0.0}"
TRIVY_VERSION="${TRIVY_VERSION:-0.70.0}"; LYNIS_VERSION="${LYNIS_VERSION:-3.1.6}"; GATUS_VERSION="${GATUS_VERSION:-5.36.0}"
TASK_VERSION="${TASK_VERSION:-latest}"; GO_GETTER_VERSION="${GO_GETTER_VERSION:-latest}"; ORAS_VERSION="${ORAS_VERSION:-latest}"
ARCH="${ARCH:-linux_arm64}"; STATE_BIN_DIR="${STATE_BIN_DIR:-$STATE_DIR/bin}"; CHECKSUM_DIR="${CHECKSUM_DIR:-$STATE_DIR/checksums}"

install_vault() {
  if have vault; then log INFO "Vault already installed"; return 0; fi
  local zip="$STATE_DIR/vault_${VAULT_VERSION}_${ARCH}.zip"
  download_if_missing "https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_${ARCH}.zip" "$zip"
  local sum_file="$CHECKSUM_DIR/vault-${VAULT_VERSION}.sha256"
  [[ -f "$sum_file" ]] && sha256_verify "$zip" "$(awk '{print $1}' "$sum_file")"
  unzip -o "$zip" -d "$STATE_DIR" >/dev/null
  install -m 0755 "$STATE_DIR/vault" "$PREFIX/bin/vault"
  rm -f "$STATE_DIR/vault" "$zip"
}
install_act_runner() {
  if have act_runner; then log INFO "act_runner already installed"; return 0; fi
  local bin="$STATE_DIR/act_runner_${ACT_RUNNER_VERSION}_${ARCH}"
  download_if_missing "https://gitea.com/gitea/act_runner/releases/download/v${ACT_RUNNER_VERSION}/act_runner-${ACT_RUNNER_VERSION}-${ARCH}" "$bin"
  install -m 0755 "$bin" "$PREFIX/bin/act_runner"; rm -f "$bin"
}
install_go_binary() {
  local cmd="$1" module="$2" version="$3"
  if have "$cmd"; then log INFO "$cmd already installed"; return 0; fi
  require_cmd go
  log INFO "Installing $cmd with go install"
  GOBIN="$PREFIX/bin" GO111MODULE=on go install "${module}@${version}"
}
ensure_python_runtime() {
  require_cmd python3
  log INFO "Ensuring Python runtime packages"
  python3 - <<'PYCHK' || python3 -m pip install --user --upgrade --no-cache-dir dulwich ansible-runner ansible-core fastapi "uvicorn[standard]" pydantic nats-py
import importlib.util, sys
required = ("dulwich", "ansible_runner", "fastapi", "uvicorn", "pydantic", "nats")
sys.exit(0 if all(importlib.util.find_spec(m) for m in required) else 1)
PYCHK
}
install_proot_stack() {
  if ! have proot-distro || ! proot-distro list 2>/dev/null | awk '{print $1}' | grep -Fxq ubuntu; then
    log WARN "PRoot Ubuntu is not ready; skipping observability/security guest binaries"
    return 0
  fi
  log INFO "Ensuring observability/security binaries inside PRoot Ubuntu"
  proot-distro login ubuntu -- bash -lc "
    set -Eeuo pipefail
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq >/dev/null 2>&1 || true
    apt-get install -y -qq curl unzip tar ca-certificates >/dev/null 2>&1 || true
    mkdir -p /tmp/pocketlab-downloads /usr/local/bin /opt
    cd /tmp/pocketlab-downloads
    if ! command -v prometheus >/dev/null 2>&1; then curl -fsSLO https://github.com/prometheus/prometheus/releases/download/v${PROM_VERSION}/prometheus-${PROM_VERSION}.linux-arm64.tar.gz && tar -xzf prometheus-${PROM_VERSION}.linux-arm64.tar.gz && install -m 0755 prometheus-${PROM_VERSION}.linux-arm64/prometheus /usr/local/bin/prometheus && install -m 0755 prometheus-${PROM_VERSION}.linux-arm64/promtool /usr/local/bin/promtool; fi
    if ! command -v grafana-server >/dev/null 2>&1; then curl -fsSLO https://dl.grafana.com/oss/release/grafana-${GRAFANA_VERSION}.linux-arm64.tar.gz && tar -xzf grafana-${GRAFANA_VERSION}.linux-arm64.tar.gz && rm -rf /opt/grafana && mv grafana-${GRAFANA_VERSION} /opt/grafana && ln -sf /opt/grafana/bin/grafana-server /usr/local/bin/grafana-server; fi
    if ! command -v loki >/dev/null 2>&1; then curl -fsSLO https://github.com/grafana/loki/releases/download/v${LOKI_VERSION}/loki-linux-arm64.zip && unzip -qo loki-linux-arm64.zip && install -m 0755 loki-linux-arm64 /usr/local/bin/loki; fi
    if ! command -v promtail >/dev/null 2>&1; then curl -fsSLO https://github.com/grafana/loki/releases/download/v${PROMTAIL_VERSION}/promtail-linux-arm64.zip && unzip -qo promtail-linux-arm64.zip && install -m 0755 promtail-linux-arm64 /usr/local/bin/promtail; fi
    if ! command -v trivy >/dev/null 2>&1; then curl -fsSLO https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}/trivy_${TRIVY_VERSION}_Linux-ARM64.tar.gz && tar -xzf trivy_${TRIVY_VERSION}_Linux-ARM64.tar.gz && install -m 0755 trivy /usr/local/bin/trivy; fi
    if [ ! -d /opt/lynis ]; then curl -fsSLO https://github.com/CISOfy/lynis/archive/refs/tags/${LYNIS_VERSION}.tar.gz && tar -xzf ${LYNIS_VERSION}.tar.gz && rm -rf /opt/lynis && mv lynis-${LYNIS_VERSION} /opt/lynis && ln -sf /opt/lynis/lynis /usr/local/bin/lynis; fi
    rm -rf /tmp/pocketlab-downloads
  "
}
main() {
  SCRIPT_NAME="install-binaries.sh"; acquire_lock "$SCRIPT_NAME"; ensure_root_dirs; require_termux
  ensure_dir_perm "$STATE_BIN_DIR" 755; ensure_dir_perm "$CHECKSUM_DIR" 700
  require_cmd curl unzip tar sha256sum
  install_vault; install_act_runner
  install_go_binary gatus github.com/TwiN/gatus/v5 "v${GATUS_VERSION}"
  install_go_binary nats-server github.com/nats-io/nats-server/v2 latest
  ensure_python_runtime
  install_go_binary task github.com/go-task/task/v3/cmd/task "$TASK_VERSION"
  install_go_binary go-getter github.com/hashicorp/go-getter/cmd/go-getter "$GO_GETTER_VERSION"
  install_go_binary oras oras.land/oras/cmd/oras "$ORAS_VERSION"
  install_proot_stack
  mark_done binaries_ready
  log INFO "Native and PRoot binary layer is ready and safe to rerun"
}
main "$@"
