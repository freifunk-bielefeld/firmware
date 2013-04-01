#!/usr/bin/haserl -n
Content-type: text/html

<html>
<head>
<title>Info</title>
<style type="text/css">
* {
    margin: 0;
}

html, body {
    height: 98%;
}

#header {
	margin:1%;
}

#footer {
    position: absolute;
    bottom: 1%;
    left: 1%;
    right: 1%;
    width: 98%;
}
</style>
</head>
<body>
<div id="header">
<b>Name des Knoten: </b>
<% uci get system.@system[0].hostname %>
<br />
<b>Eigene IP-Adresse: </b>
<% ifconfig br-public 2> /dev/null | awk -F':' '/inet addr/{split($2,_," ");print _[1]}' %>
<br />
<b>Anzahl bekannter Knoten: </b>
<% echo $((`batctl tg | grep '^ \*' | cut -b 33-49 | sort | uniq | wc -l 2> /dev/null`+1)) %>
<br />
<b>Anzahl benachbarter Knoten: </b>
<% batctl o | grep '^[[:digit:]|[:lower:]]' | cut -b 37-53 | sort | uniq | wc -l %>
<br /><br />
<b>Liste bekannter Gateways: </b>
<br /><br />
<%

own_mac=`cat /sys/class/net/dummy_mesh/address 2> /dev/null`
own_status=`batctl gw 2> /dev/null`

[ "${own_status:0:6}" = "server" ] && {
	gw_macs="$own_mac"
	gw_mac="$own_mac"
}

IFS="
"
for line in `batctl gwl | tail -n+2`; do
	local mac="${line:3:17}"
	[ "$mac" = "gateways in range" ] && continue
	[ -z "$gw_mac" -a "${line:0:2}" = "=>" ] && gw_mac="$mac"
	gw_macs="$gw_macs $mac"
done

echo "<ul>"
IFS=" "
for mac in $gw_macs; do
	ip=`mac2ip $mac`
	[ "$mac" = "$gw_mac" ] && ext=" (aktueller default)" || ext=""
	[ -n "$ip" ] && echo "<li><a href='http://$ip'>$ip</a>$ext</li>"
done
echo "</ul>"

%>
</div>

<div id="footer">
    <span style="float: left;"><a href="#" id="link">Login</a></span>
    <span style="float: right;"><a href="http://www.freifunk-bielefeld.de/">Version</a> <% uci get -q freifunk.@settings[0].version || echo "???" %></span>
</div>

<script type="text/javascript">
document.getElementById("link").href="https://"+location.host;
</script>

</body>
</html>
