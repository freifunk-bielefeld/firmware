#!/bin/sh

uci delete batman-adv

uci -q batch <<-EOF >/dev/null
batman-adv.bat0=mesh
batman-adv.bat0.orig_interval=10000
batman-adv.bat0.multicast_mode=1
batman-adv.bat0.distributed_arp_table=0
commit batman-adv
EOF

exit 0
