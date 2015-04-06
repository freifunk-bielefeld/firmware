#!/bin/sh

uci delete alfred

uci -q batch <<-EOF >/dev/null
alfred.alfred=alfred
alfred.alfred.interface=br-freifunk
alfred.alfred.mode=slave
alfred.alfred.batmanif=bat0
alfred.alfred.start_vis=0
alfred.alfred.run_facters=0
commit alfred
EOF

exit 0
