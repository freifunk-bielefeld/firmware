#!/bin/sh

uci delete simple-radvd

uci -q batch <<-EOF >/dev/null
simple-radvd.@interface[0]=interface
simple-radvd.@interface[0].ifname=br-freifunk
simple-radvd.@interface[0].prefix=fdef:17a0:ffb1:300::/64
simple-radvd.@interface[1]=interface
simple-radvd.@interface[1].ifname=br-lan
simple-radvd.@interface[1].prefix=fdef:17a0:ffb1:300::/64
commit simple-radvd
EOF

exit 0
