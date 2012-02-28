#!/usr/bin/haserl -n
Content-type: text/html

<html>
<head>
<title>Info</title>
</head>
<body>
<a href="https://<% ifconfig br-mesh | grep "inet addr" | awk 'BEGIN { FS=":" } { print $2 }'| awk '{ printf "%s", $1 }' %>">Login</a><br />
<br />
<b>Andere Knoten im Netz: </b>
<% batctl o | grep -c "^[0-9a-f]\{2\}:" %>
<br /><br />
<b>Liste bekannter Gateways: </b>
<%
gw_macs=`batctl gwl | grep "^=>" | awk '{ print $2 }'`
if [ `batctl gw | grep -c -o -m 1 "^server"` -eq 1 ]; then
  own_ip=`ifconfig br-mesh | grep "inet addr" | awk 'BEGIN { FS=":" } { print $2 }'| awk '{ print $1 }'`
fi

if [ ! -z "$gw_macs" ]; then
  echo "<ul>"
  if [ -n "$own_ip" ]; then
    echo "<li>$own_ip (dieser Knoten)</li>"
  fi
  for mac in "$gw_macs"; do
    [ -n "$mac" ] && echo "<li>" `mac2ip "$mac"` "</li>"
  done
  echo "</ul>"
else
  if [ -n "$own_ip" ]; then
    echo "<ul>"
    echo "<li>$own_ip (dieser Knoten)</li>"
    echo "</ul>"
  else
    echo "Keine"
  fi
fi
%>
</body>
</html>
