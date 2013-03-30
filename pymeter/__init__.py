#!/usr/bin/env python
import os
from flask import Flask
from time import time

app = Flask(__name__)
app.debug = True

#Interface to monitor byrtes in and out on
interfaceToMon = 'bond0'
#Max total bw
maxbw = 1000
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
#Chicken or the egg?
startBw = getBwData(interfaceToMon)

@app.route("/pwd")
def pwd():
	return os.getcwd()

@app.route("/")
def hello():
	ret = ''
	with open('static/main.html', 'r') as base:
		for line in base:
			ret += line.replace('max: 1000','max: '+str(maxbw))
	return ret


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


if __name__ == "__main__":
	app.run(host='0.0.0.0')
