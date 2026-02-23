import http.server
import json
import pyautogui
import socketserver

PORT = 5000
SCREEN_WIDTH, SCREEN_HEIGHT = pyautogui.size()
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0
pyautogui.MINIMUM_DURATION = 0

class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/move':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            # Map normalized (0-1) to screen coordinates
            target_x = int(data['x'] * SCREEN_WIDTH)
            target_y = int(data['y'] * SCREEN_HEIGHT)
            
            # Smooth move is better but slower. For now, jump or small duration.
            # pyautogui.moveTo(target_x, target_y, duration=0) # Instant
            pyautogui.moveTo(target_x, target_y) 
            
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'OK')
            
        elif self.path == '/click':
            pyautogui.click()
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'OK')
        
    def log_message(self, format, *args):
        return # Silence logs to keep console clean

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Stark Bridge active on port {PORT}")
    print(f"Screen resolution: {SCREEN_WIDTH}x{SCREEN_HEIGHT}")
    httpd.serve_forever()
