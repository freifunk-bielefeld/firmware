#!/bin/sh

uci delete simple-tc

uci -q batch <<-EOF >/dev/null
simple-tc.@interface[0]=interface
simple-tc.@interface[0].enabled=0
simple-tc.@interface[0].ifname=fastd_mesh
simple-tc.@interface[0].limit_egress=1000
simple-tc.@interface[0].limit_ingress=5000
commit simple-tc
EOF

exit 0
