#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

UBUNTU_NAME="${UBUNTU_NAME:-ubuntu}"

main() {
  ensure_root_dirs
  require_cmd proot-distro

  if ! proot-distro list 2>/dev/null | grep -qE "^${UBUNTU_NAME}$"; then
    log INFO "Installing proot distro: ${UBUNTU_NAME}"
    proot-distro install "$UBUNTU_NAME"
  else
    log INFO "proot distro already installed: ${UBUNTU_NAME}"
  fi

  local wrapper_dir="$PREFIX/bin"
  ensure_dir_perm "$wrapper_dir" 755

  log INFO "Installing Ansible and tooling inside proot Ubuntu"
  proot-distro login "$UBUNTU_NAME" -- bash -lc '
    set -Eeuo pipefail
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y ansible python3 python3-pip python3-venv python3-yaml openssh-client sshpass curl jq git ca-certificates gnupg lsb-release rsync unzip tar gzip
    python3 -m pip install --no-cache-dir --upgrade pip
    python3 -m pip install --no-cache-dir jmespath netaddr
  '

  log INFO "Creating native wrapper scripts for Guest OS tools..."
  cat > "$PREFIX/bin/ansible" <<EOF
#!/data/data/com.termux/files/usr/bin/bash
exec proot-distro login ${UBUNTU_NAME} -- ansible "\$@"
EOF
  chmod +x "$PREFIX/bin/ansible"

  cat > "$PREFIX/bin/ansible-playbook" <<EOF
#!/data/data/com.termux/files/usr/bin/bash
exec proot-distro login ${UBUNTU_NAME} -- ansible-playbook "\$@"
EOF
  chmod +x "$PREFIX/bin/ansible-playbook"

  log INFO "PRoot Ubuntu Guest OS provisioned successfully."
}

main "$@"