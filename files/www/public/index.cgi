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
<% ip -4 address show dev br-public 2> /dev/null | sed -rn 's/.*inet6? (.*[^:])\/.*/\1/p' | head -1 %>
<br />
<b>Eigene IPv6-Addresse: </b>
<% ip -6 address show dev br-public 2> /dev/null | sed -rn 's/.*inet6? (.*[^:])\/.*/\1/p' | head -1 %>
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

#selected gateway
public_gw_mac="`cat /tmp/public_gw_mac 2> /dev/null`"

#add own mac to gateway mac list
if uci get -q firewall.share_internet 2> /dev/null; then
	#add own mac to gateway list
	own_mac=`cat /sys/class/net/dummy_mesh/address 2> /dev/null`
fi

IFS="
"
found_gw="no"
echo "<ul>"
for mac in $own_mac `batctl gwl | sed 's/=>//' | awk -F' ' '{printf("%.3d %s\n", $(NF-2), $1)}' | sort -n -r | cut -f 2 -d ' ' 2> /dev/null`; do
	[ ${#mac} -ne 17 ] && continue
	ip=`mac2ip $mac`
	[ "$mac" = "$public_gw_mac" ] && ext=" (aktueller default)" || ext=""
	[ -n "$ip" ] && { echo "<li><a href='http://$ip'>$ip</a>$ext</li>"; found_gw="yes"; }
done
echo "</ul>"
if [ "$found_gw" = "no" ]; then
	echo "<li>Kein Gateway gefunden</li>"
fi
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
