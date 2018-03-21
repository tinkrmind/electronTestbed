#!/usr/bin/env python
from http.server import BaseHTTPRequestHandler, HTTPServer
# import SocketServer
from urllib.parse import urlparse
from urllib.parse import unquote
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

import config
# dialogflow
CLIENT_ACCESS_TOKEN = config.dialogflow_config['CLIENT_ACCESS_TOKEN']
# octopart
API_KEY = config.octopart_config['API_KEY']
sessionID = time.time()
firstRun = 0

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s:%(name)s:%(message)s"
)

colors = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'grey', 'white'];
colorsForEncoding = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'grey', 'white', 'gold', 'silver'];
colorsForDecoding = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'grey', 'white', 'gray'];
fancyColors =['gold', 'silver', 'unknown'];
unitModifiers = ['femto', 'pico', 'nano', 'micro', 'milli', 'kilo', 'mega', 'giga', 'tera'];

def getPosition(list, item):
    return [(i, sublist.index(item)) for i, sublist in enumerate(list) if item in sublist]

def decodeResistor(band1, band2, band3, band4):
    responseString = '';

    resistorValue = 0;

    v1 = getPosition(colorsForDecoding, band1)[0][0]
    v2 = getPosition(colorsForDecoding, band2)[0][0]
    v3 = getPosition(colorsForDecoding, band3)[0][0]
    v4 = getPosition(fancyColors, band4)[0][0]

    if v1 == 10:
        v1 = 8
    if v2 == 10:
        v2 = 8
    if v3 == 10:
        v3 = 8

    #print(v1, v2, v3, v4);
    resistorValue = (v1*10+v2)*pow(10, v3)
    tempResistance = resistorValue
    #recalcualte v1 v2 v3 because it gets messed up when band1 is black
    v3 = 0
    while tempResistance > 100:
        tempResistance = tempResistance/10
        v3+=1

    v1 = math.floor((tempResistance)/10)
    v2 = math.floor(tempResistance%10)

    responseString = str(resistorValue) + 'ohms';
    print("Resistance:", resistorValue)
    if v3 > 1:
        responseString = str('{:g}'.format((v1*10+v2)*pow(10, (v3-3)))) + 'kilo ohms';
    if v3 > 4:
        responseString = str('{:g}'.format((v1*10+v2)*pow(10, (v3-6)))) + ' mega ohms ';
    if v3 > 7:
        responseString = str('{:g}'.format((v1*10+v2)*pow(10, (v3-9)))) + ' giga ohms ';

    if v4 == 0:
        if random.randint(0, 1):
            responseString += 'plus minus five percent';
        else:
            responseString += 'tolerance five percent';
    if v4 == 1:
        if random.randint(0,1):
            responseString += 'plus minus ten percent';
        else:
            responseString += 'tolerance ten percent';

    return responseString


def encodeResistor(value, unitModifier, resistanceUnit):
    responseString = ''

    if unitModifier == "" and resistanceUnit == "":
        responseString = "I'm sorry, I don't understand the resistor value"
        restartConversation()
        return responseString

    resistance = float(value)
    if unitModifier != "":
        exponent = getPosition(unitModifiers, unitModifier)[0][0]

        if exponent <= 4:
            responseString = "I don't think they make four band resistors with such small values"
            return responseString
        else:
            exponent = (exponent -4)*3;

        resistance = resistance * pow(10, exponent);

    v3 = 0
    while resistance >= 100:
        resistance = resistance/10
        v3+=1

    v1 = math.floor((resistance)/10)
    v2 = round(resistance)%10

    print(v1)
    print(v2)
    print(v3)

    responseString = "Resistor colors are "
    responseString += colorsForEncoding[v1]
    responseString += ' '
    responseString += colorsForEncoding[v2]
    responseString += ' '
    responseString += colorsForEncoding[v3]

    print(responseString)

    return responseString

def getOctopartResponse(techSpec, component):
    print("Getting octopart spec "+techSpec+" for "+component)
    techSpecResponses = {"supply_voltage_dc":"The supply voltage for ", "pin_count":"The number of pins in "}
    mpn= ""
    response = ""

    url = "http://octopart.com/api/v3/parts/search"
    url += "?apikey="+API_KEY

    args = [
       ('q', component),
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
       mpn = part['mpn']

    url = "http://octopart.com/api/v3/parts/match"
    url += "?apikey="+API_KEY

    args = [
       ('queries', "[{\"mpn\":\""+mpn+"\"}]"),
       ('include[]', 'specs')
       ]

    url += '&' + urllib.parse.urlencode(args)

    print(url)
    data = urllib.request.urlopen(url)
    print(data)
    str_response = data.read().decode('utf-8')
    search_response = json.loads(str_response)
    # print(search_response['results'])
    print(search_response['results'][0]['items'][0]['specs'][techSpec]['display_value'])

    response =  techSpecResponses[techSpec]+mpn+" is "+search_response['results'][0]['items'][0]['specs'][techSpec]['display_value'];

    return response

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
    return "Conversation restarted!"

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
        text = unquote(text).lower()
        if text == 'restart conversation' or text == 'reset conversation':
            responseSpeech = restartConversation()

        else:
            response = getDialogflowResponse(text)
            responseString = response.read().decode('utf-8')
            responseJSON = json.loads(responseString);
            print (json.dumps(responseJSON, indent = 4, sort_keys = False))

            if responseJSON["status"]["errorType"] == "success":
                responseSpeech = str(responseJSON["result"]["fulfillment"]["messages"][0]["speech"])
                print(responseSpeech)

                getTechSpec = 'getTechSpec'
                decodeResistorString = 'Decoding resistor'
                encodeResistorString = 'Encoding resistor'
                resetConversationString = 'RESTART CONVERSATION'
                selfDestructString = 'Self Destruct'

                if getTechSpec in responseSpeech:
                    responseSpeech = getOctopartResponse(responseJSON["result"]["parameters"]["techSpec"].lower(),
                                                responseJSON["result"]["parameters"]["any"].lower())
                    print(responseSpeech)

                elif decodeResistorString in responseSpeech:
                    responseSpeech = decodeResistor(responseJSON["result"]["parameters"]["BandColor1"].lower(),
                                                responseJSON["result"]["parameters"]["BandColor2"].lower(),
                                                responseJSON["result"]["parameters"]["BandColor3"].lower(),
                                                responseJSON["result"]["parameters"]["ToleranceColor"].lower())

                elif encodeResistorString in responseSpeech:
                    print(responseJSON);
                    responseSpeech = encodeResistor(responseJSON["result"]["parameters"]["number"].lower(),
                                                responseJSON["result"]["parameters"]["unitModifier"].lower(),
                                                responseJSON["result"]["parameters"]["resistanceUnit"].lower())

                elif resetConversationString in responseSpeech:
                    responseSpeech = restartConversation()

        self.wfile.write(responseSpeech.encode())

def run(server_class=HTTPServer, handler_class=S, port=config.port):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print('Starting httpd...')
    httpd.serve_forever()


if __name__ == "__main__":
    from sys import argv

    # result = getOctopartResponse('supply_voltage_dc', '555 timer')
    # print(result)
    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
