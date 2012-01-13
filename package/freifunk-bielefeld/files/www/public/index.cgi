#!/usr/bin/haserl
Content-type: text/html

<html>
<head>
<title>Info</title>
</head>
<body>
<h2>Nodes:</h2>
<pre><% ndsctl status %></pre>
<h2>Gateways:</h2>
<pre><% batctl gwl %></pre>
<h2>Splash:</h2>
<pre><% ndsctl status %></pre>
</body>
</html>

