#!/bin/sh

#Print out local connection data for map creation

map_level="$(uci get -q freifunk.@settings[0].publish_map 2> /dev/null)"

memory_usage()
{
	meminfo=$(cat /proc/meminfo)
	free=$(echo "$meminfo" | awk /^MemFree:/'{print($2)}')
	buffers=$(echo "$meminfo" | awk /^Buffers:/'{print($2)}')
	cached=$(echo "$meminfo" | awk /^Cached:/'{print($2)}')
	total=$(echo "$meminfo" | awk /^MemTotal:/'{print($2)}')
	echo $free $buffers $cached $total | awk '{ printf("%f", 1 - ($1 + $2 + $3) / $4)}'
}

rootfs_usage()
{
	df / | awk '/^rootfs/{print($5/100)}'
}

print_all() {
	local community="$(uci get -q freifunk.@settings[0].community 2> /dev/null)"
	local version="$(uci get -q freifunk.@settings[0].version 2> /dev/null)"
	local name="$(uci get -q freifunk.@settings[0].name 2> /dev/null)"
	local longitude="$(uci get -q freifunk.@settings[0].longitude 2> /dev/null)"
	local latitude="$(uci get -q freifunk.@settings[0].latitude 2> /dev/null)"
	local contact="$(uci get -q freifunk.@settings[0].contact 2> /dev/null)"

	echo -n "{"

	if [ -n "$longitude" -a -n "$latitude" ]; then
		echo -n "\"longitude\" : \"$longitude\", "
		echo -n "\"latitude\" : \"$latitude\", "
	fi

	[ -n "$name" ] && echo -n "\"name\" : \"$name\", "
	[ -n "$contact" ] && echo -n "\"contact\" : \"$contact\", "
	[ -n "$version" ] && echo -n "\"firmware\" : \"ffbi-$version\", "
	[ -n "$community" ] && echo -n "\"community\" : \"$community\", "

	if [ $map_level -gt 1 ]; then
		echo -n "\"loadavg\" : $(uptime | awk '{print($NF)}'), "
		echo -n "\"uptime\" : $(cat /proc/uptime | awk '{print($1)}'), "
		echo -n "\"model\" : \"$(cat /tmp/sysinfo/model)\", "
		echo -n "\"rootfs_usage\" : $(rootfs_usage), "
		echo -n "\"memory_usage\" : $(memory_usage), "
	fi

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
	cat /sys/kernel/debug/batman_adv/bat0/transtable_local 2> /dev/null | tr '\t/[]()' ' ' | awk -v mac=$mac 'BEGIN{ c=0; } { if($1 == "*" && $2 != mac && $4 ~ /^[.NW]+$/ && $5 < 300) c++;} END{ printf("\"clientcount\" : %d", c);}'
	echo -n '}'
}

if [ "$1" = "-p" ]; then
	[ $map_level -eq 0 ] && exit 0

	content="$(print_all)"
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
	print_all
fi
