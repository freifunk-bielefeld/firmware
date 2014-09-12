#!/bin/sh

link="$(uci get -q freifunk.@settings[0].service_link)"
label="$(uci get -q freifunk.@settings[0].service_label)"

[ -z "$link" -o -z "$label" ] && exit 1

echo "{ \"link\" : \"$link\", \"label\" : \"$label\" }"
