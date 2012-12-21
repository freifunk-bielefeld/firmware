#!/bin/sh

get_ip() {
	ifconfig "$1" 2> /dev/null | awk -F':' '/inet addr/{split($2,_," ");print _[1]}'
}

env_foreach()
{
	local pkg sec opt key val old="$IFS"
	split() { pkg=${1:4}; sec=$2; opt=$3; }
	IFS="
"
	for line in `env | grep "^GET_$1"`; do
		key=${line%%=*}
		val=${line##*=}
		IFS="#"; split $key;
		[ -n "$opt" ] && $2 "$pkg" "$sec" "$opt" "$val"
	done
	IFS="$old"
}
