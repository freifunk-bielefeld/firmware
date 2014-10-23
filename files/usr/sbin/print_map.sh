#!/bin/sh

#Print out local connection data for map creation

print() {
	local default_ap_ssid="$(uci get -q freifunk.@settings[0].default_ap_ssid 2> /dev/null)"
	local community="${default_ap_ssid%%.*}"
	local version="$(uci get -q freifunk.@settings[0].version 2> /dev/null)"
	local name="$(uci get -q freifunk.@settings[0].name 2> /dev/null)"
	local geo="$(uci get -q freifunk.@settings[0].geo 2> /dev/null)"

	echo -n "{"

	[ -n "$geo" ] && echo -n "\"geo\" : \"$geo\", "
	[ -n "$name" ] && echo -n "\"name\" : \"$name\", "
	[ -n "$version" ] && echo -n "\"firmware\" : \"ffbi-$version\", "
	[ -n "$community" ] && echo -n "\"community\" : \"$community\", "

	echo -n "\"links\" : ["

	printLink() { echo -n "{ \"smac\" : \"$(cat /sys/class/net/$3/address)\", \"dmac\" : \"$1\", \"qual\" : $2 }"; }
	IFS="
	"
	nd=0
	for entry in $(cat /sys/kernel/debug/batman_adv/bat0/originators |  tr '\t/[]()' ' ' |  awk '{ if($1==$4) print($1, $3, $5) }'); do
		[ $nd -eq 0 ] && nd=1 || echo -n ", "
		IFS=" "
		printLink $entry
	done

	echo -n '], '
	mac=$(uci get -q network.public.macaddr)
	cat /sys/kernel/debug/batman_adv/bat0/transtable_local | tr '\t/[]()' ' ' | awk -v mac=$mac 'BEGIN{ c=0; } { if($1 == "*" && $2 != mac && $4 ~ /^[.NW]+$/ && $5 < 300) c++;} END{ printf("\"clientcount\" : %d", c);}'
	echo -n '}'
}

if [ "$1" = "-p" ]; then
	map_publish="$(uci get -q freifunk.@settings[0].map_publish 2> /dev/null)"
	[ "$map_publish" != "1" ] && exit 0

	content="$(print)"
	if [ -n "$content" ]; then
		echo "$content" | alfred -s 64
	fi
else
	print
fi
