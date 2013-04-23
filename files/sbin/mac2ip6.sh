#!/bin/sh

# Create an IPv6 address based on a given MAC
# and the configured IPv6 prefix.


mac=$1
prefix=`uci get -q freifunk.@settings[0].ff_prefix`

[ -z "$mac" -o -z "$ff_prefix" -o ${#mac} -ne 17 ] && exit 1

ip="$prefix:"
i=0
IFS=':';
for hex in $mac; do
	[  $i -ne 0 -a $(($i%2)) -eq 0 ] && {
		ip="$ip:"
	}
	ip="$ip$hex"
	i=$((i+1))
done
IFS="
"
echo $ip
