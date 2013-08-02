import json, time, memcache

# Gets bytes in and out for specified interface
def getBwData(iface):
	# RX bytes first then TX bytes
	with open('/proc/net/dev','r') as ifaceStat:
		for line in ifaceStat:
			if iface in line:
				lsplit = line.split()
				down = lsplit[1]
				up = lsplit[9]
	return {'in':int(down), 'out':int(up), 'time':time.time()}

class BandwidthDataCache():
	def __init__(self):
		self.mc = memcache.Client(['127.0.0.1:11211'], debug=0)

	def getBandwidthData(self):
		return self.mc.get('current')
	
	def setBandwidthData(self, dict):
		return self.mc.set('current', json.dumps(dict))

	def getHistoryData(self):
		return self.mc.get('history')

	def setHistoryData(self, dict):
		return self.mc.set('history', json.dumps(dict))

	def getDaemonData(self):
		return self.mc.get('status')

	def setDaemonData(self, dict):
		return self.mc.set('status', json.dumps(dict))
