#!/bin/sh                                                                                              

# Calculate up/down speed and record data volume on given network interfaces.

net="$1"
td="$2"

if [ -n "$net" -a -n "$td" ]; then
	bytes1="$(cat /var/${td}_data_${net} 2> /dev/null)"
	time1="$(date +%s -r /var/${td}_data_${net} 2> /dev/null)"

	bytes2="$(cat /sys/class/net/$net/statistics/${td}_bytes)"
	time2="$(date +%s)"

	# Only calculate new speed after at least one second has passed
	if [ "$time1" != "$time2" ]; then
		# Remember data volume for next time
		echo -n "$bytes2" > /var/${td}_data_${net}
	fi

	speed="$(expr \( $bytes2 - $bytes1 \) / \( $time2 - $time1 \) 2> /dev/null)"
	echo "${speed:-0}"
else
	echo "Usage: $0 <interface> [tx|rx]"
fi
