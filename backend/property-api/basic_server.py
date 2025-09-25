"""
Basic HTTP Server using only Python standard library
No external dependencies required
"""

import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class SimpleAPIHandler(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _send_json_response(self, data):
        self._set_headers()
        response = json.dumps(data)
        self.wfile.write(response.encode('utf-8'))

    def do_GET(self):
        parsed_path = urlparse(self.path)

        if parsed_path.path == '/':
            self._send_json_response({
                "message": "Basic HTTP API is running",
                "status": "ok",
                "server": "Python standard library"
            })
        elif parsed_path.path == '/health':
            api_key = "configured" if os.getenv("VITE_REAL_ESTATE_API_KEY") else "not_configured"
            self._send_json_response({
                "status": "healthy",
                "api_key": api_key,
                "python_version": "3.10.13",
                "server": "Basic HTTP Server"
            })
        elif parsed_path.path == '/test':
            self._send_json_response({
                "test": "success",
                "message": "Basic HTTP server working correctly"
            })
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')

    def do_OPTIONS(self):
        self._set_headers()

    def log_message(self, format, *args):
        # Override to reduce log noise
        print(f"{self.address_string()} - {format % args}")

def run_server():
    port = int(os.getenv('PORT', 8000))
    server_address = ('', port)

    httpd = HTTPServer(server_address, SimpleAPIHandler)
    print(f"Starting basic HTTP server on port {port}")
    print(f"Server URL: http://localhost:{port}")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()