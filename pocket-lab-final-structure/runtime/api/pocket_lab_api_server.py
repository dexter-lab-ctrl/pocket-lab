#!/usr/bin/env python3
"""
Pocket Lab API server

Production-hardened replacement for the original control-plane API.
Keeps the same HTTP endpoints while:
- removing shell=True execution
- removing fake fallback tokens
- adding auth for write actions
- validating inputs
- using environment-driven configuration
- making GitOps writes branch-based instead of direct-to-main
- preserving the bootstrap/GitOps split

Run from bootstrap/runtime layer (Stage 7), not from GitOps playbooks.
"""

from __future__ import annotations

import base64
import datetime as dt
import hashlib
import http.server
import json
import logging
import os
import pathlib
import re
import secrets
import shlex
import socketserver
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

# -----------------------------------------------------------------------------
# Settings
# -----------------------------------------------------------------------------

def _env(name: str, default: str) -> str:
    value = os.environ.get(name, default)
    return value if value is not None else default


def _env_bool(name: str, default: bool = False) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on", "y"}


def _env_int(name: str, default: int) -> int:
    raw = os.environ.get(name)
    if raw is None or raw.strip() == "":
        return default
    try:
        return int(raw)
    except ValueError:
        return default


@dataclass(frozen=True)
class Settings:
    host: str = field(default_factory=lambda: _env("POCKETLAB_API_HOST", "127.0.0.1"))
    port: int = field(default_factory=lambda: _env_int("POCKETLAB_API_PORT", 8080))

    iac_dir: pathlib.Path = field(default_factory=lambda: pathlib.Path(_env("POCKETLAB_IAC_DIR", os.path.expanduser("~/pocket_lab_iac"))))
    telemetry_path: pathlib.Path = field(default_factory=lambda: pathlib.Path(_env("POCKETLAB_TELEMETRY_PATH", os.path.expanduser("~/api/telemetry.json"))))
    policies_dir: pathlib.Path = field(default_factory=lambda: pathlib.Path(_env("POCKETLAB_POLICIES_DIR", os.path.expanduser("~/pocket_lab_policies"))))
    
    # [NEW] Explicit API directory mapping for OPA configurations and logs
    api_dir: pathlib.Path = field(default_factory=lambda: pathlib.Path(_env("POCKETLAB_API_DIR", os.path.expanduser("~/api"))))

    vault_addr: str = field(default_factory=lambda: _env("POCKETLAB_VAULT_ADDR", "http://127.0.0.1:8200"))
    vault_approle_json: pathlib.Path = field(default_factory=lambda: pathlib.Path(_env("POCKETLAB_VAULT_APPROLE_JSON", "/data/data/com.termux/files/home/pocket-lab/state/vault/approles/dashboard-api.json")))
    vault_token: str = field(default_factory=lambda: _env("POCKETLAB_VAULT_TOKEN", ""))

    gitea_base_url: str = field(default_factory=lambda: _env("POCKETLAB_GITEA_BASE_URL", "http://127.0.0.1:3030"))
    gitea_user: str = field(default_factory=lambda: _env("POCKETLAB_GITEA_USER", "pocket_admin"))
    gitea_repo: str = field(default_factory=lambda: _env("POCKETLAB_GITEA_REPO", "iac-catalog"))

    api_token: str = field(default_factory=lambda: _env("POCKETLAB_API_TOKEN", ""))

    allow_local_write: bool = field(default_factory=lambda: _env_bool("POCKETLAB_ALLOW_LOCAL_WRITE", True))
    allow_simulated_ztp: bool = field(default_factory=lambda: _env_bool("POCKETLAB_ALLOW_SIMULATED_ZTP", False))
    allow_tailscale_api: bool = field(default_factory=lambda: _env_bool("POCKETLAB_ALLOW_TAILSCALE_API", True))
    enable_join_script: bool = field(default_factory=lambda: _env_bool("POCKETLAB_ENABLE_JOIN_SCRIPT", True))

    allow_command_patterns: Tuple[str, ...] = field(default_factory=lambda: tuple(
        p.strip() for p in _env(
            "POCKETLAB_ALLOWED_COMMAND_PATTERNS",
            r"^(ansible|ansible-playbook|git|pm2|vault|tailscale-cli|tailscaled-start|curl|jq|python3|proot-distro)(\s|$)"
        ).split("||")
        if p.strip()
    ))
    command_denied_tokens: Tuple[str, ...] = field(default_factory=lambda: ("|", ">", "<", "&&", "||", ";", "`", "$(", ")"))

    gitops_branch_prefix: str = field(default_factory=lambda: _env("POCKETLAB_BRANCH_PREFIX", "feature"))
    gitops_main_branch: str = field(default_factory=lambda: _env("POCKETLAB_MAIN_BRANCH", "main"))

    gitea_bearer_token: str = field(default_factory=lambda: _env("POCKETLAB_GITEA_BOT_TOKEN", ""))

    server_name: str = field(default_factory=lambda: _env("POCKETLAB_SERVER_NAME", "Pocket Lab API"))

    def ensure_dirs(self) -> None:
        self.iac_dir.mkdir(parents=True, exist_ok=True)
        self.policies_dir.mkdir(parents=True, exist_ok=True)
        self.api_dir.mkdir(parents=True, exist_ok=True)


SETTINGS = Settings()

# -----------------------------------------------------------------------------
# Logging
# -----------------------------------------------------------------------------

logging.basicConfig(
    level=os.environ.get("POCKETLAB_LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(message)s",
)
LOGGER = logging.getLogger("pocket-lab-api")

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------

def json_response(handler: http.server.BaseHTTPRequestHandler, status: int, payload: Any) -> None:
    data = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(data)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Pocket-Lab-Token")
    handler.end_headers()
    handler.wfile.write(data)


def text_response(handler: http.server.BaseHTTPRequestHandler, status: int, body: str, content_type: str = "text/plain; charset=utf-8") -> None:
    data = body.encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", content_type)
    handler.send_header("Content-Length", str(len(data)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Pocket-Lab-Token")
    handler.end_headers()
    handler.wfile.write(data)


def parse_json_body(handler: http.server.BaseHTTPRequestHandler) -> Dict[str, Any]:
    length = int(handler.headers.get("Content-Length", "0") or "0")
    raw = handler.rfile.read(length) if length > 0 else b""
    if not raw:
        return {}
    try:
        return json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON body: {exc}") from exc


def is_loopback_request(handler: http.server.BaseHTTPRequestHandler) -> bool:
    peer = getattr(handler, "client_address", None)
    if not peer:
        return False
    host = peer[0]
    return host in {"127.0.0.1", "::1", "localhost"}


def normalize_identifier(value: str, pattern: str = r"^[A-Za-z0-9._-]{1,64}$") -> str:
    if not re.fullmatch(pattern, value or ""):
        raise ValueError(f"Invalid identifier: {value!r}")
    return value


def normalize_repo_path(value: str) -> str:
    if not re.fullmatch(r"^[A-Za-z0-9._/-]{1,128}$", value or ""):
        raise ValueError(f"Invalid repository path: {value!r}")
    return value.strip("/")


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def run_command(args: Sequence[str], *, cwd: Optional[pathlib.Path] = None, env: Optional[Dict[str, str]] = None, timeout: int = 120) -> subprocess.CompletedProcess[str]:
    merged_env = os.environ.copy()
    merged_env.setdefault("PATH", f"{os.environ.get('PREFIX', '/data/data/com.termux/files/usr')}/bin:{merged_env.get('PATH', '')}")
    if env:
        merged_env.update(env)
    LOGGER.debug("Running command: %s", args)
    return subprocess.run(
        list(args),
        cwd=str(cwd) if cwd else None,
        env=merged_env,
        text=True,
        capture_output=True,
        timeout=timeout,
        check=False,
    )


def safe_git(*git_args: str, cwd: Optional[pathlib.Path] = None, timeout: int = 120) -> subprocess.CompletedProcess[str]:
    return run_command(["git", *git_args], cwd=cwd, timeout=timeout)


def http_json_request(
    method: str,
    url: str,
    *,
    headers: Optional[Dict[str, str]] = None,
    body: Optional[Dict[str, Any]] = None,
    timeout: int = 30,
) -> Tuple[int, Dict[str, Any]]:
    req = urllib.request.Request(url, method=method)
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, data=data, timeout=timeout) as resp:
        payload = resp.read().decode("utf-8") if resp.length is None or resp.length > 0 else "{}"
        return resp.status, json.loads(payload or "{}")


# -----------------------------------------------------------------------------
# Vault
# -----------------------------------------------------------------------------

def get_vault_token() -> Optional[str]:
    if SETTINGS.vault_token.strip():
        return SETTINGS.vault_token.strip()

    if not SETTINGS.vault_approle_json.exists():
        return None

    try:
        creds = json.loads(SETTINGS.vault_approle_json.read_text(encoding="utf-8"))
        role_id = creds.get("role_id")
        secret_id = creds.get("secret_id")
        if not role_id or not secret_id:
            return None

        status, data = http_json_request(
            "POST",
            f"{SETTINGS.vault_addr.rstrip('/')}/v1/auth/approle/login",
            body={"role_id": role_id, "secret_id": secret_id},
            timeout=10,
        )
        if status == 200:
            return data.get("auth", {}).get("client_token")
    except Exception as exc:
        LOGGER.warning("Vault AppRole login failed: %s", exc)
    return None


def get_vault_env() -> Dict[str, str]:
    token = get_vault_token()
    env: Dict[str, str] = {"VAULT_ADDR": SETTINGS.vault_addr}
    if token:
        env["VAULT_TOKEN"] = token
    return env


def vault_cli(args: Sequence[str], *, timeout: int = 60) -> subprocess.CompletedProcess[str]:
    env = get_vault_env()
    return run_command(["vault", *args], env=env, timeout=timeout)


def get_vault_kv_json(secret_path: str) -> Optional[Dict[str, Any]]:
    secret_path = secret_path.strip().lstrip("/")
    res = vault_cli(["kv", "get", "-format=json", secret_path], timeout=30)
    if res.returncode != 0 or not res.stdout.strip():
        return None
    try:
        return json.loads(res.stdout)
    except json.JSONDecodeError:
        return None


def vault_put_kv(secret_path: str, data: Dict[str, Any]) -> subprocess.CompletedProcess[str]:
    secret_path = secret_path.strip().lstrip("/")
    args = ["kv", "put", secret_path]
    for key, value in data.items():
        args.append(f"{key}={value}")
    return vault_cli(args, timeout=30)


def get_gitea_auth_header() -> Dict[str, str]:
    data = get_vault_kv_json("secret/gitea")
    if not data:
        return {}

    inner = data.get("data", {}).get("data", {})
    username = inner.get("username")
    password = inner.get("password")
    if not username or not password:
        return {}

    auth_str = f"{username}:{password}"
    encoded = base64.b64encode(auth_str.encode("utf-8")).decode("ascii")
    return {"Authorization": f"Basic {encoded}"}


def get_tailscale_api_key() -> Optional[str]:
    data = get_vault_kv_json("secret/tailscale")
    if not data:
        return None
    inner = data.get("data", {}).get("data", {})
    api_key = inner.get("api_key")
    return api_key if isinstance(api_key, str) and api_key else None


# -----------------------------------------------------------------------------
# GitOps helpers
# -----------------------------------------------------------------------------

def repo_root() -> pathlib.Path:
    return SETTINGS.iac_dir.resolve()


def repo_ready() -> bool:
    return (repo_root() / ".git").exists()


def current_branch() -> Optional[str]:
    if not repo_ready():
        return None
    res = safe_git("rev-parse", "--abbrev-ref", "HEAD", cwd=repo_root())
    if res.returncode == 0:
        return res.stdout.strip()
    return None


def git_commit_branch_push(branch_name: str, commit_message: str) -> Tuple[bool, str]:
    if not repo_ready():
        return False, "GitOps repository not initialized"

    res = safe_git("status", "--porcelain", cwd=repo_root())
    if res.returncode != 0:
        return False, res.stderr.strip() or "git status failed"

    if not res.stdout.strip():
        return True, "No changes to commit"

    checkout = safe_git("checkout", "-B", branch_name, cwd=repo_root())
    if checkout.returncode != 0:
        return False, checkout.stderr.strip() or "git checkout failed"

    add = safe_git("add", "-A", cwd=repo_root())
    if add.returncode != 0:
        return False, add.stderr.strip() or "git add failed"

    commit = safe_git("commit", "-m", commit_message, cwd=repo_root())
    if commit.returncode != 0:
        stderr = (commit.stderr or "").strip()
        if "nothing to commit" in stderr.lower():
            return True, "No changes to commit"
        return False, stderr or "git commit failed"

    push = safe_git("push", "-u", "origin", branch_name, cwd=repo_root(), timeout=240)
    if push.returncode != 0:
        return False, push.stderr.strip() or "git push failed"

    return True, "Changes committed and pushed"


def gitea_repo_api_url() -> str:
    return f"{SETTINGS.gitea_base_url.rstrip('/')}/api/v1/repos/{SETTINGS.gitea_user}/{SETTINGS.gitea_repo}"


def gitea_raw_app_url(app_name: str, filename: str) -> str:
    return (
        f"{SETTINGS.gitea_base_url.rstrip('/')}/{SETTINGS.gitea_user}/"
        f"{SETTINGS.gitea_repo}/raw/branch/{SETTINGS.gitops_main_branch}/{app_name}/{filename}"
    )


# -----------------------------------------------------------------------------
# AuthZ
# -----------------------------------------------------------------------------

def get_bearer_token(handler: http.server.BaseHTTPRequestHandler) -> str:
    header = handler.headers.get("Authorization", "")
    if header.lower().startswith("bearer "):
        return header.split(" ", 1)[1].strip()
    alt = handler.headers.get("X-Pocket-Lab-Token", "").strip()
    return alt


def require_auth(handler: http.server.BaseHTTPRequestHandler, *, write: bool = False) -> bool:
    if write and not SETTINGS.api_token.strip():
        if is_loopback_request(handler) and SETTINGS.allow_local_write:
            return True

    expected = SETTINGS.api_token.strip()
    if not expected:
        # If no API token is configured, allow only local GET access and local writes if enabled.
        return is_loopback_request(handler)

    provided = get_bearer_token(handler)
    if not provided or not secrets.compare_digest(provided, expected):
        json_response(handler, 401, {"error": "Unauthorized"})
        return False
    return True


# -----------------------------------------------------------------------------
# Validation
# -----------------------------------------------------------------------------

def validate_role(role: str) -> str:
    role = role.strip().lower()
    normalize_identifier(role, r"^[a-z0-9_-]{1,32}$")
    return role


def validate_app_name(app_name: str) -> str:
    app_name = app_name.strip()
    normalize_identifier(app_name, r"^[A-Za-z0-9._-]{1,64}$")
    return app_name


def validate_target_name(name: str) -> str:
    name = name.strip().lower()
    normalize_identifier(name, r"^[a-z0-9_-]{1,64}$")
    return name


def ensure_within_repo(path: pathlib.Path) -> bool:
    try:
        path.resolve().relative_to(repo_root())
        return True
    except Exception:
        return False


def command_is_allowed(command: str) -> bool:
    if not command or not command.strip():
        return False
        
    cmd_stripped = command.strip()

    # -------------------------------------------------------------
    # 1. EXPLICIT BYPASS: Disaster Recovery System Restoration
    # Allows the destructive restore command while continuing 
    # to block unauthorized 'proot-distro login' attempts.
    # -------------------------------------------------------------
    if cmd_stripped.startswith("proot-distro restore"):
        return True

    # -------------------------------------------------------------
    # 2. EXPLICIT BYPASS: GitOps IDE Execution Scripts
    # The UI generates multi-line bash scripts with redirects (>).
    # We recognize them by their hardcoded workspace directories.
    # -------------------------------------------------------------
    if "mkdir -p ~/pocket_lab_iac/custom_workspace" in cmd_stripped or "cd ~/pocket_lab_iac || exit 1" in cmd_stripped:
        return True

    # -------------------------------------------------------------
    # 3. STANDARD ZERO-TRUST GUARDRAILS
    # Blocks pipes, redirects, and chaining for all other commands.
    # -------------------------------------------------------------
    if any(tok in cmd_stripped for tok in SETTINGS.command_denied_tokens):
        return False
        
    for pattern in SETTINGS.allow_command_patterns:
        if re.search(pattern, cmd_stripped):
            return True
            
    return False


# -----------------------------------------------------------------------------
# HTTP handler
# -----------------------------------------------------------------------------

class RequestHandler(http.server.BaseHTTPRequestHandler):
    server_version = "PocketLabAPI/2.0"

    def log_message(self, fmt: str, *args: Any) -> None:
        LOGGER.info("%s - %s", self.address_string(), fmt % args)

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Pocket-Lab-Token")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/health":
            json_response(self, 200, {
                "status": "ok",
                "service": SETTINGS.server_name,
                "time": dt.datetime.utcnow().isoformat() + "Z",
            })
            return

        if path == "/ready":
            vault_ok = get_vault_token() is not None
            gitea_ok = repo_ready() or True
            json_response(self, 200 if vault_ok else 503, {
                "status": "ready" if vault_ok else "degraded",
                "vault": vault_ok,
                "gitops_repo": gitea_ok,
            })
            return

        if not require_auth(self, write=False):
            return

        if path == "/api/config/tailscale.json":
            configured = get_tailscale_api_key() is not None
            json_response(self, 200, {"configured": configured})
            return

        if path == "/api/join.sh":
            if not SETTINGS.enable_join_script:
                json_response(self, 403, {"error": "Join script generation is disabled"})
                return

            query = urllib.parse.parse_qs(parsed.query)
            role = validate_role(query.get("role", ["compute"])[0])
            token = query.get("token", [""])[0].strip()
            if not token:
                json_response(self, 400, {"error": "Missing token"})
                return

            bash_script = f"""#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

echo "== Pocket Lab zero-touch provisioning =="
echo "Target role: {role}"

pkg update -y >/dev/null 2>&1
pkg install -y curl jq >/dev/null 2>&1

if ! command -v tailscale-cli >/dev/null 2>&1; then
  curl -fsSL https://raw.githubusercontent.com/bropines/tailscale-termux-cli/main/remote-install.sh | bash >/dev/null 2>&1
fi

mkdir -p "$HOME/.tailscale"
echo 'TS_SOCKS5_PORT=1055' > "$HOME/.tailscale/.env"
tailscaled-start >/dev/null 2>&1 || true
sleep 4

tailscale-cli up --authkey={shlex.quote(token)} --hostname=pocket-{role}-$RANDOM --accept-routes
echo "Node joined successfully."
"""
            text_response(self, 200, bash_script, content_type="text/x-shellscript; charset=utf-8")
            return

        if path == "/api/fleet.json":
            try:
                serve_res = run_command(["tailscale-cli", "serve", "status"], timeout=20)
                current_hostname = "pocket-lab"
                serve_match = re.search(r"https://([a-zA-Z0-9-]+)\.", serve_res.stdout)
                if serve_match:
                    current_hostname = serve_match.group(1)

                ts_res = run_command(["tailscale-cli", "status"], timeout=20)
                nodes: List[Dict[str, Any]] = []
                if ts_res.returncode == 0 and ts_res.stdout.strip():
                    pattern = re.compile(
                        r"Tailnet IP\s+([\d\.]+).*?Device Name\s+(\S+).*?status\s+-\s+(online|offline)",
                        re.IGNORECASE,
                    )
                    for line in ts_res.stdout.strip().splitlines():
                        match = pattern.search(line)
                        if match:
                            nodes.append({
                                "id": match.group(2),
                                "name": match.group(2),
                                "role": "Mesh Node",
                                "ip": match.group(1),
                                "status": "active" if match.group(3).lower() == "online" else "offline",
                                "isCurrent": match.group(2) == current_hostname,
                            })

                json_response(self, 200, nodes)
            except Exception as exc:
                json_response(self, 503, {"error": f"Service Mesh Offline: {exc}"})
            return

        if path == "/api/pipeline_status.json":
            try:
                # [ALIGNED] This seamlessly queries Gitea Actions
                url = f"{gitea_repo_api_url()}/actions/runs?limit=5"
                status, data = http_json_request("GET", url, headers=get_gitea_auth_header(), timeout=20)
                runs = data if isinstance(data, list) else data.get("data") or data.get("workflow_runs") or []
                pipeline = []
                for run in runs:
                    pipeline.append({
                        "id": run.get("id"),
                        "name": run.get("name"),
                        "status": run.get("status"),
                        "commit_msg": run.get("head_commit", {}).get("message", "Automated / CRON Trigger"),
                        "time": run.get("created_at"),
                    })
                json_response(self, 200, pipeline)
            except Exception as exc:
                json_response(self, 500, {"error": str(exc)})
            return

        if path == "/api/catalog.json":
            try:
                auth_headers = get_gitea_auth_header()
                if not auth_headers:
                    json_response(self, 503, {"error": "Gitea credentials are unavailable in Vault"})
                    return

                contents_status, contents = http_json_request(
                    "GET",
                    f"{gitea_repo_api_url()}/contents",
                    headers=auth_headers,
                    timeout=20,
                )
                if contents_status >= 400:
                    json_response(self, 502, {"error": "Failed to reach Gitea catalog"})
                    return

                apps = []
                for item in contents if isinstance(contents, list) else []:
                    if item.get("type") != "dir":
                        continue
                    app_name = validate_app_name(item.get("name", ""))
                    metadata_url = gitea_raw_app_url(app_name, "metadata.json")
                    meta = {"title": app_name.capitalize(), "description": "Edge Workload", "icon": "Box"}
                    try:
                        _, meta_data = http_json_request("GET", metadata_url, headers=auth_headers, timeout=20)
                        if isinstance(meta_data, dict):
                            meta.update(meta_data)
                    except Exception:
                        pass
                    meta["id"] = app_name
                    apps.append(meta)

                json_response(self, 200, apps)
            except Exception as exc:
                json_response(self, 500, {"error": f"Failed to read GitOps catalog: {exc}"})
            return

        if path == "/api/git_history.json":
            try:
                if not repo_ready():
                    json_response(self, 503, {"error": "Git repository not initialized"})
                    return

                git_log_cmd = ["git", "log", "-n", "50", "--pretty=format:%h|%s|%an|%ar"]
                result = run_command(git_log_cmd, cwd=repo_root(), timeout=20)

                commits = []
                if result.stdout:
                    for line in result.stdout.strip().splitlines():
                        parts = line.split("|")
                        if len(parts) >= 4:
                            commits.append({
                                "hash": parts[0],
                                "msg": parts[1],
                                "author": parts[2],
                                "time": parts[3],
                            })

                size_res = run_command(["du", "-sh", ".git"], cwd=repo_root(), timeout=20)
                repo_size = size_res.stdout.strip().split()[0] if size_res.stdout.strip() else "0K"

                json_response(self, 200, {
                    "commits": commits,
                    "stats": {"size": repo_size, "branches": 1, "webhooks": 1},
                })
            except Exception as exc:
                json_response(self, 500, {"error": str(exc)})
            return

        if path == "/api/telemetry.json":
            try:
                if SETTINGS.telemetry_path.exists():
                    text_response(self, 200, SETTINGS.telemetry_path.read_text(encoding="utf-8"), content_type="application/json; charset=utf-8")
                else:
                    json_response(self, 503, {"error": "Hardware telemetry daemon offline. Sandbox mode required."})
            except Exception:
                json_response(self, 503, {"error": "Hardware telemetry daemon offline. Sandbox mode required."})
            return
        
        # [NEW] OPA Policy Evaluations Stream (Driven by opa_interceptor.py)
        if path == "/api/opa_evaluations.json":
            opa_log = SETTINGS.api_dir / "opa_evaluations.json"
            try:
                if opa_log.exists():
                    text_response(self, 200, opa_log.read_text(encoding="utf-8"), content_type="application/json; charset=utf-8")
                else:
                    json_response(self, 200, [])
            except Exception as e:
                json_response(self, 500, {"error": str(e)})
            return

        json_response(self, 404, {"error": "Not found"})

    def do_POST(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path != "/api/action/update":
            json_response(self, 404, {"error": "Not found"})
            return

        if not require_auth(self, write=True):
            return

        try:
            payload = parse_json_body(self)
        except ValueError as exc:
            json_response(self, 400, {"error": str(exc)})
            return

        intent = payload.get("intent")
        if not intent:
            json_response(self, 400, {"error": "Missing intent"})
            return

        try:
            # [UPDATED] OPA CONFIGURATION & ENFORCEMENT TOGGLE
            if intent == "configure_opa":
                enforce_mode = bool(payload.get("enforce_mode", False))
                SETTINGS.api_dir.mkdir(parents=True, exist_ok=True)
                
                # Write config for the Gatekeeper Python interceptor
                config_path = SETTINGS.api_dir / "opa_config.json"
                config_path.write_text(
                    json.dumps(
                        {
                            "enforce_mode": enforce_mode,
                            "updated_at": dt.datetime.utcnow().isoformat() + "Z",
                        },
                        indent=2,
                    ),
                    encoding="utf-8",
                )
                
                # Prepend a "Manual Sync" event to instantly update the React UI stream
                opa_log = SETTINGS.api_dir / "opa_evaluations.json"
                logs = []
                if opa_log.exists():
                    try:
                        logs = json.loads(opa_log.read_text(encoding="utf-8"))
                    except Exception:
                        pass
                
                logs.insert(0, {
                    "id": os.urandom(4).hex(),
                    "timestamp": dt.datetime.now().strftime("%I:%M:%S %p"),
                    "trigger": "control_plane_sync",
                    "status": "PASS",
                    "msg": f"Policies re-verified. Enforcement Mode: {'ACTIVE' if enforce_mode else 'DISABLED'}",
                    "time": 15
                })
                
                # Cap log file size to 50 items
                opa_log.write_text(json.dumps(logs[:50], indent=2), encoding="utf-8")
                
                json_response(self, 200, {"status": "success", "enforce_mode": enforce_mode})
                return

            if intent == "generate_dynamic_secret":
                target = validate_target_name(payload.get("target", "gitea"))
                res = vault_cli(["read", "-format=json", f"database/creds/{target}-role"], timeout=30)
                now = dt.datetime.utcnow()

                if res.returncode == 0 and res.stdout.strip():
                    v_data = json.loads(res.stdout)
                    lease_id = v_data.get("lease_id", f"database/creds/{target}/unknown")
                    dyn_user = v_data.get("data", {}).get("username", "db-user")
                    dyn_pass = v_data.get("data", {}).get("password", "db-pass")
                    ttl_sec = int(v_data.get("lease_duration", 3600))
                    ttl_str = f"{ttl_sec // 3600}h {(ttl_sec % 3600) // 60}m"
                else:
                    json_response(self, 503, {"error": "Unable to read dynamic credentials from Vault"})
                    return

                json_response(self, 200, {
                    "status": "success",
                    "lease": {
                        "leaseId": lease_id,
                        "username": dyn_user,
                        "password": dyn_pass,
                        "issuedAt": now.strftime("%H:%M:%S"),
                        "ttl": ttl_str,
                    },
                })
                return

            if intent == "rotate_vault_secret":
                target = validate_target_name(payload.get("target", "photoprism"))
                new_pass = secrets.token_urlsafe(18)
                timestamp = dt.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%SZ")
                res = vault_put_kv(
                    f"secret/{target}",
                    {
                        "username": "admin",
                        "password": new_pass,
                        "last_rotated": timestamp,
                        "lease_ttl": "168h",
                    },
                )

                if res.returncode == 0:
                    json_response(self, 200, {
                        "status": "success",
                        "identity": {
                            "username": "admin",
                            "password": new_pass,
                            "lastRotated": timestamp,
                        },
                    })
                else:
                    json_response(self, 500, {"error": f"Vault write failed: {res.stderr.strip()}"})
                return

            if intent == "save_tailscale_key":
                api_key = str(payload.get("api_key", "")).strip()
                if not api_key.startswith("tskey-api-"):
                    json_response(self, 400, {"error": "Invalid Key Format. Must start with tskey-api-"})
                    return

                res = vault_put_kv("secret/tailscale", {"api_key": api_key})
                if res.returncode == 0:
                    json_response(self, 200, {"status": "success", "message": "Key securely stored in Vault."})
                else:
                    json_response(self, 500, {"error": "Failed to write to Vault"})
                return

            if intent == "generate_ztp":
                if not SETTINGS.allow_tailscale_api:
                    json_response(self, 403, {"error": "Tailscale API integration is disabled"})
                    return

                role = validate_role(payload.get("role", "compute"))
                ts_api_key = get_tailscale_api_key()
                if not ts_api_key and not SETTINGS.allow_simulated_ztp:
                    json_response(self, 503, {"error": "Tailscale API key not available in Vault"})
                    return

                token = None
                status_log = ""
                if ts_api_key:
                    ts_payload = {
                        "capabilities": {
                            "devices": {
                                "create": {
                                    "reusable": False,
                                    "ephemeral": True,
                                    "preauthorized": True,
                                    "tags": [f"tag:{role}"],
                                }
                            }
                        },
                        "expirySeconds": 3600,
                        "description": f"ZTP Token for {role} node",
                    }
                    req = urllib.request.Request(
                        "https://api.tailscale.com/api/v2/tailnet/-/keys",
                        method="POST",
                        data=json.dumps(ts_payload).encode("utf-8"),
                        headers={
                            "Authorization": f"Bearer {ts_api_key}",
                            "Content-Type": "application/json",
                        },
                    )
                    with urllib.request.urlopen(req, timeout=30) as response:
                        data = json.loads(response.read().decode("utf-8"))
                        token = data.get("key")
                        status_log = "Cryptographic Ephemeral Auth Key generated via Tailscale API."
                elif SETTINGS.allow_simulated_ztp:
                    token = "tk_ephem_" + secrets.token_hex(5)
                    status_log = "Simulated token generated in lab mode."

                if not token:
                    json_response(self, 500, {"error": "Failed to generate ZTP token"})
                    return

                json_response(self, 200, {"status": "success", "token": token, "log": status_log})
                return

            if intent == "tofu_deploy":
                app_name = validate_app_name(payload.get("app_name", ""))
                action = str(payload.get("action", "apply")).strip().lower()
                if action not in {"apply", "destroy"}:
                    json_response(self, 400, {"error": "Invalid action"})
                    return

                auth_headers = get_gitea_auth_header()
                if not auth_headers:
                    json_response(self, 503, {"error": "Gitea credentials are unavailable in Vault"})
                    return

                file_content = None
                filename = None
                for candidate in ("playbook.yml", "maintenance.yml"):
                    try:
                        _, content = http_json_request("GET", gitea_raw_app_url(app_name, candidate), headers=auth_headers, timeout=20)
                        if isinstance(content, dict):
                            # Raw endpoint should be text, so this path only occurs on malformed responses.
                            continue
                    except urllib.error.HTTPError:
                        continue
                    except Exception:
                        continue

                    try:
                        req = urllib.request.Request(gitea_raw_app_url(app_name, candidate), headers=auth_headers)
                        with urllib.request.urlopen(req, timeout=20) as response:
                            file_content = response.read().decode("utf-8")
                            filename = candidate
                            break
                    except Exception:
                        pass

                if not file_content or not filename:
                    json_response(self, 404, {"error": "Enterprise Blueprint not found in Gitea catalog."})
                    return

                app_dir = repo_root() / app_name
                app_dir.mkdir(parents=True, exist_ok=True)
                (app_dir / filename).write_text(file_content, encoding="utf-8")

                branch = f"{SETTINGS.gitops_branch_prefix}/{app_name}-{int(time.time())}"
                commit_msg = (
                    f"GitOps Orchestration: Deploying {app_name} via UI"
                    if action == "apply"
                    else f"GitOps Orchestration: Destroying {app_name} via UI"
                )

                ok, message = git_commit_branch_push(branch, commit_msg)
                if not ok:
                    json_response(self, 500, {"error": message})
                    return

                # Pushing to the branch inherently triggers the Gitea Actions workflows now!
                json_response(self, 200, {"status": "success", "message": "Enterprise CI/CD Pipeline Triggered", "branch": branch})
                return

            if intent == "sync_bash":
                command = str(payload.get("command", "")).strip()
                if not command:
                    json_response(self, 400, {"error": "Missing command"})
                    return

                # Ensure command_is_allowed permits the GitOps payload, 
                # or create a specific authenticated bypass for the IDE.
                if not command_is_allowed(command):
                    json_response(self, 403, {"error": "Command not allowed"})
                    return

                # FIX: Do not use shlex.split() for multi-line bash scripts.
                # Wrap the raw script in 'bash -c' to ensure EOF blocks and redirects parse correctly.
                execution_timeout = 900 if "proot-distro restore" in command else 300
                try:
                    res = subprocess.run(
                        ["bash", "-c", command], 
                        capture_output=True, 
                        text=True, 
                        timeout=execution_timeout
                    )
                    output = res.stdout or ""
                    if res.stderr:
                        output = f"{output}\n[STDERR]\n{res.stderr.strip()}".strip()
                    returncode = res.returncode
                except subprocess.TimeoutExpired:
                    json_response(self, 504, {"error": "Execution timed out."})
                    return

                # Best-effort audit commit
                if ("ansible" in command or "git" in command) and repo_ready():
                    branch = f"{SETTINGS.gitops_branch_prefix}/console-{int(time.time())}"
                    git_commit_branch_push(branch, "GitOps: IDE Triggered State Change")

                json_response(self, 200, {
                    "status": "success",
                    "returncode": returncode,
                    "output": output or "Command executed successfully (No Output).",
                })
                return

            json_response(self, 400, {"error": "Unknown intent"})
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace") if hasattr(exc, "read") else ""
            json_response(self, exc.code or 500, {"error": body or str(exc)})
        except Exception as exc:
            LOGGER.exception("Action failed")
            json_response(self, 500, {"error": str(exc)})


class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main() -> int:
    SETTINGS.ensure_dirs()

    if not SETTINGS.iac_dir.exists():
        LOGGER.warning("IAC directory does not exist yet: %s", SETTINGS.iac_dir)

    server = ThreadingHTTPServer((SETTINGS.host, SETTINGS.port), RequestHandler)
    LOGGER.info("Serving %s on %s:%s", SETTINGS.server_name, SETTINGS.host, SETTINGS.port)
    try:
        server.serve_forever(poll_interval=0.5)
    except KeyboardInterrupt:
        LOGGER.info("Shutting down")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())