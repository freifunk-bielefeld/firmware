#!/bin/sh                                                                                              

# Calculate up/dpwn speed on given network interfaces

for net in $@; do
        for act in rx_bytes tx_bytes; do
                bytes1="$(cat /var/$act$net)"
                time1="$(date +%s -r /var/$act$net)"

                bytes2="$(cat /sys/class/net/$net/statistics/$act)"
                time2="$(date +%s)"

                speed="$(expr \( $bytes2 - $bytes1 \) / \( $time2 - $time1 \) 2> /dev/null)"
                echo "${speed:-0}" > /var/speed_$act$net

                # Remember bytes for next time
                echo -n "$bytes2" > /var/$act$net
        done
done
