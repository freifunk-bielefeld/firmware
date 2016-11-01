#!/bin/sh

#create an IPv6 ULA-address based on EUI-64
ula_addr()
{
	local prefix a  prefix="$1" mac="$2" invert=${3:-0}

	if [ $invert -eq 1 ]; then
		# translate to local administered mac
		a=${mac%%:*} #cut out first hex
		a=$((0x$a ^ 2)) #invert second least significant bit
		a=$(printf '%02x\n' $a) #convert back to hex
		mac="$a:${mac#*:}" #reassemble mac
	fi

	mac=${mac//:/} # remove ':'
	mac=${mac:0:6}fffe${mac:6:6} # insert ffee
	mac=$(echo $mac | sed 's/..../&:/g') # insert ':'

	# assemble IPv6 address
	echo "${prefix%%::*}:${mac%?}"
}
