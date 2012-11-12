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
<b>Eigene Mesh IP: </b>
<% ifconfig br-mesh | grep "inet addr" | awk 'BEGIN { FS=":" } { print $2 }'| awk '{ print $1 }' %>
<br />
<b>Andere Knoten im Netz: </b>
<% batctl tg | grep '^ \*' | cut -b 33-49 | sort | uniq | wc -l %>
<br />
<b>Anzahl benachbarter Knoten: </b>
<% batctl o | grep '^[[:digit:]|[:lower:]]' | cut -b 37-53 | sort | uniq | wc -l %>
<br /><br />
<b>Liste bekannter Gateways: </b>
<%
gw_ip=`cat /tmp/ff_mesh_gw 2> /dev/null`
IFS="
"
echo "<ul>"
for line in `batctl gwl`; do
    mac=`echo "$line" | grep -o -E -m 1 '([[:xdigit:]]{1,2}:){5}[[:xdigit:]]{1,2}'`
    ip=`mac2ip $mac`
    if [ "$ip" = "$gw_ip" ]; then
        echo "<li>$ip (aktueller default)</li>"
    else
        echo "<li>$ip</li>"
    fi
done
echo "</ul>"
%>
</body>
</html>
