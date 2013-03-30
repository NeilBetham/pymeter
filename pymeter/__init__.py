#!/usr/bin/env python
import os
from flask import Flask
from time import time

app = Flask(__name__)

# Interface to monitor bytes in and out on
interfaceToMon = 'bond0'

# Max total bw
maxbw = 1000

# Get intial start time
startT = time()


def getBwData(iface):
	# RX bytes first then TX bytes
	with open('/proc/net/dev','r') as ifaceStat:
		for line in ifaceStat:
			if iface in line:
				lsplit = line.split()
				down = lsplit[1]
				up = lsplit[9]
	return [int(down),int(up)]

# Get Initial bandwidth count
startBw = getBwData(interfaceToMon)

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
	global startT
	global startBw
	newBw = getBwData(interfaceToMon)
	newT = time()
	deltaT = float(newT) - float(startT)
	bpsdown = float(newBw[0] - startBw[0])/deltaT
	bpsup = float(newBw[1] - startBw[1])/deltaT
	startT = newT
	startBw = newBw
	return '{"bpsup":%d,"bpsdown":%d,"tdif":%d}' % (bpsup,bpsdown,deltaT)

# If we are running standalone
if __name__ == "__main__":
	app.debug = True
	app.run(host='0.0.0.0')
