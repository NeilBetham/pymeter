#!/usr/bin/env python
from flask import Flask
from common import *

app = Flask(__name__)

# Interface to monitor bytes in and out on
interfaceToMon = 'eth0'

# Max total bw
maxbw = 1000

# Connect to memcache
bc = BandwidthDataCache()

# Root path reads in html file to do some formatting then returns html string
@app.route("/")
def hello():
	ret = ''
	with open('static/main.html', 'r') as base:
		for line in base:
			ret += line.replace('max: 1000','max: '+str(maxbw))
	return ret

# BW API Endpoint returns json of up and down bandwidth and the time delta
@app.route("/bw", methods=['GET'])
def bandWidth():
	return bc.getBandwidthData()

@app.route("/history", methods=['GET'])
def history():
	return bc.getHistoryData()

@app.route("/daemon", methods=['GET'])
def daemon():
	return bc.getDaemonData()
	
# If we are running standalone
if __name__ == "__main__":
	app.debug = True
	app.run(host='0.0.0.0')
