#!/bin/sh

uci delete dhcp

uci -q batch <<-EOF >/dev/null
dhcp.lan=dnsmasq
dhcp.lan.domainneeded=1
dhcp.lan.boguspriv=1
dhcp.lan.filterwin2k=0
dhcp.lan.localise_queries=1
dhcp.lan.rebind_protection=0
dhcp.lan.rebind_localhost=1
dhcp.lan.expandhosts=1
dhcp.lan.nonegcache=0
dhcp.lan.authoritative=1
dhcp.lan.readethers=1
dhcp.lan.leasefile=/tmp/dhcp.lan.leases
dhcp.lan.resolvfile=/tmp/resolv.conf.auto
dhcp.lan.add_local_domain=0
dhcp.lan.add_local_hostname=0
dhcp.lan.bind_dynamic=1
dhcp.lan.interface=br-lan
dhcp.freifunk=dnsmasq
dhcp.freifunk.domainneeded=1
dhcp.freifunk.boguspriv=1
dhcp.freifunk.filterwin2k=0
dhcp.freifunk.localise_queries=1
dhcp.freifunk.rebind_protection=0
dhcp.freifunk.rebind_localhost=1
dhcp.freifunk.expandhosts=1
dhcp.freifunk.nonegcache=0
dhcp.freifunk.authoritative=1
dhcp.freifunk.readethers=1
dhcp.freifunk.leasefile=/tmp/dhcp.freifunk.leases
dhcp.freifunk.resolvfile=/tmp/resolv.conf.freifunk.auto
dhcp.freifunk.add_local_domain=0
dhcp.freifunk.add_local_hostname=0
dhcp.freifunk.bind_dynamic=1
dhcp.freifunk.interface=br-freifunk
dhcp.freifunk.notinterface=lo
dhcp.odhcpd=odhcpd
dhcp.odhcpd.maindhcp=0
dhcp.odhcpd.leasefile=/tmp/hosts/odhcpd
dhcp.odhcpd.leasetrigger=/usr/sbin/odhcpd-update
dhcp.@dhcp[0]=dhcp
dhcp.@dhcp[0].interface=lan
dhcp.@dhcp[0].start=100
dhcp.@dhcp[0].limit=150
dhcp.@dhcp[0].leasetime=2h
dhcp.@dhcp[0].dhcp_option=3,192.168.133.1 6,192.168.133.1
dhcp.@dhcp[0].ndp=relay
dhcp.@dhcp[0].dnsmasq_config=lan
dhcp.@dhcp[1]=dhcp
dhcp.@dhcp[1].interface=freifunk
dhcp.@dhcp[1].start=100
dhcp.@dhcp[1].limit=150
dhcp.@dhcp[1].leasetime=2h
dhcp.@dhcp[1].dhcp_option=3 6,192.168.132.1
dhcp.@dhcp[1].ndp=relay
dhcp.@dhcp[1].master=1
dhcp.@dhcp[1].dnsmasq_config=freifunk
dhcp.wan=dhcp
dhcp.wan.interface=wan
dhcp.wan.ignore=1
commit dhcp
EOF

exit 0
