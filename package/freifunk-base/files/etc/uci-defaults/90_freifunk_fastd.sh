#!/bin/sh

uci delete fastd

uci -q batch <<-EOF >/dev/null
fastd.default=fastd
fastd.default.enabled=1
fastd.default.syslog_level=warn
fastd.default.bind=any interface "br-wan"
fastd.default.method=salsa2012+umac
fastd.default.secure_handshakes=1
fastd.default.hide_ip_addresses=1
fastd.default.hide_mac_addresses=1
fastd.default.status_socket=/var/run/fastd.status
fastd.default.mode=tap
fastd.default.interface=fastd_mesh
fastd.default.mtu=1406
fastd.default.forward=0
fastd.default.packet_mark=1
fastd.backbone=peer_group
fastd.backbone.enabled=1
fastd.backbone.net=default
fastd.backbone.peer_limit=1
fastd.vpn1=peer
fastd.vpn1.enabled=1
fastd.vpn1.net=default
fastd.vpn1.group=backbone
fastd.vpn1.key=d7822baec77e7f6572ae9298b5506191e00f9eeaac1db4aba6e3c280678cac3c
fastd.vpn1.remote=ipv4 "vpn1.freifunk-bielefeld.de" port 1244
fastd.vpn1.float=0
fastd.vpn2=peer
fastd.vpn2.enabled=1
fastd.vpn2.net=default
fastd.vpn2.group=backbone
fastd.vpn2.key=5369f843d41a89c107fe1839b1683e14869046252bb7af734f7d67b2711dd9cc
fastd.vpn2.remote=ipv4 "vpn2.freifunk-bielefeld.de" port 1244
fastd.vpn2.float=0
fastd.vpn3=peer
fastd.vpn3.enabled=1
fastd.vpn3.net=default
fastd.vpn3.group=backbone
fastd.vpn3.key=c1f20f98bf22860aac43796c70387651c832c8e7c067761b262850567deab06e
fastd.vpn3.remote=ipv4 "vpn3.freifunk-bielefeld.de" port 1244
fastd.vpn3.float=0
fastd.vpn4=peer
fastd.vpn4.enabled=1
fastd.vpn4.net=default
fastd.vpn4.group=backbone
fastd.vpn4.key=ac2eae2716aaa287f346cf0e1fa7043b2586a0c9655b769074ec1a8e83c49849
fastd.vpn4.remote=ipv4 "vpn4.freifunk-bielefeld.de" port 1244
fastd.vpn4.float=0
fastd.vpn5=peer
fastd.vpn5.enabled=1
fastd.vpn5.net=default
fastd.vpn5.group=backbone
fastd.vpn5.key=57c69b1d25c0492d5337f1b23af4fb76394d87495453b8ec9e1c66ca4d2f1c5d
fastd.vpn5.remote=ipv4 "vpn5.freifunk-bielefeld.de" port 1244
fastd.vpn5.float=0
fastd.vpn6=peer
fastd.vpn6.enabled=1
fastd.vpn6.net=default
fastd.vpn6.group=backbone
fastd.vpn6.key=949ced1433a3ec8920e18efd01e30c7cc0a52a72454619cfe878d4e4fd5e7440
fastd.vpn6.remote=ipv4 "vpn6.freifunk-bielefeld.de" port 1244
fastd.vpn6.float=0
fastd.vpn1_owl=peer
fastd.vpn1_owl.enabled=1
fastd.vpn1_owl.net=default
fastd.vpn1_owl.group=backbone
fastd.vpn1_owl.key=b6d51c7f80704d9a3f5b3ec8b7727757fdf85961a8bf0bc1d058419083b64a33
fastd.vpn1_owl.remote=ipv4 "vpn1.freifunk-owl.de" port 1244
fastd.vpn1_owl.float=0
fastd.vpn1_badsalzuflen=peer
fastd.vpn1_badsalzuflen.enabled=1
fastd.vpn1_badsalzuflen.net=default
fastd.vpn1_badsalzuflen.group=backbone
fastd.vpn1_badsalzuflen.key=9d9bbeb26813afde58681eb3102329657e08003496e8429bfc367047edb59e44
fastd.vpn1_badsalzuflen.remote=ipv4 "vpn1.freifunk-bad-salzuflen.de" port 1244
fastd.vpn1_badsalzuflen.float=0
commit fastd
EOF

exit 0
