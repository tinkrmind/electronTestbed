#!/usr/bin/env python

from http.server import BaseHTTPRequestHandler, HTTPServer
# import SocketServer
from urllib.parse import urlparse
import urllib.request
import urllib
import time

import logging
import subprocess
import sys
import random

# ApiAI
import os.path
import sys

try:
    import apiai
except ImportError:
    sys.path.append(
        os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir)
    )
    import apiai

import json
import math

CLIENT_ACCESS_TOKEN = 'e65a38c1c3494f44a77aec4a02863df8'
sessionID = time.time()
firstRun = 0

def getOctopartResponse(text):
    url = "http://octopart.com/api/v3/parts/search"
    url += "?apikey=861f85cf"

    args = [
       ('q', text),
       ('start', 0),
       ('limit', 1)
       ]

    url += '&' + urllib.parse.urlencode(args)

    print(url)
    data = urllib.request.urlopen(url)
    print(data)

    str_response = data.read().decode('utf-8')
    search_response = json.loads(str_response)
    # search_response = json.loads(data)

    # print results
    for result in search_response['results']:
       part = result['item']
       # print matched part
       print(part['mpn'])

def getDialogflowResponse(text):
    ai = apiai.ApiAI(CLIENT_ACCESS_TOKEN)

    request = ai.text_request()

    # if continue_session == False:
    request.session_id = sessionID
    #random.randint(0,999999999999)

    request.query = text

    response = request.getresponse()

    return response

def restartConversation():
    global sessionID
    sessionID = time.time()
    main()

class S(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):
        self._set_headers()

        query = urlparse(self.path).query
        query_components = dict(qc.split("=") for qc in query.split("&"))
        text = query_components["test"]

        # time.sleep(3)

        print('You said:', text)
        text = text.lower()
        if text == 'restart conversation' or text == 'reset conversation':
            restartConversation()

        response = getDialogflowResponse(text)
        responseString = response.read().decode('utf-8')
        responseJSON = json.loads(responseString);
        print (json.dumps(responseJSON, indent = 4, sort_keys = False))

        self.wfile.write(text)

def run(server_class=HTTPServer, handler_class=S, port=8080):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print('Starting httpd...')
    httpd.serve_forever()


if __name__ == "__main__":
    from sys import argv

    getOctopartResponse('555 timer')

    # if len(argv) == 2:
    #     run(port=int(argv[1]))
    # else:
    #     run()
