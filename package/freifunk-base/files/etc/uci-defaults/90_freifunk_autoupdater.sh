#!/bin/sh

uci delete autoupdater

uci -q batch <<-EOF >/dev/null
autoupdater.settings=autoupdater
autoupdater.settings.enabled=1
autoupdater.settings.branch=stable
autoupdater.stable=branch
autoupdater.stable.name=stable
autoupdater.stable.mirror=http://[fdef:17a0:ffb1:300::4]/freifunk/firmware/autoupdater http://[fdef:17a0:ffb1:300::5]/freifunk/firmware/autoupdater
autoupdater.stable.fetch_delay=3600
autoupdater.stable.apply_delay=0
autoupdater.stable.good_signatures=2
autoupdater.stable.pubkey=371d244af00790e1d8e0da61d5c01ab32457374e7c33c0bddd334333a91a7a18 4320668c6858faa064d2f205c538bafb7b042600eef6a7503258d7355d01e4f8 4d379d4a9d73260785c013f61d5e483725c1272f385a25a60fc53e1784b89f8f b3d6eeaf8995a4a445be482e4da49402da62d44f125638905fdb8b8c0582f939
commit autoupdater
EOF

exit 0
