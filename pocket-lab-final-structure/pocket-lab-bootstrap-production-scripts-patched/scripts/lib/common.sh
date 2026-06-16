#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# Pocket Lab Day-0 common runtime helpers.
# Goals: Android/Termux compatibility, idempotency, rerun safety, and readable logs.

is_termux() { [[ -n "${TERMUX_VERSION:-}" || -d "/data/data/com.termux/files/usr" ]]; }

if is_termux; then
  export HOME="${HOME:-/data/data/com.termux/files/home}"
  export PREFIX="${PREFIX:-/data/data/com.termux/files/usr}"
else
  export HOME="${HOME:-$PWD/.pocketlab-home}"
  export PREFIX="${PREFIX:-$HOME/.local}"
fi

export PATH="$PREFIX/bin:$HOME/.local/bin:$PATH"
export POCKET_LAB_BASE_DIR="${POCKET_LAB_BASE_DIR:-$HOME/pocket-lab}"
export POCKET_LAB_IAC_DIR="${POCKET_LAB_IAC_DIR:-$POCKET_LAB_BASE_DIR/pocket_lab_iac}"
export POCKET_LAB_API_DIR="${POCKET_LAB_API_DIR:-$POCKET_LAB_BASE_DIR/api}"
export POCKET_LAB_PWA_DIR="${POCKET_LAB_PWA_DIR:-$POCKET_LAB_BASE_DIR/pwa_dist}"
export POCKET_LAB_POLICIES_DIR="${POCKET_LAB_POLICIES_DIR:-$POCKET_LAB_BASE_DIR/pocket_lab_policies}"
export POCKET_LAB_GITEA_DIR="${POCKET_LAB_GITEA_DIR:-$POCKET_LAB_BASE_DIR/gitea}"
export POCKET_LAB_GITEA_RUNNERS_DIR="${POCKET_LAB_GITEA_RUNNERS_DIR:-$POCKET_LAB_BASE_DIR/gitea-runners}"
export POCKET_LAB_VAULT_DIR="${POCKET_LAB_VAULT_DIR:-$POCKET_LAB_BASE_DIR/vault}"
export POCKET_LAB_OBSERVABILITY_DIR="${POCKET_LAB_OBSERVABILITY_DIR:-$POCKET_LAB_BASE_DIR/observability_configs}"
export POCKET_LAB_GATUS_DIR="${POCKET_LAB_GATUS_DIR:-$POCKET_LAB_OBSERVABILITY_DIR/gatus}"
export POCKET_LAB_CADDYFILE="${POCKET_LAB_CADDYFILE:-$POCKET_LAB_BASE_DIR/caddy/Caddyfile}"
export POCKET_LAB_HARDWARE_DAEMON="${POCKET_LAB_HARDWARE_DAEMON:-$POCKET_LAB_BASE_DIR/hardware_daemon.py}"

STATE_DIR="${STATE_DIR:-$HOME/.pocket_lab}"
LOG_DIR="${LOG_DIR:-$HOME/pocket_lab_logs}"
RUN_DIR="${RUN_DIR:-$HOME/pocket_lab_run}"
LOCK_DIR="${LOCK_DIR:-$STATE_DIR/locks}"
MARKER_DIR="${MARKER_DIR:-$STATE_DIR/markers}"
TMP_ROOT="${TMP_ROOT:-${TMPDIR:-$PREFIX/tmp}/pocket-lab}"
export TERMUX_PREFIX="$PREFIX"

mkdir -p "$STATE_DIR" "$LOG_DIR" "$RUN_DIR" "$LOCK_DIR" "$MARKER_DIR" "$TMP_ROOT" "$PREFIX/bin"

SCRIPT_NAME="${SCRIPT_NAME:-$(basename "${BASH_SOURCE[-1]:-$0}")}"
LOCK_FD=200

NO_NETWORK="${POCKET_LAB_NO_NETWORK:-0}"
ALLOW_NON_TERMUX="${POCKET_LAB_ALLOW_NON_TERMUX:-0}"

handle_err() {
  local rc=$? line=${BASH_LINENO[0]:-unknown} cmd=${BASH_COMMAND:-unknown}
  log FATAL "Unexpected error rc=$rc at line $line while running: $cmd"
  exit "$rc"
}
trap handle_err ERR

timestamp() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
log() { printf '[%s] [%s] [%s] %s\n' "$(timestamp)" "${1:-INFO}" "$SCRIPT_NAME" "${*:2}"; }
die() { log FATAL "$*"; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

ensure_root_dirs() {
  mkdir -p "$STATE_DIR" "$LOG_DIR" "$RUN_DIR" "$LOCK_DIR" "$MARKER_DIR" "$TMP_ROOT" "$PREFIX/bin" \
    "$POCKET_LAB_BASE_DIR" "$POCKET_LAB_API_DIR"
  chmod 700 "$STATE_DIR" "$LOG_DIR" "$RUN_DIR" "$LOCK_DIR" "$MARKER_DIR" 2>/dev/null || true
}

require_termux() {
  if ! is_termux && [[ "$ALLOW_NON_TERMUX" != "1" ]]; then
    die "This script targets Android/Termux. Set POCKET_LAB_ALLOW_NON_TERMUX=1 for syntax/test harness mode."
  fi
}

require_cmd() { for c in "$@"; do have "$c" || die "Required command missing: $c"; done; }
require_any_cmd() { for c in "$@"; do have "$c" && return 0; done; die "Required one of these commands: $*"; }

acquire_lock() {
  local name="${1:-$SCRIPT_NAME}"
  ensure_root_dirs
  local lockfile="$LOCK_DIR/${name//[^A-Za-z0-9_.-]/_}.lock"
  if have flock; then
    eval "exec ${LOCK_FD}>\"$lockfile\""
    flock -n "$LOCK_FD" || die "Another $name run is already active: $lockfile"
    printf '%s\n' "$$" 1>&$LOCK_FD || true
  else
    if ! mkdir "$lockfile.d" 2>/dev/null; then
      die "Another $name run may be active: $lockfile.d"
    fi
    trap 'rm -rf "$lockfile.d"' EXIT
  fi
}

marker_path() { printf '%s/%s.done' "$MARKER_DIR" "${1//[^A-Za-z0-9_.-]/_}"; }
is_done() { [[ -f "$(marker_path "$1")" ]]; }
mark_done() { mkdir -p "$MARKER_DIR"; printf '%s\n' "$(timestamp)" > "$(marker_path "$1")"; }
mark_clear() { rm -f "$(marker_path "$1")"; }

run_once() {
  local key="$1"; shift
  if is_done "$key"; then
    log INFO "Already completed: $key"
    return 0
  fi
  "$@"
  mark_done "$key"
}

ensure_dir_perm() { local dir="$1" mode="${2:-700}"; mkdir -p "$dir"; chmod "$mode" "$dir" 2>/dev/null || true; }

atomic_write() {
  local dst="$1" mode="${2:-0644}" tmp
  mkdir -p "$(dirname "$dst")"
  tmp="$(mktemp "${dst}.tmp.XXXXXX")"
  cat > "$tmp"
  chmod "$mode" "$tmp" 2>/dev/null || true
  mv -f "$tmp" "$dst"
}

write_secret_file() {
  local file="$1"; shift
  umask 077
  { for kv in "$@"; do printf '%s\n' "$kv"; done; } | atomic_write "$file" 0600
}

backup_file_if_exists() { local src="$1" suffix="${2:-$(date -u +%Y%m%d%H%M%S).bak}"; [[ -f "$src" ]] && cp -p "$src" "${src}.${suffix}" || true; }
ensure_line_in_file() { local line="$1" file="$2"; mkdir -p "$(dirname "$file")"; touch "$file"; grep -Fxq "$line" "$file" || printf '%s\n' "$line" >> "$file"; }

wait_for_tcp() {
  local host="$1" port="$2" timeout="${3:-60}" i
  for i in $(seq 1 "$timeout"); do
    if have nc && nc -z "$host" "$port" >/dev/null 2>&1; then return 0; fi
    if have python3 && python3 - "$host" "$port" >/dev/null 2>&1 <<'PYCHECK'
import socket, sys
s=socket.socket(); s.settimeout(1)
s.connect((sys.argv[1], int(sys.argv[2])))
PYCHECK
    then return 0; fi
    sleep 1
  done
  return 1
}

wait_for_http() {
  local url="$1" timeout="${2:-60}" i
  for i in $(seq 1 "$timeout"); do curl -fsS "$url" >/dev/null 2>&1 && return 0; sleep 1; done
  return 1
}

retry() { local tries="${1:-5}" delay="${2:-2}" n=1; shift 2; until "$@"; do (( n >= tries )) && return 1; sleep "$delay"; n=$((n+1)); done; }

download_file() {
  local url="$1" dest="$2"
  [[ "$NO_NETWORK" == "1" ]] && die "Network disabled; cannot download $url"
  mkdir -p "$(dirname "$dest")"
  local tmp="${dest}.download.$$"
  curl -fL --retry 3 --connect-timeout 20 --max-time 180 "$url" -o "$tmp"
  mv -f "$tmp" "$dest"
}

download_if_missing() { local url="$1" dest="$2"; [[ -s "$dest" ]] && { log INFO "Already present: $dest"; return 0; }; log INFO "Downloading $url"; download_file "$url" "$dest"; }
sha256_verify() { local file="$1" expected="$2"; [[ -n "$expected" ]] || die "Missing expected SHA256 for $file"; printf '%s  %s\n' "$expected" "$file" | sha256sum -c -; }

ensure_pkg_installed() {
  local pkg_name="$1"
  require_termux
  require_cmd pkg dpkg
  if dpkg -s "$pkg_name" >/dev/null 2>&1; then log INFO "Package already installed: $pkg_name"; return 0; fi
  log INFO "Installing Termux package: $pkg_name"
  DEBIAN_FRONTEND=noninteractive pkg install -y "$pkg_name"
}

pm2_has() { have pm2 && pm2 describe "$1" >/dev/null 2>&1; }
pm2_start_or_restart() {
  local name="$1"; shift
  require_cmd pm2

  # Recreate instead of plain restart so bootstrap script changes refresh the
  # PM2 command, arguments, interpreter, working directory, and environment.
  if pm2_has "$name"; then
    log INFO "Deleting existing PM2 process before restart: $name"
    pm2 delete "$name" >/dev/null || true
  fi

  local before_sep=() after_sep=() seen_sep=0 arg
  for arg in "$@"; do
    if [[ "$arg" == "--" && "$seen_sep" -eq 0 ]]; then
      seen_sep=1
      continue
    fi
    if [[ "$seen_sep" -eq 0 ]]; then
      before_sep+=("$arg")
    else
      after_sep+=("$arg")
    fi
  done

  log INFO "Starting PM2 process: $name"
  if [[ "${#after_sep[@]}" -gt 0 ]]; then
    [[ "${#before_sep[@]}" -gt 0 ]] || die "pm2_start_or_restart requires a command before -- for process: $name"
    local script="${before_sep[0]}"
    local pm2_opts=("${before_sep[@]:1}")
    pm2 start "$script" --name "$name" --update-env "${pm2_opts[@]}" -- "${after_sep[@]}"
  else
    pm2 start "$@" --name "$name" --update-env
  fi
}

cleanup_pidfile() { local pidfile="$1" pid=""; [[ -f "$pidfile" ]] || return 0; pid="$(cat "$pidfile" 2>/dev/null || true)"; [[ -n "$pid" ]] && kill "$pid" >/dev/null 2>&1 || true; rm -f "$pidfile"; }

json_get() { jq -r "$1" "${2:--}"; }
safe_cp() { local src="$1" dst="$2"; install -m 0644 "$src" "$dst"; }
render_template() { local tpl="$1" dst="$2"; shift 2; export "$@"; envsubst < "$tpl" > "$dst"; }
PYTHON_BIN="${PYTHON_BIN:-$(command -v python3 || command -v python || true)}"
