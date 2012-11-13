#!/usr/bin/haserl -n
Content-type: text/html

<html>
<head>
<title>Info</title>
</head>
<body>
<a href="#" id="link">Login</a><br />
<script type="text/javascript">
document.getElementById("link").href="https://"+location.host;
</script>
<br />
<b>Eigene IP-Adresse: </b>
<% ifconfig br-mesh | grep "inet addr" | awk 'BEGIN { FS=":" } { print $2 }'| awk '{ print $1 }' %>
<br />
<b>Anzahl aller Knoten: </b>
<% echo $((`batctl tg | grep '^ \*' | cut -b 33-49 | sort | uniq | wc -l 2> /dev/null`+1)) %>
<br />
<b>Anzahl benachbarter Knoten: </b>
<% batctl o | grep '^[[:digit:]|[:lower:]]' | cut -b 37-53 | sort | uniq | wc -l %>
<br /><br />
<b>Liste bekannter Gateways: </b>
<%

own_mac=`cat /sys/class/net/br-mesh/address 2> /dev/null`
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
    if [ "$mac" = "$gw_mac" ]; then
        echo "<li>$ip (aktueller default)</li>"
    else
        echo "<li>$ip</li>"
    fi
done
echo "</ul>"

%>
</body>
</html>