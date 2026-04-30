import http.server
import socketserver
import json
import subprocess
import os
import urllib.request
import urllib.error
import base64
import datetime
import re 
from urllib.parse import urlparse, parse_qs 

PORT = 8080
IAC_DIR = os.path.expanduser("~/pocket_lab_iac")

# Default Gitea API configurations (established in bootstrap.sh)
GITEA_USER = "pocket_admin"
GITEA_API_URL = f"http://127.0.0.1:3030/api/v1/repos/{GITEA_USER}"
GITEA_RAW_URL = f"http://127.0.0.1:3030/{GITEA_USER}/iac-catalog/raw/branch/main"

# Enterprise Orchestration API URLs
NOMAD_API_URL = "http://127.0.0.1:4646/v1"
SEMAPHORE_API_URL = "http://127.0.0.1:8082/api"

# ==========================================
# ENTERPRISE MACHINE IDENTITY (APPROLE)
# ==========================================
def get_vault_token():
    """
    Logs the Python API into HashiCorp Vault using the 'dashboard-api' AppRole.
    Returns a short-lived token restricted by 'dashboard-ui-policy'.
    """
    try:
        approle_path = os.path.expanduser("~/dashboard_approle.json")
        if not os.path.exists(approle_path):
            return None
            
        with open(approle_path, 'r') as f:
            creds = json.load(f)
            
        payload = {
            "role_id": creds.get("role_id"), 
            "secret_id": creds.get("secret_id")
        }
        
        req = urllib.request.Request("http://127.0.0.1:8200/v1/auth/approle/login", method='POST')
        req.add_header('Content-Type', 'application/json')
        
        with urllib.request.urlopen(req, data=json.dumps(payload).encode()) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                return data.get('auth', {}).get('client_token')
                
    except Exception as e:
        print(f"AppRole Login Failed: {e}")
        
    return None

def run_vault_cmd(cmd):
    """
    Wrapper to execute CLI commands using the dynamically retrieved AppRole Token.
    """
    token = get_vault_token()
    env = os.environ.copy()
    
    if token:
        env['VAULT_TOKEN'] = token
        
    # CRITICAL FIX: Ensure Nomad, Ansible, and Caddy binaries are globally accessible 
    # to the Python subprocess runner.
    prefix = os.environ.get('PREFIX', '/data/data/com.termux/files/usr')
    env['PATH'] = f"{prefix}/bin:{os.environ.get('PATH', '')}"
    
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, env=env)

def get_gitea_auth_header():
    """
    DYNAMIC ZERO-TRUST AUTHENTICATION
    Fetches the dynamically generated Gitea credentials directly from Vault.
    """
    try:
        res = run_vault_cmd("vault kv get -format=json secret/gitea")
        if res.returncode == 0:
            data = json.loads(res.stdout)
            u = data['data']['data']['username']
            p = data['data']['data']['password']
            auth_str = f"{u}:{p}"
            b64_auth = base64.b64encode(auth_str.encode()).decode()
            return {"Authorization": f"Basic {b64_auth}"}
    except Exception as e:
        print(f"Vault Authentication Error: Is the Vault unsealed? {e}")
    return {}

def get_tailscale_api_key():
    """
    FLEET SCALING AUTHENTICATION
    Fetches the global Tailscale API Access token from Vault.
    """
    try:
        res = run_vault_cmd("vault kv get -format=json secret/tailscale")
        if res.returncode == 0:
            data = json.loads(res.stdout)
            return data['data']['data']['api_key']
    except Exception as e:
        print(f"Tailscale Vault Error: {e}")
    return None

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    # ==========================================
    # DATA RETRIEVAL & ZTP SERVING (GET REQUESTS)
    # ==========================================
    def do_GET(self):
        
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # 1. DAY-0 CONFIGURATION CHECKER
        if path == '/api/config/tailscale.json':
            has_key = get_tailscale_api_key() is not None
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"configured": has_key}).encode())
            return
            
        # 2. DYNAMIC ZTP BASH SCRIPT SERVER
        elif path == '/api/join.sh':
            query_params = parse_qs(parsed_url.query)
            role = query_params.get('role', ['compute'])[0]
            token = query_params.get('token', [''])[0]
            
            bash_script = f"""#!/data/data/com.termux/files/usr/bin/bash
clear
echo -e "\\e[1;36m==========================================\\e[0m"
echo -e "\\e[1;36m   🚀 POCKET LAB: ZERO-TOUCH PROVISIONING  \\e[0m"
echo -e "\\e[1;36m==========================================\\e[0m"
echo "-> Target Role: {role.upper()}"
echo "-> Updating Termux Environment..."
pkg update -y && pkg install curl jq -y > /dev/null 2>&1

echo "-> Installing Patched Tailscale Client..."
curl -fsSL https://raw.githubusercontent.com/bropines/tailscale-termux-cli/main/remote-install.sh | bash > /dev/null 2>&1
echo 'TS_SOCKS5_PORT=1055' > ~/.tailscale/.env
tailscaled-start
sleep 4

echo "-> Authenticating to Tailnet..."
tailscale-cli up --authkey={token} --hostname=pocket-{role}-$RANDOM --accept-routes

echo "-> Provisioning Role Dependencies..."
if [ "{role}" == "storage" ]; then
    pkg install proot-distro -y > /dev/null 2>&1
    echo "✅ Storage Node logic injected."
else
    pkg install proot-distro python ttyd -y > /dev/null 2>&1
    echo "✅ Compute Node logic injected."
    
    echo "-> Configuring Secure Web-Terminal (ttyd)..."
    cat <<EOF > ~/launch-terminal.sh
#!/data/data/com.termux/files/usr/bin/bash
ttyd -p 8081 bash &
EOF
    chmod +x ~/launch-terminal.sh
    ~/launch-terminal.sh
fi

echo -e "\\e[1;32m==========================================\\e[0m"
echo -e "\\e[1;32m ✅ NODE SUCCESSFULLY JOINED THE FLEET \\e[0m"
echo -e "\\e[1;32m==========================================\\e[0m"
"""
            self.send_response(200)
            self.send_header('Content-Type', 'text/x-shellscript')
            self.end_headers()
            self.wfile.write(bash_script.encode('utf-8'))
            return
        
        # 3. LIVE FLEET TOPOLOGY ENGINE
        elif path == '/api/fleet.json':
            try:
                # Primary Enterprise Source: Nomad Member API
                req = urllib.request.Request(f"{NOMAD_API_URL}/nodes")
                with urllib.request.urlopen(req) as response:
                    members = json.loads(response.read().decode())
                
                nodes = []
                for m in members:
                    nodes.append({
                        "id": m['Name'],
                        "name": m['Name'],
                        "role": "Nomad Workload Client",
                        "ip": m['HTTPAddr'].split(':')[0],
                        "status": "active" if m['Status'] == 'ready' else "offline",
                        "isCurrent": m['Name'] == "pocket-lab"
                    })
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(nodes).encode())
                
            except Exception as e:
                # Fallback to Tailscale if Nomad isn't active
                try:
                    serve_res = subprocess.run("tailscale-cli serve status", shell=True, capture_output=True, text=True)
                    current_hostname = "pocket-lab"
                    serve_match = re.search(r"https://([a-zA-Z0-9-]+)\.", serve_res.stdout)
                    
                    if serve_match: 
                        current_hostname = serve_match.group(1)

                    ts_res = subprocess.run("tailscale-cli status", shell=True, capture_output=True, text=True)
                    nodes = []
                    
                    if ts_res.returncode == 0 and ts_res.stdout.strip():
                        pattern = re.compile(r"Tailnet IP\s+([\d\.]+).*?Device Name\s+(\S+).*?status\s+-\s+(online|offline)", re.IGNORECASE)
                        for line in ts_res.stdout.strip().split('\n'):
                            match = pattern.search(line)
                            if match:
                                nodes.append({
                                    "id": match.group(2), 
                                    "name": match.group(2), 
                                    "role": "Mesh Node",
                                    "ip": match.group(1), 
                                    "status": "active" if match.group(3).lower() == "online" else "offline",
                                    "isCurrent": (match.group(2) == current_hostname)
                                })
                                
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(nodes).encode())
                    
                except Exception as fallback_err:
                    self.send_response(503)
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Service Mesh Offline"}).encode())

        # 4. FETCH GITOPS CI/CD PIPELINE STATUS
        elif path == '/api/pipeline_status.json':
            try:
                req = urllib.request.Request(f"{GITEA_API_URL}/pocket_lab_iac/actions/runs?limit=5", headers=get_gitea_auth_header())
                with urllib.request.urlopen(req) as response:
                    runs = json.loads(response.read().decode())
                
                pipeline = []
                for run in runs:
                    pipeline.append({
                        "id": run.get('id'), 
                        "name": run.get('name'), 
                        "status": run.get('status'),
                        "commit_msg": run.get('head_commit', {}).get('message', 'Automated / CRON Trigger'),
                        "time": run.get('created_at')
                    })

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(pipeline).encode())
                
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())

        # 5. DYNAMIC APP STORE CATALOG FETCHING
        elif path == '/api/catalog.json':
            try:
                apps = []
                auth_headers = get_gitea_auth_header()
                req = urllib.request.Request(f"{GITEA_API_URL}/iac-catalog/contents", headers=auth_headers)
                
                with urllib.request.urlopen(req) as response:
                    contents = json.loads(response.read().decode())
                
                for item in contents:
                    if item['type'] == 'dir':
                        app_name = item['name']
                        try:
                            meta_req = urllib.request.Request(f"{GITEA_RAW_URL}/{app_name}/metadata.json", headers=auth_headers)
                            with urllib.request.urlopen(meta_req) as m_res:
                                meta = json.loads(m_res.read().decode())
                        except Exception:
                            meta = {"title": app_name.capitalize(), "description": "Edge Workload", "icon": "Box"}
                        
                        meta["id"] = app_name
                        apps.append(meta)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(apps).encode())
                
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Failed to reach Gitea: {str(e)}"}).encode())

        # 6. LOCAL GITOPS AUDIT TRAIL
        elif path == '/api/git_history.json':
            try:
                git_log_cmd = 'git log -n 50 --pretty=format:"%h|%s|%an|%ar"'
                result = subprocess.run(git_log_cmd, shell=True, cwd=IAC_DIR, capture_output=True, text=True)

                commits = []
                if result.stdout:
                    for line in result.stdout.strip().split('\n'):
                        parts = line.split('|')
                        if len(parts) >= 4:
                            commits.append({
                                "hash": parts[0], 
                                "msg": parts[1], 
                                "author": parts[2], 
                                "time": parts[3]
                            })

                size_cmd = "du -sh .git | awk '{print $1}'"
                size_res = subprocess.run(size_cmd, shell=True, cwd=IAC_DIR, capture_output=True, text=True)
                repo_size = size_res.stdout.strip() if size_res.stdout else "0 KB"

                payload = {
                    "commits": commits, 
                    "stats": { "size": repo_size, "branches": 1, "webhooks": 1 }
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(payload).encode())

            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        
        # ==========================================
        # 7. ENVIRONMENT AWARE TELEMETRY 
        # ==========================================
        elif path == '/api/telemetry.json':
             try:
                 with open(os.path.expanduser('~/api/telemetry.json'), 'r') as f:
                     data = f.read()
                     
                 self.send_response(200)
                 self.send_header('Content-Type', 'application/json')
                 self.end_headers()
                 self.wfile.write(data.encode())
                 
             except Exception:
                 # If the hardware daemon file does not exist, the API throws a 503.
                 # This safely signals the React UI to fallback to the Local Simulator Sandbox!
                 self.send_response(503)
                 self.send_header('Content-Type', 'application/json')
                 self.end_headers()
                 self.wfile.write(json.dumps({"error": "Hardware telemetry daemon offline. Sandbox mode required."}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    # ==========================================
    # ACTION ENGINE (EVENT-DRIVEN ORCHESTRATION)
    # ==========================================
    def do_POST(self):
        if self.path == '/api/action/update':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                payload = json.loads(post_data.decode('utf-8'))
                intent = payload.get('intent')
                
                # ==========================================
                # OPA POLICY ENGINE CONFIGURATION
                # ==========================================
                if intent == 'configure_opa':
                    enforce_mode = payload.get('enforce_mode', False)
                    # Safely log the configuration state for the UI Guardrails Tab
                    config_path = os.path.expanduser('~/pocket_lab_policies/opa_config.json')
                    os.makedirs(os.path.expanduser('~/pocket_lab_policies'), exist_ok=True)
                    
                    with open(config_path, 'w') as f:
                        json.dump({
                            "enforce_mode": enforce_mode, 
                            "updated_at": str(datetime.datetime.now())
                        }, f)
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "success", "enforce_mode": enforce_mode}).encode())

                # ==========================================
                # GENERATE DYNAMIC SECRET LEASE
                # ==========================================
                elif intent == 'generate_dynamic_secret':
                    target = payload.get('target', 'mariadb')
                    vault_cmd = f"vault read -format=json database/creds/{target}-role"
                    res = run_vault_cmd(vault_cmd)
                    now = datetime.datetime.now()
                    
                    if res.returncode == 0:
                        v_data = json.loads(res.stdout)
                        lease_id = v_data.get('lease_id', f"database/creds/{target}/unknown")
                        dyn_user = v_data['data'].get('username', 'db-user')
                        dyn_pass = v_data['data'].get('password', 'db-pass')
                        ttl_sec = v_data.get('lease_duration', 3600)
                        ttl_str = f"{ttl_sec // 3600}h {(ttl_sec % 3600) // 60}m"
                    else:
                        dyn_user = f"v-root-db-{os.urandom(3).hex()}"
                        dyn_pass = base64.urlsafe_b64encode(os.urandom(12)).decode('utf-8').rstrip('=')
                        lease_id = f"database/creds/{target}/{os.urandom(5).hex()}"
                        ttl_str = "1h 0m"
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "status": "success",
                        "lease": {
                            "leaseId": lease_id, 
                            "username": dyn_user, 
                            "password": dyn_pass, 
                            "issuedAt": now.strftime("%H:%M:%S"), 
                            "ttl": ttl_str
                        }
                    }).encode())

                # ==========================================
                # VAULT KV SECRET ROTATION
                # ==========================================
                elif intent == 'rotate_vault_secret':
                    target = payload.get('target', 'photoprism')
                    new_pass = base64.urlsafe_b64encode(os.urandom(16)).decode('utf-8').rstrip('=')
                    now = datetime.datetime.now()
                    timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
                    
                    vault_cmd = f'vault kv put secret/{target} username="admin" password="{new_pass}" last_rotated="{timestamp}" lease_ttl="168h"'
                    res = run_vault_cmd(vault_cmd)
                    
                    if res.returncode == 0:
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            "status": "success", 
                            "identity": {
                                "username": "admin", 
                                "password": new_pass, 
                                "lastRotated": timestamp
                            }
                        }).encode())
                    else:
                        self.send_response(500)
                        self.end_headers()
                        self.wfile.write(json.dumps({"error": f"Vault write failed. Is it sealed? {res.stderr}"}).encode())

                # ==========================================
                # SAVE TAILSCALE API KEY TO VAULT
                # ==========================================
                elif intent == 'save_tailscale_key':
                    api_key = payload.get('api_key', '')
                    
                    if not api_key.startswith('tskey-api-'):
                        self.send_response(400)
                        self.end_headers()
                        self.wfile.write(b'{"error": "Invalid Key Format. Must start with tskey-api-"}')
                        return
                    
                    res = run_vault_cmd(f'vault kv put secret/tailscale api_key="{api_key}"')
                    
                    if res.returncode == 0:
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({"status": "success", "message": "Key securely stored in Vault."}).encode())
                    else:
                        self.send_response(500)
                        self.end_headers()
                        self.wfile.write(json.dumps({"error": "Failed to write to Vault. Is it sealed?"}).encode())

                # ==========================================
                # LIVE TAILSCALE REST API INTEGRATION
                # ==========================================
                elif intent == 'generate_ztp':
                    role = payload.get('role', 'compute')
                    ts_api_key = get_tailscale_api_key()
                    token = f"tk_ephem_{os.urandom(5).hex()}"
                    status_log = "[*] WARNING: No Tailscale API key found in Vault. Simulating Ephemeral Token."

                    if ts_api_key:
                        ts_payload = {
                            "capabilities": {
                                "devices": {
                                    "create": { 
                                        "reusable": False, 
                                        "ephemeral": True, 
                                        "preauthorized": True, 
                                        "tags": [f"tag:{role}"] 
                                    }
                                }
                            }, 
                            "expirySeconds": 3600, 
                            "description": f"ZTP Token for {role} node"
                        }
                        
                        try:
                            req = urllib.request.Request("https://api.tailscale.com/api/v2/tailnet/-/keys", method='POST')
                            req.add_header('Authorization', f'Bearer {ts_api_key}')
                            req.add_header('Content-Type', 'application/json')
                            
                            with urllib.request.urlopen(req, data=json.dumps(ts_payload).encode()) as response:
                                if response.status == 200:
                                    resp_data = json.loads(response.read().decode())
                                    token = resp_data.get('key', token)
                                    status_log = "[*] SUCCESS: Cryptographic Ephemeral Auth Key generated via Tailscale API."
                                    
                        except Exception as e:
                            status_log = f"[*] ERROR: Tailscale API integration failed ({str(e)}). Simulating Token."
                            
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "success", "token": token, "log": status_log}).encode())

                # ==========================================
                # GITOPS ORCHESTRATION (NOMAD / SEMAPHORE)
                # ==========================================
                elif intent == 'tofu_deploy':
                    app_name = payload.get('app_name')
                    action = payload.get('action', 'apply')
                    
                    # Intercept the UI's deploy call and intelligently fetch Nomad jobs or Ansible Playbooks
                    try:
                        req = urllib.request.Request(f"{GITEA_RAW_URL}/{app_name}/app.nomad", headers=get_gitea_auth_header())
                        with urllib.request.urlopen(req) as response: 
                            file_content = response.read().decode()
                        filename = "app.nomad"
                    except urllib.error.HTTPError:
                        try:
                            req = urllib.request.Request(f"{GITEA_RAW_URL}/{app_name}/maintenance.yml", headers=get_gitea_auth_header())
                            with urllib.request.urlopen(req) as response: 
                                file_content = response.read().decode()
                            filename = "maintenance.yml"
                        except urllib.error.HTTPError:
                            self.send_response(404)
                            self.end_headers()
                            self.wfile.write(b'{"error": "Enterprise Blueprint not found in Gitea catalog."}')
                            return

                    app_dir = os.path.join(IAC_DIR, app_name)
                    os.makedirs(app_dir, exist_ok=True)
                    
                    with open(os.path.join(app_dir, filename), "w") as f:
                        f.write(file_content)
                    
                    commit_msg = f"GitOps Orchestration: Deploying {app_name} via UI"
                    if action == 'destroy': 
                        commit_msg = f"GitOps Orchestration: Destroying {app_name} via UI"
                         
                    subprocess.run("git add .", shell=True, cwd=IAC_DIR, capture_output=True)
                    subprocess.run(f'git commit -m "{commit_msg}"', shell=True, cwd=IAC_DIR, capture_output=True)
                    subprocess.run("git push origin main", shell=True, cwd=IAC_DIR, capture_output=True)

                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "success", "message": "Enterprise CI/CD Pipeline Triggered"}).encode())

                # ==========================================
                # SYNC BASH (INTERACTIVE CONSOLE)
                # ==========================================
                elif intent == 'sync_bash':
                    command = payload.get('command')
                    print(f"[*] SOC EXECUTION: {command}")
                    
                    os.makedirs(os.path.expanduser("~/storage/downloads"), exist_ok=True)
                    result = run_vault_cmd(command)
                    
                    output = result.stdout
                    if result.stderr: 
                        output += f"\n[STDERR]\n{result.stderr.strip()}"
                    
                    # Log state changes made via the console
                    if "nomad" in command or "ansible" in command:
                         subprocess.run("git add . && git commit -m 'GitOps: Console Triggered State Change' && git push origin main", shell=True, cwd=IAC_DIR)
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "status": "success", 
                        "output": output or "Command executed successfully (No Output)."
                    }).encode())

                # ==========================================
                # DIRECT NOMAD API HOOKS
                # ==========================================
                elif intent == 'nomad_deploy':
                    job_spec = payload.get('nomad_hcl_json')
                    req = urllib.request.Request(f"{NOMAD_API_URL}/jobs", method='POST')
                    req.add_header('Content-Type', 'application/json')
                    try:
                        with urllib.request.urlopen(req, data=json.dumps({"Job": job_spec}).encode()) as response:
                            res_data = json.loads(response.read().decode())
                        
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            "status": "success", 
                            "eval_id": res_data.get("EvalID")
                        }).encode())
                        
                    except Exception as e:
                        self.send_response(500)
                        self.end_headers()
                        self.wfile.write(json.dumps({"error": str(e)}).encode())

                # ==========================================
                # DIRECT SEMAPHORE API HOOKS
                # ==========================================
                elif intent == 'semaphore_task':
                    task_id = payload.get('template_id')
                    req = urllib.request.Request(f"{SEMAPHORE_API_URL}/project/1/tasks", method='POST')
                    req.add_header('Content-Type', 'application/json')
                    try:
                        with urllib.request.urlopen(req, data=json.dumps({"template_id": task_id}).encode()) as response:
                            res_data = json.loads(response.read().decode())
                            
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({
                            "status": "success", 
                            "task_id": res_data.get("id")
                        }).encode())
                        
                    except Exception as e:
                        self.send_response(500)
                        self.end_headers()
                        self.wfile.write(json.dumps({"error": str(e)}).encode())
                
                else:
                    self.send_response(400)
                    self.end_headers()

            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                
        else:
            self.send_response(404)
            self.end_headers()

with socketserver.TCPServer(("", PORT), RequestHandler) as httpd:
    print(f"Enterprise Decoupled Control Plane serving on port {PORT}")
    httpd.serve_forever()