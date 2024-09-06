import threading
import sys
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from bs4 import BeautifulSoup
import re

PORT = 49876

def extract_test_cases_with_test_case_count(html):
    soup = BeautifulSoup(html, 'html.parser')
    
    test_case_divs = soup.find_all('div', class_='test-example-line')
    
    test_cases = []
    odd_group = []
    even_group = []
    
    for div in test_case_divs:
        text = div.get_text(strip=True)
        
        if 'test-example-line-odd' in div.get('class', []):
            if even_group:
                test_cases.append("\n".join(even_group))
                even_group = []
            odd_group.append(text)
        else:
            if odd_group:
                test_cases.append("\n".join(odd_group))
                odd_group = []
            even_group.append(text)
    
    if odd_group:
        test_cases.append("\n".join(odd_group))

    if even_group:
        test_cases.append("\n".join(even_group))
    return test_cases

def extract_test_case_without_test_case_count(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')

    input_divs = soup.find_all('div', class_='input')

    test_cases = [div.find('pre').get_text(strip=True) for div in input_divs]

    return test_cases

    
def extract_input_description(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    input_spec = soup.find('div', class_='input-specification')
    
    if not input_spec:
        return []
    
    paragraphs = []
    for p in input_spec.find_all('p'):
        text = ''
        for content in p.contents:
            if content.name == 'span':
                continue
            # Extract and append raw text from the script tags (used for MathJax)
            elif content.name == 'script' and content.get('type') == 'math/tex':
                text += f'$${content.string}$$'
            else:
                text += str(content)
        
        text = re.sub(r'\s+', ' ', text).strip()
        paragraphs.append(text)
    
    return paragraphs



class RequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')

        try:
            problem_data = post_data
            hasTestCaseCount = True if sys.argv[1] == "True" else False 
            if hasTestCaseCount:
              print(extract_test_cases_with_test_case_count(problem_data)[1], end="©")
              print(''.join(extract_input_description(problem_data)[1:]))
            else:
              print(extract_test_case_without_test_case_count(problem_data)[0], end="©")
              print(''.join(extract_input_description(problem_data)))
                
            sys.exit()

        except json.JSONDecodeError as error:
            print('Error parsing JSON:', error)

        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*') 
        self.end_headers()
        self.wfile.write(b'Data received')

def run(httpd):
    httpd.serve_forever()

def stopServerTimeout(server,serverThread):
    currTime = time.time()
    endTime = currTime + 30  # in seconds
    while time.time() < endTime and serverThread.is_alive():
        time.sleep(1)  # sleep for 10 seconds
    if(serverThread.is_alive()):
        server.shutdown()

if __name__ == "__main__":
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, RequestHandler)

    # create and start the server thread
    serverThread = threading.Thread(target=run, args=(httpd,))
    serverThread.start()

    # create and start the timeout thread, passing the server instance
    timeoutThread = threading.Thread(target=stopServerTimeout, args=(httpd,serverThread))
    timeoutThread.start()
