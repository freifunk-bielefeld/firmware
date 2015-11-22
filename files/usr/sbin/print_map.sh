#!/bin/sh

#Print out local connection data for map creation

print() {
	local community="$(uci get -q freifunk.@settings[0].community 2> /dev/null)"
	local version="$(uci get -q freifunk.@settings[0].version 2> /dev/null)"
	local name="$(uci get -q freifunk.@settings[0].name 2> /dev/null)"
	local geo="$(uci get -q freifunk.@settings[0].geo 2> /dev/null)"
	local contact="$(uci get -q freifunk.@settings[0].contact 2> /dev/null)"

	echo -n "{"

	[ -n "$geo" ] && echo -n "\"geo\" : \"$geo\", "
	[ -n "$name" ] && echo -n "\"name\" : \"$name\", "
	[ -n "$contact" ] && echo -n "\"contact\" : \"$contact\", "
	[ -n "$version" ] && echo -n "\"firmware\" : \"ffbi-$version\", "
	[ -n "$community" ] && echo -n "\"community\" : \"$community\", "

	echo -n "\"links\" : ["

	printLink() { echo -n "{ \"smac\" : \"$(cat /sys/class/net/$3/address)\", \"dmac\" : \"$1\", \"qual\" : $2 }"; }
	IFS="
"
	nd=0
	for entry in $(cat /sys/kernel/debug/batman_adv/bat0/originators 2> /dev/null | tr '\t/[]()' ' ' |  awk '{ if($1==$4) print($1, $3, $5) }'); do
		[ $nd -eq 0 ] && nd=1 || echo -n ", "
		IFS=" "
		printLink $entry
	done

	echo -n '], '
	mac=$(uci get -q network.freifunk.macaddr)
	echo -n "\"clientcount\" : $(cat /sys/kernel/debug/batman_adv/bat0/transtable_local 2> /dev/null | grep -c 'W')"
	echo -n '}'
}

if [ "$1" = "-p" ]; then
	publish_map="$(uci get -q freifunk.@settings[0].publish_map 2> /dev/null)"
	[ "$publish_map" != "1" ] && exit 0

	content="$(print)"
	if [ -n "$content" ]; then
		#make sure alfred is running
		pidof alfred > /dev/null || /etc/init.d/alfred start

		#publish content via alfred
		echo "$content" | alfred -s 64
		echo "map published"
	else
		echo "nothing published"
	fi
else
	print
fi
