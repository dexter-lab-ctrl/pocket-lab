import http.server
import socketserver
import json
import subprocess
import os

PORT = 8080
# Serve static files from the ~/api directory (like telemetry.json)
DIRECTORY = os.path.expanduser("~/api")

class CommandAPIHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        # Because Tailscale maps --set-path /api to /, the request arrives as /action/update
        if self.path == '/action/update':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            payload = json.loads(post_data.decode('utf-8'))
            
            if payload.get('intent') == 'ota_update':
                download_url = payload.get('downloadUrl')
                # Trigger the bash OTA script in the background
                command = f"nohup bash ~/update_pocketlab.sh '{download_url}' > ~/pocket_lab_logs/ota_update.log 2>&1 &"
                subprocess.Popen(command, shell=True, executable='/data/data/com.termux/files/usr/bin/bash')
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "updating"}).encode())
                return

        self.send_response(404)
        self.end_headers()

with socketserver.TCPServer(("", PORT), CommandAPIHandler) as httpd:
    print(f"Pocket Lab Active API serving at port {PORT}")
    httpd.serve_forever()