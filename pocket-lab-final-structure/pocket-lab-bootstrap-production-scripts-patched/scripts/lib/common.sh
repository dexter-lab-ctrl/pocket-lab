#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
IFS=$'\n\t'

export HOME="${HOME:-/data/data/com.termux/files/home}"
export PREFIX="${PREFIX:-/data/data/com.termux/files/usr}"

STATE_DIR="${STATE_DIR:-$HOME/.pocket_lab}"
LOG_DIR="${LOG_DIR:-$HOME/pocket_lab_logs}"
RUN_DIR="${RUN_DIR:-$HOME/pocket_lab_run}"
mkdir -p "$STATE_DIR" "$LOG_DIR" "$RUN_DIR"

export TERMUX_PREFIX="$PREFIX"

timestamp() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
log() { printf '[%s] [%s] %s\n' "$(timestamp)" "${1:-INFO}" "${*:2}"; }
die() { log FATAL "$*"; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

trap 'die "Unexpected error at line $LINENO while running: ${BASH_COMMAND:-unknown}"' ERR

ensure_root_dirs() {
  mkdir -p "$STATE_DIR" "$LOG_DIR" "$RUN_DIR"
  chmod 700 "$STATE_DIR" "$LOG_DIR" "$RUN_DIR" 2>/dev/null || true
}

require_cmd() {
  for c in "$@"; do have "$c" || die "Required command missing: $c"; done
}

wait_for_tcp() {
  local host="$1" port="$2" timeout="${3:-60}" i
  for i in $(seq 1 "$timeout"); do
    if nc -z "$host" "$port" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  return 1
}

wait_for_http() {
  local url="$1" timeout="${2:-60}" i
  for i in $(seq 1 "$timeout"); do
    if curl -fsS "$url" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  return 1
}

download_file() {
  local url="$1" dest="$2"
  mkdir -p "$(dirname "$dest")"
  curl -fsSL "$url" -o "$dest"
}

download_if_missing() {
  local url="$1" dest="$2"
  if [[ -f "$dest" ]]; then
    log INFO "Already present: $dest"
    return 0
  fi
  log INFO "Downloading $url"
  download_file "$url" "$dest"
}

safe_cp() {
  local src="$1" dst="$2"
  install -m 0644 "$src" "$dst"
}

render_template() {
  local tpl="$1" dst="$2"
  shift 2
  export "$@"
  envsubst < "$tpl" > "$dst"
}

json_get() {
  jq -r "$1" "${2:--}"
}

write_secret_file() {
  local file="$1"
  shift
  umask 077
  : > "$file"
  for kv in "$@"; do
    printf '%s\n' "$kv" >> "$file"
  done
  chmod 600 "$file"
}

ensure_pkg_installed() {
  local pkg="$1"
  if dpkg -s "$pkg" >/dev/null 2>&1; then
    log INFO "Package already installed: $pkg"
    return 0
  fi
  log INFO "Installing package: $pkg"
  yes "" | pkg install -y "$pkg"
}

sha256_verify() {
  local file="$1" expected="$2"
  [[ -n "$expected" ]] || die "Missing expected SHA256 for $file"
  echo "${expected}  ${file}" | sha256sum -c -
}

ensure_line_in_file() {
  local line="$1" file="$2"
  grep -Fxq "$line" "$file" 2>/dev/null || echo "$line" >> "$file"
}

backup_file_if_exists() {
  local src="$1" suffix="${2:-bak}"
  [[ -f "$src" ]] || return 0
  cp -f "$src" "${src}.${suffix}"
}

ensure_dir_perm() {
  local dir="$1" mode="${2:-700}"
  mkdir -p "$dir"
  chmod "$mode" "$dir" || true
}

retry() {
  local tries="${1:-5}" delay="${2:-2}"
  shift 2
  local n=1
  until "$@"; do
    if (( n >= tries )); then
      return 1
    fi
    sleep "$delay"
    n=$((n+1))
  done
}

cleanup_pidfile() {
  local pidfile="$1"
  [[ -f "$pidfile" ]] || return 0
  local pid
  pid="$(cat "$pidfile" 2>/dev/null || true)"
  [[ -n "${pid:-}" ]] && kill "$pid" >/dev/null 2>&1 || true
  rm -f "$pidfile"
}
