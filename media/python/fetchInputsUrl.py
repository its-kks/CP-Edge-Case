import threading
import sys
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

PORT = 10043

class RequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Received a POST request from Competitive Companion
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        try:
            problem_data = json.loads(post_data)
            print(problem_data['tests'][0]['input'], end='')
            print('©', end='')
            print(problem_data['url'], end='')
            sys.exit()

        except json.JSONDecodeError as error:
            print('Error parsing JSON:', error)
        
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'Data received')

def run(httpd):
    # Server is now listening on port PORT 10043
    httpd.serve_forever()

def stopServerTimeout(server,serverThread):
    currTime = time.time()
    endTime = currTime + 30  # in seconds
    while time.time() < endTime and serverThread.is_alive():
        time.sleep(1)  # Sleep for 10 seconds
    if(serverThread.is_alive()):
        server.shutdown()

if __name__ == "__main__":
    # Create the server instance
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, RequestHandler)

    # Create and start the server thread
    serverThread = threading.Thread(target=run, args=(httpd,))
    serverThread.start()

    # Create and start the timeout thread, passing the server instance
    timeoutThread = threading.Thread(target=stopServerTimeout, args=(httpd,serverThread))
    timeoutThread.start()