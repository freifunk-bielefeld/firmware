#!/bin/sh                                                                                              

# Calculate up/down speed and record data volume on given network interfaces.
# The result will be written to /var/.

for net in $@; do
        for act in rx tx; do
                bytes1="$(cat /var/${act}_data_${net} 2> /dev/null)"
                time1="$(date +%s -r /var/${act}_data_${net} 2> /dev/null)"

                bytes2="$(cat /sys/class/net/$net/statistics/${act}_bytes)"
                time2="$(date +%s)"

		# Only calculate speed after at least one second has passed
		if [ "$time1" != "$time2" ]; then
			speed="$(expr \( $bytes2 - $bytes1 \) / \( $time2 - $time1 \) 2> /dev/null)"
			echo "${speed:-0}" > /var/${act}_speed_${net}

			# Remember data volume for next time
			echo -n "$bytes2" > /var/${act}_data_${net}
		fi
        done
done
