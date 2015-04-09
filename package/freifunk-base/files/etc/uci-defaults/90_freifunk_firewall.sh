#!/bin/sh

uci delete firewall

uci -q batch <<-EOF >/dev/null
firewall.@defaults[0]=defaults
firewall.@defaults[0].syn_flood=1
firewall.@defaults[0].input=ACCEPT
firewall.@defaults[0].output=ACCEPT
firewall.@defaults[0].forward=REJECT
firewall.@zone[0]=zone
firewall.@zone[0].name=lan
firewall.@zone[0].network=lan
firewall.@zone[0].input=ACCEPT
firewall.@zone[0].output=ACCEPT
firewall.@zone[0].forward=REJECT
firewall.@zone[1]=zone
firewall.@zone[1].name=wan
firewall.@zone[1].network=wan wan6
firewall.@zone[1].input=REJECT
firewall.@zone[1].output=ACCEPT
firewall.@zone[1].forward=REJECT
firewall.@zone[1].masq=1
firewall.@zone[1].mtu_fix=1
firewall.@forwarding[0]=forwarding
firewall.@forwarding[0].src=lan
firewall.@forwarding[0].dest=wan
firewall.@rule[0]=rule
firewall.@rule[0].name=Allow-DHCP-Renew
firewall.@rule[0].src=wan
firewall.@rule[0].proto=udp
firewall.@rule[0].dest_port=68
firewall.@rule[0].target=ACCEPT
firewall.@rule[0].family=ipv4
firewall.@rule[1]=rule
firewall.@rule[1].name=Allow-Ping
firewall.@rule[1].src=wan
firewall.@rule[1].proto=icmp
firewall.@rule[1].icmp_type=echo-request
firewall.@rule[1].family=ipv4
firewall.@rule[1].target=ACCEPT
firewall.@rule[2]=rule
firewall.@rule[2].name=Allow-DHCPv6
firewall.@rule[2].src=wan
firewall.@rule[2].proto=udp
firewall.@rule[2].src_ip=fe80::/10
firewall.@rule[2].src_port=547
firewall.@rule[2].dest_ip=fe80::/10
firewall.@rule[2].dest_port=546
firewall.@rule[2].family=ipv6
firewall.@rule[2].target=ACCEPT
firewall.@rule[3]=rule
firewall.@rule[3].name=Allow-ICMPv6-Input
firewall.@rule[3].src=wan
firewall.@rule[3].proto=icmp
firewall.@rule[3].icmp_type=echo-request echo-reply destination-unreachable packet-too-big time-exceeded bad-header unknown-header-type router-solicitation neighbour-solicitation router-advertisement neighbour-advertisement
firewall.@rule[3].limit=1000/sec
firewall.@rule[3].family=ipv6
firewall.@rule[3].target=ACCEPT
firewall.@rule[4]=rule
firewall.@rule[4].name=Allow-ICMPv6-Forward
firewall.@rule[4].src=wan
firewall.@rule[4].dest=*
firewall.@rule[4].proto=icmp
firewall.@rule[4].icmp_type=echo-request echo-reply destination-unreachable packet-too-big time-exceeded bad-header unknown-header-type
firewall.@rule[4].limit=1000/sec
firewall.@rule[4].family=ipv6
firewall.@rule[4].target=ACCEPT
firewall.@include[0]=include
firewall.@include[0].path=/etc/firewall.user
firewall.@zone[2]=zone
firewall.@zone[2].name=freifunk
firewall.@zone[2].network=freifunk freifunk6
firewall.@zone[2].input=ACCEPT
firewall.@zone[2].output=ACCEPT
firewall.@zone[2].forward=REJECT
firewall.@zone[2].masq=1
firewall.@forwarding[1]=forwarding
firewall.@forwarding[1].src=lan
firewall.@forwarding[1].dest=freifunk
commit firewall
EOF

exit 0
