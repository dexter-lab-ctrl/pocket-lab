import http.server
import socketserver
import json
import subprocess
import os

PORT = 8080
DIRECTORY = os.path.expanduser("~/api")

class CommandAPIHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        if self.path == '/action/update':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            payload = json.loads(post_data.decode('utf-8'))
            
            # --- OTA Updater ---
            if payload.get('intent') == 'ota_update':
                download_url = payload.get('downloadUrl')
                command = f"nohup bash ~/update_pocketlab.sh '{download_url}' > ~/pocket_lab_logs/ota_update.log 2>&1 &"
                subprocess.Popen(command, shell=True, executable='/data/data/com.termux/files/usr/bin/bash')
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "updating"}).encode())
                return

            # --- Background Bash Execution (Fire & Forget) ---
            if payload.get('intent') == 'run_bash':
                script_content = payload.get('script')
                task_name = payload.get('task_name', 'task')
                script_path = os.path.expanduser(f'~/{task_name}.sh')
                with open(script_path, 'w') as f:
                    f.write(script_content)
                command = f"nohup bash {script_path} > ~/pocket_lab_logs/{task_name}.log 2>&1 &"
                subprocess.Popen(command, shell=True, executable='/data/data/com.termux/files/usr/bin/bash')
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "running"}).encode())
                return

            # --- NEW: Synchronous Execution & Log Streaming ---
            if payload.get('intent') == 'sync_bash':
                command = payload.get('command')
                try:
                    # Capture output synchronously (Timeout safely after 15s)
                    result = subprocess.run(command, shell=True, executable='/data/data/com.termux/files/usr/bin/bash', capture_output=True, text=True, timeout=15)
                    output = result.stdout + result.stderr
                    if not output.strip():
                        output = "[Success: Process returned no text output]"
                except subprocess.TimeoutExpired:
                    output = "[ERROR] Command timed out after 15 seconds."
                except Exception as e:
                    output = f"[ERROR] Execution failed: {str(e)}"
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "output": output}).encode())
                return

        self.send_response(404)
        self.end_headers()

with socketserver.TCPServer(("", PORT), CommandAPIHandler) as httpd:
    print(f"Pocket Lab Active API serving at port {PORT}")
    httpd.serve_forever()