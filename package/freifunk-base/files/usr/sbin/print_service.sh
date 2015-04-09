#!/bin/sh

#Print a link that is displayed on other routers status page

print() {
	local link="$(uci get -q freifunk.@settings[0].service_link)"
	local label="$(uci get -q freifunk.@settings[0].service_label)"
	if [ -n "$link" -a -n "$label" ]; then
		echo "{ \"link\" : \"$link\", \"label\" : \"$label\" }"
	fi
}

if [ "$1" = "-p" ]; then
	content="$(print)"
	if [ -n "$content" ]; then
		echo "$content" | alfred -s 91
		echo "service published"
	else
		echo "nothing published"
	fi
else
	print
fi
