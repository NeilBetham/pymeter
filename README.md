pymeter
=======

WSGI Python App To Keep An Eye On Network Bandwidth

[Example](http://neilbetham.github.com/pymeter/)


Dependencies
------------
* python Flask
    * sudo easy_install flask
* mod_wsgi
    * sudo apt-get install libapache2-mod-wsgi
* Memcahced
	* sudo apt-get install memcached

Setup
-------------
* Place the pymeter folder somewhere in you web server's document root.
* Modify and copy the upstart script into /etc/init/; Then run "start bw-daemon"
* Modify and copy the apache vhost config into your sites-available folder and active it

Config
-------------
The config file for an example apache vhost is in the ApacheConfig folder.
The vhost config for apache will require a bit of tweaking, namely:
* WSGIScriptAlias / /var/www/pymeter/pymeter.wsgi Should be changed to match where the app is placed on the system
* Directory /var/www/pymeter/ Should also be changed to match where the app is placed on the system
* WSGIDaemonProcess pymeter user=www-data group=www-data threads=5 home=/var/www/pymeter/
    * The user and group may need to modified to fit your system
    * home should be changed to the root folder for pymeter
* pymeter/__init__.py
    * maxbw Needs to be changed to the theoretical max bandwidth of the port you are monitoring
* pymeter/daemon.py
	* iFace Needs to be changed to the main network port to monitor
	* numSamples Needs to be changed to the number of samples to buffer for history graphing

OS Support
--------------
* Ubuntu Server 12.04
* **Anything with a proper /proc/net/dev**