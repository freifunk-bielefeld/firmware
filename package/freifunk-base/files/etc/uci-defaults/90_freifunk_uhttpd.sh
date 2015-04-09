#!/bin/sh

uci delete uhttpd

uci -q batch <<-EOF >/dev/null
uhttpd.freifunk=uhttpd
uhttpd.freifunk.listen_http=80
uhttpd.freifunk.home=/www/freifunk
uhttpd.freifunk.rfc1918_filter=1
uhttpd.freifunk.cgi_prefix=/cgi-bin
uhttpd.freifunk.script_timeout=60
uhttpd.freifunk.network_timeout=30
uhttpd.freifunk.tcp_keepalive=1
uhttpd.freifunk.config=_
uhttpd.lan=uhttpd
uhttpd.lan.listen_https=443
uhttpd.lan.home=/www/lan
uhttpd.lan.rfc1918_filter=1
uhttpd.lan.cert=/etc/uhttpd.crt
uhttpd.lan.key=/etc/uhttpd.key
uhttpd.lan.cgi_prefix=/cgi-bin
uhttpd.lan.script_timeout=60
uhttpd.lan.network_timeout=30
uhttpd.lan.tcp_keepalive=1
uhttpd.lan.config=/etc/httpd.conf
uhttpd.px5g=cert
uhttpd.px5g.days=1400
uhttpd.px5g.bits=2048
uhttpd.px5g.commonname=OpenWrt
commit uhttpd
EOF

exit 0
