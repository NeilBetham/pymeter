#!/usr/bin/env python
import time, common, json

# Number of samples to buffer up
numSamples = 720 # An hours worth of samples

# Interface to monitor
iFace = 'eth0'

def runLoop():
	daemonInfo = {
		'lastCheckin':time.time(),
		'numSamples':0,
	}
	cc = common.BandwidthDataCache()
	bw = common.getBwData(iFace)
	history = json.loads(cc.getHistoryData()) if cc.getHistoryData() != None else []

	while True:
		# Anything less than 5 seconds and the data gets wonky
		time.sleep(5)

		toCache = {}

		# Get the current bandwidth data
		current = common.getBwData(iFace)
		toCache['out'] = current['out'] - bw['out']
		toCache['in'] = current['in'] - bw['in']
		toCache['timeDiff'] = current['time'] - bw['time']
		toCache['time'] = time.time()
		bw = current
		
		# Write that out to the cache
		cc.setBandwidthData(toCache)

		# Buffer up results till we hit the limit
		if len(history) < numSamples:
			history.insert(0, toCache)
		else:
			history.pop(len(history) - 1)
			history.insert(0, toCache)

		# Store out the history to the cache
		cc.setHistoryData(history)

		# Store out info from this process
		daemonInfo['lastCheckin'] = time.time()
		daemonInfo['numSamples'] = len(history)
		cc.setDaemonData(daemonInfo)

if __name__ == "__main__":
	runLoop()