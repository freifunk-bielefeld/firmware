#!/usr/bin/haserl -n
Content-type: text/html

<html>
<head>
<title>Info</title>
</head>
<body>
<a href="https://<% ifconfig br-mesh | grep "inet addr" | awk 'BEGIN { FS=":" } { print $2 }'| awk '{ print $1 }' %>">Login</a>
<b>Anzahl der Nutzer dieses Knotens:</b>
<pre><% ndsctl clients %></pre>
<b>Anzahl bekannter Knoten:</b>
<pre><%batctl o | grep -c "^[0-9a-b]\{2\}:"%></pre>
<b>Bekannte Gateways:</b>
<pre><% batctl gwl %></pre>
<b>Splash-Seite:</b>
<pre><% ndsctl status %></pre>
</body>
</html>
