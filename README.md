pymeter
=======

WSGI Python App To Keep An Eye On Network Bandwidth

[link Example](http://neilbetham.github.com/pymeter/)


Dependencies
------------
* python Flask
		* sudo easy_install flask
* mod_wsgi
		* sudo apt-get install libapache2-mod-wsgi

Setup
-------------
* Place the pymeter folder somewhere in you web server's document root.

Config
-------------
The config file for an example apache vhost is in the ApacheConfig folder.
The vhost config for apache will require a bit of tweaking, namely:
* WSGIScriptAlias / /var/www/pymeter/pymeter.wsgi Should be changed to match where the app is placed on the system
* Directory /var/www/pymeter/ Should also be changed to match where the app is placed on the system
* WSGIDaemonProcess pymeter user=www-data group=www-data threads=5 home=/var/www/pymeter/
    * The use and group may need to modified to fit your system
    * home should be changed to the root folder for pymeter

OS Support
--------------
* Ubuntu Server 12.04
* **Anything with a proper /proc/net/dev**