#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

VAULT_VERSION="${VAULT_VERSION:-2.0.0}"
ACT_RUNNER_VERSION="${ACT_RUNNER_VERSION:-0.2.10}"

# Observability Versions
PROM_VERSION="${PROM_VERSION:-2.51.0}"
GRAFANA_VERSION="${GRAFANA_VERSION:-13.0.1}"
LOKI_VERSION="${LOKI_VERSION:-3.7.2}"
PROMTAIL_VERSION="${PROMTAIL_VERSION:-3.0.0}"

# DevSecOps Versions
TRIVY_VERSION="${TRIVY_VERSION:-0.70.0}"
LYNIS_VERSION="${LYNIS_VERSION:-3.1.6}"

ARCH="${ARCH:-linux_arm64}"
STATE_BIN_DIR="${STATE_BIN_DIR:-$STATE_DIR/bin}"
CHECKSUM_DIR="${CHECKSUM_DIR:-$STATE_DIR/checksums}"

main() {
  ensure_root_dirs
  ensure_dir_perm "$STATE_BIN_DIR" 755
  ensure_dir_perm "$CHECKSUM_DIR" 700
  require_cmd curl unzip tar sha256sum proot-distro

  local vault_zip="$STATE_DIR/vault_${VAULT_VERSION}_${ARCH}.zip"
  local act_runner_bin="$STATE_DIR/act_runner_${ACT_RUNNER_VERSION}_${ARCH}"

  # 1. Vault (Native)
  if ! have vault; then
    log INFO "Downloading Vault ${VAULT_VERSION}..."
    download_if_missing "https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_${ARCH}.zip" "$vault_zip"
    
    local vault_sum_file="$CHECKSUM_DIR/vault-${VAULT_VERSION}.sha256"
    if [[ -f "$vault_sum_file" ]]; then
      local expected
      expected="$(awk '{print $1}' "$vault_sum_file")"
      sha256_verify "$vault_zip" "$expected"
    fi
    
    unzip -o "$vault_zip" -d "$STATE_DIR" >/dev/null
    install -m 0755 "$STATE_DIR/vault" "$PREFIX/bin/vault"
    rm -f "$vault_zip" "$STATE_DIR/vault"
  else
    log INFO "Vault already installed"
  fi

  # 2. act_runner (Native)
  if ! command -v act_runner >/dev/null 2>&1; then
    log INFO "Downloading act_runner ${ACT_RUNNER_VERSION} natively..."
    download_if_missing "https://gitea.com/gitea/act_runner/releases/download/v${ACT_RUNNER_VERSION}/act_runner-${ACT_RUNNER_VERSION}-${ARCH}" "$act_runner_bin"
    install -m 0755 "$act_runner_bin" "$PREFIX/bin/act_runner"
    rm -f "$act_runner_bin"
  else
    log INFO "act_runner already installed"
  fi

  # 3. Observability & Security Stack (PRoot Ubuntu Execution)
  log INFO "Ensuring Observability and Security binaries inside PRoot Ubuntu..."
  proot-distro login ubuntu -- bash -c "
    set -e
    apt-get update -qq >/dev/null 2>&1 || true
    apt-get install -y -qq curl unzip tar >/dev/null 2>&1 || true

    mkdir -p /tmp/downloads
    cd /tmp/downloads
    
    # Prometheus
    if ! command -v prometheus >/dev/null 2>&1; then
      echo 'Downloading Prometheus...'
      curl -fsSLO https://github.com/prometheus/prometheus/releases/download/v${PROM_VERSION}/prometheus-${PROM_VERSION}.linux-arm64.tar.gz
      tar -xzf prometheus-${PROM_VERSION}.linux-arm64.tar.gz
      mv prometheus-${PROM_VERSION}.linux-arm64/prometheus /usr/local/bin/
      mv prometheus-${PROM_VERSION}.linux-arm64/promtool /usr/local/bin/
    fi
    
    # Grafana
    if ! command -v grafana-server >/dev/null 2>&1; then
      echo 'Downloading Grafana...'
      curl -fsSLO https://dl.grafana.com/oss/release/grafana-${GRAFANA_VERSION}.linux-arm64.tar.gz
      tar -xzf grafana-${GRAFANA_VERSION}.linux-arm64.tar.gz
      mv grafana-${GRAFANA_VERSION} /opt/grafana
      ln -sf /opt/grafana/bin/grafana-server /usr/local/bin/grafana-server
    fi
    
    # Loki
    if ! command -v loki >/dev/null 2>&1; then
      echo 'Downloading Loki...'
      curl -fsSLO https://github.com/grafana/loki/releases/download/v${LOKI_VERSION}/loki-linux-arm64.zip
      unzip -qo loki-linux-arm64.zip
      mv loki-linux-arm64 /usr/local/bin/loki
      chmod +x /usr/local/bin/loki
    fi
    
    # Promtail
    if ! command -v promtail >/dev/null 2>&1; then
      echo 'Downloading Promtail...'
      curl -fsSLO https://github.com/grafana/loki/releases/download/v${PROMTAIL_VERSION}/promtail-linux-arm64.zip
      unzip -qo promtail-linux-arm64.zip
      mv promtail-linux-arm64 /usr/local/bin/promtail
      chmod +x /usr/local/bin/promtail
    fi

    # Trivy (Vulnerability Scanner)
    if ! command -v trivy >/dev/null 2>&1; then
      echo 'Downloading Trivy...'
      curl -fsSLO https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}/trivy_${TRIVY_VERSION}_Linux-ARM64.tar.gz
      tar -xzf trivy_${TRIVY_VERSION}_Linux-ARM64.tar.gz
      mv trivy /usr/local/bin/trivy
      chmod +x /usr/local/bin/trivy
    fi

    # Lynis (Host Hardening)
    if [ ! -d '/opt/lynis' ]; then
      echo 'Downloading Lynis...'
      curl -fsSLO https://github.com/CISOfy/lynis/archive/refs/tags/${LYNIS_VERSION}.tar.gz
      tar -xzf ${LYNIS_VERSION}.tar.gz
      mv lynis-${LYNIS_VERSION} /opt/lynis
      ln -sf /opt/lynis/lynis /usr/local/bin/lynis
    fi
    
    cd /
    rm -rf /tmp/downloads
  "
  log INFO "Observability and Security stacks successfully staged in PRoot."
}

main "$@"